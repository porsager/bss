import {
  objectToRules
} from './utils'

const document = window.document
const classes = Object.create(null, {})
const styleSheet = document && document.createElement('style')
styleSheet && document.head.appendChild(styleSheet)
const sheet = styleSheet && styleSheet.sheet

let debug = false
let rules = []
let count = 0

export const classPrefix = 'b' + ('000' + ((Math.random() * 46656) | 0).toString(36)).slice(-3) +
                    ('000' + ((Math.random() * 46656) | 0).toString(36)).slice(-3)

export function setDebug(d) {
  debug = d
}

export function getSheet() {
  const content = rules.join('')
  rules = []
  return content
}

export function insert(rule, index) {
  rules.push(rule)

  if (debug)
    return styleSheet.textContent += rule

  sheet && sheet.insertRule(rule, arguments.length > 1
    ? index
    : sheet.cssRules.length
  )
}

export function createClass(style) {
  const rules = objectToRules(style)
      , css = rules.join('')

  if (css in classes)
    return classes[css]

  const className = classPrefix + (++count)

  rules.map(rule =>
    insert(rule.replace(/\.\$/, '.' + className))
  )

  classes[css] = className

  return className
}
