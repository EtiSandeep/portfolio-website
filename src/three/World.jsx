import Atmosphere from "./Atmosphere";
import Effects from "./Effects";
import GridField from "./GridField";
import Rig from "./Rig";
import SkyDome from "./SkyDome";
import SpaceFrame from "./SpaceFrame";
import Plots from "./pieces/Plots";
import Seal from "./pieces/Seal";
import Sheets from "./pieces/Sheets";
import Truss from "./pieces/Truss";
import Tower from "./pieces/Tower";

/**
 * Blueprint → Built.
 *
 * Everything here exists first as linework and then as matter. As the camera nears a
 * station, that set piece inks itself in and a construction front rises through it, turning
 * the drawing into a lit, solid object. The hero can be struck, and puts itself back.
 */
export default function World({ theme, quality }) {
    const { tier, motion, effects } = quality;

    return (
        <>
            <Atmosphere theme={theme} motion={motion} />
            <Rig motion={motion} />
            <SkyDome motion={motion} />
            <GridField />

            <SpaceFrame motion={motion} tier={tier} />
            <Sheets motion={motion} />
            <Tower motion={motion} />
            <Truss motion={motion} />
            <Plots motion={motion} />
            <Seal motion={motion} />

            {effects && <Effects theme={theme} tier={tier} motion={motion} />}
        </>
    );
}
