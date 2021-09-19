var pseudos = [
  ":active",
  ":any",
  ":checked",
  ":default",
  ":disabled",
  ":empty",
  ":enabled",
  ":first",
  ":first-child",
  ":first-of-type",
  ":fullscreen",
  ":focus",
  ":hover",
  ":indeterminate",
  ":in-range",
  ":invalid",
  ":last-child",
  ":last-of-type",
  ":left",
  ":link",
  ":only-child",
  ":only-of-type",
  ":optional",
  ":out-of-range",
  ":read-only",
  ":read-write",
  ":required",
  ":right",
  ":root",
  ":scope",
  ":target",
  ":valid",
  ":visited",
  ":dir",
  ":lang",
  ":not",
  ":nth-child",
  ":nth-last-child",
  ":nth-last-of-type",
  ":nth-of-type",
  "::after",
  "::before",
  "::first-letter",
  "::first-line",
  "::selection",
  "::backdrop",
  "::placeholder",
  "::marker",
  "::spelling-error",
  "::grammar-error"
];

var popular = {
  ai: "alignItems",
  b: "bottom",
  bc: "backgroundColor",
  br: "borderRadius",
  bs: "boxShadow",
  bi: "backgroundImage",
  c: "color",
  d: "display",
  f: "float",
  fd: "flexDirection",
  ff: "fontFamily",
  fs: "fontSize",
  h: "height",
  jc: "justifyContent",
  l: "left",
  lh: "lineHeight",
  ls: "letterSpacing",
  m: "margin",
  mb: "marginBottom",
  ml: "marginLeft",
  mr: "marginRight",
  mt: "marginTop",
  o: "opacity",
  p: "padding",
  pb: "paddingBottom",
  pl: "paddingLeft",
  pr: "paddingRight",
  pt: "paddingTop",
  r: "right",
  t: "top",
  ta: "textAlign",
  td: "textDecoration",
  tt: "textTransform",
  w: "width"
};

const cssProperties = ["float"].concat(Object.keys(typeof document === "undefined" ? {} : findWidth(document.documentElement.style)).filter((p) => p.indexOf("-") === -1 && p !== "length"));
function findWidth(obj) {
  return obj ? obj.hasOwnProperty("width") ? obj : findWidth(Object.getPrototypeOf(obj)) : {};
}
const isProp = /^-?-?[a-z][a-z-_0-9]*$/i;
const memoize = (fn, cache = {}) => (item) => item in cache ? cache[item] : cache[item] = fn(item);
function add(style, prop, values) {
  if (prop in style)
    add(style, "!" + prop, values);
  else
    style[prop] = formatValues(prop, values);
}
const vendorMap = Object.create(null, {});
const vendorValuePrefix = Object.create(null, {});
const vendorRegex = /^(o|O|ms|MS|Ms|moz|Moz|webkit|Webkit|WebKit)([A-Z])/;
const appendPx = memoize((prop) => {
  const el = document.createElement("div");
  try {
    el.style[prop] = "1px";
    el.style.setProperty(prop, "1px");
    return el.style[prop].slice(-3) === "1px" ? "px" : "";
  } catch (err) {
    return "";
  }
}, {
  flex: "",
  boxShadow: "px",
  border: "px",
  borderTop: "px",
  borderRight: "px",
  borderBottom: "px",
  borderLeft: "px"
});
function lowercaseFirst(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
function assign(obj, obj2) {
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      obj[key] = typeof obj2[key] === "string" ? obj2[key] : assign(obj[key] || {}, obj2[key]);
    }
  }
  return obj;
}
const hyphenSeparator = /-([a-z])/g;
function hyphenToCamelCase(hyphen) {
  return hyphen.slice(hyphen.charAt(0) === "-" ? 1 : 0).replace(hyphenSeparator, function(match) {
    return match[1].toUpperCase();
  });
}
const camelSeparator = /(\B[A-Z])/g;
function camelCaseToHyphen(camelCase) {
  return camelCase.replace(camelSeparator, "-$1").toLowerCase();
}
const initialMatch = /([A-Z])/g;
function initials(camelCase) {
  return camelCase.charAt(0) + (camelCase.match(initialMatch) || []).join("").toLowerCase();
}
const ampersandMatch = /&/g;
function objectToRules(style, selector, suffix = "", single) {
  const base = {};
  const extra = suffix.indexOf("&") > -1 && suffix.indexOf(",") === -1 ? "" : "&";
  let rules = [];
  Object.keys(style).forEach((prop) => {
    if (prop.charAt(0) === "@")
      rules.push(prop + "{" + objectToRules(style[prop], selector, suffix, single).join("") + "}");
    else if (typeof style[prop] === "object")
      rules = rules.concat(objectToRules(style[prop], selector, suffix + prop, single));
    else
      base[prop] = style[prop];
  });
  if (Object.keys(base).length) {
    rules.unshift(((single || suffix.charAt(0) === " " ? "" : "&") + extra + suffix).replace(ampersandMatch, selector).trim() + "{" + stylesToCss(base) + "}");
  }
  return rules;
}
const selectorSplit = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
function stylesToCss(style) {
  return Object.keys(style).reduce((acc, prop) => acc + propToString(prop.charAt(0) === "!" ? prop.slice(1) : prop, style[prop]), "");
}
function propToString(prop, value) {
  prop = prop in vendorMap ? vendorMap[prop] : prop;
  return (vendorRegex.test(prop) ? "-" : "") + (cssVar(prop) ? prop : camelCaseToHyphen(prop)) + ":" + value + ";";
}
function formatValues(prop, value) {
  return Array.isArray(value) ? value.map((v) => formatValue(prop, v)).join(" ") : typeof value === "string" ? formatValues(prop, value.split(" ")) : formatValue(prop, value);
}
function formatValue(prop, value) {
  return value in vendorValuePrefix ? vendorValuePrefix[value] : value + (isNaN(value) || value === null || value === 0 || value === "0" || typeof value === "boolean" || cssVar(prop) ? "" : appendPx(prop));
}
function cssVar(prop) {
  return prop.charAt(0) === "-" && prop.charAt(1) === "-";
}

const classPrefix = "b" + ("000" + (Math.random() * 46656 | 0).toString(36)).slice(-3) + ("000" + (Math.random() * 46656 | 0).toString(36)).slice(-3);
const styleSheet = typeof document === "object" && document.createElement("style");
styleSheet && document.head && document.head.appendChild(styleSheet);
styleSheet && (styleSheet.id = classPrefix);
const sheet = styleSheet && styleSheet.sheet;
let debug = false;
let classes = Object.create(null, {});
let rules = [];
let count$1 = 0;
function setDebug(d) {
  debug = d;
}
function getSheet() {
  const content = rules.join("");
  rules = [];
  classes = Object.create(null, {});
  count$1 = 0;
  return content;
}
function getRules() {
  return rules;
}
function insert(rule, index) {
  rules.push(rule);
  if (debug)
    return styleSheet.textContent = rules.join("\n");
  try {
    sheet && sheet.insertRule(rule, arguments.length > 1 ? index : sheet.cssRules.length);
  } catch (e) {
  }
}
function createClass(style) {
  const json = JSON.stringify(style);
  if (json in classes)
    return classes[json];
  const className = classPrefix + ++count$1, rules2 = objectToRules(style, "." + className);
  for (let i = 0; i < rules2.length; i++)
    insert(rules2[i]);
  classes[json] = className;
  return className;
}

const shorts = Object.create(null);
function bss(input, value) {
  const b = chain(bss);
  input && assign(b.__style, parse.apply(null, arguments));
  return b;
}
function setProp(prop, value) {
  Object.defineProperty(bss, prop, {
    configurable: true,
    value
  });
}
Object.defineProperties(bss, {
  __style: {
    configurable: true,
    writable: true,
    value: {}
  },
  valueOf: {
    configurable: true,
    writable: true,
    value: function() {
      return "." + this.class;
    }
  },
  toString: {
    configurable: true,
    writable: true,
    value: function() {
      return this.class;
    }
  }
});
setProp("setDebug", setDebug);
setProp("$keyframes", keyframes);
setProp("$media", $media);
setProp("$import", $import);
setProp("$nest", $nest);
setProp("getSheet", getSheet);
setProp("getRules", getRules);
setProp("helper", helper);
setProp("css", css);
setProp("classPrefix", classPrefix);
function chain(instance) {
  const newInstance = Object.create(bss, {
    __style: {
      value: assign({}, instance.__style)
    },
    style: {
      enumerable: true,
      get: function() {
        return Object.keys(this.__style).reduce((acc, key) => {
          if (typeof this.__style[key] === "number" || typeof this.__style[key] === "string")
            acc[key.charAt(0) === "!" ? key.slice(1) : key] = this.__style[key];
          return acc;
        }, {});
      }
    }
  });
  if (instance === bss)
    bss.__style = {};
  return newInstance;
}
cssProperties.forEach((prop) => {
  const vendor = prop.match(vendorRegex);
  if (vendor) {
    const unprefixed = lowercaseFirst(prop.replace(vendorRegex, "$2"));
    if (cssProperties.indexOf(unprefixed) === -1) {
      if (unprefixed === "flexDirection")
        vendorValuePrefix.flex = "-" + vendor[1].toLowerCase() + "-flex";
      vendorMap[unprefixed] = prop;
      setProp(unprefixed, setter(prop));
      setProp(short(unprefixed), bss[unprefixed]);
      return;
    }
  }
  setProp(prop, setter(prop));
  setProp(short(prop), bss[prop]);
});
setProp("content", function Content(arg) {
  const b = chain(this);
  arg === null || arg === void 0 || arg === false ? delete b.__style.content : b.__style.content = '"' + arg + '"';
  return b;
});
Object.defineProperty(bss, "class", {
  set: function(value) {
    this.__class = value;
  },
  get: function() {
    return this.__class || createClass(this.__style);
  }
});
function $media(value, style) {
  const b = chain(this);
  if (value)
    b.__style["@media " + value] = parse(style);
  return b;
}
const hasUrl = /^('|"|url\('|url\(")/i;
function $import(value) {
  value && insert("@import " + (hasUrl.test(value) ? value : '"' + value + '"') + ";", 0);
  return chain(this);
}
function $nest(selector, properties) {
  const b = chain(this);
  if (arguments.length === 1)
    Object.keys(selector).forEach((x) => addNest(b.__style, x, selector[x]));
  else if (selector)
    addNest(b.__style, selector, properties);
  return b;
}
function addNest(style, selector, properties) {
  const prop = selector.split(selectorSplit).map((x) => {
    x = x.trim();
    return (x.charAt(0) === ":" || x.charAt(0) === "[" ? "" : " ") + x;
  }).join(",&");
  prop in style ? assign(style[prop], parse(properties)) : style[prop] = parse(properties);
}
pseudos.forEach((name) => setProp("$" + hyphenToCamelCase(name.replace(/:/g, "")), function Pseudo(value, style) {
  const b = chain(this);
  if (isTagged(value))
    b.__style[name] = parse.apply(null, arguments);
  else if (value || style)
    b.__style[name + (style ? "(" + value + ")" : "")] = parse(style || value);
  return b;
}));
function setter(prop) {
  return function CssProperty(value) {
    const b = chain(this);
    if (!value && value !== 0)
      delete b.__style[prop];
    else if (arguments.length > 0)
      add(b.__style, prop, Array.prototype.slice.call(arguments));
    return b;
  };
}
function css(selector, style) {
  if (arguments.length === 1)
    Object.keys(selector).forEach((key) => addCss(key, selector[key]));
  else
    addCss(selector, style);
  return chain(this);
}
function addCss(selector, style) {
  objectToRules(parse(style), selector, "", true).forEach((rule) => insert(rule));
}
function helper(name, styling) {
  if (arguments.length === 1)
    return Object.keys(name).forEach((key) => helper(key, name[key]));
  delete bss[name];
  if (typeof styling === "function") {
    helper[name] = styling;
    Object.defineProperty(bss, name, {
      configurable: true,
      value: function Helper(input) {
        const b = chain(this);
        const result = isTagged(input) ? styling(raw(input, arguments)) : styling.apply(null, arguments);
        assign(b.__style, result.__style);
        return b;
      }
    });
  } else {
    helper[name] = parse(styling);
    Object.defineProperty(bss, name, {
      configurable: true,
      get: function() {
        const b = chain(this);
        assign(b.__style, parse(styling));
        return b;
      }
    });
  }
}
bss.helper("$animate", (value, props) => bss.animation(bss.$keyframes(props) + " " + value));
function short(prop) {
  const acronym = initials(prop), short2 = popular[acronym] && popular[acronym] !== prop ? prop : acronym;
  shorts[short2] = prop;
  return short2;
}
const blockEndMatch = /;(?![^("]*[)"])|\n/;
const commentsMatch = /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*(?![^("]*[)"])/g;
const propSeperator = /[ :]+/;
const stringToObject = memoize((string) => {
  let last = "", prev;
  return string.trim().replace(commentsMatch, "").split(blockEndMatch).reduce((acc, line) => {
    if (!line)
      return acc;
    line = last + line.trim();
    const [key, ...tokens] = line.replace(propSeperator, " ").split(" ");
    last = line.charAt(line.length - 1) === "," ? line : "";
    if (last)
      return acc;
    if (line.charAt(0) === "," || !isProp.test(key)) {
      acc[prev] += " " + line;
      return acc;
    }
    if (!key)
      return acc;
    const prop = key.charAt(0) === "-" && key.charAt(1) === "-" ? key : hyphenToCamelCase(key);
    prev = shorts[prop] || prop;
    if (key in helper) {
      typeof helper[key] === "function" ? assign(acc, helper[key](...tokens).__style) : assign(acc, helper[key]);
    } else if (prop in helper) {
      typeof helper[prop] === "function" ? assign(acc, helper[prop](...tokens).__style) : assign(acc, helper[prop]);
    } else if (tokens.length > 0) {
      add(acc, prev, tokens);
    }
    return acc;
  }, {});
});
let count = 0;
const keyframeCache = {};
function keyframes(props) {
  const content = Object.keys(props).reduce((acc, key) => acc + key + "{" + stylesToCss(parse(props[key])) + "}", "");
  if (content in keyframeCache)
    return keyframeCache[content];
  const name = classPrefix + count++;
  keyframeCache[content] = name;
  insert("@keyframes " + name + "{" + content + "}");
  return name;
}
function parse(input, value) {
  if (typeof input === "string") {
    if (typeof value === "string" || typeof value === "number")
      return { [input]: value };
    return stringToObject(input);
  } else if (isTagged(input)) {
    return stringToObject(raw(input, arguments));
  }
  return input.__style || sanitize(input);
}
function isTagged(input) {
  return Array.isArray(input) && typeof input[0] === "string";
}
function raw(input, args) {
  let str = "";
  for (let i = 0; i < input.length; i++)
    str += input[i] + (args[i + 1] || args[i + 1] === 0 ? args[i + 1] : "");
  return str;
}
function sanitize(styles) {
  return Object.keys(styles).reduce((acc, key) => {
    const value = styles[key];
    key = shorts[key] || key;
    if (!value && value !== 0 && value !== "")
      return acc;
    if (key === "content" && value.charAt(0) !== '"')
      acc[key] = '"' + value + '"';
    else if (typeof value === "object")
      acc[key] = sanitize(value);
    else
      add(acc, key, value);
    return acc;
  }, {});
}

export { bss as default };
//# sourceMappingURL=bss.esm.js.map
