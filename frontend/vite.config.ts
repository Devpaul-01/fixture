import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Required by the fixture-app spec: source maps must stay on in any
    // build used for testing, so DOM -> component-source resolution works
    // even against a production build. Dev mode has them by default.
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
})
