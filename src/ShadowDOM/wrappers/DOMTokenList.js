// Copyright 2014 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;

  function invalidateClass(el) {
    scope.invalidateRendererBasedOnAttribute(el, 'class');
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
      unsafeUnwrap(this).add.apply(unsafeUnwrap(this), arguments);
      invalidateClass(this.ownerElement_);
    },
    remove: function() {
      unsafeUnwrap(this).remove.apply(unsafeUnwrap(this), arguments);
      invalidateClass(this.ownerElement_);
    },
    toggle: function(token) {
      var rv = unsafeUnwrap(this).toggle.apply(unsafeUnwrap(this), arguments);
      invalidateClass(this.ownerElement_);
      return rv;
    },
    toString: function() {
      return unsafeUnwrap(this).toString();
    }
  };

  scope.wrappers.DOMTokenList = DOMTokenList;
})(window.ShadowDOMPolyfill);
