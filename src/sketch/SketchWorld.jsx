import InkDriver from "./InkDriver";
import Paper from "./Paper";
import Rig from "../three/Rig";
import Agents from "./pieces/Agents";
import Whiteboard from "./pieces/Whiteboard";
import Ladder from "./pieces/Ladder";
import MindMap from "./pieces/MindMap";
import Panels from "./pieces/Panels";
import Plane from "./pieces/Plane";

/**
 * One sheet, six drawings on it. The camera route, the scroll store and the station
 * geometry are the same machinery the site has always used — only the hand has changed.
 */
export default function SketchWorld({ theme, quality }) {
    const { motion, tier } = quality;

    return (
        <>
            <InkDriver theme={theme} />
            <Rig motion={motion} />
            <Paper />

            <Agents motion={motion} />
            <Whiteboard motion={motion} />
            <Ladder motion={motion} />
            <MindMap motion={motion} showLabels={tier !== "low"} />
            <Panels motion={motion} />
            <Plane motion={motion} />
        </>
    );
}
