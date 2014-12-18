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

  var unsafeUnwrap = scope.unsafeUnwrap;
  var enqueueMutation = scope.enqueueMutation;

  function getClass (el) {
    return unsafeUnwrap(el).getAttribute('class');
  }

  function enqueueClassAttributeChange(el, oldValue) {
    enqueueMutation(el, 'attributes', {
      name: 'class',
      namespace: null,
      oldValue: oldValue
    });
  }

  function invalidateClass(el) {
    scope.invalidateRendererBasedOnAttribute(el, 'class');
  }

  function changeClass(tokenList, method, args) {
    var ownerElement = tokenList.ownerElement_;
    if (ownerElement == null) {
      return method.apply(tokenList, args);
    }

    var oldValue = getClass(ownerElement);
    var retv = method.apply(tokenList, args);
    if (getClass(ownerElement) !== oldValue) {
      enqueueClassAttributeChange(ownerElement, oldValue);
      invalidateClass(ownerElement);
    }

    return retv;
  }

  var oldAdd = DOMTokenList.prototype.add;
  DOMTokenList.prototype.add = function() {
    changeClass(this, oldAdd, arguments);
  };

  var oldRemove = DOMTokenList.prototype.remove;
  DOMTokenList.prototype.remove = function() {
    changeClass(this, oldRemove, arguments);
  };

  var oldToggle = DOMTokenList.prototype.toggle;
  DOMTokenList.prototype.toggle = function() {
    return changeClass(this, oldToggle, arguments);
  };

})(window.ShadowDOMPolyfill);
