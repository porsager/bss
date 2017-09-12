import keyframes from './keyframes'
import pseudos from './pseudos'

import {
  classPrefix,
  createClass,
  setDebug,
  getSheet,
  insert
} from './sheet'

import {
  hyphenToCamelCase,
  lowercaseFirst,
  selectorBlock,
  cssProperties,
  vendorRegex,
  vendorMap,
  assign,
  addPx,
  short,
  parse
} from './utils'

function bss(input, value) {
  assign(bss.style, parse.apply(null, arguments))
  return chain(bss)
}

bss.setDebug = setDebug

bss.style = {}

bss.toString = function() {
  return '.' + this.class
}

bss.$keyframes = keyframes
bss.getSheet = getSheet
bss.helper = helper
bss.css = css
bss.classPrefix = classPrefix

function chain(instance) {
  const newInstance = Object.create(bss, { style: { value: instance.style } })

  if (instance === bss)
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

bss.content = function(arg) {
  this.style.content = '"' + arg + '"'
  return chain(this)
}

Object.defineProperty(bss, 'class', {
  get: function() {
    return createClass(this.style)
  }
})

bss.$media = function(value, style) {
  this.style['@media ' + value] = parse(style)
  return chain(this)
}

bss.$nest = function(value, style) {
  this.style[(value.charAt(0) === ':' ? '' : ' ') + value] = parse(style)
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
    for (let i = 0; i < arguments.length; i++) {
      if (prop in this.style)
        this.style[prop] += ' ' + addPx(prop, arguments[i])
      else if (arguments[i] || arguments[i] === 0)
        this.style[prop] = addPx(prop, arguments[i])
    }

    return chain(this)
  }
}

function css(selector, style) {
  if (arguments.length === 1)
    return Object.keys(selector).forEach(key => css(key, selector[key]))

  insert(selectorBlock(selector, parse(style)), 0)
}

function helper(name, styling) {
  if (arguments.length === 1)
    return Object.keys(name).forEach(key => helper(key, name[key]))

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
