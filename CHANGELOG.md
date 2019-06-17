## v[Unreleased]

## v1.6.3 -
- Fixed multiple identical selectors used in $nest

## v1.6.2 -
- Just braces security update (part of rollup)

## v1.6.1 -
- Allow hyphenated names for helpers
- Fix multiple rules inside @ rules
- Fix ; and // inside url or content ""

## v1.6.0 -
- Fix usage of 0 in template strings eg. `${ 0 }`
- Fix composing of nested instances

## v1.5.2 -
- Fix `.css()` + `.$import` use
- Set id of sheet to class prefix

## v1.5.1 -
- Add better `&`` handling in `$nest`

## v1.5.0 -
- Support comments in template strings
- Don't throw for unsupported defs in firefox
- Add toString to support direct cast using class & className attrs
- Fix unsetting of the "content" property in :before / :after

## v1.4.0 -
- Fix css values spanning several lines
- Allow shortNamese using object input
- Fix pseudos and @rules using object input
- Fix calling helpers and pseduos as tagged functions
- Add toString to support setting directly to class / className attrs
- Add bi as shorthand for background-image 

## v1.3.0 -
- Fix leaking instances (memory and styling)
- Fix border sides auto px in firefox 
- Fix px auto added wrongly to some values
- Ensure parsing and vendor prefixes work the same for all input methods

## v1.2.13 -
- Fix for undefined head in nodejs

## v1.2.12 -
- Fix for nodejs base element registration

## v1.2.11 -
- Add support for running in node

## v1.2.10 -
- Fix vendor prefixing
- Allow & ignore falsy values to `b()`
- Transpile esm version to ES5 for webpack compat

## v1.2.9 -
- Add `&` to `$nest` as class placeholder (like sass/less)
- Fix same named props disappearing
- Clean up style output
- Fix raw browser module usage (added file extensions)

## v1.2.8 -
- Remove String.raw requirement
- Group multiple selectors in $nest

## v1.2.7 -
- Fix attribute selector usage in `$nest`

## v1.2.6 -
- Fix colons being removed from values

## v1.2.5 -
- Support strings directly for helpers

## v1.2.4 -
- Fix support for passing full bss objects to `b.css()`
- Fix camel-case css variables issue
- Fix auto adding px to border and box-shadow shorthand

## v1.2.3 -
- Add `b.$import` for `@import` support
- Fix uppercase letter support for css variables

## v1.2.2 -
- Fix `b.css` regression
- Fix `b.$keyframes` and `b.$animate` 

## v1.2.1 -
- Support helpers in strings
- Fix support for css variables

## v1.2.0 -
- Fix missing pseudo/nest objects on instance reuse
- Fix pseduo element support by using `::`
- Fix consecutive selectors in `$nest` being applied as globals
- Fix common specificity issue by using double class names
- Add object overload to $nest
- Fix multiple definitions in @media blocks
- Fix Edge missing `float` detection
- Support multiple same named props
- Add support for recursive $nest

## v1.1.8 -
- Automatically add vendor prefix to display: flex value (eg. -webkit-flex)
- Fix browsers that doesn't support startsWith

## v1.1.7 -
- Fix browsers that doesn't support endsWith
- Add shorthand `lh` for lineHeight
- Fix rules missing in debug mode

## v1.1.6 -
- Fix Safari 9 bug

## v1.1.5 -
- Fix overriding `valueOf`

## v1.1.3 -
- Clean up enumerable properties for better vdom integration

## v1.1.0 - 
- Make the style property enumerable for easy composition using spread in attributes

## v1.0.7 -
- Fix regression that snuck in with a 1.0.6 commit

## v1.0.6 -
- Support comma separated prop values on multiple lines fixes
- Allow px for multiple values in shorthand lean string
- Allow conditionals for `$media` and `$nest`

## v1.0.5 -
- Revert usage of getComputedStyle for prop resolution

## v1.0.4 -
- Fixed property resolution bug in firefox

## v1.0.3 - 
- Added `letter-spacing` as preferred `ls` shortname
- Fixed unsetting props when using setter functions
- Use getComputedStyle for property registration (fixes safari 5)

## v1.0.2 - 
- Convenience toString helper changed to valueOf
- Fixed px being added to flex shorthand unexpectedly
- Lazy registration of px value properties
- Add multiple properties per line for css strings

## v1.0.1 - 
- Fixed px property registration in edge
- Fixed px addition for shorthands

## v1.0.0 - 2017-09-05
- First stable release of `bss`. Changes from here on will follow [semver](http://semver.org/).
- Made 

[Unreleased]: https://github.com/porsager/bss/compare/v1.0.0...HEAD
