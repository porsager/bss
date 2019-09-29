import properties from './properties.js'

const initials = (acc, x) => Object.assign(acc, {
  [x.split('-').map(x => x[0]).join('')]: x
})

const popular = [
  'align-items',
  'bottom',
  'background-color',
  'border-radius',
  'box-shadow',
  'background-image',
  'color',
  'display',
  'float',
  'flex-direction',
  'font-family',
  'font-size',
  'height',
  'justify-content',
  'left',
  'line-height',
  'letter-spacing',
  'margin',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'margin-top',
  'opacity',
  'padding',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'right',
  'top',
  'text-align',
  'text-decoration',
  'text-transform',
  'width'
]

const shorts = Object.assign(
  properties.reduce(initials, {}),
  popular.reduce(initials, {})
)

export default x => shorts[x] || x
