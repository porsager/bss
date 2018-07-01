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
  vendorValuePrefix,
  lowercaseFirst,
  selectorSplit,
  selectorBlock,
  cssProperties,
  vendorRegex,
  formatValue,
  vendorMap,
  assign,
  addPx,
  short,
  parse,
  add
} from './utils'

function bss(input, value) {
  assign(bss.style, parse.apply(null, arguments))
  return chain(bss)
}

function setProp(prop, value) {
  Object.defineProperty(bss, prop, {
    configurable: true,
    value
  })
}

Object.defineProperty(bss, 'valueOf', {
  configurable: true,
  writable: true,
  value: function ValueOf() {
    return '.' + this.class
  }
})

bss.style = {}

setProp('setDebug', setDebug)

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
  const vendor = prop.match(vendorRegex)
  if (vendor) {
    const unprefixed = lowercaseFirst(prop.replace(vendorRegex, '$2'))
    if (cssProperties.indexOf(unprefixed) === -1) {
      if (unprefixed === 'flexDirection')
        vendorValuePrefix.flex = '-' + vendor[1].toLowerCase() + '-flex'

      vendorMap[unprefixed] = prop
      setProp(unprefixed, setter(prop))
      setProp(short(unprefixed), bss[unprefixed])
      return
    }
  }

  setProp(prop, setter(prop))
  setProp(short(prop), bss[prop])
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
    add(this.style, '@media ' + value, parse(style))

  return chain(this)
})

setProp('$nest', function Nest(value, style) {
  if (arguments.length === 1)
    Object.keys(value).forEach(x => this.$nest(x, value[x]))
  else if (value)
    value.split(selectorSplit).map(x => x.trim()).forEach(x => add(this.style, (x.charAt(0) === ':' ? '' : ' ') + x, parse(style)))

  return chain(this)
})

pseudos.forEach(name =>
  setProp('$' + hyphenToCamelCase(name), function Pseudo(value, b) {
    if (value || b)
      add(this.style, ':' + name + (b ? '(' + value + ')' : ''), parse(b || value))
    return chain(this)
  })
)

function setter(prop) {
  return function CssProperty(value) {
    if (!value && value !== 0) {
      delete this.style[prop]
    } else if (arguments.length > 0) {
      add(this.style, prop, arguments.length === 1
        ? formatValue(prop, value)
        : Array.prototype.slice.call(arguments).map(v => addPx(prop, v)).join(' ')
      )
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
