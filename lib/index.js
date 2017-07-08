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
  sanitize,
  assign,
  short
} from './utils'

const debug = true

let cached = {}
let style = {}

function bss(a) {
  if (Array.isArray(a) && Array.isArray(a.raw)) {
    arguments[0] = { raw: arguments[0] }
    assign(style, stringToObject(String.raw.apply(null, arguments)))
  } else {
    for (let i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] === 'string')
        assign(style, stringToObject(arguments[i]))
      else if (typeof arguments[i] === 'object')
        assign(style, arguments[i].style || arguments[i])
    }
  }

  return bss
}

bss.toString = () => '.' + bss.class
bss.forceUpdate = forceUpdate
bss.$keyframes = keyframes
bss.prepend = prepend
bss.helper = helper
bss.css = css

cssProperties.forEach(prop => {
  if (vendorRegex.test(prop)) {
    const unprefixed = lowercaseFirst(prop.replace(vendorRegex, '$2'))
    if (cssProperties.indexOf(unprefixed) === -1) {
      vendorMap[unprefixed] = prop
      return addSetter(unprefixed, prop)
    }
  }

  addSetter(prop)
})

addGetter('style', () => {
  const sanitized = sanitize(style)
  style = {}
  return sanitized
})

addGetter('class', () => {
  const className = createClass(style)
  style = {}
  return className
})

addGetter('$animate', cache((value, props) => {
  style = cached
  bss.animation(bss.$keyframes(props) + ' ' + value)
  return bss
}))

addGetter('$media', cache((value, b) =>
  add('@media ' + value, b.style || b)
))

addGetter('$nest', cache((value, b) =>
    add((value.indexOf(':') === 0 ? '' : ' ') + value, b.style || b)
))

pseudos.forEach(name =>
  addGetter('$' + hyphenToCamelCase(name), cache((value, b) =>
    add(':' + name + (b ? '(' + value + ')' : ''), b ? b.style || b : value.style || value)
  ))
)

function addSetter(name, prop) {
  bss[name] = bss[short(name)] = setter(prop || name)
}

function setter(prop) {
  return function cssProperty(value) {
    style[prop] = typeof value === 'undefined' ? false : value
    return bss
  }
}

function css(selector, style) {
  prepend(selectorToStyle(selector, style.style || style))
}

function add(key, value) {
  style = cached
  style[key] = value
  return bss
}

function cache(fn) {
  return function() {
    cached = style
    style = {}
    return fn
  }
}

function addGetter(name, fn) {
  Object.defineProperty(bss, name, {
    get: fn
  })
}

function helper(name, styling) {
  if (arguments.length === 1)
    return readClasses(name)

  if (typeof styling !== 'function') {
    delete bss[name] // Needed to avoid weird get calls in chrome
    addGetter(name, () => {
      assign(style, styling)
      return bss
    })
    return
  }

  bss[name] = function Helper() {
    assign(style, styling.apply(null, arguments))
    return bss
  }
}

export default bss
