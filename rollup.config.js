import esbuild from 'rollup-plugin-esbuild'
import filesize from 'rollup-plugin-filesize'

export default [
  {
    input: 'lib/index.js',
    output: {
      file: 'bss.js',
      exports: 'default',
      format: 'umd',
      name: 'b',
      sourcemap: true
    },
    plugins: process.env.TEST
      ? []
      : [
        esbuild(),
        filesize()
      ]
  }, {
    input: 'lib/index.js',
    output: {
      file: 'bss.min.js',
      exports: 'default',
      format: 'umd',
      name: 'b',
      sourcemap: true
    },
    plugins: [
      esbuild({ minify: true }),
      filesize()
    ]
  }, {
    input: 'lib/index.js',
    output: {
      file: 'bss.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      esbuild(),
      filesize()
    ]
  }
]
