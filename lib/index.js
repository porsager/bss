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

function setProp(prop, value) {
  Object.defineProperty(bss, prop, {
    value
  })
}

bss.style = {}

setProp('setDebug', setDebug)
setProp('valueOf', function ValueOf() {
  return '.' + this.class
})

setProp('$keyframes', keyframes)
setProp('getSheet', getSheet)
setProp('helper', helper)
setProp('css', css)
setProp('classPrefix', classPrefix)

function chain(instance) {
  const newInstance = Object.create(bss, {
    style: {
      value: instance.style,
      enumerable: true
    }
  })

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

setProp('content', function Content(arg) {
  this.style.content = '"' + arg + '"'
  return chain(this)
})

Object.defineProperty(bss, 'class', {
  set: function(value) {
    this.__class = value
  },
  get: function() {
    return this.__class || createClass(this.style)
  }
})

setProp('$media', function Media(value, style) {
  if (value)
    this.style['@media ' + value] = parse(style)

  return chain(this)
})

setProp('$nest', function Nest(value, style) {
  if (value)
    this.style[(value.charAt(0) === ':' ? '' : ' ') + value] = parse(style)

  return chain(this)
})

pseudos.forEach(name =>
  setProp('$' + hyphenToCamelCase(name), function Pseudo(value, b) {
    this.style[':' + name + (b ? '(' + value + ')' : '')] = parse(b || value)
    return chain(this)
  })
)

function setter(prop) {
  return function CssProperty(value) {
    if (!value && value !== 0) {
      delete this.style[prop]
    } else if (arguments.length > 0) {
      this.style[prop] = arguments.length === 1
        ? addPx(prop, value)
        : Array.prototype.slice.call(arguments).map(v => addPx(prop, v)).join(' ')
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

  delete bss[name] // Needed to avoid weird get calls in chrome
  typeof styling === 'object'
    ?
    Object.defineProperty(bss, name, {
      configurable: true,
      get: function() {
        assign(this.style, parse(styling))
        return chain(this)
      }
    })
    :
    Object.defineProperty(bss, name, {
      configurable: true,
      value: function Helper() {
        const result = styling.apply(null, arguments)
        assign(this.style, result.style)
        return chain(this)
      }
    })
}

bss.helper('$animate', (value, props) =>
  bss.animation(bss.$keyframes(props) + ' ' + value)
)

export default bss
