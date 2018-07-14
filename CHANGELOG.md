## [Unreleased]

## 1.2.1 -
Support helpers in strings
Fix support for css variables

## 1.2.0 -
Fix missing pseudo/nest objects on instance reuse
Fix pseduo element support by using `::`
Fix consecutive selectors in `$nest` being applied as globals
Fix common specificity issue by using double class names
Add object overload to $nest
Fix multiple definitions in @media blocks
Fix Edge missing `float` detection
Support multiple same named props
Add support for recursive $nest

## 1.1.8 -
Automatically add vendor prefix to display: flex value (eg. -webkit-flex)
Fix browsers that doesn't support startsWith

## 1.1.7 -
Fix browsers that doesn't support endsWith
Add shorthand `lh` for lineHeight
Fix rules missing in debug mode

## 1.1.6 -
Fix Safari 9 bug

## 1.1.5 -
Fix overriding `valueOf`

## 1.1.3 -
Clean up enumerable properties for better vdom integration

## 1.1.0 - 
Make the style property enumerable for easy composition using spread in attributes

## 1.0.7 -

Fix regression that snuck in with a 1.0.6 commit

## 1.0.6 -

Support comma separated prop values on multiple lines fixes
Allow px for multiple values in shorthand lean string
Allow conditionals for `$media` and `$nest`

## 1.0.5 -

Revert usage of getComputedStyle for prop resolution

## 1.0.4 -

Fixed property resolution bug in firefox

## 1.0.3 - 

Added `letter-spacing` as preferred `ls` shortname
Fixed unsetting props when using setter functions
Use getComputedStyle for property registration (fixes safari 5)

## 1.0.2 - 

Convenience toString helper changed to valueOf
Fixed px being added to flex shorthand unexpectedly
Lazy registration of px value properties
Add multiple properties per line for css strings

## 1.0.1 - 

Fixed px property registration in edge
Fixed px addition for shorthands

## 1.0.0 - 2017-09-05

First stable release of `bss`. Changes from here on will follow [semver](http://semver.org/).
- Made 

[Unreleased]: https://github.com/porsager/bss/compare/v1.0.0...HEAD
