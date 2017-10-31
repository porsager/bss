(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.b = factory());
}(this, (function () { 'use strict';

var popular = {
  ai : 'alignItems',
  b  : 'bottom',
  bc : 'backgroundColor',
  br : 'borderRadius',
  bs : 'boxShadow',
  c  : 'color',
  d  : 'display',
  f  : 'float',
  fd : 'flexDirection',
  ff : 'fontFamily',
  fs : 'fontSize',
  h  : 'height',
  jc : 'justifyContent',
  l  : 'left',
  m  : 'margin',
  mb : 'marginBottom',
  ml : 'marginLeft',
  mr : 'marginRight',
  mt : 'marginTop',
  o  : 'opacity',
  p  : 'padding',
  pb : 'paddingBottom',
  pl : 'paddingLeft',
  pr : 'paddingRight',
  pt : 'paddingTop',
  r  : 'right',
  t  : 'top',
  ta : 'textAlign',
  td : 'textDecoration',
  tt : 'textTransform',
  w  : 'width'
};

const shorts = Object.create(null);

const cssProperties = Object.keys(
  findWidth(document.documentElement.style)
).filter(prop => typeof document.documentElement.style[prop] === 'string');

function findWidth(obj) {
  return obj.hasOwnProperty('width')
    ? obj
    : findWidth(Object.getPrototypeOf(obj))
}

const vendorMap = Object.create(null, {});

const vendorRegex = /^(o|O|ms|MS|Ms|moz|Moz|webkit|Webkit|WebKit)([A-Z])/;

function parse(input, value) {
  if (typeof input === 'string') {
    if (typeof value === 'string' || typeof value === 'number')
      return ({ [input] : value })

    return stringToObject(input)
  } else if (Array.isArray(input) && Array.isArray(input.raw)) {
    arguments[0] = { raw: input };
    return stringToObject(String.raw.apply(null, arguments))
  }

  return input.style || sanitize(input)
}

const memoize = (fn, cache = {}) => item =>
  item in cache
    ? cache[item]
    : cache[item] = fn(item);

const appendPx = memoize(prop => {
  const el = document.createElement('div');

  try {
    el.style[prop] = '1px';
    el.style.setProperty(prop, '1px');
    return el.style[prop].slice(-3) === '1px' ? 'px' : ''
  } catch (err) {
    return ''
  }
}, {
  flex: ''
});

function lowercaseFirst(string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

function sanitize(styles) {
  return Object.keys(styles).reduce((acc, key) => {
    const value = styles[key];

    if (!value && value !== 0 && value !== '')
      return acc

    if (key === 'content' && value.charAt(0) !== '"')
      acc[key] = '"' + value + '"';
    else
      acc[key in vendorMap ? vendorMap[key] : key] = addPx(key, value);

    return acc
  }, {})
}

function assign(obj, obj2) {
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key))
      obj[key] = obj2[key];
  }
}

function hyphenToCamelCase(hyphen) {
  return hyphen.slice(hyphen.charAt(0) === '-' ? 1 : 0).replace(/-([a-z])/g, function(match) {
    return match[1].toUpperCase()
  })
}

function camelCaseToHyphen(camelCase) {
  return camelCase.replace(/([A-Z])/g, '-$1').toLowerCase()
}

function initials(camelCase) {
  return camelCase.charAt(0) + (camelCase.match(/([A-Z])/g) || []).join('').toLowerCase()
}

function short(prop) {
  const acronym = initials(prop)
      , short = popular[acronym] && popular[acronym] !== prop ? prop : acronym;

  shorts[short] = prop;
  return short
}



function objectToRules(style) {
  const base = {}
      , rules = [];

  let hasBase = false;

  Object.keys(style).forEach(key => {
    if (key.charAt(0) === '@') {
      rules.push(key + '{' + objectToRules(style[key]) + '}');
    } else if (key.charAt(0) === ' ' || key.charAt(0) === ':') {
      rules.push(selectorBlock('.$' + key, style[key]));
    } else {
      base[key] = style[key];
      hasBase = true;
    }
  });

  if (hasBase)
    rules.unshift(selectorBlock('.$', base));

  return rules
}

function selectorBlock(selector, style) {
  return selector + '{'
    + stylesToCss((typeof style === 'string' ? stringToObject(style) : style))
    + '}'
}

function stylesToCss(style) {
  return Object.keys(style).map(k => propToString(style, k)).join('')
}

function stringToObject(string) {
  return string.replace(/;/g, '\n').split('\n').reduce((acc, line) => {
    const tokens = line.trim().split(/[: ]/);
    if (tokens.length > 1) {
      const key = hyphenToCamelCase(tokens.shift().trim());
      acc[shorts[key] || key] = addPx(shorts[key] || key, tokens.join(' ').trim());
    }
    return acc
  }, {})
}



function propToString(style, k) {
  return (vendorRegex.test(k) ? '-' : '')
  + camelCaseToHyphen(k) + ':' + style[k] + ';'
}

function addPx(key, value) {
  return value + (isNaN(value) ? '' : appendPx(key))
}

const document$1 = window.document;
const classes = Object.create(null, {});
const styleSheet = document$1 && document$1.createElement('style');
styleSheet && document$1.head.appendChild(styleSheet);
const sheet = styleSheet && styleSheet.sheet;

let debug = false;
let rules = [];
let count$1 = 0;

const classPrefix = 'b' + ('000' + ((Math.random() * 46656) | 0).toString(36)).slice(-3) +
                    ('000' + ((Math.random() * 46656) | 0).toString(36)).slice(-3);

function setDebug(d) {
  debug = d;
}

function getSheet() {
  const content = rules.join('');
  rules = [];
  return content
}

function insert(rule, index) {
  rules.push(rule);

  if (debug)
    return styleSheet.textContent += rule

  sheet && sheet.insertRule(rule, arguments.length > 1
    ? index
    : sheet.cssRules.length
  );
}

function createClass(style) {
  const rules = objectToRules(style)
      , css = rules.join('');

  if (css in classes)
    return classes[css]

  const className = classPrefix + (++count$1);

  rules.map(rule =>
    insert(rule.replace(/\.\$/, '.' + className))
  );

  classes[css] = className;

  return className
}

let count = 0;
const keyframeCache = {};

var keyframes = function(props) {
  const content = Object.keys(props).map(key =>
    selectorBlock(key, props[key].style || props[key])
  ).join('');

  if (content in keyframeCache)
    return keyframeCache[content]

  const name = classPrefix + ++count;
  keyframeCache[content] = name;
  insert('@keyframes ' + name + '{' + content + '}');

  return name
};

var pseudos = [
  'active',
  'any',
  'checked',
  'default',
  'disabled',
  'empty',
  'enabled',
  'first',
  'first-child',
  'first-of-type',
  'fullscreen',
  'focus',
  'hover',
  'indeterminate',
  'in-range',
  'invalid',
  'last-child',
  'last-of-type',
  'left',
  'link',
  'only-child',
  'only-of-type',
  'optional',
  'out-of-range',
  'read-only',
  'read-write',
  'required',
  'right',
  'root',
  'scope',
  'target',
  'valid',
  'visited',

  // With value
  'dir',
  'lang',
  'not',
  'nth-child',
  'nth-last-child',
  'nth-last-of-type',
  'nth-of-type',

  // Elements
  'after',
  'before',
  'first-letter',
  'first-line',
  'selection',
  'backdrop',
  'placeholder',
  'marker',
  'spelling-error',
  'grammar-error'
];

function bss(input, value) {
  assign(bss.style, parse.apply(null, arguments));
  return chain(bss)
}

bss.setDebug = setDebug;

bss.style = {};

bss.valueOf = function() {
  return '.' + this.class
};

bss.$keyframes = keyframes;
bss.getSheet = getSheet;
bss.helper = helper;
bss.css = css;
bss.classPrefix = classPrefix;

function chain(instance) {
  const newInstance = Object.create(bss, { style: { value: instance.style } });

  if (instance === bss)
    bss.style = {};

  return newInstance
}

cssProperties.forEach(prop => {
  if (vendorRegex.test(prop)) {
    const unprefixed = lowercaseFirst(prop.replace(vendorRegex, '$2'));
    if (cssProperties.indexOf(unprefixed) === -1) {
      vendorMap[unprefixed] = prop;
      bss[unprefixed] = bss[short(unprefixed)] = setter(prop);
      return
    }
  }

  bss[prop] = bss[short(prop)] = setter(prop);
});

bss.content = function(arg) {
  this.style.content = '"' + arg + '"';
  return chain(this)
};

Object.defineProperty(bss, 'class', {
  get: function() {
    return createClass(this.style)
  }
});

bss.$media = function(value, style) {
  this.style['@media ' + value] = parse(style);
  return chain(this)
};

bss.$nest = function(value, style) {
  this.style[(value.charAt(0) === ':' ? '' : ' ') + value] = parse(style);
  return chain(this)
};

pseudos.forEach(name =>
  bss['$' + hyphenToCamelCase(name)] = function(value, b) {
    this.style[':' + name + (b ? '(' + value + ')' : '')] = parse(b || value);
    return chain(this)
  }
);

function setter(prop) {
  return function CssProperty(value) {
    for (let i = 0; i < arguments.length; i++) {
      if (prop in this.style)
        this.style[prop] += ' ' + addPx(prop, arguments[i]);
      else if (arguments[i] || arguments[i] === 0)
        this.style[prop] = addPx(prop, arguments[i]);
    }

    return chain(this)
  }
}

function css(selector, style) {
  if (arguments.length === 1)
    return Object.keys(selector).forEach(key => css(key, selector[key]))

  insert(selectorBlock(selector, parse(style)), 0);
}

function helper(name, styling) {
  if (arguments.length === 1)
    return Object.keys(name).forEach(key => helper(key, name[key]))

  if (typeof styling === 'object') {
    delete bss[name]; // Needed to avoid weird get calls in chrome
    Object.defineProperty(bss, name, {
      get: function() {
        assign(this.style, parse(styling));
        return chain(this)
      }
    });
    return
  }

  bss[name] = function Helper() {
    const result = styling.apply(null, arguments);
    assign(this.style, result.style);
    return chain(this)
  };
}

bss.helper('$animate', (value, props) =>
  bss.animation(bss.$keyframes(props) + ' ' + value)
);

return bss;

})));
//# sourceMappingURL=bss.js.map
