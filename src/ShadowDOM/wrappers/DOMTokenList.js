/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
 
// NOTE: Set the 'ownerElement_' property on a DOMTokenList to make invalidation
// happen. This is pretty hacky but we only have to do it in one place
// (Element.js) currently so it seems like the least bad option.
(function(scope) {
  'use strict';

  function invalidateClass(el) {
    scope.invalidateRendererBasedOnAttribute(el, 'class');
  }

  var oldAdd = DOMTokenList.prototype.add;
  DOMTokenList.prototype.add = function() {
    oldAdd.apply(this, arguments);
    this.ownerElement_ && invalidateClass(this.ownerElement_);
  };

  var oldRemove = DOMTokenList.prototype.remove;
  DOMTokenList.prototype.remove = function() {
    oldRemove.apply(this, arguments);
    this.ownerElement_ && invalidateClass(this.ownerElement_);
  };

  var oldToggle = DOMTokenList.prototype.toggle;
  DOMTokenList.prototype.toggle = function(token) {
    var rv = oldToggle.apply(this, arguments);
    this.ownerElement_ && invalidateClass(this.ownerElement_);
    return rv;
  };

})(window.ShadowDOMPolyfill);
