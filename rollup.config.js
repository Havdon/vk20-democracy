

import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

module.exports = {
    input: 'src/index.js',
    output: {
        file: 'public/bundle.js',
        format: 'iife'
    },
    plugins: [
        serve(),
        livereload()
    ]
  };