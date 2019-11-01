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

o.spec('bss', function() {

  o('global', () => {
    b.global`
      html {
        width 50
      }
    `
    o(b.rules.pop()).equals('html{width:50px;}')
  })

  o('Nested classes', () => {
    b`
      ${ b`
        c white
        ${ b`
          position relative
          ${ b`
            font-size 20
          `}
        `}
      `}
      bc blue
    `.toString()

    o(b.rules.shift().replace(/.*{/, '{')).equals(
      '{color:white;position:relative;font-size:20px;background-color:blue;}'
    )
  })

  o('Pseudo works', () => {
    b`
      :hover {
        opacity 0.5
      }
    `.toString()
    o(b.rules.pop()).equals(cn() + ':hover{opacity:0.5;}')
  })

  o('Fails gracefully on bad prop syntax', () => {
    b`
      transform translateY(20)
                rotate(${ 'sdfk' })
    `.toString()
    o(b.rules.pop()).equals(cn() + '{transform:translateY(20px);rotate:(sdfk);}')
  })

  o('Support multiline props', () => {
    b`
      transform: translateY(20)
                 rotate(${ 'sdfk' });
    `.toString()
    o(b.rules.pop()).equals(cn() + '{transform:translateY(20px) rotate(sdfk);}')
  })

  o('White space around colon', () => {
    b`position:absolute;
      position: absolute;
      position :absolute;
      position : absolute;
      position:
      absolute;
      position:
      absolute`.toString()
    o(b.rules.pop()).equals(cn() +
      '{position:absolute;position:absolute;position:absolute;position:absolute;position:absolute;position:absolute;}'
    )
  })

  o('Multiline property values', () => {
    b`position: absolute;
      transform: translate(-50%, -50%)
                  rotate(-45deg);`.toString()
    o(b.rules.pop()).equals(cn() + '{position:absolute;transform:translate(-50%, -50%) rotate(-45deg);}')
  })

  o('Comments in strings', () => {
    b`position: absolute; // This is absolute
      transform: translate(-50%, -50%) // This is multi line
                  rotate(-45deg); // And here it ends`.toString()
    o(b.rules.pop()).equals(cn() + '{position:absolute;transform:translate(-50%, -50%) rotate(-45deg);}')
  })

  o('@keyframes', () => {
    b`
      @keyframes wat {
        from { margin-top: 50px; }
        50%  { margin-top: 150px; }
        to   { margin-top: 100px; }
      }
    `.toString()
    o(b.rules.pop()).equals('@keyframes wat{from{margin-top:50px;}50%{margin-top:150px;}to{margin-top:100px;}}')
  })

  o('@media', () => {
    b`
      @media screen and (min-width: 900px) {
        article {
          padding: 1rem 3rem;
        }
      }
    `.toString()
    o(b.rules.pop()).equals('@media screen and (min-width: 900px){' + cn() + ' article{padding:1rem 3rem;}}')
  })

  o('@media @media', () => {
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

    o(b.rules.pop()).equals('@media screen and (min-width: 1500px){' + cn() + ' article{padding:2rem 6rem;}}')
    o(b.rules.pop()).equals('@media screen and (min-width: 900px){' + cn() + ' article{padding:1rem 3rem;}}')
  })

  o('@supports', () => {
    b`
      @supports (display: flex) {
        article {
          display: flex;
        }
      }
    `.toString()
    o(b.rules.pop()).equals('@supports (display: flex){' + cn() + ' article{display:flex;}}')
  })

  o('@media inside @supports', () => {
    b`
      @supports (display: flex) {
        @media screen and (min-width: 900px) {
          article {
            display: flex;
          }
        }
      }
    `.toString()
    o(b.rules.pop()).equals(
      '@supports (display: flex){@media screen and (min-width: 900px){' + cn() + ' article{display:flex;}}}'
    )
  })


  o('Auto px', () => {
    b`
      bc rgba(200,200,200,0.5)
      border 10 solid rgb(255,0,0)
      transform translate(60) rotate(40)
    `.toString()
    o(b.rules.pop()).equals(cn() + '{'
      + 'background-color:rgba(200,200,200,0.5);'
      + 'border:10px solid rgb(255,0,0);'
      + 'transform:translate(60px) rotate(40deg);'
      + '}'
    )
  })

  o('Inline animation', () => {
    b`animation 1s ${{
      from: 'margin-bottom 0',
      '50%': 'margin-top 50',
      to: 'margin-top 100'
    }}
    `.toString()
    o(b.rules.pop()).equals(cn() + '{animation:1s ' + (b.prefix + (b.count - 1)) + ';}')
  })

})
