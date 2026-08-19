import { motion, useScroll, useSpring } from "framer-motion";
import Contact from "./components/Contact";
import CustomCursor from "./components/CustomCursor";
import Dock from "./components/Dock";
import Experience from "./components/Experience";
import Hero from "./components/Hero";
import Intro from "./components/Intro";
import About from "./components/About";
import Projects from "./components/Projects";
import SceneCanvas from "./components/SceneCanvas";
import Skills from "./components/Skills";
import { useInput } from "./hooks/useInput";

function App() {
    // Feeds scroll position and pointer into the 3D world without re-rendering React.
    useInput();

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    return (
        <div className="relative min-h-screen text-ink dark:text-moon-ink cursor-none overflow-x-hidden selection:bg-coral/30 selection:text-ink dark:selection:bg-moon-violet/40 dark:selection:text-moon-ink">
            <Intro />
            <CustomCursor />

            {/* One canvas behind everything — scrolling flies the camera through it. */}
            <SceneCanvas />

            <motion.div
                aria-hidden="true"
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-coral via-tangerine to-gold dark:from-moon-indigo dark:via-moon-violet dark:to-moon-glow origin-left z-[100]"
                style={{ scaleX }}
            />

            <Dock />

            <main className="relative z-10 font-sans">
                <Hero />
                <About />
                <Experience />
                <Skills />
                <Projects />
                <Contact />
            </main>

            <footer className="relative z-10 pt-6 pb-28 sm:pb-10 text-center text-ink-soft dark:text-moon-ink-soft text-sm">
                <p>
                    Made with warmth in every commit &middot; &copy; {new Date().getFullYear()} Sandeep Eti
                </p>
            </footer>
        </div>
    );
}

export default App;
