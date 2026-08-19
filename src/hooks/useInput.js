import { useEffect } from "react";
import { initInput } from "../three/store";

/** Starts the scroll/pointer listeners that feed the 3D world. Mount once, at the root. */
export function useInput() {
    useEffect(() => initInput(), []);
}
