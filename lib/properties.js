const vendorRegex = /^(o|O|ms|MS|Ms|moz|Moz|webkit|Webkit|WebKit)([A-Z])/

const snake       = x => x.replace(/(\B[A-Z])/g, '-$1').toLowerCase()
const findWidth   = x => x ? x.hasOwnProperty('width') ? x : findWidth(Object.getPrototypeOf(x)) : {}

const properties = ['float']
  .concat(Object.keys(
    typeof document === 'undefined' ? {} : findWidth(document.documentElement.style) // eslint-disable-line
  ))
  .filter((x, i, xs) => x.indexOf('-') === -1 && x !== 'length' && xs.indexOf(x) === i)
  .map(x => x.match(vendorRegex) ? '-' + snake(x) : snake(x))
  .sort()

export default properties
