export const cssProperties = ['float'].concat(Object.keys(
  typeof document === 'undefined'
    ? {}
    : findWidth(document.documentElement.style)
).filter(p => p.indexOf('-') === -1 && p !== 'length'))

function findWidth(obj) {
  return obj
    ? obj.hasOwnProperty('width')
      ? obj
      : findWidth(Object.getPrototypeOf(obj))
    : {}
}

export const isProp = /^-?-?[a-z][a-z-_0-9]*$/i

export const memoize = (fn, cache = {}) => item =>
  item in cache
    ? cache[item]
    : cache[item] = fn(item)

export function add(style, prop, values) {
  if (prop in style) // Recursively increase specificity
    add(style, '!' + prop, values)
  else
    style[prop] = formatValues(prop, values)
}

export const vendorMap = Object.create(null, {})
export const vendorValuePrefix = Object.create(null, {})

export const vendorRegex = /^(o|O|ms|MS|Ms|moz|Moz|webkit|Webkit|WebKit)([A-Z])/

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
  flex: '',
  boxShadow: 'px',
  border: 'px',
  borderTop: 'px',
  borderRight: 'px',
  borderBottom: 'px',
  borderLeft: 'px'
})

export function lowercaseFirst(string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

export function assign(obj, obj2) {
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      obj[key] = typeof obj2[key] === 'string'
        ? obj2[key]
        : assign(obj[key] || {}, obj2[key])
    }
  }
  return obj
}

const hyphenSeparator = /-([a-z])/g
export function hyphenToCamelCase(hyphen) {
  return hyphen.slice(hyphen.charAt(0) === '-' ? 1 : 0).replace(hyphenSeparator, function(match) {
    return match[1].toUpperCase()
  })
}

const camelSeparator = /(\B[A-Z])/g
export function camelCaseToHyphen(camelCase) {
  return camelCase.replace(camelSeparator, '-$1').toLowerCase()
}

const initialMatch = /([A-Z])/g
export function initials(camelCase) {
  return camelCase.charAt(0) + (camelCase.match(initialMatch) || []).join('').toLowerCase()
}

const ampersandMatch = /&/g
export function objectToRules(style, selector, suffix = '', single) {
  const base = {}
  const extra = suffix.indexOf('&') > -1 && suffix.indexOf(',') === -1 ? '' : '&'
  let rules = []

  Object.keys(style).forEach(prop => {
    if (prop.charAt(0) === '@')
      rules.push(prop + '{' + objectToRules(style[prop], selector, suffix, single).join('') + '}')
    else if (typeof style[prop] === 'object')
      rules = rules.concat(objectToRules(style[prop], selector, suffix + prop, single))
    else
      base[prop] = style[prop]
  })

  if (Object.keys(base).length) {
    rules.unshift(
      ((single || (suffix.charAt(0) === ' ') ? '' : '&') + extra + suffix).replace(ampersandMatch, selector).trim() +
      '{' + stylesToCss(base) + '}'
    )
  }

  return rules
}

export const selectorSplit = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/

export function stylesToCss(style) {
  return Object.keys(style).reduce((acc, prop) =>
    acc + propToString(prop.charAt(0) === '!' ? prop.slice(1) : prop, style[prop])
  , '')
}

export function readClasses(sheet) {
  throw new Error('not implemented')
}

function propToString(prop, value) {
  prop = prop in vendorMap ? vendorMap[prop] : prop
  return (vendorRegex.test(prop) ? '-' : '')
    + (cssVar(prop)
      ? prop
      : camelCaseToHyphen(prop)
    )
    + ':'
    + value
    + ';'
}

function formatValues(prop, value) {
  return Array.isArray(value)
    ? value.map(v => formatValue(prop, v)).join(' ')
    : typeof value === 'string'
      ? formatValues(prop, value.split(' '))
      : formatValue(prop, value)
}

function formatValue(prop, value) {
  return value in vendorValuePrefix
    ? vendorValuePrefix[value]
    : value + (isNaN(value) || value === null || value === 0 || value === '0' || typeof value === 'boolean' || cssVar(prop) ? '' : appendPx(prop))
}

function cssVar(prop) {
  return prop.charAt(0) === '-' && prop.charAt(1) === '-'
}
