export const cssProperties = ['float'].concat(Object.keys(
  findWidth(document.documentElement.style)
).filter(p => p.indexOf('-') === -1 && p !== 'length'))

function findWidth(obj) {
  return obj.hasOwnProperty('width')
    ? obj
    : findWidth(Object.getPrototypeOf(obj))
}

export const memoize = (fn, cache = {}) => item =>
  item in cache
    ? cache[item]
    : cache[item] = fn(item)

export function add(style, prop, value) {
  if (prop in style)
    add(style, '!' + prop, value)
  else
    style[prop] = value
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
  border: 'px'
})

export function lowercaseFirst(string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

export function sanitize(styles) {
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

export function objectToRules(style, selector, suffix = '', single) {
  const base = {}

  let rules = []

  Object.keys(style).forEach(prop => {
    if (prop.charAt(0) === '@')
      rules.push(prop + '{' + objectToRules(style[prop], selector, suffix, single) + '}')
    else if (typeof style[prop] === 'object')
      rules = rules.concat(objectToRules(style[prop], selector, suffix + prop, single))
    else
      base[prop] = style[prop]
  })

  if (Object.keys(base).length) {
    rules.unshift(
      ((single || (suffix.charAt(0) === ' ') ? '' : '&') + '&' + suffix).replace(/&/g, selector) +
      '{' + stylesToCss(base) + '}'
    )
  }

  return rules
}

export const selectorSplit = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/

export function stylesToCss(style) {
  return Object.keys(style).reduce((acc, prop) =>
    acc + propToString(prop.replace(/!/g, ''), style[prop])
  , '')
}

export function readClasses(sheet) {
  throw new Error('not implemented')
}

function propToString(prop, value) {
  return (vendorRegex.test(prop) ? '-' : '')
    + (prop.charAt(0) === '-' && prop.charAt(1) === '-'
      ? prop
      : camelCaseToHyphen(prop)
    )
    + ':'
    + value
    + ';'
}

export function formatValue(key, value) {
  return value in vendorValuePrefix
    ? vendorValuePrefix[value]
    : addPx(key, value)
}

export function addPx(key, value) {
  return value + (isNaN(value) ? '' : appendPx(key))
}
