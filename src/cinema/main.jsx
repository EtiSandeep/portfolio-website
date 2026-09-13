import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FILM } from "./filmColors";
import LookTest from "./LookTest";
import "./cinema.css";

// The grade, onto the document, before React paints anything. One definition, shared by the
// shaders and the stylesheet — the stylesheet declares no colours of its own.
Object.entries(FILM).forEach(([name, value]) => {
    document.documentElement.style.setProperty(`--${name}`, value);
});

createRoot(document.getElementById("cinema-root")).render(
    <StrictMode>
        <LookTest />
    </StrictMode>,
);
