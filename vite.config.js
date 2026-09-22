import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2019',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // GSAP and Lenis are split out so they cache independently of app
          // code — they change on library upgrades, the app changes on every
          // deploy, and bundling them together invalidates both every time.
          if (id.includes('node_modules/gsap')) return 'gsap'
          if (id.includes('node_modules/lenis')) return 'lenis'
          if (id.includes('node_modules/framer-motion')) return 'motion'
          if (id.includes('node_modules/react-router')) return 'router'
          if (id.includes('node_modules/react')) return 'react'
          if (id.includes('src/data/blog-content.json')) return 'blog-bodies'
        },
      },
    },
  },
})
