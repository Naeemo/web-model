/**
 * Created by naeemo on 2017/5/16.
 */
import babel from "@rollup/plugin-babel";
import {eslint} from "rollup-plugin-eslint";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import {terser} from "rollup-plugin-terser";

export default {
    input: "src/Model.js",
    output: {
        file: "dist/model.js",
        sourcemap: "hidden",
        format: "es"
    },
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        eslint(),
        babel({
            babelHelpers: "bundled",
            exclude: "node_modules/**",
        }),
        commonjs(),
        (process.env.NODE_ENV === "production" && terser()),
    ],
};
