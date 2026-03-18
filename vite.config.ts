import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

const INPUT = process.env.INPUT;
if (!INPUT) {
  throw new Error("INPUT environment variable is not set");
}

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    sourcemap: process.env.NODE_ENV === "development" ? "inline" : undefined,
    cssMinify: process.env.NODE_ENV !== "development",
    minify: process.env.NODE_ENV !== "development",
    rollupOptions: {
      input: INPUT,
    },
    outDir: "dist",
    emptyOutDir: false,
  },
});
