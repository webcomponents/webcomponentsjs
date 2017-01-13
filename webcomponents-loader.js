/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function() {
  // Feature detect which polyfill needs to be imported.
  let polyfills = [];
  let useNativeImports = ('import' in document.createElement('link'));
  if (!useNativeImports) {
    polyfills.push('hi');
  }

  // Stub out HTMLImports if we're using native imports
  window.HTMLImports = {
    whenReady: function(callback) {
      if (useNativeImports) {
        // When native imports boot, the are "ready" the first rAF after
        // the document becomes interactive, so wait for the correct state change.
        if (document.readyState !== 'interactive') {
          function once() {
            document.removeEventListener('readystatechange', once);
            window.HTMLImports.whenReady(callback);
          }
          document.addEventListener('readystatechange', once);
        } else {
          requestAnimationFrame(function() {
            callback();
          });
        }
      } else {
        window.addEventListener('HTMLImportsLoaded', callback);
      }
    }
  };

  if (!window.customElements || window.customElements.forcePolyfill) {
    polyfills.push('ce');
  }
  if (!('attachShadow' in Element.prototype) || (window.ShadyDOM && window.ShadyDOM.force)) {
    polyfills.push('sd');
  }
  if (!('content' in document.createElement('template')) || !window.Promise || !window.URL) {
    polyfills.push('pf');
  }

  // TODO(notwaldorf): This is a temporary hack because Chrome still needs to
  // load some things for now.
  if (!polyfills.length) {
    polyfills.push('none');
  }

  if (polyfills.length) {
    var script = document.querySelector('script[src*="webcomponents-loader.js"]');
    let newScript = document.createElement('script');
    // Load it from the right place.
    var url = script.src.replace(
        'webcomponents-loader.js', `webcomponents-${polyfills.join('-')}.js`);
    newScript.src = url;
    console.log('Loaded: ', newScript.src);
    document.head.appendChild(newScript);
  }

  HTMLImports.whenReady(function() {
    requestAnimationFrame(function() {
      window.dispatchEvent(new CustomEvent('WebComponentsReady'));
    })
  });
})();
