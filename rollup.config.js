import buble from 'rollup-plugin-buble'
import uglify from 'rollup-plugin-uglify'
import filesize from 'rollup-plugin-filesize'

export default {
  entry: 'lib/index.js',
  dest: 'bss.js',
  format: 'umd',
  moduleName: 'b',
  sourceMap: true,
  exports: 'default',
  plugins: process.env.TEST
    ? []
    : [
      buble(),
      uglify({ mangle: true, compress: true }),
      filesize()
    ]
}
