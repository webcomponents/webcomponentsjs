webcomponents.js
================

[![Join the chat at https://gitter.im/webcomponents/webcomponentsjs](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/webcomponents/webcomponentsjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A suite of polyfills supporting the [Web Components](http://webcomponents.org) specs:

**Custom Elements**: allows authors to define their own custom tags ([spec](https://w3c.github.io/webcomponents/spec/custom/)).

**HTML Imports**: a way to include and reuse HTML documents via other HTML documents ([spec](https://w3c.github.io/webcomponents/spec/imports/)).

**Shadow DOM**: provides encapsulation by hiding DOM subtrees under shadow roots ([spec](https://w3c.github.io/webcomponents/spec/shadow/)).

This also folds in polyfills for `MutationObserver` and `WeakMap`.


## Releases

Pre-built (concatenated & minified) versions of the polyfills are maintained in the [tagged versions](https://github.com/webcomponents/webcomponentsjs/releases) of this repo. There are two variants:

`webcomponents.js` includes all of the polyfills.

`webcomponents-lite.js` includes all polyfills except for shadow DOM.


## Browser Support

Our polyfills are intended to work in the latest versions of evergreen browsers. See below
for our complete browser support matrix:

|   | IE10 | IE11+ | Chrome* | Firefox* | Safari 7+* | Chrome Android* | Mobile Safari* |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| __Custom Elements__ | ~ | x | x | x | x | x| x
| __HTML Imports__ | ~ | x | x | x | x| x| x
| __Shadow DOM__ | x | x | x | x | x | x | x
| __Templates__ | x | x | x | x| x | x | x

*Indicates the current version of the browser
~Indicates support may be flaky


### Manually Building

If you wish to build the polyfills yourself, you'll need `node` and `gulp` on your system:

 * install [node.js](http://nodejs.org/) using the instructions on their website
 * use `npm` to install [gulp.js](http://gulpjs.com/): `npm install -g gulp`

Now you are ready to build the polyfills with:

    # install dependencies
    npm install
    # build
    gulp build

The builds will be placed into the `dist/` directory.

## Contribute

See the [contributing guide](CONTRIBUTING.md)


