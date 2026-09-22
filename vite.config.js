import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 部署到 GitHub Pages 时，base 要改成 '/仓库名/'
// 例如仓库叫 deep-space，就写 '/deep-space/'
export default defineConfig({
  plugins: [react()],
  base: '/deep-space/'
});