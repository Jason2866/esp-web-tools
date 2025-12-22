import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import babel from "@rollup/plugin-babel";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { dirname } from "path";

// Copy WASM files and compiled JS after build
function copyWasmFiles() {
  return {
    name: "copy-wasm-files",
    writeBundle() {
      // Copy WASM files from src to dist/web AND js/modules
      const files = [
        {
          src: "src/wasm/littlefs/littlefs.wasm",
          dest: "dist/web/wasm/littlefs/littlefs.wasm",
        },
        {
          src: "src/wasm/littlefs/littlefs.js",
          dest: "dist/web/wasm/littlefs/littlefs.js",
        },
        {
          src: "src/wasm/littlefs/index.js",
          dest: "dist/web/wasm/littlefs/index.js",
        },
        {
          src: "src/wasm/littlefs/index.d.ts",
          dest: "dist/web/wasm/littlefs/index.d.ts",
        },
        // Also copy to js/modules for GitHub Pages compatibility
        {
          src: "src/wasm/littlefs/littlefs.wasm",
          dest: "js/modules/wasm/littlefs/littlefs.wasm",
        },
        {
          src: "src/wasm/littlefs/littlefs.js",
          dest: "js/modules/wasm/littlefs/littlefs.js",
        },
        {
          src: "src/wasm/littlefs/index.js",
          dest: "js/modules/wasm/littlefs/index.js",
        },
        {
          src: "src/wasm/littlefs/index.d.ts",
          dest: "js/modules/wasm/littlefs/index.d.ts",
        },
      ];

      files.forEach(({ src, dest }) => {
        const destDir = dirname(dest);
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }
        try {
          if (existsSync(src)) {
            copyFileSync(src, dest);
            console.log(`Copied ${src} to ${dest}`);
          } else {
            console.warn(`Warning: Source file not found: ${src}`);
          }
        } catch (err) {
          console.warn(`Warning: Could not copy ${src}: ${err.message}`);
        }
      });
    },
  };
}

const config = {
  input: "dist/install-button.js",
  output: {
    dir: "dist/web",
    format: "module",
  },
  external: [
    "https://www.improv-wifi.com/sdk-js/launch-button.js",
    /wasm\/littlefs/,  // Treat wasm/littlefs imports as external
  ],
  preserveEntrySignatures: false,
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    babel({
      babelHelpers: "bundled",
      plugins: ["@babel/plugin-proposal-class-properties"],
    }),
    json(),
    copyWasmFiles(),
  ],
};

if (process.env.NODE_ENV === "production") {
  config.plugins.push(
    terser({
      ecma: 2019,
      toplevel: true,
      format: {
        comments: false,
      },
    })
  );
}

export default config;
