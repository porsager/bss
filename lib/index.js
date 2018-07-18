import pseudos from './pseudos'
import popular from './popular'

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
  cssProperties,
  stylesToCss,
  vendorRegex,
  formatValue,
  vendorMap,
  sanitize,
  initials,
  memoize,
  assign,
  addPx,
  add
} from './utils'

const shorts = Object.create(null)

function bss(input, value) {
  const b = chain(bss)
  assign(b.style, parse.apply(null, arguments))
  return b
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
setProp('$media', $media)
setProp('$import', $import)
setProp('$nest', $nest)
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

function $media(value, style) {
  if (value)
    add(this.style, '@media ' + value, parse(style))

  return chain(this)
}

function $import(value) {
  if (value)
    insert('@import ' + value + ';', 0)

  return chain(this)
}

function $nest(value, style) {
  if (arguments.length === 1)
    Object.keys(value).forEach(x => this.$nest(x, value[x]))
  else if (value)
    value.split(selectorSplit).map(x => x.trim()).forEach(x => add(this.style, (x.charAt(0) === ':' ? '' : ' ') + x, parse(style)))

  return chain(this)
}

pseudos.forEach(name =>
  setProp('$' + hyphenToCamelCase(name.replace(/:/g, '')), function Pseudo(value, b) {
    if (value || b)
      add(this.style, name + (b ? '(' + value + ')' : ''), parse(b || value))
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

  insert(selector + '{' + stylesToCss(parse(style)) + '}', 0)
}

function helper(name, styling) {
  if (arguments.length === 1)
    return Object.keys(name).forEach(key => helper(key, name[key]))

  delete bss[name] // Needed to avoid weird get calls in chrome

  if (typeof styling === 'object') {
    helper[name] = parse(styling)
    Object.defineProperty(bss, name, {
      configurable: true,
      get: function() {
        assign(this.style, parse(styling))
        return chain(this)
      }
    })
  } else {
    helper[name] = styling
    Object.defineProperty(bss, name, {
      configurable: true,
      value: function Helper() {
        const result = styling.apply(null, arguments)
        assign(this.style, result.style)
        return chain(this)
      }
    })
  }
}

bss.helper('$animate', (value, props) =>
  bss.animation(bss.$keyframes(props) + ' ' + value)
)

function short(prop) {
  const acronym = initials(prop)
      , short = popular[acronym] && popular[acronym] !== prop ? prop : acronym

  shorts[short] = prop
  return short
}

const stringToObject = memoize(string => {
  let last = ''
    , prev

  return string.trim().split(/;|\n/).reduce((acc, line) => {
    line = last + line.trim()
    last = line.charAt(line.length - 1) === ',' ? line : ''
    if (last)
      return acc

    if (line.charAt(0) === ',') {
      acc[prev] += line
      return acc
    }

    const tokens = line.match(/[^:\s]+/g)

    if (!tokens)
      return acc

    const key = hyphenToCamelCase(tokens.shift())

    prev = shorts[key] || key

    if (key in helper) {
      typeof helper[key] === 'function'
        ? assign(acc, helper[key](...tokens).style)
        : assign(acc, helper[key])
    } else if (tokens.length > 0) {
      add(acc, prev, tokens.reduce((acc, t) => acc + addPx(prev, t) + ' ', '').trim())
    }

    return acc
  }, {})
})

let count = 0
const keyframeCache = {}

function keyframes(props) {
  const content = Object.keys(props).reduce((acc, key) =>
    acc + key + '{' + stylesToCss(parse(props[key])) + '}'
  , '')

  if (content in keyframeCache)
    return keyframeCache[content]

  const name = classPrefix + count++
  keyframeCache[content] = name
  insert('@keyframes ' + name + '{' + content + '}')

  return name
}

function parse(input, value) {
  if (typeof input === 'string') {
    if (typeof value === 'string' || typeof value === 'number')
      return ({ [input] : value })

    return stringToObject(input)
  } else if (Array.isArray(input) && Array.isArray(input.raw)) {
    arguments[0] = { raw: input }
    return stringToObject(String.raw.apply(null, arguments))
  }

  return input.style || sanitize(input)
}

export default bss
