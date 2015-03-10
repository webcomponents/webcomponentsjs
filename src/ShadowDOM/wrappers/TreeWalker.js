/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
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
  var unwrapIfNeeded = scope.unwrapIfNeeded;
  var wrap = scope.wrap;

  var OriginalTreeWalker = window.TreeWalker;

  function TreeWalker(impl) {
    setWrapper(impl, this);
  }

  TreeWalker.prototype = {
    get root(){
      return wrap(unsafeUnwrap(this).root);
    },
    get currentNode() {
      return wrap(unsafeUnwrap(this).currentNode);
    },
    set currentNode(node) {
      unsafeUnwrap(this).currentNode=unwrapIfNeeded(node);
    },
    get filter(){
      return unsafeUnwrap(this).filter;
    },
    parentNode: function() {
      return wrap(unsafeUnwrap(this).parentNode());
    },
    firstChild: function() {
      return wrap(unsafeUnwrap(this).firstChild());
    },
    lastChild: function() {
      return wrap(unsafeUnwrap(this).lastChild());
    },
    previousSibling: function() {
      return wrap(unsafeUnwrap(this).previousSibling());
    },
    previousNode: function() {
      return wrap(unsafeUnwrap(this).previousNode());
    },
    nextNode: function() {
      return wrap(unsafeUnwrap(this).nextNode());
    }
  };

  registerWrapper(OriginalTreeWalker, TreeWalker);

  scope.wrappers.TreeWalker = TreeWalker;

})(window.ShadowDOMPolyfill);
