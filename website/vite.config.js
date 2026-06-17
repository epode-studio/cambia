import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// base is the GitHub project-pages path (https://<user>.github.io/cambia/).
// Override with `--base=/` for local builds or a custom domain.
export default defineConfig({
  plugins: [react()],
  base: '/cambia/',
});
