/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(scope) {
  /**
    The ShadowDOM polyfill uses a wrapping strategy on dom elements. This is
    99% transparent but there are a few nodes (e.g. document) that cannot be
    automatically wrapped. Therefore, rarely it's necessary to wrap nodes in
    user code. Here we're choosing to make convenient globals `wrap` and
    `unwrap` that can be used whether or not the polyfill is in use.
  */
  // convenient global
  if (window.ShadowDOMPolyfill) {
    window.wrap = ShadowDOMPolyfill.wrapIfNeeded;
    window.unwrap = ShadowDOMPolyfill.unwrapIfNeeded;
  } else {
    // so we can call wrap/unwrap without testing for ShadowDOMPolyfill
    window.wrap = window.unwrap = function(n) {
      return n;
    };
  }

})(window.WebComponents);
