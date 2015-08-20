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

  var EventTarget = scope.wrappers.EventTarget;
  var NodeList = scope.wrappers.NodeList;
  var TreeScope = scope.TreeScope;
  var assert = scope.assert;
  var defineWrapGetter = scope.defineWrapGetter;
  var enqueueMutation = scope.enqueueMutation;
  var getTreeScope = scope.getTreeScope;
  var isWrapper = scope.isWrapper;
  var mixin = scope.mixin;
  var registerTransientObservers = scope.registerTransientObservers;
  var registerWrapper = scope.registerWrapper;
  var setTreeScope = scope.setTreeScope;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var unwrapIfNeeded = scope.unwrapIfNeeded;
  var wrap = scope.wrap;
  var wrapIfNeeded = scope.wrapIfNeeded;
  var wrappers = scope.wrappers;

  function assertIsNodeWrapper(node) {
    assert(node instanceof Node);
  }

  function createOneElementNodeList(node) {
    var nodes = new NodeList();
    nodes[0] = node;
    nodes.length = 1;
    return nodes;
  }

  var surpressMutations = false;

  /**
   * Called before node is inserted into a node to enqueue its removal from its
   * old parent.
   * @param {!Node} node The node that is about to be removed.
   * @param {!Node} parent The parent node that the node is being removed from.
   * @param {!NodeList} nodes The collected nodes.
   */
  function enqueueRemovalForInsertedNodes(node, parent, nodes) {
    enqueueMutation(parent, 'childList', {
      removedNodes: nodes,
      previousSibling: node.previousSibling,
      nextSibling: node.nextSibling
    });
  }

  function enqueueRemovalForInsertedDocumentFragment(df, nodes) {
    enqueueMutation(df, 'childList', {
      removedNodes: nodes
    });
  }

  /**
   * Collects nodes from a DocumentFragment or a Node for removal followed
   * by an insertion.
   *
   * This updates the internal pointers for node, previousNode and nextNode.
   */
  function collectNodes(node, parentNode, previousNode, nextNode) {
    if (node instanceof DocumentFragment) {
      var nodes = collectNodesForDocumentFragment(node);

      // The extra loop is to work around bugs with DocumentFragments in IE.
      surpressMutations = true;
      for (var i = nodes.length - 1; i >= 0; i--) {
        node.removeChild(nodes[i]);
        nodes[i].parentNode_ = parentNode;
      }
      surpressMutations = false;

      for (var i = 0; i < nodes.length; i++) {
        nodes[i].previousSibling_ = nodes[i - 1] || previousNode;
        nodes[i].nextSibling_ = nodes[i + 1] || nextNode;
      }

      if (previousNode)
        previousNode.nextSibling_ = nodes[0];
      if (nextNode)
        nextNode.previousSibling_ = nodes[nodes.length - 1];

      return nodes;
    }

    var nodes = createOneElementNodeList(node);
    var oldParent = node.parentNode;
    if (oldParent) {
      // This will enqueue the mutation record for the removal as needed.
      oldParent.removeChild(node);
    }

    node.parentNode_ = parentNode;
    node.previousSibling_ = previousNode;
    node.nextSibling_ = nextNode;
    if (previousNode)
      previousNode.nextSibling_ = node;
    if (nextNode)
      nextNode.previousSibling_ = node;

    return nodes;
  }

  function collectNodesNative(node) {
    if (node instanceof DocumentFragment)
      return collectNodesForDocumentFragment(node);

    var nodes = createOneElementNodeList(node);
    var oldParent = node.parentNode;
    if (oldParent)
      enqueueRemovalForInsertedNodes(node, oldParent, nodes);
    return nodes;
  }

  function collectNodesForDocumentFragment(node) {
    var nodes = new NodeList();
    var i = 0;
    for (var child = node.firstChild; child; child = child.nextSibling) {
      nodes[i++] = child;
    }
    nodes.length = i;
    enqueueRemovalForInsertedDocumentFragment(node, nodes);
    return nodes;
  }

  function snapshotNodeList(nodeList) {
    // NodeLists are not live at the moment so just return the same object.
    return nodeList;
  }

  // http://dom.spec.whatwg.org/#node-is-inserted
  function nodeWasAdded(node, treeScope) {
    setTreeScope(node, treeScope);
    node.nodeIsInserted_();
  }

  function nodesWereAdded(nodes, parent) {
    var treeScope = getTreeScope(parent);
    for (var i = 0; i < nodes.length; i++) {
      nodeWasAdded(nodes[i], treeScope);
    }
  }

  // http://dom.spec.whatwg.org/#node-is-removed
  function nodeWasRemoved(node) {
    setTreeScope(node, new TreeScope(node, null));
  }

  function nodesWereRemoved(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      nodeWasRemoved(nodes[i]);
    }
  }

  function ensureSameOwnerDocument(parent, child) {
    var ownerDoc = parent.nodeType === Node.DOCUMENT_NODE ?
        parent : parent.ownerDocument;
    if (ownerDoc !== child.ownerDocument)
      ownerDoc.adoptNode(child);
  }

  function adoptNodesIfNeeded(owner, nodes) {
    if (!nodes.length)
      return;

    var ownerDoc = owner.ownerDocument;

    // All nodes have the same ownerDocument when we get here.
    if (ownerDoc === nodes[0].ownerDocument)
      return;

    for (var i = 0; i < nodes.length; i++) {
      scope.adoptNodeNoRemove(nodes[i], ownerDoc);
    }
  }

  function unwrapNodesForInsertion(owner, nodes) {
    adoptNodesIfNeeded(owner, nodes);
    var length = nodes.length;

    if (length === 1)
      return unwrap(nodes[0]);

    var df = unwrap(owner.ownerDocument.createDocumentFragment());
    for (var i = 0; i < length; i++) {
      df.appendChild(unwrap(nodes[i]));
    }
    return df;
  }

  function clearChildNodes(wrapper) {
    if (wrapper.firstChild_ !== undefined) {
      var child = wrapper.firstChild_;
      while (child) {
        var tmp = child;
        child = child.nextSibling_;
        tmp.parentNode_ = tmp.previousSibling_ = tmp.nextSibling_ = undefined;
      }
    }
    wrapper.firstChild_ = wrapper.lastChild_ = undefined;
  }

  function removeAllChildNodes(wrapper) {
    if (wrapper.invalidateShadowRenderer()) {
      var childWrapper = wrapper.firstChild;
      while (childWrapper) {
        assert(childWrapper.parentNode === wrapper);
        var nextSibling = childWrapper.nextSibling;
        var childNode = unwrap(childWrapper);
        var parentNode = childNode.parentNode;
        if (parentNode)
          originalRemoveChild.call(parentNode, childNode);
        childWrapper.previousSibling_ = childWrapper.nextSibling_ =
            childWrapper.parentNode_ = null;
        childWrapper = nextSibling;
      }
      wrapper.firstChild_ = wrapper.lastChild_ = null;
    } else {
      var node = unwrap(wrapper);
      var child = node.firstChild;
      var nextSibling;
      while (child) {
        nextSibling = child.nextSibling;
        originalRemoveChild.call(node, child);
        child = nextSibling;
      }
    }
  }

  function invalidateParent(node) {
    var p = node.parentNode;
    return p && p.invalidateShadowRenderer();
  }

  function cleanupNodes(nodes) {
    for (var i = 0, n; i < nodes.length; i++) {
      n = nodes[i];
      n.parentNode.removeChild(n);
    }
  }

  var originalImportNode = document.importNode;
  var originalCloneNode = window.Node.prototype.cloneNode;

  function cloneNode(node, deep, opt_doc) {
    var clone;
    if (opt_doc)
      clone = wrap(originalImportNode.call(opt_doc, unsafeUnwrap(node), false));
    else
      clone = wrap(originalCloneNode.call(unsafeUnwrap(node), false));

    if (deep) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        clone.appendChild(cloneNode(child, true, opt_doc));
      }

      if (node instanceof wrappers.HTMLTemplateElement) {
        var cloneContent = clone.content;
        for (var child = node.content.firstChild;
             child;
             child = child.nextSibling) {
         cloneContent.appendChild(cloneNode(child, true, opt_doc));
        }
      }
    }
    // TODO(arv): Some HTML elements also clone other data like value.
    return clone;
  }

  function contains(self, child) {
    if (!child || getTreeScope(self) !== getTreeScope(child))
      return false;

    for (var node = child; node; node = node.parentNode) {
      if (node === self)
        return true;
    }
    return false;
  }

  var OriginalNode = window.Node;

  /**
   * This represents a wrapper of a native DOM node.
   * @param {!Node} original The original DOM node, aka, the visual DOM node.
   * @constructor
   * @extends {EventTarget}
   */
  function Node(original) {
    assert(original instanceof OriginalNode);

    EventTarget.call(this, original);

    // These properties are used to override the visual references with the
    // logical ones. If the value is undefined it means that the logical is the
    // same as the visual.

    /**
     * @type {Node|undefined}
     * @private
     */
    this.parentNode_ = undefined;

    /**
     * @type {Node|undefined}
     * @private
     */
    this.firstChild_ = undefined;

    /**
     * @type {Node|undefined}
     * @private
     */
    this.lastChild_ = undefined;

    /**
     * @type {Node|undefined}
     * @private
     */
    this.nextSibling_ = undefined;

    /**
     * @type {Node|undefined}
     * @private
     */
    this.previousSibling_ = undefined;

    this.treeScope_ = undefined;
  }

  var OriginalDocumentFragment = window.DocumentFragment;
  var originalAppendChild = OriginalNode.prototype.appendChild;
  var originalCompareDocumentPosition =
      OriginalNode.prototype.compareDocumentPosition;
  var originalIsEqualNode = OriginalNode.prototype.isEqualNode;
  var originalInsertBefore = OriginalNode.prototype.insertBefore;
  var originalRemoveChild = OriginalNode.prototype.removeChild;
  var originalReplaceChild = OriginalNode.prototype.replaceChild;

  var isIEOrEdge = /Trident|Edge/.test(navigator.userAgent);

  var removeChildOriginalHelper = isIEOrEdge ?
      function(parent, child) {
        try {
          originalRemoveChild.call(parent, child);
        } catch (ex) {
          if (!(parent instanceof OriginalDocumentFragment))
            throw ex;
        }
      } :
      function(parent, child) {
        originalRemoveChild.call(parent, child);
      };

  Node.prototype = Object.create(EventTarget.prototype);
  mixin(Node.prototype, {
    appendChild: function(childWrapper) {
      return this.insertBefore(childWrapper, null);
    },

    insertBefore: function(childWrapper, refWrapper) {
      assertIsNodeWrapper(childWrapper);

      var refNode;
      if (refWrapper) {
        if (isWrapper(refWrapper)) {
          refNode = unwrap(refWrapper);
        } else {
          refNode = refWrapper;
          refWrapper = wrap(refNode);
        }
      } else {
        refWrapper = null;
        refNode = null;
      }

      refWrapper && assert(refWrapper.parentNode === this);

      var nodes;
      var previousNode =
          refWrapper ? refWrapper.previousSibling : this.lastChild;

      var useNative = !this.invalidateShadowRenderer() &&
                      !invalidateParent(childWrapper);

      if (useNative)
        nodes = collectNodesNative(childWrapper);
      else
        nodes = collectNodes(childWrapper, this, previousNode, refWrapper);

      if (useNative) {
        ensureSameOwnerDocument(this, childWrapper);
        clearChildNodes(this);
        originalInsertBefore.call(unsafeUnwrap(this), unwrap(childWrapper), refNode);
      } else {
        if (!previousNode)
          this.firstChild_ = nodes[0];
        if (!refWrapper) {
          this.lastChild_ = nodes[nodes.length - 1];
          if (this.firstChild_ === undefined)
            this.firstChild_ = this.firstChild;
        }

        var parentNode = refNode ? refNode.parentNode : unsafeUnwrap(this);

        // insertBefore refWrapper no matter what the parent is?
        if (parentNode) {
          originalInsertBefore.call(parentNode,
              unwrapNodesForInsertion(this, nodes), refNode);
        } else {
          adoptNodesIfNeeded(this, nodes);
        }
      }

      enqueueMutation(this, 'childList', {
        addedNodes: nodes,
        nextSibling: refWrapper,
        previousSibling: previousNode
      });

      nodesWereAdded(nodes, this);

      return childWrapper;
    },

    removeChild: function(childWrapper) {
      assertIsNodeWrapper(childWrapper);
      if (childWrapper.parentNode !== this) {
        // IE has invalid DOM trees at times.
        var found = false;
        var childNodes = this.childNodes;
        for (var ieChild = this.firstChild; ieChild;
             ieChild = ieChild.nextSibling) {
          if (ieChild === childWrapper) {
            found = true;
            break;
          }
        }
        if (!found) {
          // TODO(arv): DOMException
          throw new Error('NotFoundError');
        }
      }

      var childNode = unwrap(childWrapper);
      var childWrapperNextSibling = childWrapper.nextSibling;
      var childWrapperPreviousSibling = childWrapper.previousSibling;

      if (this.invalidateShadowRenderer()) {
        // We need to remove the real node from the DOM before updating the
        // pointers. This is so that that mutation event is dispatched before
        // the pointers have changed.
        var thisFirstChild = this.firstChild;
        var thisLastChild = this.lastChild;

        var parentNode = childNode.parentNode;
        if (parentNode)
          removeChildOriginalHelper(parentNode, childNode);

        if (thisFirstChild === childWrapper)
          this.firstChild_ = childWrapperNextSibling;
        if (thisLastChild === childWrapper)
          this.lastChild_ = childWrapperPreviousSibling;
        if (childWrapperPreviousSibling)
          childWrapperPreviousSibling.nextSibling_ = childWrapperNextSibling;
        if (childWrapperNextSibling) {
          childWrapperNextSibling.previousSibling_ =
              childWrapperPreviousSibling;
        }

        childWrapper.previousSibling_ = childWrapper.nextSibling_ =
            childWrapper.parentNode_ = undefined;
      } else {
        clearChildNodes(this);
        removeChildOriginalHelper(unsafeUnwrap(this), childNode);
      }

      if (!surpressMutations) {
        enqueueMutation(this, 'childList', {
          removedNodes: createOneElementNodeList(childWrapper),
          nextSibling: childWrapperNextSibling,
          previousSibling: childWrapperPreviousSibling
        });
      }

      registerTransientObservers(this, childWrapper);

      return childWrapper;
    },

    replaceChild: function(newChildWrapper, oldChildWrapper) {
      assertIsNodeWrapper(newChildWrapper);

      var oldChildNode;
      if (isWrapper(oldChildWrapper)) {
        oldChildNode = unwrap(oldChildWrapper);
      } else {
        oldChildNode = oldChildWrapper;
        oldChildWrapper = wrap(oldChildNode);
      }

      if (oldChildWrapper.parentNode !== this) {
        // TODO(arv): DOMException
        throw new Error('NotFoundError');
      }

      var nextNode = oldChildWrapper.nextSibling;
      var previousNode = oldChildWrapper.previousSibling;
      var nodes;

      var useNative = !this.invalidateShadowRenderer() &&
                      !invalidateParent(newChildWrapper);

      if (useNative) {
        nodes = collectNodesNative(newChildWrapper);
      } else {
        if (nextNode === newChildWrapper)
          nextNode = newChildWrapper.nextSibling;
        nodes = collectNodes(newChildWrapper, this, previousNode, nextNode);
      }

      if (!useNative) {
        if (this.firstChild === oldChildWrapper)
          this.firstChild_ = nodes[0];
        if (this.lastChild === oldChildWrapper)
          this.lastChild_ = nodes[nodes.length - 1];

        oldChildWrapper.previousSibling_ = oldChildWrapper.nextSibling_ =
            oldChildWrapper.parentNode_ = undefined;

        // replaceChild no matter what the parent is?
        if (oldChildNode.parentNode) {
          originalReplaceChild.call(
              oldChildNode.parentNode,
              unwrapNodesForInsertion(this, nodes),
              oldChildNode);
        }
      } else {
        ensureSameOwnerDocument(this, newChildWrapper);
        clearChildNodes(this);
        originalReplaceChild.call(unsafeUnwrap(this), unwrap(newChildWrapper),
                                  oldChildNode);
      }

      enqueueMutation(this, 'childList', {
        addedNodes: nodes,
        removedNodes: createOneElementNodeList(oldChildWrapper),
        nextSibling: nextNode,
        previousSibling: previousNode
      });

      nodeWasRemoved(oldChildWrapper);
      nodesWereAdded(nodes, this);

      return oldChildWrapper;
    },

    /**
     * Called after a node was inserted. Subclasses override this to invalidate
     * the renderer as needed.
     * @private
     */
    nodeIsInserted_: function() {
      for (var child = this.firstChild; child; child = child.nextSibling) {
        child.nodeIsInserted_();
      }
    },

    hasChildNodes: function() {
      return this.firstChild !== null;
    },

    /** @type {Node} */
    get parentNode() {
      // If the parentNode has not been overridden, use the original parentNode.
      return this.parentNode_ !== undefined ?
          this.parentNode_ : wrap(unsafeUnwrap(this).parentNode);
    },

    /** @type {Node} */
    get firstChild() {
      return this.firstChild_ !== undefined ?
          this.firstChild_ : wrap(unsafeUnwrap(this).firstChild);
    },

    /** @type {Node} */
    get lastChild() {
      return this.lastChild_ !== undefined ?
          this.lastChild_ : wrap(unsafeUnwrap(this).lastChild);
    },

    /** @type {Node} */
    get nextSibling() {
      return this.nextSibling_ !== undefined ?
          this.nextSibling_ : wrap(unsafeUnwrap(this).nextSibling);
    },

    /** @type {Node} */
    get previousSibling() {
      return this.previousSibling_ !== undefined ?
          this.previousSibling_ : wrap(unsafeUnwrap(this).previousSibling);
    },

    get parentElement() {
      var p = this.parentNode;
      while (p && p.nodeType !== Node.ELEMENT_NODE) {
        p = p.parentNode;
      }
      return p;
    },

    get textContent() {
      // TODO(arv): This should fallback to unsafeUnwrap(this).textContent if there
      // are no shadow trees below or above the context node.
      var s = '';
      for (var child = this.firstChild; child; child = child.nextSibling) {
        if (child.nodeType != Node.COMMENT_NODE) {
          s += child.textContent;
        }
      }
      return s;
    },
    set textContent(textContent) {
      if (textContent == null) textContent = '';
      var removedNodes = snapshotNodeList(this.childNodes);

      if (this.invalidateShadowRenderer()) {
        removeAllChildNodes(this);
        if (textContent !== '') {
          var textNode = unsafeUnwrap(this).ownerDocument.createTextNode(textContent);
          this.appendChild(textNode);
        }
      } else {
        clearChildNodes(this);
        unsafeUnwrap(this).textContent = textContent;
      }

      var addedNodes = snapshotNodeList(this.childNodes);

      enqueueMutation(this, 'childList', {
        addedNodes: addedNodes,
        removedNodes: removedNodes
      });

      nodesWereRemoved(removedNodes);
      nodesWereAdded(addedNodes, this);
    },

    get childNodes() {
      var wrapperList = new NodeList();
      var i = 0;
      for (var child = this.firstChild; child; child = child.nextSibling) {
        wrapperList[i++] = child;
      }
      wrapperList.length = i;
      return wrapperList;
    },

    cloneNode: function(deep) {
      return cloneNode(this, deep);
    },

    contains: function(child) {
      return contains(this, wrapIfNeeded(child));
    },

    compareDocumentPosition: function(otherNode) {
      // This only wraps, it therefore only operates on the composed DOM and not
      // the logical DOM.
      return originalCompareDocumentPosition.call(unsafeUnwrap(this),
                                                  unwrapIfNeeded(otherNode));
    },

    isEqualNode: function(otherNode){
      return originalIsEqualNode.call(unsafeUnwrap(this), unwrapIfNeeded(otherNode));
    },

    normalize: function() {
      var nodes = snapshotNodeList(this.childNodes);
      var remNodes = [];
      var s = '';
      var modNode;

      for (var i = 0, n; i < nodes.length; i++) {
        n = nodes[i];
        if (n.nodeType === Node.TEXT_NODE) {
          if (!modNode && !n.data.length)
            this.removeChild(n);
          else if (!modNode)
            modNode = n;
          else {
            s += n.data;
            remNodes.push(n);
          }
        } else {
          if (modNode && remNodes.length) {
            modNode.data += s;
            cleanupNodes(remNodes);
          }
          remNodes = [];
          s = '';
          modNode = null;
          if (n.childNodes.length)
            n.normalize();
        }
      }

      // handle case where >1 text nodes are the last children
      if (modNode && remNodes.length) {
        modNode.data += s;
        cleanupNodes(remNodes);
      }
    }
  });

  defineWrapGetter(Node, 'ownerDocument');

  // We use a DocumentFragment as a base and then delete the properties of
  // DocumentFragment.prototype from the wrapper Node. Since delete makes
  // objects slow in some JS engines we recreate the prototype object.
  registerWrapper(OriginalNode, Node, document.createDocumentFragment());
  delete Node.prototype.querySelector;
  delete Node.prototype.querySelectorAll;
  Node.prototype = mixin(Object.create(EventTarget.prototype), Node.prototype);

  scope.cloneNode = cloneNode;
  scope.nodeWasAdded = nodeWasAdded;
  scope.nodeWasRemoved = nodeWasRemoved;
  scope.nodesWereAdded = nodesWereAdded;
  scope.nodesWereRemoved = nodesWereRemoved;
  scope.originalInsertBefore = originalInsertBefore;
  scope.originalRemoveChild = originalRemoveChild;
  scope.snapshotNodeList = snapshotNodeList;
  scope.wrappers.Node = Node;

})(window.ShadowDOMPolyfill);
