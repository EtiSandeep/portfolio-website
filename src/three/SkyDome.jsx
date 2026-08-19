import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide } from "three";
import { baseUniforms, outputChunks } from "./uniforms";

const vertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragment = /* glsl */ `
uniform float uTime;
uniform vec3 uBright;
uniform vec3 uDeep;
uniform vec3 uAccent;
uniform vec3 uHorizon;
uniform vec3 uBackground;

varying vec3 vDir;

void main() {
  // Light overhead, warm and heavy toward the floor — the same read in either theme.
  float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(uHorizon, uBackground, smoothstep(0.16, 0.82, h));
  col = mix(col, uDeep, smoothstep(0.26, 0.0, h) * 0.5);

  // A soft glow parked off to one side, so the sky has a direction to it.
  float sun = pow(max(dot(vDir, normalize(vec3(0.55, 0.32, -0.75))), 0.0), 7.0);
  col += uBright * sun * 0.22;
  col += uAccent * pow(max(dot(vDir, normalize(vec3(-0.7, -0.1, 0.6))), 0.0), 5.0) * 0.10;

  // Faint cloud banding keeps large flat areas from looking like a gradient mesh. This is
  // deliberately analytic rather than fbm: the sky covers every pixel, so a noise term that
  // goes out of range anywhere shows up as a hole in the world.
  float clouds = sin(vDir.x * 3.1 + uTime * 0.02) * cos(vDir.z * 2.4 - uTime * 0.015)
               + 0.5 * sin(vDir.y * 5.3 - vDir.x * 2.2);
  col *= 0.97 + 0.05 * clamp(clouds, -1.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
  ${outputChunks}
}
`;

/** A camera-locked sky. Cheap, and it gives the additive set pieces something to sit on. */
export default function SkyDome({ motion = 1 }) {
    const mesh = useRef();
    const mat = useRef();
    const uniforms = useMemo(() => baseUniforms(), []);

    useFrame(({ camera, clock }) => {
        if (mesh.current) mesh.current.position.copy(camera.position);
        if (mat.current) mat.current.uniforms.uTime.value = clock.elapsedTime * motion;
    });

    return (
        <mesh ref={mesh} frustumCulled={false} renderOrder={-1}>
            <sphereGeometry args={[70, 32, 24]} />
            <shaderMaterial
                ref={mat}
                vertexShader={vertex}
                fragmentShader={fragment}
                uniforms={uniforms}
                side={BackSide}
                depthWrite={false}
            />
        </mesh>
    );
}
