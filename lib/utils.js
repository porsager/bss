import popular from './popular'

const shorts = Object.create(null)

export const cssProperties = Object.keys(
  findWidth(document.documentElement.style)
).filter(prop => typeof document.documentElement.style[prop] === 'string')

function findWidth(obj) {
  return obj.hasOwnProperty('width')
    ? obj
    : findWidth(Object.getPrototypeOf(obj))
}

export const vendorMap = Object.create(null, {})

export const vendorRegex = /^(o|O|ms|MS|Ms|moz|Moz|webkit|Webkit|WebKit)([A-Z])/

const edge = window.navigator.userAgent.indexOf('Edge') > -1

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) > -1
}

// Figure out recognizing shorthands (eg gridGap)
const pxProperties = (function() {
  const el = document.createElement('div')

  return cssProperties.filter(prop => {
    try {
      el.style[prop] = '1px'
      el.style.setProperty(prop, '1px')
    } catch (err) {
      return
    }

    return endsWith(!edge && el.style[prop] || el.style.getPropertyValue(prop), 'px')
  }).concat('gridGap')
}())

export function lowercaseFirst(string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

export function assign(obj, obj2) {
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key))
      obj[key] = obj2[key]
  }
}

export function hyphenToCamelCase(hyphen) {
  return hyphen.replace(/-([a-z])/g, function(match) {
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

export function objectToCss(style) {
  const atRules = []
      , nested = []

  let notEmpty = false

  Object.keys(style).forEach(item => {
    if (item.charAt(0) === '@') {
      atRules.push([item, style[item]])
      delete style[item]
    } else if (item.charAt(0) === ' ' || item.charAt(0) === ':') {
      nested.push([item, style[item]])
      delete style[item]
    } else {
      notEmpty = true
    }
  })

  return (notEmpty ? selectorToStyle('.CLASS_NAME', style) : '')
  + nested.map(([target, style]) =>
    selectorToStyle('.CLASS_NAME' + target, style)
  ).join('')

  + atRules.map(([atRule, style]) =>
    atRule + '{' + selectorToStyle('.CLASS_NAME', style) + '}'
  ).join('')
}

export function selectorToStyle(selector, style) {
  if (!style)
    console.trace(selector, style)
  return selector + '{'
    + stylesToCss((typeof style === 'string' ? stringToObject(style) : style))
    + '}'
}

export function stylesToCss(style) {
  style = sanitize(style)
  return Object.keys(style).map(k => propToString(style, k)).join('')
}

export function sanitize(styles) {
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

export function stringToObject(string) {
  return string.indexOf(';') > -1
    ? cssToObject(string)
    : stylusToObject(string)
}

function cssToObject(string) {
  return string.split(';').reduce((acc, line) => {
    const [prop, value] = line.trim().split(':')
    if (prop && value)
      acc[hyphenToCamelCase(prop.trim())] = value.trim()
    return acc
  }, {})
}

function stylusToObject(string) {
  return string.split('\n').reduce((acc, line) => {
    const tokens = line.trim().split(/[: ]/)
    if (tokens.length > 1) {
      const key = hyphenToCamelCase(tokens.shift().trim())
      acc[shorts[key] || key] = tokens.join(' ').trim()
    }
    return acc
  }, {})
}

export function readClasses(sheet) {
  throw new Error('not implemented')
}

function propToString(style, k) {
  return (vendorRegex.test(k) ? '-' : '')
  + camelCaseToHyphen(k) + ':' + style[k] + ';'
}

function addPx(key, value) {
  return value + (!isNaN(value) && pxProperties.indexOf(key) > -1 ? 'px' : '')
}
