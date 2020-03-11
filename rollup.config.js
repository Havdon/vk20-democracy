

import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import babel from 'rollup-plugin-babel';

import { uglify } from "rollup-plugin-uglify";

module.exports = {
    input: 'src/index.js',
    output: {
        file: 'public/vk20-visualization.min.js',
        format: 'umd',
        globals: {
            'vec2': 'vec2'
        }
    },
    plugins: [
        babel({
            babelrc: false,
            presets: [["@babel/preset-env"]]
        }),
        serve()
    ]
  };