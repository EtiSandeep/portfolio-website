import React from "react";

// Soft, drifting sunset-toned blobs behind the page content.
const GridBackground = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -left-32 w-[32rem] h-[32rem] rounded-full bg-coral/30 blur-[110px] animate-blob-drift" />
            <div className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full bg-tangerine/30 blur-[120px] animate-blob-drift-slow" />
            <div className="absolute bottom-[-10rem] left-1/4 w-[30rem] h-[30rem] rounded-full bg-gold/30 blur-[110px] animate-blob-drift" />
            <div className="absolute bottom-1/4 right-1/3 w-72 h-72 rounded-full bg-rose/20 blur-[100px] animate-blob-drift-slow" />

            {/* Paper grain for texture */}
            <div className="absolute inset-0 grain-overlay opacity-[0.4]" />
        </div>
    );
};

export default GridBackground;
