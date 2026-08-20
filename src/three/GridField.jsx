import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float32BufferAttribute } from "three";
import { fogHelper, fogVarying } from "./glsl/fog";
import { outputChunks, FOG_DENSITY } from "./uniforms";
import { palette } from "./palette";
import { syncPaletteUniforms } from "./syncPalette";
import { STATIONS } from "./stations";
import { stationDraw } from "./store";

const EXTENT = 26;
const STEP = 1.3;

const vertex = /* glsl */ `
attribute float aDraw;
attribute float aMajor;
varying float vDraw;
varying float vMajor;
${fogVarying}

void main() {
  vDraw = aDraw;
  vMajor = aMajor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const fragment = /* glsl */ `
uniform vec3 uLine;
uniform vec3 uAccent;
uniform float uDraw;
${fogHelper}

varying float vDraw;
varying float vMajor;

void main() {
  if (vDraw > uDraw) discard;
  vec3 col = mix(uLine, uAccent, vMajor * 0.5);
  float alpha = (vMajor > 0.5 ? 0.30 : 0.13) * (1.0 - fogAmount());
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(col, alpha);
  ${outputChunks}
}
`;

/**
 * Graph paper laid under the whole route — one sheet beneath each station. It is what makes
 * the space read as a drawing board rather than open sky, and it gives the set pieces a
 * ground to be surveyed on.
 */
export default function GridField() {
    const material = useRef();

    const geometry = useMemo(() => {
        const positions = [];
        const draw = [];
        const major = [];

        STATIONS.forEach((station, index) => {
            const [ax, ay, az] = station.anchor;
            const y = ay - 3.6;
            const lines = Math.floor(EXTENT / STEP);

            for (let i = -lines; i <= lines; i++) {
                const offset = i * STEP;
                const isMajor = i % 5 === 0 ? 1 : 0;
                // Sheets ink in from the middle outward.
                const order = Math.abs(i) / lines;

                positions.push(ax - EXTENT, y, az + offset, ax + EXTENT, y, az + offset);
                positions.push(ax + offset, y, az - EXTENT, ax + offset, y, az + EXTENT);
                for (let k = 0; k < 4; k++) {
                    draw.push(order);
                    major.push(isMajor);
                }
            }
            void index;
        });

        return {
            positions: new Float32Array(positions),
            draw: new Float32Array(draw),
            major: new Float32Array(major),
        };
    }, []);

    useFrame(() => {
        if (!material.current) return;
        // The nearest station's progress inks the paper in ahead of the camera.
        let best = 0;
        for (let i = 0; i < STATIONS.length; i++) best = Math.max(best, stationDraw(i, 2.2));
        material.current.uniforms.uDraw.value = best;
        syncPaletteUniforms(material.current.uniforms);
    });

    const uniforms = useMemo(
        () => ({
            uLine: { value: palette.line.clone() },
            uAccent: { value: palette.accent.clone() },
            uDraw: { value: 0 },
            uFogColor: { value: palette.fog.clone() },
            uFogDensity: { value: FOG_DENSITY },
        }),
        [],
    );

    return (
        <lineSegments frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[geometry.positions, 3]} />
                <bufferAttribute attach="attributes-aDraw" args={[geometry.draw, 1]} />
                <bufferAttribute attach="attributes-aMajor" args={[geometry.major, 1]} />
            </bufferGeometry>
            <shaderMaterial
                ref={material}
                vertexShader={vertex}
                fragmentShader={fragment}
                uniforms={uniforms}
                transparent
                depthWrite={false}
            />
        </lineSegments>
    );
}
