import buble from 'rollup-plugin-buble'
import uglify from 'rollup-plugin-uglify'
import filesize from 'rollup-plugin-filesize'

export default [
  {
    input: 'lib/index.js',
    output: {
      file: 'bss.js',
      format: 'umd',
      name: 'b',
      sourcemap: true
    },
    exports: 'default',
    plugins: process.env.TEST
      ? []
      : [
        buble(),
        filesize()
      ]
  }, {
    input: 'lib/index.js',
    output: {
      file: 'bss.min.js',
      format: 'umd',
      name: 'b',
      sourcemap: true
    },
    exports: 'default',
    plugins: [
      buble(),
      uglify({ mangle: true, compress: true }),
      filesize()
    ]
  }
]
