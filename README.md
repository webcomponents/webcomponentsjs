webcomponents.js
================

[![Build Status](https://travis-ci.org/webcomponents/webcomponentsjs.svg?branch=master)](https://travis-ci.org/webcomponents/webcomponentsjs)

A suite of polyfills supporting the [Web Components](http://webcomponents.org) specs.

- **Custom Elements**: allows authors to define their own custom tags ([spec](https://w3c.github.io/webcomponents/spec/custom/)).
- **HTML Imports**: a way to include and reuse HTML documents via other HTML documents ([spec](https://w3c.github.io/webcomponents/spec/imports/)).
- **Shadow DOM**: provides encapsulation by hiding DOM subtrees under shadow roots ([spec](https://w3c.github.io/webcomponents/spec/shadow/)).

## Releases

Pre-built (concatenated & minified) versions of the polyfills are maintained in the [tagged versions](https://github.com/webcomponents/webcomponentsjs/releases) of this repo. There are several variants:

- `webcomponents-lite.js` includes all of the polyfills.
- `webcomponents-loader.js` is a custom loader that dynamically load a minified polyfill
bundle, using feature detection. The bundles that can be loaded are:
  - `webcomponents-hi` -- HTML Imports (needed by Safari Tech Preview)
  - `webcomponents-hi-ce` -- HTML Imports and Custom Elements (needed by Safari 10)
  - `webcomponents-hi-ce-sd` -- HTML Imports, Custom Elements and Shady DOM/CSS (needed by Safari 9, Firefox, Edge)
  - `webcomponents-lite` -- HTML Imports, Custom Elements, Shady DOM/CSS and generic platform polyfills (such as URL, Template, ES6 Promise, Constructable events, etc.) (needed by Internet Explorer 11)

## Browser Support

Our polyfills are intended to work in the latest versions of evergreen browsers. See below
for our complete browser support matrix:

| Polyfill   | IE11+ | Chrome* | Firefox* | Safari 9+* | Chrome Android* | Mobile Safari* |
| ---------- |:-----:|:-------:|:--------:|:----------:|:---------------:|:--------------:|
| Custom Elements | ✓ | ✓ | ✓ | ✓ | ✓| ✓ |
| HTML Imports |  ✓ | ✓ | ✓ | ✓| ✓| ✓ |
| Shady CSS/DOM |  ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

\*Indicates the current version of the browser

The polyfills may work in older browsers, however require additional polyfills (such as classList)
to be used. We cannot guarantee support for browsers outside of our compatibility matrix.


### Manually Building

If you wish to build the polyfills yourself, you'll need `node` and `npm` on your system:

 * install [node.js](http://nodejs.org/) using the instructions on their website
 * use `npm` to install [gulp.js](http://gulpjs.com/): `npm install -g gulp`

Now you are ready to build the polyfills with:

    # install dependencies
    npm install
    bower install
    # build
    gulp build

The builds will be placed into the root directory.

## Contribute

See the [contributing guide](CONTRIBUTING.md)

## License

Everything in this repository is BSD style license unless otherwise specified.

Copyright (c) 2015 The Polymer Authors. All rights reserved.

## Helper utilities

### `WebComponentsReady`

Under native HTML Imports, `<script>` tags in the main document block the loading of such imports. This is to ensure the imports have loaded and any registered elements in them have been upgraded.

The `webcomponents-lite.js` polyfill (as well as the smaller bundles and the loader) parse element definitions and handle their upgrade asynchronously. If prematurely fetching the element from the DOM before it has an opportunity to upgrade, you'll be working with an `HTMLUnknownElement`.

For these situations, you can use the `WebComponentsReady` event as a signal before interacting with the element. The criteria for this event to fire is all Custom Elements with definitions registered by the time HTML Imports available at load time have loaded have upgraded.

```js
window.addEventListener('WebComponentsReady', function(e) {
  // imports are loaded and elements have been registered
  console.log('Components are ready');
});
```

## Known Issues

  * [Custom element's constructor property is unreliable](#constructor)
  * [Contenteditable elements do not trigger MutationObserver](#contentedit)
  * [ShadyCSS: :host(.zot:not(.bar:nth-child(2))) doesn't work](#nestedparens)

### Custom element's constructor property is unreliable <a id="constructor"></a>
See [#215](https://github.com/webcomponents/webcomponentsjs/issues/215) for background.

In Safari and IE, instances of Custom Elements have a `constructor` property of `HTMLUnknownElementConstructor` and `HTMLUnknownElement`, respectively. It's unsafe to rely on this property for checking element types.

It's worth noting that `customElement.__proto__.__proto__.constructor` is `HTMLElementPrototype` and that the prototype chain isn't modified by the polyfills(onto `ElementPrototype`, etc.)

### Contenteditable elements do not trigger MutationObserver <a id="contentedit"></a>
Using the MutationObserver polyfill, it isn't possible to monitor mutations of an element marked `contenteditable`.
See [the mailing list](https://groups.google.com/forum/#!msg/polymer-dev/LHdtRVXXVsA/v1sGoiTYWUkJ)

### ShadyCSS: :host(.zot:not(.bar:nth-child(2))) doesn't work <a id="nestedparens"></a>
ShadyCSS `:host()` rules can only have (at most) 1-level of nested parentheses in its argument selector under ShadyCSS. For example, `:host(.zot)` and `:host(.zot:not(.bar))` both work, but `:host(.zot:not(.bar:nth-child(2)))` does not.
