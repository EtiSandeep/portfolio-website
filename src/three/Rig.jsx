import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import { STATIONS } from "./stations";
import { pointer, scroll } from "./store";

const smootherstep = (x) => x * x * x * (x * (x * 6 - 15) + 10);

/** The aspect ratio the station route was composed for. */
const REFERENCE_ASPECT = 1.6;

const CAM_POINTS = STATIONS.map((s) => new Vector3(
    s.anchor[0] + s.camOffset[0],
    s.anchor[1] + s.camOffset[1],
    s.anchor[2] + s.camOffset[2],
));
const LOOK_POINTS = STATIONS.map((s) => new Vector3(...s.anchor));
const SIDES = STATIONS.map((s) => s.pieceSide);
const LIFTS = STATIONS.map((s) => s.pieceLift ?? 0);

const damp3 = (current, target, lambda, dt) => {
    current.x = MathUtils.damp(current.x, target.x, lambda, dt);
    current.y = MathUtils.damp(current.y, target.y, lambda, dt);
    current.z = MathUtils.damp(current.z, target.z, lambda, dt);
};

/**
 * Flies the camera along the station route as the page scrolls, with a little pointer
 * parallax and a speed-reactive dolly/roll so travelling between sections reads as flight.
 */
export default function Rig({ motion = 1 }) {
    const size = useThree((state) => state.size);

    const targetCam = useRef(new Vector3().copy(CAM_POINTS[0]));
    const targetLook = useRef(new Vector3().copy(LOOK_POINTS[0]));
    const currentLook = useRef(new Vector3().copy(LOOK_POINTS[0]));
    const roll = useRef(0);
    const started = useRef(false);

    useFrame(({ camera }, delta) => {
        const dt = Math.min(delta, 0.1);
        const last = STATIONS.length - 1;

        const s = MathUtils.clamp(scroll.station, 0, last);
        const i = Math.min(Math.floor(s), last - 1);
        const f = smootherstep(MathUtils.clamp(s - i, 0, 1));

        targetCam.current.lerpVectors(CAM_POINTS[i], CAM_POINTS[i + 1], f);
        targetLook.current.lerpVectors(LOOK_POINTS[i], LOOK_POINTS[i + 1], f);

        // The route is framed for a landscape window. On a phone the vertical field of view
        // is unchanged but the frame is far narrower, so back the camera off instead of
        // widening the lens — same composition, no fisheye.
        const aspect = size.width / Math.max(size.height, 1);
        const pull = MathUtils.clamp(REFERENCE_ASPECT / Math.max(aspect, 0.3), 1, 1.75);
        targetCam.current.sub(targetLook.current).multiplyScalar(pull).add(targetLook.current);

        // On wide screens push the set piece to one side so the copy gets the other.
        const spread = size.width >= 1024 ? 3.0 : 0;
        const side = MathUtils.lerp(SIDES[i], SIDES[i + 1], f);
        const lateral = -side * spread;
        targetCam.current.x += lateral;
        targetLook.current.x += lateral;

        // Raising both camera and target drops the set piece down the frame. Portrait
        // viewports get an extra push so the piece clears the copy panel above it.
        const portraitLift = aspect < 1 ? 1.2 : 0;
        const lift = MathUtils.lerp(LIFTS[i], LIFTS[i + 1], f) + portraitLift;
        targetCam.current.y += lift;
        targetLook.current.y += lift;

        // Pointer parallax, and a dolly-back while the visitor is moving fast.
        const speed = MathUtils.clamp(Math.abs(scroll.velocity), 0, 4);
        targetCam.current.x += pointer.x * 0.6 * motion;
        targetCam.current.y += pointer.y * 0.4 * motion;
        targetCam.current.z += speed * 0.45 * motion;

        if (!started.current) {
            camera.position.copy(targetCam.current);
            currentLook.current.copy(targetLook.current);
            started.current = true;
        }

        damp3(camera.position, targetCam.current, 3.2, dt);
        damp3(currentLook.current, targetLook.current, 4.5, dt);

        camera.lookAt(currentLook.current);

        // Bank into the turn a touch — pure garnish, but it sells the motion.
        const targetRoll = MathUtils.clamp(-scroll.velocity * 0.02, -0.06, 0.06) * motion;
        roll.current = MathUtils.damp(roll.current, targetRoll, 3, dt);
        camera.rotateZ(roll.current);

        const targetFov = 46 + speed * 2.2 * motion;
        if (Math.abs(camera.fov - targetFov) > 0.01) {
            camera.fov = MathUtils.damp(camera.fov, targetFov, 4, dt);
            camera.updateProjectionMatrix();
        }
    });

    return null;
}
