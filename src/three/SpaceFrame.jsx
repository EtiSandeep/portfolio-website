import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
    IcosahedronGeometry,
    InstancedBufferAttribute,
    MathUtils,
    Matrix4,
    Object3D,
    Quaternion,
    Vector3,
} from "three";
import { simplex3d } from "./glsl/noise";
import { fogHelper, fogVarying } from "./glsl/fog";
import { outputChunks, FOG_DENSITY } from "./uniforms";
import { palette } from "./palette";
import { syncPaletteUniforms } from "./syncPalette";
import { anchorOf } from "./stations";
import { stationBuild } from "./store";
import { hero, strikeHero } from "./heroBus";
import { skeletonOf } from "./frame";

const RADIUS = 2.7;
const CUT = -1.05;              // where the dome meets its base ring
const BEAM = 0.055;

// Impact timeline, in seconds after a strike.
const BURST = 0.16;             // everything flies apart
const HOLD = 0.34;              // it hangs there, broken
const REPAIR = 1.5;             // and walks itself back together, base upward

/**
 * Instanced build shader. Every beam carries its rest position, so the construction front
 * reads from where the beam *belongs* rather than where damage has currently thrown it —
 * otherwise a fractured structure would appear to un-build itself.
 */
const vertex = /* glsl */ `
attribute vec3 aRest;

varying vec3 vBuildLocal;
varying vec3 vNormalV;
varying vec3 vViewDir;
varying float vRestY;
${fogVarying}

void main() {
  vBuildLocal = aRest;
  vRestY = aRest.y;

  mat4 im = instanceMatrix;
  vec4 local = im * vec4(position, 1.0);
  vec4 mv = modelViewMatrix * local;

  vNormalV = normalize(normalMatrix * (mat3(im) * normal));
  vViewDir = normalize(-mv.xyz);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const fragment = /* glsl */ `
uniform float uBuild;
uniform float uMinY;
uniform float uSpan;
uniform float uJitter;
uniform float uNoiseScale;
uniform float uMetal;
uniform float uRepair;        // height of the repair wavefront, or -999 when idle

uniform vec3 uWarm;
uniform vec3 uBright;
uniform vec3 uDeep;
uniform vec3 uRim;
uniform vec3 uAccent;

varying vec3 vBuildLocal;
varying vec3 vNormalV;
varying vec3 vViewDir;
varying float vRestY;

${simplex3d}
${fogHelper}

void main() {
  float h = clamp((vBuildLocal.y - uMinY) / max(uSpan, 0.0001), 0.0, 1.0);
  float level = h + fbm(vBuildLocal * uNoiseScale, 3) * uJitter;
  float front = uBuild * 1.18 - 0.09;

  // Above the construction front this beam is still only a drawing.
  if (level > front) discard;

  vec3 n = normalize(vNormalV);
  vec3 v = normalize(vViewDir);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.2);

  vec3 lightDir = normalize(vec3(0.45, 0.85, 0.6));
  float key = max(dot(n, lightDir), 0.0);
  float fill = max(dot(n, -lightDir), 0.0);
  float diffuse = 0.55 + 0.45 * key + 0.18 * fill;
  float spec = pow(max(dot(reflect(-v, n), lightDir), 0.0), 42.0);

  vec3 col = mix(uDeep, uWarm, uMetal) * diffuse;
  col += mix(uRim, uBright, uMetal) * spec * 0.65;
  col += uAccent * fres * 0.30;

  // The construction front glows as the drawing turns into matter.
  col += uBright * smoothstep(0.075, 0.0, abs(level - front)) * 1.9;

  // And so does the repair wavefront, sweeping up through a structure putting itself back.
  col += uAccent * smoothstep(0.5, 0.0, abs(vRestY - uRepair)) * 1.6;

  col = mix(col, uFogColor, fogAmount());
  gl_FragColor = vec4(col, 1.0);
  ${outputChunks}
}
`;

const UP = new Vector3(0, 1, 0);

/**
 * The hero: a geodesic dome built from beams and joints. It draws itself, materialises
 * bottom-up, and — when struck — blows apart and walks itself back together.
 */
export default function SpaceFrame({ motion = 1, tier = "high" }) {
    const anchor = useMemo(() => anchorOf("home"), []);
    const beamsRef = useRef();
    const jointsRef = useRef();
    const group = useRef();
    const impactAt = useRef(-999);

    const skeleton = useMemo(() => {
        const detail = tier === "low" ? 0 : 1;
        const geometry = new IcosahedronGeometry(RADIUS, detail);
        const result = skeletonOf(geometry, { keepAbove: CUT });
        geometry.dispose();
        return result;
    }, [tier]);

    // Rest transform and scatter behaviour for each piece, computed once.
    const pieces = useMemo(() => {
        const mid = new Vector3();
        const dir = new Vector3();

        const beams = skeleton.beams.map(([a, b], i) => {
            const from = skeleton.joints[a];
            const to = skeleton.joints[b];
            mid.addVectors(from, to).multiplyScalar(0.5);
            dir.subVectors(to, from);
            const length = dir.length();

            const quaternion = new Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
            const rest = mid.clone();
            const outward = rest.clone().normalize();

            return {
                rest,
                quaternion,
                length,
                outward,
                spin: new Vector3(
                    Math.sin(i * 12.9898) * 2.4,
                    Math.sin(i * 78.233) * 2.4,
                    Math.sin(i * 37.719) * 2.4,
                ),
                throwDistance: 1.0 + Math.abs(Math.sin(i * 4.1)) * 1.5,
            };
        });

        const joints = skeleton.joints.map((p, i) => ({
            rest: p.clone(),
            outward: p.clone().normalize(),
            spin: new Vector3(Math.sin(i * 5.31) * 3, Math.sin(i * 9.17) * 3, Math.sin(i * 2.71) * 3),
            throwDistance: 0.8 + Math.abs(Math.sin(i * 7.7)) * 1.2,
        }));

        return { beams, joints };
    }, [skeleton]);

    const bounds = useMemo(() => {
        const ys = pieces.beams.map((b) => b.rest.y);
        const min = Math.min(...ys, CUT);
        const max = Math.max(...ys, RADIUS);
        return { min, span: Math.max(max - min, 0.0001) };
    }, [pieces]);

    const uniforms = useMemo(
        () => ({
            uBuild: { value: 0 },
            uMinY: { value: bounds.min },
            uSpan: { value: bounds.span },
            uJitter: { value: 0.14 },
            uNoiseScale: { value: 0.9 },
            uMetal: { value: 0.75 },
            uRepair: { value: -999 },
            uWarm: { value: palette.warm.clone() },
            uBright: { value: palette.bright.clone() },
            uDeep: { value: palette.deep.clone() },
            uRim: { value: palette.rim.clone() },
            uAccent: { value: palette.accent.clone() },
            uFogColor: { value: palette.fog.clone() },
            uFogDensity: { value: FOG_DENSITY },
        }),
        [bounds],
    );

    // Per-instance rest position, so the shader can locate a beam even mid-explosion.
    useLayoutEffect(() => {
        const write = (ref, list) => {
            if (!ref.current) return;
            const rest = new Float32Array(list.length * 3);
            list.forEach((piece, i) => {
                rest[i * 3] = piece.rest.x;
                rest[i * 3 + 1] = piece.rest.y;
                rest[i * 3 + 2] = piece.rest.z;
            });
            ref.current.geometry.setAttribute("aRest", new InstancedBufferAttribute(rest, 3));
        };
        write(beamsRef, pieces.beams);
        write(jointsRef, pieces.joints);
    }, [pieces]);

    const dummy = useMemo(() => new Object3D(), []);
    const scratch = useMemo(() => ({ matrix: new Matrix4(), position: new Vector3() }), []);

    const onStrike = useCallback((event) => {
        event.stopPropagation();
        strikeHero();
    }, []);

    useFrame(({ clock }) => {
        const time = clock.elapsedTime;

        if (hero.pending) {
            hero.pending = false;
            impactAt.current = time;
        }

        // Written through each material's own uniform block: the renderer keeps its own
        // copy of whatever is passed as the `uniforms` prop, so the memoised object above
        // is only ever a template.
        const build = stationBuild(0);
        const materials = [beamsRef.current?.material, jointsRef.current?.material];

        // Damage curve: a fast burst, a held pause, then a staggered return that walks up
        // from the base — so the structure repairs itself in a direction, not all at once.
        const since = time - impactAt.current;
        const burst = MathUtils.clamp(since / BURST, 0, 1);
        const settleStart = BURST + HOLD;

        const repair =
            since > settleStart && since < settleStart + REPAIR
                ? bounds.min + ((since - settleStart) / REPAIR) * bounds.span
                : -999;

        for (const material of materials) {
            if (!material) continue;
            material.uniforms.uBuild.value = build;
            material.uniforms.uRepair.value = repair;
            syncPaletteUniforms(material.uniforms);
        }

        // Both instanced meshes are laid out with the same rule, written inline rather than
        // through a helper: handing the memoised piece list to a function makes it look, to
        // static analysis, like caller state might be mutated. Nothing here writes to it.
        for (const [mesh, list] of [
            [beamsRef.current, pieces.beams],
            [jointsRef.current, pieces.joints],
        ]) {
            if (!mesh) continue;

            for (let i = 0; i < list.length; i++) {
                const piece = list[i];

                // Pieces low in the structure come home first.
                const heightRank = (piece.rest.y - bounds.min) / bounds.span;
                const delay = heightRank * REPAIR * 0.65;
                const healed = MathUtils.clamp((since - settleStart - delay) / (REPAIR * 0.5), 0, 1);
                const eased = healed * healed * (3 - 2 * healed);
                const damage = since < 0 ? 0 : burst * (1 - eased);

                scratch.position
                    .copy(piece.rest)
                    .addScaledVector(piece.outward, damage * piece.throwDistance);

                dummy.position.copy(scratch.position);
                if (piece.quaternion) dummy.quaternion.copy(piece.quaternion);
                else dummy.quaternion.identity();

                dummy.rotateX(piece.spin.x * damage);
                dummy.rotateY(piece.spin.y * damage);
                dummy.rotateZ(piece.spin.z * damage);

                // Beams stretch along their own length; joints keep their geometry's size.
                if (piece.length !== undefined) dummy.scale.set(1, piece.length, 1);
                else dummy.scale.setScalar(1);

                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            }

            mesh.instanceMatrix.needsUpdate = true;
        }

        if (group.current) {
            group.current.rotation.y = time * 0.075 * motion;
            group.current.rotation.x = Math.sin(time * 0.13) * 0.06 * motion;
        }
    });

    return (
        <group ref={group} position={anchor} onClick={onStrike}>
            <instancedMesh
                ref={beamsRef}
                args={[undefined, undefined, pieces.beams.length]}
                frustumCulled={false}
            >
                <boxGeometry args={[BEAM, 1, BEAM]} />
                <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
            </instancedMesh>

            <instancedMesh
                ref={jointsRef}
                args={[undefined, undefined, pieces.joints.length]}
                frustumCulled={false}
            >
                <octahedronGeometry args={[0.115, 0]} />
                <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
            </instancedMesh>
        </group>
    );
}
