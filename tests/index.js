const o = require('ospec')

const styleEl = function() {
  const el = {
    textContent: '',
    sheet: {
      cssRules: [],
      insertRule: rule => {
        el.sheet.cssRules.push(rule)
        el.sheet.textContent += rule
      }
    },
    style: {
      setProperty: (prop) => {
        if (prop === 'backgroundColor')
          throw new Error()
      }
    }
  }

  return el
}

global.document = {
  createElement: () => styleEl(),
  head: {
    appendChild: () => null
  },
  documentElement: {
    style: {
      animation: '',
      display: '',
      backgroundColor: '',
      content: '',
      width: '0',
      padding: '',
      boxShadow: ''
    }
  }
}

global.window = {
  navigator: {
    userAgent: 'test'
  }
}

const b = require('../bss')

o.spec('bss', function() {
  o('inputs', function() {
    o(b`foo: bar; baz: boo;`.style).deepEquals({ foo: 'bar', baz: 'boo' })
    o(b`foo: bar;`.style).deepEquals({ foo: 'bar' })
    o(b`foo: bar`.style).deepEquals({ foo: 'bar' })
    o(b`foo bar`.style).deepEquals({ foo: 'bar' })
    o(b({ foo: 'bar' }).style).deepEquals({ foo: 'bar' })
    o(b('foo', 'bar').style).deepEquals({ foo: 'bar' })
  })

  o('multiline input', function() {
    o(b('transform scale(1)\n,rotate(0)').style).deepEquals({ transform: 'scale(1),rotate(0)' })
    o(b('transform scale(1),\nrotate(0)').style).deepEquals({ transform: 'scale(1),rotate(0)' })
  })

  o('default css properties', function() {
    o(b.bc('green').style).deepEquals({ backgroundColor: 'green' })
    o(b.p(20, 10, '50%').style).deepEquals({ padding: '20px 10px 50%' })
    o(b`p 20 10 50%`.style).deepEquals({ padding: '20px 10px 50%' })
    o(b.backgroundColor('red').style).deepEquals({ backgroundColor: 'red' })
  })

  o('css doulbe class for specificity generation', function() {
    const cls = b`foo: bar;`.class
    o(b.getSheet()).equals(`.${cls}.${cls}{foo:bar;}`)
  })

  o('pseudo', function() {
    const cls = b.$hover(b.bc('green')).class
    o(b.getSheet()).equals(`.${cls}.${cls}:hover{background-color:green;}`)
  })

  o('same named properties string', function() {
    const cls = b`
      display -webkit-flex
      display flex
    `.class
    o(b.getSheet()).equals(`.${cls}.${cls}{display:-webkit-flex;display:flex;}`)
  })

  o('same named properties function', function() {
    const cls = b.d('-webkit-flex').d('flex').class
    o(b.getSheet()).equals(`.${cls}.${cls}{display:-webkit-flex;display:flex;}`)
  })

  o('empty content string is set to ""', function() {
    const cls = b.$before(b.content('')).$after(b({ content: '' })).class
    o(b.getSheet()).equals(`.${cls}.${cls}::before{content:"";}.${cls}.${cls}::after{content:"";}`)
  })

  o('allows vendor prefix', function() {
    const cls = b('-webkit-overflow-scrolling touch').class
    o(b.getSheet()).equals(`.${cls}.${cls}{-webkit-overflow-scrolling:touch;}`)
  })

  o('allows css variables', function() {
    const cls = b('--primaryColor 250 250 250').class
    o(b.getSheet()).equals(`.${cls}.${cls}{--primaryColor:250 250 250;}`)
  })

  o('single class for less specificity when using $nest', function() {
    const cls = b.$nest('li', b('-webkit-overflow-scrolling touch')).class
    o(b.getSheet()).equals(`.${cls} li{-webkit-overflow-scrolling:touch;}`)
  })

  o('nest multiple selectors', function() {
    const cls = b.$nest('th, tr', b('background blue')).class
    o(b.getSheet()).equals(`.${cls} th{background:blue;}.${cls} tr{background:blue;}`)
  })

  o('nest objects', function() {
    const cls = b.$nest({ th : b('background blue') }).class
    o(b.getSheet()).equals(`.${cls} th{background:blue;}`)
  })

  o('add px', function() {
    o(b`w 1`.style).deepEquals({ width: '1px' })
    o(b('width 1').style).deepEquals({ width: '1px' })
    o(b({ width: 1 }).style).deepEquals({ width: '1px' })
    o(b`boxShadow 1 1 10 black`.style).deepEquals({ boxShadow: '1px 1px 10px black' })
    o(b`border 1 solid black`.style).deepEquals({ border: '1px solid black' })
    o(b.w(1).style).deepEquals({ width: '1px' })
  })

  o('clears empty', function() {
    o(b.width(false && 20).style).deepEquals({})
    o(b.width(undefined && 20).style).deepEquals({})
    o(b.width(null && 20).style).deepEquals({})
    o(b.width('').style).deepEquals({})
  })

  o.spec('helpers', function() {

    o('without args', function() {
      b.helper('foobar', b`foo bar`)
      o(b.foobar.style).deepEquals({ foo: 'bar' })
    })

    o('parsed', function() {
      b.helper('foobar', `foo bar`)
      o(b.foobar.style).deepEquals({ foo: 'bar' })
    })

    o('with args (object notation)', function() {
      b.helper('foo', arg => b({ foo: arg }))
      o(b.foo('bar').style).deepEquals({ foo: 'bar' })
    })

    o('with args (bss notation)', function() {
      b.helper('foo', arg => b`foo ${arg}`)
      o(b.foo('bar').style).deepEquals({ foo: 'bar' })
    })

    o('with and without args mixed', function() {
      b.helper('foo', arg => b`foo ${arg}`)
      b.helper('baz', b`baz foz`)
      o(b.foo('bar').baz.style).deepEquals({ foo: 'bar', baz: 'foz' })
    })

    o('multiple helpers in object', function() {
      b.helper({
        foo: b`bar baz`,
        bar: b`foo bar`
      })
      o(b.foo.bar.style).deepEquals({ bar: 'baz', foo: 'bar' })
    })

    o('helpers in strings', function() {
      b.helper({
        size: (w, h) => b(`width ${w};height ${h}`),
        pointer: b('cursor pointer')
      })
      o(b`
        size 20 20
        pointer
      `.style).deepEquals({ width: '20px', height: '20px', cursor: 'pointer' })
    })
  })

  o('css', function() {
    b.css('html', 'background blue')
    o(b.getSheet()).equals('html{background:blue;}')
  })

  o('css objects', function() {
    b.css({ html: 'background blue' })
    o(b.getSheet()).equals('html{background:blue;}')
  })

  o('css nest', function() {
    b.css('html', b('background blue').$nest('li', 'background red'))
    o(b.getSheet()).equals('html{background:blue;}html li{background:red;}')
  })

  o('$keyframes', function() {
    const anim = b.$keyframes({
      from: 'bc red'
    })
    o(b.getSheet()).equals(`@keyframes ${anim}{from{background-color:red;}}`)
  })

  o('$animate', function() {
    const cls = b.$animate('1s', {
      from: 'bc black'
    }).class
    const sheet = b.getSheet()
    o(sheet).equals(`@keyframes ${cls}{from{background-color:black;}}.${cls}.${cls}{animation:${cls} 1s;}`)
  })

  o('Override valueOf', function() {
    const newValueOf = function() {
      return 'test'
    }
    b.valueOf = newValueOf
    o(b.valueOf).equals(newValueOf)
    o('' + b.bc('red')).equals('test')
  })
})
