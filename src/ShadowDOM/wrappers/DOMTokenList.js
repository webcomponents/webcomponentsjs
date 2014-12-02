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

  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var enqueueMutation = scope.enqueueMutation;

  function invalidateClass(el) {
    scope.invalidateRendererBasedOnAttribute(el, 'class');
  }

  function enqueueClassAttributeChange(element, oldValue) {
    enqueueMutation(element, 'attributes', {
      name: 'class',
      namespace: null,
      oldValue: oldValue
    });
  }

  function changeClass(tokenList, method, args) {
    var oldValue = unsafeUnwrap(tokenList.ownerElement_).getAttribute('class');
    var retv = method.apply(unsafeUnwrap(tokenList), args);

    if (unsafeUnwrap(tokenList.ownerElement_).getAttribute('class') !== oldValue) {
      enqueueClassAttributeChange(tokenList.ownerElement_, oldValue);
      invalidateClass(tokenList.ownerElement_);
    }
    return retv;
  }

  function DOMTokenList(impl, ownerElement) {
    setWrapper(impl, this);
    this.ownerElement_ = ownerElement;
  }

  DOMTokenList.prototype = {
    constructor: DOMTokenList,
    get length() {
      return unsafeUnwrap(this).length;
    },
    item: function(index) {
      return unsafeUnwrap(this).item(index);
    },
    contains: function(token) {
      return unsafeUnwrap(this).contains(token);
    },
    add: function() {
      changeClass(this, unsafeUnwrap(this).add, arguments);
    },
    remove: function() {
      changeClass(this, unsafeUnwrap(this).remove, arguments);
    },
    toggle: function() {
      return changeClass(this, unsafeUnwrap(this).toggle, arguments);
    },
    toString: function() {
      return unsafeUnwrap(this).toString();
    }
  };

  scope.wrappers.DOMTokenList = DOMTokenList;
})(window.ShadowDOMPolyfill);
