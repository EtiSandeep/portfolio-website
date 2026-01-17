import React, { useEffect, useState } from "react";
import Dock from "./components/Dock";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import GridBackground from "./components/GridBackground";
import CustomCursor from "./components/CustomCursor";
import { motion, useScroll, useSpring } from "framer-motion";

function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-blue-500/30 selection:text-blue-200 cursor-none overflow-x-hidden">
      <CustomCursor />
      <GridBackground />

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Floating Dock Navigation */}
      <Dock />

      {/* Main Content */}
      <main className="relative z-10 font-sans">
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Contact />
      </main>

      {/* Footer */}
      <footer className="py-8 bg-black/80 backdrop-blur text-center text-gray-500 text-xs font-mono border-t border-gray-900/50">
        <p>SYSTEM STATUS: ONLINE | &copy; {new Date().getFullYear()} Sandeep Eti. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}

export default App;
