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

  'use strict';

  var forceShady = scope.flags.shadydom;
  if (forceShady) {
    window.ShadyDOM = window.ShadyDOM || {};
    ShadyDOM.force = forceShady;
  }

  var forceCE = scope.flags.register || scope.flags.ce;
  if (forceCE && window.customElements) {
    customElements.forcePolyfill = forceCE;
  }

})(window.WebComponents);
