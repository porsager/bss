require('reify')
const o = require('ospec')

const styleEl = {}
global.document = {
  createElement: () => styleEl,
  head: {
    appendChild: () => null
  },
  documentElement: {
    style: {
      width: 0
    }
  }
}

global.window = {
  navigator: {
    userAgent: 'test'
  }
}

const b = require('../lib').default
const sheet = require('../lib/sheet')

o('inputs', function() {
  o(b`foo: bar;`.style).deepEquals({foo: 'bar'})
  o(b`foo: bar`.style).deepEquals({foo: 'bar'})
  o(b`foo bar`.style).deepEquals({foo: 'bar'})
  o(b({foo: 'bar'}).style).deepEquals({foo: 'bar'})
})

o('css class generation', function(done) {
  const cls = b`foo: bar;`.class
  setTimeout(() => {
    o(cls).equals(sheet.classPrefix + 1)
    o(styleEl.textContent).equals(`.${cls}{foo:bar;}`)
    done()
  })
})

o.spec('helpers', function() {
  o('without args', function() {
    b.helper('foobar', b`foo bar`)
    o(b.foobar.style).deepEquals({foo: 'bar'})
  })

  o('with args (object notation)', function() {
    b.helper('foo', arg => b({foo: arg}))
    o(b.foo('bar').style).deepEquals({foo: 'bar'})
  })

  o('with args (bss notation)', function() {
    b.helper('foo', arg => b`foo ${arg}`)
    o(b.foo('bar').style).deepEquals({foo: 'bar'})
  })

  o('with and without args mixed', function() {
    b.helper('foo', arg => b`foo ${arg}`)
    b.helper('baz', b`baz foz`)
    o(b.foo('bar').baz.style).deepEquals({foo: 'bar', baz: 'foz'})
  })
})
