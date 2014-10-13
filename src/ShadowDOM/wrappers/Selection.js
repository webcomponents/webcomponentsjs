// Copyright 2014 The Polymer Authors. All rights reserved.
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

  var OriginalSelection = window.Selection;

  function Selection(impl) {
    setWrapper(impl, this);
  }
  Selection.prototype = {
    get anchorNode() {
      return wrap(unsafeUnwrap(this).anchorNode);
    },
    get focusNode() {
      return wrap(unsafeUnwrap(this).focusNode);
    },
    addRange: function(range) {
      unsafeUnwrap(this).addRange(unwrap(range));
    },
    collapse: function(node, index) {
      unsafeUnwrap(this).collapse(unwrapIfNeeded(node), index);
    },
    containsNode: function(node, allowPartial) {
      return unsafeUnwrap(this).containsNode(unwrapIfNeeded(node), allowPartial);
    },
    extend: function(node, offset) {
      unsafeUnwrap(this).extend(unwrapIfNeeded(node), offset);
    },
    getRangeAt: function(index) {
      return wrap(unsafeUnwrap(this).getRangeAt(index));
    },
    removeRange: function(range) {
      unsafeUnwrap(this).removeRange(unwrap(range));
    },
    selectAllChildren: function(node) {
      unsafeUnwrap(this).selectAllChildren(unwrapIfNeeded(node));
    },
    toString: function() {
      return unsafeUnwrap(this).toString();
    }
  };

  // WebKit extensions. Not implemented.
  // readonly attribute Node baseNode;
  // readonly attribute long baseOffset;
  // readonly attribute Node extentNode;
  // readonly attribute long extentOffset;
  // [RaisesException] void setBaseAndExtent([Default=Undefined] optional Node baseNode,
  //                       [Default=Undefined] optional long baseOffset,
  //                       [Default=Undefined] optional Node extentNode,
  //                       [Default=Undefined] optional long extentOffset);
  // [RaisesException, ImplementedAs=collapse] void setPosition([Default=Undefined] optional Node node,
  //                  [Default=Undefined] optional long offset);

  registerWrapper(window.Selection, Selection, window.getSelection());

  scope.wrappers.Selection = Selection;

})(window.ShadowDOMPolyfill);
