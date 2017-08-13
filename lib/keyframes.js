import { selectorToStyle } from './utils'
import { prepend, classPrefix } from './sheet'

let count = 0
const keyframeCache = {}

export default function(props) {
  const content = Object.keys(props).map(key =>
    selectorToStyle(key, props[key].style || props[key])
  ).join('')

  if (content in keyframeCache)
    return keyframeCache[content]

  const name = classPrefix + ++count
  keyframeCache[content] = name
  prepend('@keyframes ' + name + '{' + content + '}')

  return name
}
