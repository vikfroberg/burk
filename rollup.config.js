import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import pkg from "./package.json";

export default [
  {
    input: "src/index.js",
    output: {
      sourcemap: "inline",
      file: pkg.browser,
      name: "uniontype",
      format: "umd",
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: ["node_modules/**"],
      }),
    ],
  },
  {
    input: "src/index.js",
    output: [
      {
        sourcemap: "inline",
        file: pkg.main,
        format: "cjs",
      },
      {
        sourcemap: "inline",
        file: pkg.module,
        format: "es",
      },
    ],
    plugins: [
      babel({
        exclude: ["node_modules/**"],
      }),
    ],
  },
  {
    input: "src/example.js",
    external: ["source-map-support/register"],
    output: [
      {
        sourcemap: "inline",
        file: pkg.example,
        format: "cjs",
      },
    ],
    plugins: [
      babel({
        exclude: ["node_modules/**"],
      }),
    ],
  },
];
