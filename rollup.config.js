

import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

module.exports = {
    input: 'src/index.js',
    output: {
        file: 'public/bundle.js',
        format: 'umd',
        globals: {
            'vec2': 'vec2'
        }
    },
    plugins: [
        serve(),
        livereload('public')
    ]
  };