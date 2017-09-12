import { selectorBlock } from './utils'
import { insert, classPrefix } from './sheet'

let count = 0
const keyframeCache = {}

export default function(props) {
  const content = Object.keys(props).map(key =>
    selectorBlock(key, props[key].style || props[key])
  ).join('')

  if (content in keyframeCache)
    return keyframeCache[content]

  const name = classPrefix + ++count
  keyframeCache[content] = name
  insert('@keyframes ' + name + '{' + content + '}')

  return name
}
