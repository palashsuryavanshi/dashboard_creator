import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'pv-c6e02111722e-949d1af8-6c80-40a9-91ae-66416222a249.style.dev'
    ]
  },
  build: {
    outDir: 'dist',
  },
})