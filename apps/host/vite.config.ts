import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react";
import * as dns from "dns";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import rollupNodePolyFill from "rollup-plugin-polyfill-node";

dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "host",
      remotes: [
        {
          blog_posts: {
            external: "http://localhost:4001/assets/blog_posts.js",
            from: "vite",
            externalType: "url",
          },
        },
        {
          categories: {
            external: "http://localhost:4002/assets/categories.js",
            from: "vite",
            externalType: "url",
          },
        },
      ],
      shared: [
        "react",
        "react-dom",
        "react-router-dom",
        "@refinedev/core",
        "@refinedev/antd",
        "antd",
      ],
    }),
    tsconfigPaths(),
  ],

  preview: {
    host: "localhost",
    port: 4000,
    strictPort: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
    },
  },
});
