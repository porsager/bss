const el = typeof document !== 'undefined' && document.createElement('div')

export default function(x, cache = {
  flex: 0,
  border: 1,
  'line-height': 0,
  'box-shadow': 1,
  'border-top': 1,
  'border-left': 1,
  'border-right': 1,
  'border-bottom': 1
}) {
  try {
    el.style[x] = '1px'
    el.style.setProperty(x, '1px')
    return el.style[x].slice(-3) === '1px'
  } catch (err) {
    return false
  }
}
