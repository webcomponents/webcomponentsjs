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
  if ('import' in document.createElement('link')) {
    // Stub out HTMLImports if we're using native imports.
    window.HTMLImports = {
      useNative: true,
      importForElement: function(el) {
        return el.ownerDocument !== document ? el.ownerDocument : null;
      },
      whenReady: function(callback) {
        // When native imports boot, the are "ready" the first rAF after
        // the document becomes interactive, so wait for the correct state change.
        if (document.readyState === 'loading') {
          document.addEventListener('readystatechange', function once() {
            document.removeEventListener('readystatechange', once);
            HTMLImports.whenReady(callback);
          });
        } else if (document.readyState === 'interactive') {
          requestAnimationFrame(callback);
        } else {
          callback();
        }
      }
    };
  } else {
    polyfills.push('hi');
  }
  if (!('attachShadow' in Element.prototype) || (window.ShadyDOM && window.ShadyDOM.force)) {
    polyfills.push('sd');
  }
  if (!window.customElements || window.customElements.forcePolyfill) {
    polyfills.push('ce');
  }
  if (!('content' in document.createElement('template')) || !window.Promise || !window.URL) {
    polyfills.push('pf');
  }

  // TODO(notwaldorf): This is a temporary hack because Chrome still needs to
  // load some things for now. Addressing this is blocked on
  // https://github.com/webcomponents/shadycss/issues/46.
  if (!polyfills.length) {
    polyfills.push('none');
  } else if (polyfills.length === 4) { // hi-ce-sd-pf is actually called lite.
    polyfills = ['lite'];
  }

  if (polyfills.length) {
    var script = document.querySelector('script[src*="webcomponents-loader.js"]');
    let newScript = document.createElement('script');
    // Load it from the right place.
    var url = script.src.replace(
      'webcomponents-loader.js', `webcomponents-${polyfills.join('-')}.js`);
    newScript.src = url;
    document.head.appendChild(newScript);
  }
  // Ensure `WebComponentsReady` is fired also when there are no polyfills loaded.
  // TODO(valdrin): only check for `!polyfills.length` once 'none' bundle
  // is removed. Addressing this is blocked on
  // https://github.com/webcomponents/shadycss/issues/46.
  if (polyfills[0] === 'none') {
    HTMLImports.whenReady(function() {
      requestAnimationFrame(function() {
        window.dispatchEvent(new CustomEvent('WebComponentsReady'));
      });
    });
  }
})();