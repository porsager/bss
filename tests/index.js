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
  navigator: {
    userAgent: 'test'
  }
}

const b = require('../dist/bss')

const cn = () => '.' + b.prefix + b.count

o.spec('bss', function() {

  o('Pseudo works', () => {
    b`
      :hover {
        opacity 0.5
      }
    `
    o(b.rules.pop()).equals(cn() + ':hover{opacity:0.5;}')
  })

  o('White space around colon', () => {
    b`position:absolute;
      position: absolute;
      position :absolute;
      position : absolute;
      position:
      absolute;
      position:
      absolute`
    o(b.rules.pop()).equals(cn() + '{position:absolute;position:absolute;position:absolute;position:absolute;position:absolute;position:absolute;}')
  })

  o('Multiline property values', () => {
    b`position: absolute;
      transform: translate(-50%, -50%)
                  rotate(-45deg);`
    o(b.rules.pop()).equals(cn() + '{position:absolute;transform:translate(-50%, -50%) rotate(-45deg);}')
  })

  o('Comments in strings', () => {
    b`position: absolute; // This is absolute
      transform: translate(-50%, -50%) // This is multi line
                  rotate(-45deg); // And here it ends`
    o(b.rules.pop()).equals(cn() + '{position:absolute;transform:translate(-50%, -50%) rotate(-45deg);}')
  })

  o('@keyframes', () => {
    b`
      @keyframes wat {
        from { margin-top: 50px; }
        50%  { margin-top: 150px; }
        to   { margin-top: 100px; }
      }
    `
    o(b.rules.pop()).equals('@keyframes wat{from{margin-top:50px;}50%{margin-top:150px;}to{margin-top:100px;}}')
  })

  o('@media', () => {
    b`
      @media screen and (min-width: 900px) {
        article {
          padding: 1rem 3rem;
        }
      }
    `
    o(b.rules.pop()).equals('@media screen and (min-width: 900px){' + cn() + ' article{padding:1rem 3rem;}}')
  })

  o('@supports', () => {
    b`
      @supports (display: flex) {
        article {
          display: flex;
        }
      }
    `
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
    `
    o(b.rules.pop()).equals('@supports (display: flex){@media screen and (min-width: 900px){' + cn() + ' article{display:flex;}}}')
  })

/*
  o('Inline animation', () => {
    b`
      animation 1s {
        from { margin-bottom 0 },
        50% { margin-top 50 },
        to { margin-top 100 }
      }
    `
    o(b.rules.pop()).equals('')
  })

  o('Multiple inline animation', () => {
    b`
      animation 1s {
        from { margin-top 50px }
        50%  { margin-top 150px }
        to   { margin-top 100px }
      }, {
        20%  { transform translateX(50px) }
        50%  { transform translateX(150px) }
        80%  { transform translateX(100px) }
      }
    `
    o(b.rules.pop()).equals('')
  })
*/

})
