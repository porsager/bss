import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'
import filesize from 'rollup-plugin-filesize'

export default {
  entry: 'lib/index.js',
  dest: 'bss.js',
  format: 'umd',
  moduleName: 'b',
  sourceMap: true,
  exports: 'default',
  plugins: [
    commonjs(),
    nodeResolve(),
    buble(),
    uglify({ mangle: true, compress: true }),
    filesize()
  ]
}
