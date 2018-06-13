import popular from './popular'

const shorts = Object.create(null)

export const cssProperties = Object.keys(
  findWidth(document.documentElement.style)
).filter(p => p.indexOf('-') === -1 && p !== 'length')

function findWidth(obj) {
  return obj.hasOwnProperty('width')
    ? obj
    : findWidth(Object.getPrototypeOf(obj))
}

const memoize = (fn, cache = {}) => item =>
  item in cache
    ? cache[item]
    : cache[item] = fn(item)

const stringToObject = memoize(string => {
  let last = ''
    , prev

  return string.trim().replace(/;/g, '\n').split('\n').reduce((acc, line) => {
    line = last + line.trim()
    last = line.slice(-1) === ',' ? line : ''
    if (last)
      return acc

    if (line.charAt(0) === ',') {
      acc[prev] += line
      return acc
    }

    const tokens = line.split(/[:\s]/)
    if (tokens.length > 1) {
      const key = hyphenToCamelCase(tokens.shift().trim())
      prev = shorts[key] || key
      add(acc, prev, tokens.filter(a => a).reduce((acc, t) => acc + addPx(prev, t.trim()) + ' ', '').trim())
    }
    return acc
  }, {})
})

export function add(style, prop, value) {
  if (!(prop in style))
    return style[prop] = value

  if (!style._fallback)
    Object.defineProperty(style, '_fallback', { configurable: true, value: Object.create(null, {}) })

  add(style._fallback, prop, value)
}

export const vendorMap = Object.create(null, {})
export const vendorValuePrefix = Object.create(null, {})

export const vendorRegex = /^(o|O|ms|MS|Ms|moz|Moz|webkit|Webkit|WebKit)([A-Z])/

export function parse(input, value) {
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

const appendPx = memoize(prop => {
  const el = document.createElement('div')

  try {
    el.style[prop] = '1px'
    el.style.setProperty(prop, '1px')
    return el.style[prop].slice(-3) === '1px' ? 'px' : ''
  } catch (err) {
    return ''
  }
}, {
  flex: ''
})

export function lowercaseFirst(string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

function sanitize(styles) {
  return Object.keys(styles).reduce((acc, key) => {
    const value = styles[key]

    if (!value && value !== 0 && value !== '')
      return acc

    if (key === 'content' && value.charAt(0) !== '"')
      acc[key] = '"' + value + '"'
    else
      acc[key in vendorMap ? vendorMap[key] : key] = formatValue(key, value)

    return acc
  }, {})
}

export function assign(obj, obj2) {
  if (obj2._fallback) {
    obj._fallback
      ? assign(obj._fallback, obj2._fallback)
      : Object.defineProperty(obj, '_fallback', { value: obj2._fallback })
  }

  for (const key in obj2) {
    if (obj2.hasOwnProperty(key))
      obj[key] = obj2[key]
  }
}

export function hyphenToCamelCase(hyphen) {
  return hyphen.slice(hyphen.charAt(0) === '-' ? 1 : 0).replace(/-([a-z])/g, function(match) {
    return match[1].toUpperCase()
  })
}

export function camelCaseToHyphen(camelCase) {
  return camelCase.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export function initials(camelCase) {
  return camelCase.charAt(0) + (camelCase.match(/([A-Z])/g) || []).join('').toLowerCase()
}

export function short(prop) {
  const acronym = initials(prop)
      , short = popular[acronym] && popular[acronym] !== prop ? prop : acronym

  shorts[short] = prop
  return short
}

export function getStyleSheetText(classes) {
  return Object.keys(classes).sort().reduce((acc, key) =>
    acc + key.replace(/CLASS_NAME/g, classes[key])
  , '')
}

export function objectToRules(style, prefix = '') {
  let hasBase = false
    , rules = []

  Object.keys(style).forEach(prop => {
    if (prop.charAt(0) === '@') {
      rules.push(prop + '{' + objectToRules(style[prop]) + '}')
      delete style[prop]
    } else if (typeof style[prop] === 'object') {
      rules = rules.concat(objectToRules(style[prop], prefix + prop))
      delete style[prop]
    } else {
      hasBase = true
    }
  })

  if (hasBase)
    rules.unshift(selectorBlock('.$' + prefix, style))

  return rules
}

export function selectorBlock(selector, style) {
  return selector + '{'
    + stylesToCss((typeof style === 'string' ? stringToObject(style) : style))
    + '}'
}

export function stylesToCss(style) {
  return Object.keys(style).reduce((acc, prop) =>
    acc + propToString(prop, style[prop])
  , '') + (style._fallback ? stylesToCss(style._fallback) : '')
}

export function readClasses(sheet) {
  throw new Error('not implemented')
}

function propToString(prop, value) {
  return (vendorRegex.test(prop) ? '-' : '')
  + camelCaseToHyphen(prop) + ':' + value + ';'
}

export function formatValue(key, value) {
  return value in vendorValuePrefix
    ? vendorValuePrefix[value]
    : addPx(key, value)
}

export function addPx(key, value) {
  return value + (isNaN(value) ? '' : appendPx(key))
}
