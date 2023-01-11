import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  vite: {
    build: {
      target: ['node16.0.0'],
      manifest: true,
    }
  },
});
