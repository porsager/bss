import px from './px.js'
import shorts from './shorts.js'
import properties from './properties.js'

const doc = window && typeof window.document === 'object' && window.document
    , validChar = (c, ci) => ci ? x => c.indexOf(x.toLowerCase()) > -1 : x => c.indexOf(x) > -1
    , isProp = validChar('abcdefghijklmnopqrstuvwxyz-')
    , isClass = validChar('abcdefghijklmnopqrstuvwxyz0123456789-_', true)
    , isQuote = validChar('\'"')
    , isPropEnd = validChar(' :')
    , isValueSep = validChar(' ,)')
    , vendorMap = Object.create(null, {})
    , vendorValuePrefix = Object.create(null, {})
    , randomId = () => 'bss' + ('000000' + (Math.random() * Math.pow(36, 6) | 0).toString(36)).slice(-6)

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
  style = doc && doc.querySelector && doc.querySelector('.bss_style') || doc.createElement('style'),
  prefix = style && style.getAttribute('id') || randomId(),
  append = true
} = {}) {
  const cache = {}
      , props = []
      , ats = []

  const b = bss()

  b.count = 0
  b.rules = style && style.textContent && style.textContent.split(b.prefix + '{}') || []
  b.debug = false
  b.dev = false
  b.prefix = prefix
  b.properties = properties
  b.at = x => ats.unshift(typeof x === 'function' ? x : (v => x[v.slice(1)] || v))
  b.prop = fn => props.unshift(fn)
  b.create = bss
  b.ssr = ssr
  b.global = global

  b.prop(vendor)
  b.prop(shorts)

  style && (style.id = b.prefix)

  return b

  function global() {
    const style = b.apply(b, arguments)
    parse(removeComments(style.content).trim(), '__raw').forEach(x =>
      insert(x.replace(/.__raw/g, '').trim())
    )
  }

  function ValueOf() {
    if (this.className)
      return this.className

    this.className = b.prefix + ++b.count
    parse(removeComments(this.content).trim(), this.className).forEach(insert)
    return this.className
  }

  function bss(pre) {
    return function(xs, ...args) {
      let s = (pre || '') + xs[0]
      for (let i = 1; i < xs.length; i++) {
        const value = args[i - 1]
        s += (value && value.toString === ValueOf
          ? value.content
          : Array.isArray(value)
            ? value.map(x => x.content || x).join('\n')
            : value)
          + xs[i]
      }

      if (s in cache)
        return cache[s]

      const x = bss('\n' + s + '\n')
      x.toString = x.valueOf = ValueOf
      x.content = s

      cache[s] = x

      return x
    }
  }

  function ssr() {
    return '<style class="bss_style" id="' + b.prefix + '">' + b.rules.join(b.prefix + '{}') + '</style>'
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

  function removeComments(str) {
    return str.replace(/\/\/.*?(\n|$)/g, '\n').replace(/\/\*[\s\S]*?\*\//g, '')
  }

  function insert(rule) {
    if (append) {
      style && doc.head && doc.head.appendChild(style)
      append = false
    }

    const isImport = rule.indexOf('@import') === 0
        , index = isImport ? 0 : b.rules.length

    index === 0 ? b.rules.unshift(rule) : b.rules.push(rule)

    if (b.dev && style) {
      style.textContent = b.rules.map(pretty).join('\n')
    } else if (style && style.sheet) {
      try {
        style.sheet.insertRule(rule, index)
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

    let ani = false
      , at = false
      , supports = false
      , name = false

    for (let i = 0; i < s.length; i++) {
      if (i > 0 && name && !isClass(s[i])) {
        x = s.slice(1, i) + '-' + x
        name = false
      }
      if (name || (i === 0 && s[i] === '.')) {
        name = true
        continue // eslint-disable-line
      }
      propsParseLoop(s, i, s[i], props)

      if (s[i] === '}' || i === s.length - 1) {
        parseAddProps(ani || at || supports || rules, i, x, props, level)
        if (ani && !level.length) {
          (at || supports || rules).push(ani.selector + '{' + ani.join('') + '}')
          ani = false
        }
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
        const selector = s.slice(props.end, i).trim().replace(/,[\s]*/, ',& ')
        if (selector.indexOf('animation') === 0)
          props.out.push(['animation', selector.slice(10) + ' ' + x])
        parseAddProps(ani || at || supports || rules, i, x, props, level)
        props.prop = props.value = null
        selector.indexOf('@supports') === 0
          ? supports = Object.assign([], { selector })
          : selector[0] === '@'
            ? at = Object.assign([], { selector: ats.reduce((acc, fn) => fn(acc), selector.trim()) })
            : selector.indexOf('animation') === 0
              ? ani = Object.assign([], { selector: '@keyframes ' + x })
              : level.push(selector)
      }
    }

    return rules
  }

  function parseAddProps(xs, i, name, props, level) { // eslint-disable-line
    const content = props.out.length && props.out.map(x => x.join(':')).join(';')
    content && xs.push(
      ((!level.length || level[0][0] !== '&') && (!xs.selector || xs.selector.indexOf('@keyframes ')) !== 0
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
      propsParseLoop(s, i, s[i], x)
    return x.out.reduce((acc, [a, b]) => acc + a + ':' + b + ';', '')
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

  function propsParseLoop(s, i, v, x) {
    if (!x.value && x.prop !== null && x.lean && v === ':')
      x.lean = false
    if (!x.value && x.prop !== null && x.out.length && v === ',') {
      x.value = x.comma
      x.prop = x.out[x.out.length - 1][0]
    } else if (!x.value && x.prop === null && isProp(v)) {
      x.prop = i
    } else if (typeof x.prop === 'number' && (i === s.length - 1 || (!x.value && (isPropEnd(v) || (x.lean && v === '\n'))))) {
      x.value = i + 1
    }
    propAdd(s, i, v, x)
  }

  function propAdd(s, i, v, x) {
    if (x.value && isQuote(v))
      x.quote = !x.quote

    if (!x.quote && x.prop !== null && (i === s.length - 1 || v === ';' || s[i + 1] === '}' || (x.lean && s[i - 1] !== ',' && v === '\n'))) {
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

  function propParse([key, value]) {
    key = props.reduce((acc, fn) => fn(acc), key.trim())

    let result = ''
    let end = 0
    let unit = 'px'
    for (let i = 0; i < value.length; i++) {
      if (isValueSep(value[i]) || i === value.length - 1) {
        const last = value.slice(end, i + 1).trim()
        result += ((unit && px(key))
          ? last.replace(/(^|[( ,])([-0-9.]+)([ ,)]|$)/g, '$1$2' + unit + '$3').trim()
          : last) + (value[i] === ',' ? '' : ' ')
        end = i + 1
      }
      if (value[i] === '(' || value[i - 1] === ')') {
        unit = value.slice(end, i).indexOf('translate') === 0
          ? 'px'
          : value.slice(end, i).indexOf('rotate') === 0
            ? 'deg'
            : ''
      }
    }

    return [key, result.trim().replace(/[\n ]+/g, ' ')]
  }
}
