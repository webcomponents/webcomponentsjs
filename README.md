webcomponents.js
================

A suite of polyfills supporting the HTML web components specs:

**Custom Elements**: allows authors to define their own custom tags ([spec](https://w3c.github.io/webcomponents/spec/custom/)).

**HTML Imports**: a way to include and reuse HTML documents via other HTML documents ([spec](https://w3c.github.io/webcomponents/spec/imports/)).

**Shadow DOM**: provides encapsulation by hiding DOM subtrees under shadow roots ([spec](https://w3c.github.io/webcomponents/spec/shadow/)).

This also folds in polyfills for `MutationObserver` and `WeakMap`.


## Building

To build the concatenated and minified polyfills, you need `node` and `gulp` on your system:

 * install [NodeJS](http://nodejs.org/) using the instructions on their website
 * use `npm` to install [gulp.js](http://gulpjs.com/):

    npm install -g gulp

Now you are able to build the polyfills with:

    # install dependecies
    npm install
    # build
    gulp


## Builds

`webcomponents.js` includes all of the polyfills.

`webcomponents-lite.js` includes all polyfills except for shadow DOM.


## Releases

[Release (tagged) versions](https://github.com/Polymer/webcomponentsjs/releases) of webcomponents.js include concatenated and minified sources for your convenience.
