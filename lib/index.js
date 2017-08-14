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
  stringToObject,
  cssProperties,
  readClasses,
  vendorRegex,
  vendorMap,
  assign,
  short
} from './utils'

function bss(a) {
  if (Array.isArray(a) && Array.isArray(a.raw)) {
    arguments[0] = { raw: arguments[0] }
    assign(bss.style, stringToObject(String.raw.apply(null, arguments)))
  } else {
    for (let i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] === 'string')
        assign(bss.style, stringToObject(arguments[i]))
      else if (typeof arguments[i] === 'object')
        assign(bss.style, arguments[i].style || arguments[i])
    }
  }

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
  this.style['@media ' + value] = b.style
  return chain(this)
}

bss.$nest = function(value, b) {
  this.style[(value.charAt(0) === ':' ? '' : ' ') + value] = b.style
  return chain(this)
}

pseudos.forEach(name =>
  bss['$' + hyphenToCamelCase(name)] = function(value, b) {
    this.style[':' + name + (b ? '(' + value + ')' : '')] = b ? b.style : value.style
    return chain(this)
  }
)

function setter(prop) {
  return function CssProperty(value) {
    this.style[prop] = typeof value === 'undefined' ? false : value
    return chain(this)
  }
}

function css(selector, style) {
  prepend(selectorToStyle(selector, style.style || style))
}

function helper(name, styling) {
  if (arguments.length === 1)
    return readClasses(name)

  if (typeof styling === 'object') {
    delete bss[name] // Needed to avoid weird get calls in chrome
    Object.defineProperty(bss, name, {
      get: function() {
        assign(this.style, styling.style || styling)
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
