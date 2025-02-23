// Install Rollup Plugins
// yarn add rollup @babel/core @rollup/plugin-commonjs @babel/preset-env @web/rollup-plugin-copy @rollup/plugin-node-resolve rollup-plugin-minify-html-literals rollup-plugin-summary rollup-plugin-typescript2 rollup-plugin-terser rollup-plugin-import-css @rollup/plugin-node-resolve @rollup/plugin-babel @babel/plugin-proposal-class-properties -D

import { copy } from '@web/rollup-plugin-copy';
import resolve from '@rollup/plugin-node-resolve';
import minifyHTML from 'rollup-plugin-minify-html-literals';
// import summary from 'rollup-plugin-summary';
// import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-import-css";
import node_resolve from "@rollup/plugin-node-resolve";
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import InlineSvg from 'rollup-plugin-inline-svg';

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: './src/index.js', // our source file
  output: [
    {
      file: pkg.main,
      format: 'umd', // the preferred format
      exports: 'named',
      name: 'stimuli'
    },
    {
      file: pkg.module,
      format: 'es' // the preferred format
    }
  ],
  //  external: [
  //   ...Object.keys(pkg.dependencies || {})
  //  ],
  plugins: [
    InlineSvg(),
    commonjs(),
    node_resolve(),
    babel({
      babelHelpers: 'runtime',
      plugins: [
        "@babel/plugin-proposal-class-properties",
        ["@babel/plugin-transform-runtime", {
          "regenerator": true
        }]
      ]
    }),
    css(),
    // Resolve bare module specifiers to relative paths
    resolve(),
    // Minify HTML template literals
    minifyHTML(),
    // Minify JS
    terser(
      // {
      // ecma: 2020,
      // module: true,
      // warnings: true,
      // }
    ),
    // Print bundle summary
    // summary(),
    // Optional: copy any static assets to build directory
    copy({
      patterns: [
        '../src/**/*.css',
        // Include the SVG files
        './src/resources/random-dot-stimuli.svg',
        './src/resources/random-line-stimuli.svg',
        './src/resources/different_pattern_types.png'
      ],
      rootDir: './',
    }),
    // Support Typescript
    // typescript({ 
    //  typescript: require('typescript'),
    // }),
  ],
  //  preserveEntrySignatures: 'strict',
}

export default config