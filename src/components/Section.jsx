import { motion } from "framer-motion";

const PLACEMENT = {
    left: "lg:mr-auto lg:max-w-[48%]",
    right: "lg:ml-auto lg:max-w-[48%]",
    center: "mx-auto max-w-4xl",
};

/**
 * A full-viewport stop on the scroll journey. Each one lines up with a camera station, and
 * `align` keeps the copy on the opposite side of the screen from that station's set piece.
 */
export default function Section({ id, align = "center", className = "", children }) {
    return (
        <section
            id={id}
            className={`relative min-h-screen flex items-center px-5 sm:px-8 py-20 sm:py-24 ${className}`}
        >
            <div className="w-full max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className={`w-full ${PLACEMENT[align]}`}
                >
                    {children}
                </motion.div>
            </div>
        </section>
    );
}
