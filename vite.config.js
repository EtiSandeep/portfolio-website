import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    rollupOptions: {
      // A second entry, so the title-sequence look test can be judged without touching the
      // site that is live.
      input: {
        main: "index.html",
        cinema: "cinema.html",
      },
      output: {
        // Vendor code changes far less often than the site does. Splitting it out means a
        // redeploy only invalidates the small app chunk for returning visitors.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined
          if (id.includes("three") || id.includes("@react-three") || id.includes("postprocessing")) {
            return undefined // already isolated behind the lazy SketchCanvas import
          }
          if (id.includes("react-dom") || id.includes("/react/") || id.includes("scheduler")) return "react"
          return undefined
        },
      },
    },
  },
})
