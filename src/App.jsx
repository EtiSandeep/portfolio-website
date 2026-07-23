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
    <div className="bg-cream text-ink dark:bg-night dark:text-moon-ink min-h-screen selection:bg-coral/30 selection:text-ink dark:selection:bg-moon-violet/40 dark:selection:text-moon-ink cursor-none overflow-x-hidden">
      <CustomCursor />
      <GridBackground />

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-coral via-tangerine to-gold dark:from-moon-indigo dark:via-moon-violet dark:to-moon-glow origin-left z-[100]"
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
      <footer className="py-8 bg-paper/80 dark:bg-night-paper/80 backdrop-blur text-center text-ink-soft dark:text-moon-ink-soft text-sm border-t border-ink/5 dark:border-white/10">
        <p>Made with warmth in every commit &middot; &copy; {new Date().getFullYear()} Sandeep Eti</p>
      </footer>
    </div>
  );
}

export default App;
