import { objectToCss, getStyleSheetText } from './utils'

const styleSheet = document.createElement('style')
const classes = Object.create(null, {})

let prefix = ''
let count = 0
let scheduled = false

const Promise = window.Promise || {
  resolve: () => ({ then: (fn) => setTimeout(fn, 0) })
}

document.head.appendChild(styleSheet)

export const classPrefix = 'b' + ('000' + ((Math.random() * 46656) | 0).toString(36)).slice(-3) +
                    ('000' + ((Math.random() * 46656) | 0).toString(36)).slice(-3)

export function forceUpdate() {
  scheduled = false

  styleSheet.textContent = prefix + getStyleSheetText(classes)
}

export function prepend(string) {
  prefix += String(string)
}

export function createClass(style) {
  const css = objectToCss(style)

  if (css in classes) // Cconsider caching json for performance
    return classes[css]

  const className = classPrefix + (++count)

  classes[css] = className

  scheduleUpdate()

  return className
}

function scheduleUpdate() {
  if (scheduled)
    return

  scheduled = true
  Promise.resolve().then(forceUpdate)
}
