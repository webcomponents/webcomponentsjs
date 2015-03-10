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

  // Not all browsers support Selection.extend. IE does not support extend.
  // https://msdn.microsoft.com/en-us/library/ie/ms535869%28v=vs.85%29.aspx
  // Code that checks if extend exists in the Selection would
  // fail the test if we define extend on the wrapper and it does not exist in
  // the browser Selection object.
  if (OriginalSelection.prototype.extend) {
    Selection.prototype.extend = function(node, offset) {
      unsafeUnwrap(this).extend(unwrapIfNeeded(node), offset);
    };
  }

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
