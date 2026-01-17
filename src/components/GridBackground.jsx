import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const GridBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resize);
        resize();

        // Grid configuration
        const gridSize = 50;
        const gridColor = "rgba(59, 130, 246, 0.1)"; // Blue-ish grey #3b82f6
        const tickSize = 4;

        // Animation state
        let offset = 0;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;

            // Moving effect
            offset = (offset + 0.2) % gridSize;

            // Vertical lines
            for (let x = offset; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();

                // Crosshairs at intersections
                for (let y = offset; y < canvas.height; y += gridSize) {
                    ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
                    ctx.fillRect(x - 1, y - 1, 2, 2);
                }
            }

            // Horizontal lines
            for (let y = offset; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Dynamic scanning line
            const time = Date.now() * 0.001;
            const scanY = (Math.sin(time) * 0.5 + 0.5) * canvas.height;

            const gradient = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
            gradient.addColorStop(0, "rgba(59, 130, 246, 0)");
            gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.1)");
            gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, scanY - 50, canvas.width, 100);

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none opacity-60"
        />
    );
};

export default GridBackground;
