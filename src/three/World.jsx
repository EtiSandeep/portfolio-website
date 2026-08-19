import Atmosphere from "./Atmosphere";
import CareerHelix from "./CareerHelix";
import CrystalBloom from "./CrystalBloom";
import Effects from "./Effects";
import Monoliths from "./Monoliths";
import Nucleus from "./Nucleus";
import Portal from "./Portal";
import Rig from "./Rig";
import SkillConstellation from "./SkillConstellation";
import SkyDome from "./SkyDome";
import StarDust from "./StarDust";

/** Everything inside the canvas: one continuous space with a set piece at each stop. */
export default function World({ theme, quality }) {
    const { tier, motion, particles, effects, dpr } = quality;
    const pixelRatio = Array.isArray(dpr) ? dpr[1] : 1.5;

    return (
        <>
            <Atmosphere theme={theme} motion={motion} />
            <Rig motion={motion} />
            <SkyDome motion={motion} />

            <StarDust count={particles} motion={motion} pixelRatio={pixelRatio} />

            <Nucleus tier={tier} motion={motion} />
            <CrystalBloom motion={motion} />
            <CareerHelix motion={motion} tier={tier} />
            <SkillConstellation motion={motion} showLabels={tier !== "low"} />
            <Monoliths motion={motion} />
            <Portal motion={motion} pixelRatio={pixelRatio} tier={tier} />

            {effects && <Effects theme={theme} tier={tier} motion={motion} />}
        </>
    );
}
