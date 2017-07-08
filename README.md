[![version](https://img.shields.io/npm/v/bss.svg)]() [![gzipped](http://img.badgesize.io/porsager/bss/bss.js.svg?compression=gzip&label=gzipped)]() [![license](https://img.shields.io/github/license/porsager/wright.svg)]()

## `bss`

A simpler way to do CSS in Javascript directly on the elements you're styling.

`bss` allows you to write your styles directly on the element where they matter using plenty of fun constructors.

- [CSS Strings](#css-strings)
- [Lean Strings](#lean-strings)
- [JS Objects](#js-objects)
- [Functions](#functions)
- [Helpers](#helpers)

Any group of definitions are resolved once one of the following properties are accessed / called

- [`.style` Returns a Javascript style object ](#style)
- [`.class` Returns a class name](#class)
- [`.toString() or '' +` returns '.' + b.class](#tostring)

## Installation

Using npm
``` bash
npm install bss -S
```

Require from CDN
``` html
<script src="https://unpkg.com/bss"></script>
```

Or download and include - [download bss.js](https://unpkg.com/bss/bss.js)


## Example usage

Here's a quick example of using bss togher with [mithril](https://github.com/mithriljs/mithril.js)
See the example [live here](https://flems.io)

``` js
// Some js file
import b from 'bss'
import m from 'mithril'

let on = true

m.mount(document.body, {
  view: vnode => m('h1' + b.bc('red').c('white').fs(32).ta('center'), {
    style: b.bc(on && 'green').style,
    onclick: () => on = !on
  }, 'Hello world')
})
```

Creates the following in the dom.
``` html

<style>
  .bdp4f3o1 {
    background-color: red;
    color: white;
    font-size: 32px;
  }
</style>

<body>
  <h1 class="bdp4f3o1" style="background:red;">Hello world</h1>
</body>
```

## Ways of writing CSS

In the spirit of Javscript - `bss` Allows you to write the same thing in many different ways.

### CSS Strings

``` js
b`
  background-color: black;
  text-align: center;
`
.$hover(`
  background-color: red;
`)
```

### Lean Strings
``` js
b`
  background-color black
  text-align center
`
.$hover`
  background-color red
`
```

### JS Objects

``` js
b({
  backgroundColor: 'black',
  textAlign: 'center',
  $hover: {
    backgroundColor: 'red'
  }
})
```

### Functions

``` js
b.backgroundColor('black')
 .textAlign('center')
 .$hover(
   b.backgroundColor('red')
 )
```

## Output

### `.class`

The `.class` getter closes the current style description, creates a class name, adds the styles to a stylesheet in `<head>` and returns the class name
``` js
b.textAlign('green').class // Returns eg. bdp4f3o1
```

### `.style`

The `.style` getter also closes the current style description and return a JS object with the styles
``` js
b.textAlign('green').style // Returns { textAlign: 'green' }
```

### `toString()`

`.toString()` will be called if b is used like `'div' + b` because javascript casts automatically using `.toString()`.
Casting `b` to a string will call `.class` and prepend a period for easy use in vdom libraries.
``` js
'div' + b.textAlign('green') // Returns eg. div.bdp4f3o1
```

You can also override `.toString` to return the class if needed
``` 
b.toString = () => b.class

`<div class="${ b.textAlign('green') }`"></div>` // Returns eg. <div class="bdp4f3o1"></div>
```

## Short property names

Short property names can also be used and are the acronyms of full css properties with collisions [handpicked by popularity](https://github.com/porsager/bss/lib/popular.js)

``` js
b.bc('black')
 .ta('center')
 .$hover(
   b.bc('red')
 )
```

## `.helper

Define your own helpers to work in a fashion similar to tachyons, or simply to make your life easier.

Tachyon style helpers
``` js
b.f1.p1 // { font-size: '3rem'; padding: '0.25rem'; }

// Created like this:
b.helper('f1', b.fontSize('3rem'))
b.helper('pa1', b.padding('0.25rem'))
```

Helpers can also take values like this:

``` js
b.size('100%').align('center') // Fills an element in it's parent and centers all children on both axes.

// Created like this:
b.helper('size', (width, height) =>
  b.width(width).height(height || width)
)

b.helper('align', (x, y) =>
  b.display('flex').justifyContent(x).alignItems(y || x)
)
```

## Pixel values and Numbers

Properties accepting pixel values will automatically have `px` added if a number type is passed.

```
b.fontSize(32) // font-size: 32px;
b.width(200) // width: 200px;
```

## `.$hover` :pseudo selectors

All of the different css pseudo selectors normally used with a colon `:` is added with the dollor `$` for ease of use in js.

``` js
b(`
  color: red;
`).$hover(`
  color: blue;
`)

b.color('red').$hover(b.color('blue'))
```

## `.$nest` nested selectors

Targeting nested children is sometimes useful, and is done by using `$nest` and supplying the first argument with a regular child css selector, and then supply styling as the second argument for that selector.

``` js
b.color('red').$nest('li', b.color('blue'))
b.color('red').$nest(':hover li', b.color('blue'))
```

## `.$media` @media queries

``` js
b.color('red').$media('(max-width: 600px)', b.color('blue'))
```

## `.$keyframes` @keyframes

Animation in CSS is usually a mixture of `transition` and `animation / @keyframes`. `Transition` is handled as usual css properties by `bss`, but `@keyframes` are a bit different.

Creating a keyframe animation is done using `b.$keyframes` and will return a generated name for the animation specified.

```js 
const fadeIn = b.$keyframes({
  from: b.o(0).style,
  to: b.o(1).style
})

// To use the animation do:
b.animation(fadeIn + ' 1s')
```

## `.$animate`

Often it might not be necessary to consider the animation name so a built in helper method called `$animate` comes in handy. It takes a regular animation shorthand value as the first argument, excluding the animation name. The second parameter is the animation definition itself.

``` js

b.$animate('1s linear', {
  from: b.o(0).style,
  to: b.o(1).style
})

```

## `.css`

A way to add regular css properties to a selector and prepend to the generated stylesheet

```
b.css('html', b.boxSizing('border-box'))
b.css('*, *:before, *:after', b.boxSizing('inherit'))
```

## `.prepend`

Prepend raw css strings to the generated stylesheet content

```
b.prepend(`
  html {
    box-sizing: border-box;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
`)
```

## Browser support
`bss` is tested and works in ie9+ and the other major browsers.
> TODO - Create browser support table

### Prefixes
When using `bss` in the browser it automatically adds only the necessary prefixes, so you can go ahead and use the raw property and expect it to work in browsers that only has the prefixed version.

Prefixes for css property values like `linear-gradient` are not supported yet.


## Server support
> TODO - If using it on the server you can specify the prefixes that you'd like to be generated when generating the css.
