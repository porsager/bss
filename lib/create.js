import px from './px.js'
import shorts from './shorts.js'
import properties from './properties.js'

const doc = typeof document === 'object' && document
    , validChar = (c, ci) => ci ? x => c.indexOf(x.toLowerCase()) > -1 : x => c.indexOf(x) > -1
    , isProp = validChar('abcdefghijklmnopqrstuvwxyz-')
    , isClass = validChar('abcdefghijklmnopqrstuvwxyz0123456789-_', true)
    , isQuote = validChar('\'"')
    , isPropEnd = validChar(' :')
    , isValueSep = validChar(' ,)')
    , vendorMap = Object.create(null, {})
    , vendorValuePrefix = Object.create(null, {})

properties.forEach(x => {
  const vendor = x.match(/-(ms|o|webkit|moz)-/g)
  if (vendor) {
    const unprefixed = x.replace(/-(ms|o|webkit|moz)-/, '')
    if (properties.indexOf(unprefixed) === -1) {
      if (unprefixed === 'flexDirection')
        vendorValuePrefix.flex = '-' + vendor[1].toLowerCase() + '-flex'
      vendorMap[unprefixed] = x
      return
    }
  }
})

export default function bss({
  root = doc && doc.documentElement.style,
  style = doc && doc.createElement('style'),
  prefix = 'b' + ('000000' + (Math.random() * Math.pow(36, 6) | 0).toString(36)).slice(-6),
  charset
} = {}) {
  const cache = Map()
  const supportsVar = root && typeof CSS !== 'undefined' && CSS.supports('color', 'var(--var)')

  const transforms = []
      , props = []
      , ats = []

  let imports = 0

  function b(xs, ...args) {
    const x = cache.get(xs) || instance()
    x.classes = [x.name]
    if (cache.has(xs)) {
      args.forEach((v, i) => classes(x, v) || setVar(x.name + '-' + (i + 1), v))
      return x
    }

    let s = xs[0]
    for (let i = 1; i < xs.length; i++) {
      const value = args[i - 1]
      if (!classes(x, value)) {
        const prop = props.reduce((acc, fn) => fn(acc), (s.match(/[;\s]\s+([a-z-]+)[:\s].*$/) || [])[1])
        s += setVar(x.name + '-' + i, value, prop, suffix(prop, s))
      }
      s += xs[i]
    }

    parse(removeComments(s), x).forEach(insert)

    cache.set(xs, x)

    return x
  }

  b.count = 0
  b.rules = []
  b.rules.vars = []
  b.vars = {}
  b.debug = false
  b.dev = false
  b.charset = charset
  b.prefix = prefix
  b.properties = properties
  b.at = x => ats.unshift(typeof x === 'function' ? x : (v => x[v.slice(1)] || v))
  b.prop = fn => props.unshift(fn)
  b.transform = fn => transforms.unshift(fn)
  b.create = bss

  b.prop(vendor)
  b.prop(shorts)

  style && doc.head && doc.head.appendChild(style)
  style && (style.id = b.prefix)

  return b

  function classes(x, value) {
    if (value && value.classes) {
      x.classes.push(...value.classes)
      return true
    }
    if (Array.isArray(value)) {
      x.classes.push(...value.map(v => x.classes).flat())
      return true
    }
  }

  function instance() {
    const x = {
      name: (b.prefix + ++b.count),
      classes: [],
      toString: () => x.classes.join(' '),
      valueOf: () => x.classes.join(' ')
    }
    return x
  }

  function vendor(x) {
    if (properties.indexOf(x) === -1) {
      if (vendorMap[x]) {
        b.debug && console.log(x, 'prefixed to', vendorMap[x])
        return vendorMap[x]
      }
      b.debug && console.log(x, 'not found')
    }
    return x
  }

  function suffix(prop, s) {
    if (prop === 'transform') {
      return s.match(/translate(3D|X|Y)?\([^)]*$/)
        ? 'px'
        : s.match(/rotate(3D|X|Y)?\([^)]*$/)
          ? 'deg'
          : ''
    }

    return px(prop) && !s.match(/\([^)]*$/) ? 'px' : ''
  }

  function removeComments(str) {
    return str.replace(/\/\/.*?(\n|$)/g, '\n').replace(/\/\*[\s\S]*?\*\//g, '')
  }

  function getValue(value, suffix) {
    return value + (value.match(/[^-0-9.]/) ? '' : suffix)
  }

  function setVar(name, raw, prop, suffix = '') {
    const x = b.vars[name] || (b.vars[name] = {
      name, prop, suffix,
      change: v => updateVar(x, prop, transforms.reduce((acc, fn) => fn(acc, x.prop, x.change), v))
    })

    x.change(raw)
    x.raw = raw
    return 'var(--' + name + ')'
  }

  function updateVar(x, prop, value) {
    value = getValue(String(value), x.suffix)
    if (x.value !== value) {
      x.value = value
      supportsVar
        ? root.setProperty('--' + x.name, value)
        : x.raw && update(x.index, x.name, prop, value)
    }

    return x.value
  }

  function update(index, name, prop, value) {
    index = index + imports + (b.charset ? 1 : 0)
    if (b.dev) {
      style.textContent = replaceVars(
        (b.charset ? [b.charset] : []).concat(b.rules).map(pretty).join('\n'),
        b.rules.vars[index],
        index
      )
    } else {
      try {
        style.sheet.deleteRule(index)
        style.sheet.insertRule(replaceVars(b.rules[index], b.rules.vars[index], index), index)
      } catch (e) {
        b.debug && console.log('Ignored error:', e)
      }
    }
  }

  function replaceVars(s, vars, index) {
    index = index + imports + (b.charset ? 1 : 0)
    return vars.reduce((acc, x) =>
      acc.replace(x, b.vars[x.slice(6, -1)].value)
    , s)
  }

  function insert(rule) {
    const isImport = rule.indexOf('@import') === 0
        , index = isImport ? 0 : b.rules.length
        , vars = !supportsVar && rule.match(/var\(--[a-z0-9-]+\)/g) || []

    vars.forEach(x => b.vars[x.slice(6, -1)].index = index)
    imports += isImport ? 1 : 0
    index === 0 ? b.rules.unshift(rule) : b.rules.push(rule)
    index === 0 ? b.rules.vars.unshift(vars) : b.rules.vars.push(vars)

    if (b.dev) {
      style.textContent = replaceVars(
        (b.charset ? [b.charset] : []).concat(b.rules).map(pretty).join('\n'),
        vars,
        index
      )
    } else {
      try {
        style.sheet.insertRule(replaceVars(rule, vars, index), index + (b.charset ? 1 : 0))
      } catch (e) {
        b.debug && console.log('Ignored error:', e)
      }
    }
  }

  function pretty(str) {
    return str
      .replace(/{/g, ' {\n')
      .replace(/([;{])\n*/g, '$1\n  ')
      .replace(/(.*):(.*);/g, '$1: $2;')
      .replace(/[\s]*}/g, '\n}\n')
      .replace(/,\s*/g, ', ')
      .replace(/@.*{[\s\S]*?}[\s]*}/g, m =>
        m.split('\n').reduce((acc, x, i, xs) =>
          acc + (i < xs.length - 1 ? '\n' : '') + (i > 1 && i < xs.length - 2 ? '  ' : '') + x
        , '')
      ).trim().replace('}\n\n}', '}\n}')
  }

  function parse(s, x) {
    const rules = []
        , props = propsState()
        , level = []

    let at = false
      , supports = false
      , name = false

    for (let i = 0; i < s.length; i++) {
      if (i > 0 && name && !isClass(s[i])) {
        x.name = s.slice(1, i) + '-' + x.name
        name = false
      }
      if (name || (i === 0 && s[i] === '.')) {
        name = true
        continue // eslint-disable-line
      }
      propsParseLoop(s, i, props)

      if (s[i] === '}' || i === s.length - 1) {
        parseAddProps(at || supports || rules, i, x.name, props, level)

        if (at && !level.length) {
          (supports || rules).push(at.selector + '{' + at.join('') + '}')
          at = false
        }
        if (supports && !level.length) {
          rules.push(supports.selector + '{' + supports.join('') + '}')
          supports = false
        }
        level.pop()
      } else if (s[i] === '{') {
        const selector = s.slice(props.end, i).trim()
        parseAddProps(at || supports || rules, i, x.name, props, level)
        props.prop = props.value = null
        selector.indexOf('@supports') === 0
          ? supports = Object.assign([], { selector })
          : selector[0] === '@'
            ? at = Object.assign([], { selector: ats.reduce((acc, fn) => fn(acc), selector.trim()) })
            : level.push(selector)
      }
    }

    return rules
  }

  function parseAddProps(xs, i, name, props, level) { // eslint-disable-line
    const content = props.out.length && props.out.map(x => x.join(':')).join(';')
    content && xs.push(
      (
       (!level.length || level[0][0] !== '&') && (!xs.selector || xs.selector.indexOf('@keyframes ')) !== 0
        ? '.' + name + (level.length && level[0][0] !== ':' ? ' ' : '')
        : ''
      )
      + level.join(' ').replace(/&/g, '.' + name).replace(/ :/g, ':')
      + '{' + content + ';}'
    )
    props.end = i + 1
    props.out = []
  }

  function propsParse(s) {
    const x = propsState()
    for (let i = 0; i <= s.length; i++)
      propsParseLoop(s.trim(), i, x)

    return x.out
  }

  function propsState() {
    return {
      prop: null,
      value:  null,
      out: [],
      lean: true,
      comma: 0,
      end: 0,
      quote: false
    }
  }

  function propsParseLoop(s, i, x) {
    if (!x.value && x.prop !== null && x.lean && s[i] === ':')
      x.lean = false
    if (!x.value && x.prop !== null && s[i] === ',') {
      x.value = x.comma
      x.prop = x.out[x.out.length - 1][0]
    } else if (!x.value && x.prop === null && isProp(s[i])) {
      x.prop = i
    } else if (typeof x.prop === 'number' && (i === s.length - 1 || (!x.value && (isPropEnd(s[i]) || (x.lean && s[i] === '\n'))))) {
      x.value = i + 1
    }
    propAdd(s, i, x)
  }

  function propAdd(s, i, x) {
    if (x.value && isQuote(s[i]))
      x.quote = !x.quote

    if (!x.quote && x.prop !== null && (i === s.length - 1 || s[i] === ';' || s[i + 1] === '}' || (x.lean && s[i - 1] !== ',' && s[i] === '\n'))) {
      x.out.push(
        propParse(
          s.slice(x.prop, i + 1).match(/\s*([a-z-]+)[\s:]*([^;]+)/).slice(1)
        )
      )
      x.end = i + 1
      x.comma = x.value
      x.value = x.prop = null
      x.lean = true
    }
  }

  function propParse([prop, s]) {
    prop = props.reduce((acc, fn) => fn(acc), prop.trim())

    if (!px(prop))
      return [prop, s.trim()]

    let result = ''
    let end = 0
    let ignore = false
    for (let i = 0; i < s.length; i++) {
      if (isValueSep(s[i]) || i === s.length - 1) {
        const last = s.slice(end, i + 1).trim()
        result += (ignore ? last : last.replace(/(^|[( ,])([-0-9.]+)([ ,)]|$)/g, '$1$2px$3').trim()) + (s[i] === ')' ? '' : ' ')
        end = i + 1
      }
      if (s[i] === '(' || s[i - 1] === ')')
        ignore = prop !== 'transform' || s.slice(end, i).indexOf('translate') !== 0
    }

    return [prop, result.trim().replace(/[\n ]+/g, ' ')]
  }

}

function Map() {
  let keys = []
    , values = []

  const map = {
    has: x => keys.indexOf(x) !== -1,
    get: x => values[keys.indexOf(x)],
    set: (x, v) => (keys.push[x], values.push(v), map),
    delete: x => keys.indexOf(x) !== -1 && values.splice(keys.indexOf(values), 1),
    forEach: fn => keys.forEach((k, i) => fn(values[i], k, map)),
    clear: () => (keys = [], values = [], undefined)
  }

  return map
}
