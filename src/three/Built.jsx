import { forwardRef, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, EdgesGeometry, Float32BufferAttribute } from "three";
import { lineFragment, lineVertex, solidFragment, solidVertex } from "./glsl/build";
import { FOG_DENSITY } from "./uniforms";
import { palette } from "./palette";
import { syncPaletteUniforms } from "./syncPalette";
import { stationBuild, stationDraw } from "./store";

/** Starting values for a set piece's two passes. Both are handed the same block. */
function initialUniforms(geometry, { jitter, noiseScale, metal }) {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;

    return {
        uBuild: { value: 0 },
        uDraw: { value: 0 },
        uMinY: { value: box.min.y },
        uSpan: { value: Math.max(box.max.y - box.min.y, 0.0001) },
        uJitter: { value: jitter },
        uNoiseScale: { value: noiseScale },
        uMetal: { value: metal },
        uWarm: { value: palette.warm.clone() },
        uBright: { value: palette.bright.clone() },
        uDeep: { value: palette.deep.clone() },
        uRim: { value: palette.rim.clone() },
        uAccent: { value: palette.accent.clone() },
        uLine: { value: palette.line.clone() },
        uFogColor: { value: palette.fog.clone() },
        uFogDensity: { value: FOG_DENSITY },
    };
}

/**
 * Edge geometry carrying `aDraw` — the order the linework inks itself in. Segments are
 * ordered by height so the drawing is laid down bottom-up, matching the direction the solid
 * then builds in.
 */
export function makeEdges(geometry, threshold = 24) {
    const edges = new EdgesGeometry(geometry, threshold);
    const position = edges.getAttribute("position");
    const count = position.count;

    const order = [];
    for (let i = 0; i < count; i += 2) {
        order.push({ i, y: (position.getY(i) + position.getY(i + 1)) * 0.5 });
    }
    order.sort((a, b) => a.y - b.y);

    const draw = new Float32Array(count);
    order.forEach((segment, rank) => {
        const t = order.length > 1 ? rank / (order.length - 1) : 0;
        draw[segment.i] = t;
        draw[segment.i + 1] = t;
    });

    edges.setAttribute("aDraw", new Float32BufferAttribute(draw, 1));
    return edges;
}

/**
 * One object in this world: its drawing and its built form, sharing a construction front.
 *
 * Both passes are driven here rather than by the caller, through the materials' own uniform
 * blocks — the renderer does not keep the object you pass as the `uniforms` prop, so writing
 * to that object updates nothing. Driving both from one place also guarantees the linework
 * and the solid can never disagree about where the front is.
 */
const Built = forwardRef(function Built(
    {
        geometry,
        station,
        jitter = 0.1,
        noiseScale = 1.6,
        metal = 0.5,
        edges = true,
        edgeThreshold = 24,
        children,
        ...props
    },
    ref,
) {
    const solidMaterial = useRef();
    const lineMaterial = useRef();

    const uniforms = useMemo(
        () => initialUniforms(geometry, { jitter, noiseScale, metal }),
        [geometry, jitter, noiseScale, metal],
    );

    const edgeGeometry = useMemo(
        () => (edges ? makeEdges(geometry, edgeThreshold) : null),
        [geometry, edges, edgeThreshold],
    );

    useFrame(() => {
        const build = stationBuild(station);
        const draw = stationDraw(station);

        for (const material of [solidMaterial.current, lineMaterial.current]) {
            if (!material) continue;
            material.uniforms.uBuild.value = build;
            material.uniforms.uDraw.value = draw;
            syncPaletteUniforms(material.uniforms);
        }
    });

    return (
        <group ref={ref} {...props}>
            <mesh geometry={geometry}>
                <shaderMaterial
                    ref={solidMaterial}
                    vertexShader={solidVertex}
                    fragmentShader={solidFragment}
                    uniforms={uniforms}
                    side={DoubleSide}
                />
            </mesh>

            {edgeGeometry && (
                <lineSegments geometry={edgeGeometry}>
                    <shaderMaterial
                        ref={lineMaterial}
                        vertexShader={lineVertex}
                        fragmentShader={lineFragment}
                        uniforms={uniforms}
                        transparent
                        depthWrite={false}
                    />
                </lineSegments>
            )}

            {children}
        </group>
    );
});

export default Built;
