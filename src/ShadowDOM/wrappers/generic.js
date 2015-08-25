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

  var Node = scope.wrappers.Node;
  var GetElementsByInterface = scope.GetElementsByInterface;
  var NonElementParentNodeInterface = scope.NonElementParentNodeInterface;
  var ParentNodeInterface = scope.ParentNodeInterface;
  var SelectorsInterface = scope.SelectorsInterface;
  var mixin = scope.mixin;
  var registerObject = scope.registerObject;
  var registerWrapper = scope.registerWrapper;

  var OriginalDocumentFragment = window.DocumentFragment;

  function DocumentFragment(node) {
    Node.call(this, node);
  }

  DocumentFragment.prototype = Object.create(Node.prototype);
  mixin(DocumentFragment.prototype, ParentNodeInterface);
  mixin(DocumentFragment.prototype, SelectorsInterface);
  mixin(DocumentFragment.prototype, GetElementsByInterface);
  mixin(DocumentFragment.prototype, NonElementParentNodeInterface);

  registerWrapper(OriginalDocumentFragment, DocumentFragment, document.createDocumentFragment());
  scope.wrappers.DocumentFragment = DocumentFragment;

  var Comment = registerObject(document.createComment(''));
  scope.wrappers.Comment = Comment;

})(window.ShadowDOMPolyfill);
