// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var registerWrapper = scope.registerWrapper;
  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var unwrapIfNeeded = scope.unwrapIfNeeded;
  var wrap = scope.wrap;

  var OriginalRange = window.Range;

  function Range(impl) {
    setWrapper(impl, this);
  }
  Range.prototype = {
    get startContainer() {
      return wrap(unsafeUnwrap(this).startContainer);
    },
    get endContainer() {
      return wrap(unsafeUnwrap(this).endContainer);
    },
    get commonAncestorContainer() {
      return wrap(unsafeUnwrap(this).commonAncestorContainer);
    },
    setStart: function(refNode,offset) {
      unsafeUnwrap(this).setStart(unwrapIfNeeded(refNode), offset);
    },
    setEnd: function(refNode,offset) {
      unsafeUnwrap(this).setEnd(unwrapIfNeeded(refNode), offset);
    },
    setStartBefore: function(refNode) {
      unsafeUnwrap(this).setStartBefore(unwrapIfNeeded(refNode));
    },
    setStartAfter: function(refNode) {
      unsafeUnwrap(this).setStartAfter(unwrapIfNeeded(refNode));
    },
    setEndBefore: function(refNode) {
      unsafeUnwrap(this).setEndBefore(unwrapIfNeeded(refNode));
    },
    setEndAfter: function(refNode) {
      unsafeUnwrap(this).setEndAfter(unwrapIfNeeded(refNode));
    },
    selectNode: function(refNode) {
      unsafeUnwrap(this).selectNode(unwrapIfNeeded(refNode));
    },
    selectNodeContents: function(refNode) {
      unsafeUnwrap(this).selectNodeContents(unwrapIfNeeded(refNode));
    },
    compareBoundaryPoints: function(how, sourceRange) {
      return unsafeUnwrap(this).compareBoundaryPoints(how, unwrap(sourceRange));
    },
    extractContents: function() {
      return wrap(unsafeUnwrap(this).extractContents());
    },
    cloneContents: function() {
      return wrap(unsafeUnwrap(this).cloneContents());
    },
    insertNode: function(node) {
      unsafeUnwrap(this).insertNode(unwrapIfNeeded(node));
    },
    surroundContents: function(newParent) {
      unsafeUnwrap(this).surroundContents(unwrapIfNeeded(newParent));
    },
    cloneRange: function() {
      return wrap(unsafeUnwrap(this).cloneRange());
    },
    isPointInRange: function(node, offset) {
      return unsafeUnwrap(this).isPointInRange(unwrapIfNeeded(node), offset);
    },
    comparePoint: function(node, offset) {
      return unsafeUnwrap(this).comparePoint(unwrapIfNeeded(node), offset);
    },
    intersectsNode: function(node) {
      return unsafeUnwrap(this).intersectsNode(unwrapIfNeeded(node));
    },
    toString: function() {
      return unsafeUnwrap(this).toString();
    }
  };

  // IE9 does not have createContextualFragment.
  if (OriginalRange.prototype.createContextualFragment) {
    Range.prototype.createContextualFragment = function(html) {
      return wrap(unsafeUnwrap(this).createContextualFragment(html));
    };
  }

  registerWrapper(window.Range, Range, document.createRange());

  scope.wrappers.Range = Range;

})(window.ShadowDOMPolyfill);
