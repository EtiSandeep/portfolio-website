import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SketchHero from "./SketchHero";
import "./sketch.css";

createRoot(document.getElementById("sketch-root")).render(
    <StrictMode>
        <div className="sketch-page">
            <SketchHero />

            <div className="sketch-copy">
                <p className="sketch-eyebrow">Hey, I&apos;m Sandeep</p>
                <h1 className="sketch-title">
                    I build <em>AI&#8209;powered systems</em> that feel effortless.
                </h1>
                <p className="sketch-lede">
                    Principal Engineer and Solution Architect, building enterprise .NET
                    platforms, cloud infrastructure and the AI systems layered on top.
                </p>
                <div className="sketch-actions">
                    <a className="sketch-btn sketch-btn--ink" href="#work">See my work</a>
                    <a className="sketch-btn" href="#contact">Say hello</a>
                </div>
            </div>
        </div>
    </StrictMode>,
);
