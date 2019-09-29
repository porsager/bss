import buble from 'rollup-plugin-buble'
import { terser } from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'

export default [
  {
    input: 'lib/index.js',
    output: {
      file: 'dist/bss.js',
      exports: 'default',
      format: 'umd',
      name: 'b',
      sourcemap: true
    },
    plugins: process.env.TEST
      ? []
      : [
        buble(),
        filesize()
      ]
  }, {
    input: 'lib/index.js',
    output: {
      file: 'dist/bss.min.js',
      exports: 'default',
      format: 'umd',
      name: 'b',
      sourcemap: true
    },
    plugins: [
      buble(),
      terser({ mangle: true, compress: true }),
      filesize()
    ]
  }, {
    input: 'lib/index.js',
    output: {
      file: 'dist/bss.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      buble(),
      filesize()
    ]
  }
]
