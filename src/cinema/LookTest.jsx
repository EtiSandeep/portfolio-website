import CinemaCanvas from "./CinemaCanvas";
import Frame from "./Frame";
import TitleCard from "./TitleCard";
import { useQuality } from "../hooks/useQuality";

/** Reel one on its own: enough of the sequence to judge whether the rest is worth shooting. */
export default function LookTest() {
    const quality = useQuality();

    return (
        <Frame reel="01" slate="Main title">
            <CinemaCanvas quality={quality} />
            <TitleCard />
        </Frame>
    );
}
