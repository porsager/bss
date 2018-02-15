import popular from './popular'

const shorts = Object.create(null)

export const cssProperties = Object.keys(
  findWidth(document.documentElement.style)
).filter(p => p.indexOf('-') === -1)

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

  return string.replace(/;/g, '\n').split('\n').reduce((acc, line) => {
    line = last + line.trim()
    last = line.endsWith(',') ? line : ''
    if (last)
      return acc

    if (line.startsWith(',')) {
      acc[prev] += line
      return acc
    }

    const tokens = line.split(/[:\s]/)
    if (tokens.length > 1) {
      const key = hyphenToCamelCase(tokens.shift().trim())
      prev = shorts[key] || key

      acc[prev] = tokens.filter(a => a).map(t => addPx(prev, t.trim())).join(' ')
    }
    return acc
  }, {})
})

export const vendorMap = Object.create(null, {})

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
      acc[key in vendorMap ? vendorMap[key] : key] = addPx(key, value)

    return acc
  }, {})
}

export function assign(obj, obj2) {
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
  return Object.keys(classes).sort().map(key => {
    return key.replace(/CLASS_NAME/g, classes[key])
  }).join('')
}

export function objectToRules(style) {
  const base = {}
      , rules = []

  let hasBase = false

  Object.keys(style).forEach(key => {
    if (key.charAt(0) === '@') {
      rules.push(key + '{' + objectToRules(style[key]) + '}')
    } else if (key.charAt(0) === ' ' || key.charAt(0) === ':') {
      rules.push(selectorBlock('.$' + key, style[key]))
    } else {
      base[key] = style[key]
      hasBase = true
    }
  })

  if (hasBase)
    rules.unshift(selectorBlock('.$', base))

  return rules
}

export function selectorBlock(selector, style) {
  return selector + '{'
    + stylesToCss((typeof style === 'string' ? stringToObject(style) : style))
    + '}'
}

export function stylesToCss(style) {
  return Object.keys(style).map(k => propToString(style, k)).join('')
}

export function readClasses(sheet) {
  throw new Error('not implemented')
}

function propToString(style, k) {
  return (vendorRegex.test(k) ? '-' : '')
  + camelCaseToHyphen(k) + ':' + style[k] + ';'
}

export function addPx(key, value) {
  return value + (isNaN(value) ? '' : appendPx(key))
}
