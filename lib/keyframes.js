import { insert, classPrefix } from './sheet'

let count = 0
const keyframeCache = {}

export default function(props) {
  const content = Object.keys(props).reduce((acc, key) =>
    acc + key + '{' + props[key].style || props[key] + '}'
  , '')

  if (content in keyframeCache)
    return keyframeCache[content]

  const name = classPrefix + ++count
  keyframeCache[content] = name
  insert('@keyframes ' + name + '{' + content + '}')

  return name
}
