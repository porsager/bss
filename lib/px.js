const el = typeof document !== 'undefined' && document.createElement('div') // eslint-disable-line

const cache = {
  flex: 0,
  border: 1,
  transform: 1,
  'line-height': 0,
  'box-shadow': 1,
  'border-top': 1,
  'border-left': 1,
  'border-right': 1,
  'border-bottom': 1
}

export default function(x) {
  if ((x[0] === '-' && x[1] === '-') || x in cache)
    return cache[x]

  try {
    el.style[x] = '1px'
    el.style.setProperty(x, '1px')
    return cache[x] = el.style[x].slice(-3) === '1px'
  } catch (err) {
    return cache[x] = false
  }
}