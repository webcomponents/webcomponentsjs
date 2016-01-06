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
  var wrap = scope.wrap;

  var shadowHostTable = new WeakMap();
  var nextOlderShadowTreeTable = new WeakMap();

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

    getSelection: function() {
      return document.getSelection();
    },

    get activeElement() {
      var unwrappedActiveElement = unwrap(this).ownerDocument.activeElement;
      if (!unwrappedActiveElement || !unwrappedActiveElement.nodeType) return null;

      var activeElement = wrap(unwrappedActiveElement);

      // Loop while activeElement is not a shallow child of this ShadowRoot.
      while (!this.contains(activeElement)) {
        // Iterate until we hit activeElement's containing ShadowRoot (which
        // isn't this one) or document.
        while (activeElement.parentNode) {
          activeElement = activeElement.parentNode;
        }

        // If we've reached a ShadowRoot, move to its host.
        if (activeElement.host) {
          activeElement = activeElement.host;
        // Otherwise, we've reached a document - this ShadowRoot is not an
        // ancestor of the active element.
        } else {
          return null;
        }
      }

      return activeElement;
    }
  });

  scope.wrappers.ShadowRoot = ShadowRoot;

})(window.ShadowDOMPolyfill);
