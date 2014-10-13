// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var DocumentFragment = scope.wrappers.DocumentFragment;
  var TreeScope = scope.TreeScope;
  var elementFromPoint = scope.elementFromPoint;
  var getInnerHTML = scope.getInnerHTML;
  var getTreeScope = scope.getTreeScope;
  var mixin = scope.mixin;
  var rewrap = scope.rewrap;
  var setInnerHTML = scope.setInnerHTML;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;

  var shadowHostTable = new WeakMap();
  var nextOlderShadowTreeTable = new WeakMap();

  var spaceCharRe = /[ \t\n\r\f]/;

  function ShadowRoot(hostWrapper) {
    var node = unwrap(unsafeUnwrap(hostWrapper).ownerDocument.createDocumentFragment());
    DocumentFragment.call(this, node);

    // createDocumentFragment associates the node with a wrapper
    // DocumentFragment instance. Override that.
    rewrap(node, this);

    var oldShadowRoot = hostWrapper.shadowRoot;
    nextOlderShadowTreeTable.set(this, oldShadowRoot);

    this.treeScope_ =
        new TreeScope(this, getTreeScope(oldShadowRoot || hostWrapper));

    shadowHostTable.set(this, hostWrapper);
  }
  ShadowRoot.prototype = Object.create(DocumentFragment.prototype);
  mixin(ShadowRoot.prototype, {
    constructor: ShadowRoot,

    get innerHTML() {
      return getInnerHTML(this);
    },
    set innerHTML(value) {
      setInnerHTML(this, value);
      this.invalidateShadowRenderer();
    },

    get olderShadowRoot() {
      return nextOlderShadowTreeTable.get(this) || null;
    },

    get host() {
      return shadowHostTable.get(this) || null;
    },

    invalidateShadowRenderer: function() {
      return shadowHostTable.get(this).invalidateShadowRenderer();
    },

    elementFromPoint: function(x, y) {
      return elementFromPoint(this, this.ownerDocument, x, y);
    },

    getElementById: function(id) {
      if (spaceCharRe.test(id))
        return null;
      return this.querySelector('[id="' + id + '"]');
    }
  });

  scope.wrappers.ShadowRoot = ShadowRoot;

})(window.ShadowDOMPolyfill);
