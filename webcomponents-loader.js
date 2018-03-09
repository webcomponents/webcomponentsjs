/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function() {
  'use strict';
  // global for (1) existence means `WebComponentsReady` will file,
  // (2) WebComponents.ready == true means event has fired.
  var resolve = null;
  var promise = null;
  var hasPromises = !!window.Promise;

  function fireEvent() {
    document.dispatchEvent(new CustomEvent('WebComponentsReady', {bubbles: true}));
  }

  function ready() {
    window.WebComponents.ready = true;
    if (!hasPromises) {
      // convert tinyPromises into real Promises
      var resolver = new Promise(function(res) {
        resolve = res;
      });
      convertFromTiny(promise, resolver);
      promise = resolver;
    }
    // bootstrap <template> elements before custom elements
    if (HTMLTemplateElement.bootstrap) {
      HTMLTemplateElement.bootstrap(window.document);
    }
    resolve();
    promise.then(function() {
      if (document.readyState !== 'loading') {
        fireEvent();
      } else {
        document.addEventListener('readystatechange', function rsc() {
          document.removeEventListener('readystatechange', rsc);
          fireEvent();
        });
      }
    });
  }

  /*
   * A tiny Promise shim used to collect `.then` and `.catch` calls off of `whenLoaded`
   * After polyfill bundle is loaded, these will become real promises
   */
  function tinyPromise(passFn, failFn) {
    this._passFn = passFn;
    this._failFn = failFn;
    this._childPromises = [];
  }
  tinyPromise.prototype.then = function(passFn, failFn) {
    var next = new tinyPromise(passFn, failFn);
    this._childPromises.push(next);
    return next;
  };
  tinyPromise.prototype['catch'] = function(failFn) {
    return this.then(undefined, failFn);
  };

  function convertFromTiny(tiny, parent) {
    if (!tiny || !parent) {
      return;
    }
    var p = parent.then(tiny._passFn, tiny._failFn);
    for (var i = 0; i < tiny._childPromises.length; i++) {
      convertFromTiny(tiny._childPromises[i], p);
    }
  }

  promise = hasPromises ?
    new Promise(function(res) { resolve = res }) :
    new tinyPromise();

  window.WebComponents = window.WebComponents || {
    ready: false,
    whenLoaded: function(waitFn) {
      // if handed a `waitFn`, execute that first before resolving whenLoaded promise
      if (waitFn) {
        return promise.then(function() {
          var flushFn;
          var resolved = false;
          // execute `waitFn` before booting custom elements to optimize CustomElements polyfill work
          if (customElements.polyfillWrapFlushCallback) {
            customElements.polyfillWrapFlushCallback(function(flushCallback) {
              flushFn = flushCallback;
              if (resolved) {
                flushFn();
              }
            });
          }
          return Promise.resolve().then(waitFn).then(function(resolvedValue) {
            resolved = true;
            flushFn && flushFn();
            return resolvedValue;
          });
        });
      }
      return promise;
    }
  };
  var name = 'webcomponents-loader.js';
  // Feature detect which polyfill needs to be imported.
  var polyfills = [];
  if (!('attachShadow' in Element.prototype && 'getRootNode' in Element.prototype) ||
    (window.ShadyDOM && window.ShadyDOM.force)) {
    polyfills.push('sd');
  }
  if (!window.customElements || window.customElements.forcePolyfill) {
    polyfills.push('ce');
  }
  // NOTE: any browser that does not have template or ES6 features
  // must load the full suite (called `lite` for legacy reasons) of polyfills.
  if (!('content' in document.createElement('template')) || !window.Promise || !Array.from ||
    // Edge has broken fragment cloning which means you cannot clone template.content
    !(document.createDocumentFragment().cloneNode() instanceof DocumentFragment)) {
    polyfills = ['sd-ce-pf'];
  }

  if (polyfills.length) {
    var script = document.querySelector('script[src*="' + name +'"]');
    var newScript = document.createElement('script');
    // Load it from the right place.
    var replacement = 'bundles/webcomponents-' + polyfills.join('-') + '.js';
    var url = script.src.replace(name, replacement);
    newScript.src = url;
    newScript.addEventListener('load', function() {
      ready();
    });
    newScript.addEventListener('error', function() {
     throw new Error('Could not load polyfill ' + url);
    });
    document.head.appendChild(newScript);
  } else {
    ready();
  }
})();
