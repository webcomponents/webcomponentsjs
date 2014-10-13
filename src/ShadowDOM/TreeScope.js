/**
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  /**
   * A tree scope represents the root of a tree. All nodes in a tree point to
   * the same TreeScope object. The tree scope of a node get set the first time
   * it is accessed or when a node is added or remove to a tree.
   *
   * The root is a Node that has no parent.
   *
   * The parent is another TreeScope. For ShadowRoots, it is the TreeScope of
   * the host of the ShadowRoot.
   *
   * @param {!Node} root
   * @param {TreeScope} parent
   * @constructor
   */
  function TreeScope(root, parent) {
    /** @type {!Node} */
    this.root = root;

    /** @type {TreeScope} */
    this.parent = parent;
  }

  TreeScope.prototype = {
    get renderer() {
      if (this.root instanceof scope.wrappers.ShadowRoot) {
        return scope.getRendererForHost(this.root.host);
      }
      return null;
    },

    contains: function(treeScope) {
      for (; treeScope; treeScope = treeScope.parent) {
        if (treeScope === this)
          return true;
      }
      return false;
    }
  };

  function setTreeScope(node, treeScope) {
    if (node.treeScope_ !== treeScope) {
      node.treeScope_ = treeScope;
      for (var sr = node.shadowRoot; sr; sr = sr.olderShadowRoot) {
        sr.treeScope_.parent = treeScope;
      }
      for (var child = node.firstChild; child; child = child.nextSibling) {
        setTreeScope(child, treeScope);
      }
    }
  }

  function getTreeScope(node) {
    if (node instanceof scope.wrappers.Window) {
      debugger;
    }

    if (node.treeScope_)
      return node.treeScope_;
    var parent = node.parentNode;
    var treeScope;
    if (parent)
      treeScope = getTreeScope(parent);
    else
      treeScope = new TreeScope(node, null);
    return node.treeScope_ = treeScope;
  }

  scope.TreeScope = TreeScope;
  scope.getTreeScope = getTreeScope;
  scope.setTreeScope = setTreeScope;

})(window.ShadowDOMPolyfill);
