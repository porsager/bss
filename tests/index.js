const { t, ot, not } = require('./test')

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
    getAttribute: () => null,
    style: {
      setProperty: (prop) => {
        if (prop === 'backgroundColor')
          throw new Error()
        if (prop === 'opacity')
          el.style[prop] = '1'
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
      color: '',
      animation: '',
      opacity: '',
      display: '',
      d: '',
      backgroundColor: '',
      content: '',
      width: '0',
      padding: '',
      boxShadow: '',
      MozAppearance: '',
      transform: '',
      position: '',
      webkitOverflowScrolling: ''
    }
  }
}

global.window = {
  document: global.document,
  navigator: {
    userAgent: 'test'
  }
}

const b = require('../dist/bss')

const cn = () => '.' + b.prefix + b.count

t('global', () => {
  b.global`
    html {
      width 50
    }
  `
  return [
    b.rules.pop(),
    'html{width:50px;}'
  ]
})

t('Nested classes', () => {
  b`
    ${ b`
      c white
      ${ b`
        position relative
        ${ b`font-size 20` }
      `}
    `}
    bc blue
  `.toString()

  return [
    b.rules.shift().replace(/.*{/, '{'),
    '{color:white;position:relative;font-size:20px;background-color:blue;}'
  ]
})

t('Pseudo works', () => {
  b`
    :hover {
      opacity 0.5
    }
  `.toString()

  return [
    b.rules.pop(),
    cn() + cn() + ':hover{opacity:0.5;}'
  ]
})

t('css variables', () => {
  b`
    --lowercase 1
    --camelCase 1
    --UPPERCASE 1
  `.toString()

  return [
    b.rules.pop(),
    cn() + cn() + '{--lowercase:1;--camelCase:1;--UPPERCASE:1;}'
  ]
})

t('Only use shorthands when lean', () => {
  b`
    d:wat;
  `.toString()

  return [
    cn() + cn() + '{d:wat;}',
    b.rules.pop()
  ]
})

t('Fails gracefully on bad prop syntax', () => {
  b`
    transform translateY(20)
              rotate(${ 'sdfk' })
  `.toString()

  return [
    b.rules.pop(),
    cn() + cn() + '{transform:translateY(20px);rotate:sdfk);}'
  ]
})

t('Mixed strict and lean works', () => {
  b`
    bc blue
    bc:blue;
  `.toString()

  return [
    cn() + cn() + '{background-color:blue;bc:blue;}',
    b.rules.pop()
  ]
})

t('Mixed nesting and lean works', () => {
  b`
    input:checked + label::after {
      w 18
    }
  `.toString()

  return [
    b.rules.pop(),
    cn() + ' input:checked + label::after{width:18px;}'
  ]
})

t('Support multiline props', () => {
  b`
    transform: translateY(20px)
               rotate(${ 'sdfk' });
  `.toString()

  return [
    b.rules.pop(),
    cn() + cn() + `{transform:translateY(20px)
               rotate(sdfk);}`
  ]
})

t('White space around colon', () => {
  b`position:absolute;
    position: absolute;
    position :absolute;
    position : absolute;
    position:
    absolute;
    position:
    absolute`.toString()

  return [
    b.rules.pop(),
    cn() + cn() + '{position:absolute;position:absolute;position:absolute;'
    + 'position:absolute;position:absolute;position:absolute;}'
  ]
})

t('Multiline property values', () => {
  b`position: absolute;
    transform: translate(-50%, -50%)
                rotate(-45deg);`.toString()
  return [
    b.rules.pop(),
    cn() + cn() + `{position:absolute;transform:translate(-50%, -50%)
                rotate(-45deg);}`
  ]
})

t('0 value is added correct', () => {
  b`w ${ 0 }%`.toString()

  return [
    cn() + cn() + '{width:0%;}',
    b.rules.pop()
  ]
})

/*
t('Inline comments', () => {
  b`position: absolute; // This is absolute
    transform: translate(-50%, -50%) // This is multi line
                rotate(-45deg); // And here it ends`.toString()

  return [
    b.rules.pop(),
    cn() + cn() + '{position:absolute;transform:translate(-50%, -50%) rotate(-45deg);}'
  ]
})
*/

t('@keyframes', () => {
  b`
    @keyframes wat {
      from { margin-top: 50px; }
      50%  { margin-top: 150px; }
      to   { margin-top: 100px; }
    }
  `.toString()

  return [
    b.rules.pop(),
    '@keyframes wat{from{margin-top:50px;}50%{margin-top:150px;}to{margin-top:100px;}}'
  ]
})

t('@media', () => {
  b`
    @media screen and (min-width: 900px) {
      padding: 1rem 3rem;
    }
  `.toString()

  return [
    b.rules.pop(),
    '@media screen and (min-width: 900px){' + cn() + cn() + '{padding:1rem 3rem;}}'
  ]
})

t('@media nest', () => {
  b`
    @media screen and (min-width: 900px) {
      article {
        padding: 1rem 3rem;
      }
    }
  `.toString()

  return [
    b.rules.pop(),
    '@media screen and (min-width: 900px){' + cn() + ' article{padding:1rem 3rem;}}'
  ]
})

t('@media @media', () => {
  b`
    @media screen and (min-width: 900px) {
      article {
        padding: 1rem 3rem;
      }
    }

    @media screen and (min-width: 1500px) {
      article {
        padding: 2rem 6rem;
      }
    }
  `.toString()

  return [
    b.rules.pop()
    + b.rules.pop(),
    '@media screen and (min-width: 1500px){' + cn() + ' article{padding:2rem 6rem;}}'
    + '@media screen and (min-width: 900px){' + cn() + ' article{padding:1rem 3rem;}}'
  ]
})

t('@supports', () => {
  b`
    @supports (display: flex) {
      article {
        display: flex;
      }
    }
  `.toString()

  return [
    b.rules.pop(),
    '@supports (display: flex){' + cn() + ' article{display:flex;}}'
  ]
})

t('@media inside @supports', () => {
  b`
    @supports (display: flex) {
      @media screen and (min-width: 900px) {
        article {
          display: flex;
        }
      }
    }
  `.toString()
  return [
    b.rules.pop(),
    '@supports (display: flex){@media screen and (min-width: 900px){' + cn() + ' article{display:flex;}}}'
  ]
})

t('Nested comma selectors are all wrapped', () => {
  b`
    div,span {
      o 0
    }
  `.toString()

  return [
    b.rules.pop(),
    cn() + ' div,' + cn() + ' span{opacity:0;}'
  ]
})

t('Auto px', () => {
  b`
    bc rgba(200,200,200,0.5)
    border 10 solid rgb(255,0,0)
    transform translate(60) rotate(40)
  `.toString()
  return [
    b.rules.pop(),
    cn() + cn() + '{'
    + 'background-color:rgba(200,200,200,0.5);'
    + 'border:10px solid rgb(255,0,0);'
    + 'transform:translate(60px) rotate(40deg);'
    + '}'
  ]
})

t('Inline animation', () => {
  b`animation 1s {
    from { margin-bottom 0 }
    50% { margin-top 50 }
    to { margin-top 100 }
  }
  `.toString()

  return [
    b.rules.join(''),
    '@keyframes ' + b.prefix + b.count + '{from{margin-bottom:0px;}50%{margin-top:50px;}to{margin-top:100px;}}'
    + cn() + cn() + '{animation:1s ' + b.prefix + b.count + ';}'
  ]
})

t('Chaining composition', () => {
  const red = b`bc red`
  red`
    c white
  `.toString()

  return [
    b.rules.pop(),
    cn() + cn() + '{background-color:red;color:white;}'
  ]
})

t('Inline mixin', () => {
  const red = b`bc red`
  b`
    ${ red }
    c white
  `.toString()

  return [
    b.rules.pop(),
    cn() + cn() + '{background-color:red;color:white;}'
  ]
})

t('Inline mixins', () => {
  const red = b`bc red`
      , round = b`br 10`
  b`
    ${ [red, round] }
    c white
  `.toString()
  return [
    b.rules.pop(),
    cn() + cn() + '{background-color:red;border-radius:10px;color:white;}'
  ]
})

t('Custom class name prefix', () => {
  const className = b`.wat
    bc blue
  `.toString()

  return [
    className + b.rules.pop(),
    'wat-' + cn().slice(1) + '.wat-' + cn().slice(1) + '.wat-' + cn().slice(1) + '{background-color:blue;}'
  ]
})

t('font-face', () => {
  b.global`
    @font-face {
      font-family Avenir
      src url(test.font)
    }
  `
  return [
    '@font-face{font-family:Avenir;src:url(test.font);}',
    b.rules.pop()
  ]
})

t('quotes', () => {
  b`
    background-image: url("http://wat.com");
  `.toString()

  return [
    cn() + cn() + '{background-image:url("http://wat.com");}',
    b.rules.pop()
  ]
})

t('Animation is reused', () => {
  b.rules = []
  b`
    bc blue
    animation 1s {
      from { o 0}
    }
  `.toString()

  b`
    bc white
    animation 1s {
      from { o 0 }
    }
  `.toString()

  return [
    b.rules[1].slice(-12),
    b.rules[2].slice(-12)
  ]
})
