/**
 * Created by naeemo on 2017/5/16.
 */
import babel from "rollup-plugin-babel";
import {eslint} from "rollup-plugin-eslint";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
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
            exclude: "node_modules/**",
        }),
        commonjs(),
        replace({
            ENV: JSON.stringify(process.env.NODE_ENV || "development"),
        }),
        (process.env.NODE_ENV === "production" && terser()),
    ],
};
