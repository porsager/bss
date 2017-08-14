import keyframes from './keyframes'
import pseudos from './pseudos'

import {
  forceUpdate,
  createClass,
  prepend
} from './sheet'

import {
  hyphenToCamelCase,
  selectorToStyle,
  lowercaseFirst,
  cssProperties,
  addProperty,
  readClasses,
  vendorRegex,
  vendorMap,
  assign,
  short,
  parse
} from './utils'

function bss(input, value) {
  assign(bss.style, parse.apply(null, arguments))
  return chain(bss)
}

bss.style = {}

bss.toString = function() {
  return '.' + this.class
}

bss.forceUpdate = forceUpdate
bss.$keyframes = keyframes
bss.prepend = prepend
bss.helper = helper
bss.css = css

function chain(instance) {
  if (instance !== bss)
    return instance

  const newInstance = Object.create(bss, { style: { value: bss.style } })
  bss.style = {}
  return newInstance
}

cssProperties.forEach(prop => {
  if (vendorRegex.test(prop)) {
    const unprefixed = lowercaseFirst(prop.replace(vendorRegex, '$2'))
    if (cssProperties.indexOf(unprefixed) === -1) {
      vendorMap[unprefixed] = prop
      bss[unprefixed] = bss[short(unprefixed)] = setter(prop)
      return
    }
  }

  bss[prop] = bss[short(prop)] = setter(prop)
})

Object.defineProperty(bss, 'class', {
  get: function() {
    return createClass(this.style)
  }
})

bss.$media = function(value, b) {
  this.style['@media ' + value] = parse(b)
  return chain(this)
}

bss.$nest = function(value, b) {
  this.style[(value.charAt(0) === ':' ? '' : ' ') + value] = parse(b)
  return chain(this)
}

pseudos.forEach(name =>
  bss['$' + hyphenToCamelCase(name)] = function(value, b) {
    this.style[':' + name + (b ? '(' + value + ')' : '')] = parse(b || value)
    return chain(this)
  }
)

function setter(prop) {
  return function CssProperty(value) {
    addProperty(this.style, prop, typeof value === 'undefined' ? false : value)
    return chain(this)
  }
}

function css(selector, style) {
  prepend(selectorToStyle(selector, parse(style)))
}

function helper(name, styling) {
  if (arguments.length === 1)
    return readClasses(name)

  if (typeof styling === 'object') {
    delete bss[name] // Needed to avoid weird get calls in chrome
    Object.defineProperty(bss, name, {
      get: function() {
        assign(this.style, parse(styling))
        return chain(this)
      }
    })
    return
  }

  bss[name] = function Helper() {
    const result = styling.apply(null, arguments)
    assign(this.style, result.style)
    return chain(this)
  }
}

bss.helper('$animate', (value, props) =>
  bss.animation(bss.$keyframes(props) + ' ' + value)
)

export default bss
