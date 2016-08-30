/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

'use strict';

// TODO(sorvell): circular (patch loads tree and tree loads patch)
// for now this is stuck on `utils`
//import {patchNode} from './patch'
import * as utils from './utils'

// native add/remove
let nativeInsertBefore = Element.prototype.insertBefore;
let nativeAppendChild = Element.prototype.appendChild;
let nativeRemoveChild = Element.prototype.removeChild;

/**
 * `tree` is a dom manipulation library used by ShadyDom to
 * manipulate composed and logical trees.
 */
export let tree = {

  // sad but faster than slice...
  arrayCopyChildNodes(parent) {
    let copy=[], i=0;
    for (let n=parent.firstChild; n; n=n.nextSibling) {
      copy[i++] = n;
    }
    return copy;
  },

  arrayCopyChildren(parent) {
    let copy=[], i=0;
    for (let n=parent.firstElementChild; n; n=n.nextElementSibling) {
      copy[i++] = n;
    }
    return copy;
  },

  arrayCopy(a$) {
    let l = a$.length;
    let copy = new Array(l);
    for (let i=0; i < l; i++) {
      copy[i] = a$[i];
    }
    return copy;
  },

  saveChildNodes(node) {
    tree.Logical.saveChildNodes(node);
    if (!tree.Composed.hasParentNode(node)) {
      tree.Composed.saveComposedData(node);
      //tree.Composed.saveParentNode(node);
    }
    tree.Composed.saveChildNodes(node);
  }

};

tree.Logical = {

  hasParentNode(node) {
    return Boolean(node.__dom && node.__dom.parentNode);
  },

  hasChildNodes(node) {
    return Boolean(node.__dom && node.__dom.childNodes !== undefined);
  },

  getChildNodes(node) {
    // note: we're distinguishing here between undefined and false-y:
    // hasChildNodes uses undefined check to see if this element has logical
    // children; the false-y check indicates whether or not we should rebuild
    // the cached childNodes array.
    return this.hasChildNodes(node) ? this._getChildNodes(node) :
      tree.Composed.getChildNodes(node);
  },

  _getChildNodes(node) {
    if (!node.__dom.childNodes) {
      node.__dom.childNodes = [];
      for (let n=this.getFirstChild(node); n; n=this.getNextSibling(n)) {
        node.__dom.childNodes.push(n);
      }
    }
    return node.__dom.childNodes;
  },

  // NOTE: __dom can be created under 2 conditions: (1) an element has a
  // logical tree, or (2) an element is in a logical tree. In case (1), the
  // element will store firstChild/lastChild, and in case (2), the element
  // will store parentNode, nextSibling, previousSibling. This means that
  // the mere existence of __dom is not enough to know if the requested
  // logical data is available and instead we do an explicit undefined check.
  getParentNode(node) {
    return node.__dom && node.__dom.parentNode !== undefined ?
      node.__dom.parentNode : tree.Composed.getParentNode(node);
  },

  getFirstChild(node) {
    return node.__dom && node.__dom.firstChild !== undefined ?
      node.__dom.firstChild : tree.Composed.getFirstChild(node);
  },

  getLastChild(node) {
    return node.__dom && node.__dom.lastChild  !== undefined ?
      node.__dom.lastChild : tree.Composed.getLastChild(node);
  },

  getNextSibling(node) {
    return node.__dom && node.__dom.nextSibling  !== undefined ?
      node.__dom.nextSibling : tree.Composed.getNextSibling(node);
  },

  getPreviousSibling(node) {
    return node.__dom && node.__dom.previousSibling  !== undefined ?
      node.__dom.previousSibling : tree.Composed.getPreviousSibling(node);
  },

  getFirstElementChild(node) {
    return node.__dom && node.__dom.firstChild !== undefined ?
      this._getFirstElementChild(node) :
      tree.Composed.getFirstElementChild(node);
  },

  _getFirstElementChild(node) {
    let n = node.__dom.firstChild;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = n.__dom.nextSibling;
    }
    return n;
  },

  getLastElementChild(node) {
    return node.__dom && node.__dom.lastChild !== undefined ?
      this._getLastElementChild(node) :
      tree.Composed.getLastElementChild(node);
  },

  _getLastElementChild(node) {
    let n = node.__dom.lastChild;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = n.__dom.previousSibling;
    }
    return n;
  },

  getNextElementSibling(node) {
    return node.__dom && node.__dom.nextSibling !== undefined ?
      this._getNextElementSibling(node) :
      tree.Composed.getNextElementSibling(node);
  },

  _getNextElementSibling(node) {
    let n = node.__dom.nextSibling;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = this.getNextSibling(n);
    }
    return n;
  },

  getPreviousElementSibling(node) {
    return node.__dom && node.__dom.previousSibling !== undefined ?
      this._getPreviousElementSibling(node) :
      tree.Composed.getPreviousElementSibling(node);
  },

  _getPreviousElementSibling(node) {
    let n = node.__dom.previousSibling;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = this.getPreviousSibling(n);
    }
    return n;
  },

  // Capture the list of light children. It's important to do this before we
  // start transforming the DOM into "rendered" state.
  // Children may be added to this list dynamically. It will be treated as the
  // source of truth for the light children of the element. This element's
  // actual children will be treated as the rendered state once this function
  // has been called.
  saveChildNodes(node) {
    if (!this.hasChildNodes(node)) {
      node.__dom = node.__dom || {};
      node.__dom.firstChild = node.firstChild;
      node.__dom.lastChild = node.lastChild;
      let c$ = node.__dom.childNodes = tree.arrayCopyChildNodes(node);
      for (let i=0, n; (i<c$.length) && (n=c$[i]); i++) {
        n.__dom = n.__dom || {};
        n.__dom.parentNode = node;
        n.__dom.nextSibling = c$[i+1] || null;
        n.__dom.previousSibling = c$[i-1] || null;
        utils.common.patchNode(n);
      }
    }
  },

  // TODO(sorvell): may need to patch saveChildNodes iff the tree has
  // already been distributed.
  // NOTE: ensure `node` is patched...
  recordInsertBefore(node, container, ref_node) {
    container.__dom.childNodes = null;
    // handle document fragments
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      let c$ = tree.arrayCopyChildNodes(node);
      for (let i=0; i < c$.length; i++) {
        this._linkNode(c$[i], container, ref_node);
      }
      // cleanup logical dom in doc fragment.
      node.__dom = node.__dom || {};
      node.__dom.firstChild = node.__dom.lastChild = undefined;
      node.__dom.childNodes = null;
    } else {
      this._linkNode(node, container, ref_node);
    }
  },

  _linkNode(node, container, ref_node) {
    utils.common.patchNode(node);
    ref_node = ref_node || null;
    node.__dom = node.__dom || {};
    container.__dom = container.__dom || {};
    if (ref_node) {
      ref_node.__dom = ref_node.__dom || {};
    }
    // update ref_node.previousSibling <-> node
    node.__dom.previousSibling = ref_node ? ref_node.__dom.previousSibling :
      container.__dom.lastChild;
    if (node.__dom.previousSibling) {
      node.__dom.previousSibling.__dom.nextSibling = node;
    }
    // update node <-> ref_node
    node.__dom.nextSibling = ref_node;
    if (node.__dom.nextSibling) {
      node.__dom.nextSibling.__dom.previousSibling = node;
    }
    // update node <-> container
    node.__dom.parentNode = container;
    if (ref_node) {
      if (ref_node === container.__dom.firstChild) {
        container.__dom.firstChild = node;
      }
    } else {
      container.__dom.lastChild = node;
      if (!container.__dom.firstChild) {
        container.__dom.firstChild = node;
      }
    }
    // remove caching of childNodes
    container.__dom.childNodes = null;
  },

  recordRemoveChild(node, container) {
    node.__dom = node.__dom || {};
    container.__dom = container.__dom || {};
    if (node === container.__dom.firstChild) {
      container.__dom.firstChild = node.__dom.nextSibling;
    }
    if (node === container.__dom.lastChild) {
      container.__dom.lastChild = node.__dom.previousSibling;
    }
    let p = node.__dom.previousSibling;
    let n = node.__dom.nextSibling;
    if (p) {
      p.__dom = p.__dom || {};
      p.__dom.nextSibling = n;
    }
    if (n) {
      n.__dom = n.__dom || {};
      n.__dom.previousSibling = p;
    }
    // When an element is removed, logical data is no longer tracked.
    // Explicitly set `undefined` here to indicate this. This is disginguished
    // from `null` which is set if info is null.
    node.__dom.parentNode = node.__dom.previousSibling =
      node.__dom.nextSibling = undefined;
    // remove caching of childNodes
    container.__dom.childNodes = null;
  }

}


// TODO(sorvell): composed tree manipulation is made available
// (1) to maninpulate the composed tree, and (2) to track changes
// to the tree for optional patching pluggability.
tree.Composed = {

  hasParentNode(node) {
    return Boolean(node.__dom && node.__dom.$parentNode !== undefined);
  },

  hasChildNodes(node) {
    return Boolean(node.__dom && node.__dom.$childNodes !== undefined);
  },

  getChildNodes(node) {
    return this.hasChildNodes(node) ? this._getChildNodes(node) :
      (!node.__patched && tree.arrayCopy(node.childNodes));
  },

  _getChildNodes(node) {
    if (!node.__dom.$childNodes) {
      node.__dom.$childNodes = [];
      for (let n=node.__dom.$firstChild; n; n=n.__dom.$nextSibling) {
        node.__dom.$childNodes.push(n);
      }
    }
    return node.__dom.$childNodes;
  },

  getComposedChildNodes(node) {
    return node.__dom.$childNodes;
  },

  getParentNode(node) {
    return this.hasParentNode(node) ? node.__dom.$parentNode :
      (!node.__patched && node.parentNode);
  },

  getFirstChild(node) {
    return node.__patched ? node.__dom.$firstChild : node.firstChild;
  },

  getLastChild(node) {
    return node.__patched ? node.__dom.$lastChild : node.lastChild;
  },

  getNextSibling(node) {
    return node.__patched ? node.__dom.$nextSibling : node.nextSibling;
  },

  getPreviousSibling(node) {
    return node.__patched ? node.__dom.$previousSibling : node.previousSibling;
  },

  getFirstElementChild(node) {
    return node.__patched ? this._getFirstElementChild(node) :
      node.firstElementChild;
  },

  _getFirstElementChild(node) {
    let n = node.__dom.$firstChild;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = n.__dom.$nextSibling;
    }
    return n;
  },

  getLastElementChild(node) {
    return node.__patched ? this._getLastElementChild(node) :
      node.lastElementChild;
  },

  _getLastElementChild(node) {
    let n = node.__dom.$lastChild;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = n.__dom.$previousSibling;
    }
    return n;
  },

  getNextElementSibling(node) {
    return node.__patched ? this._getNextElementSibling(node) :
      node.nextElementSibling;
  },

  _getNextElementSibling(node) {
    let n = node.__dom.$nextSibling;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = this.getNextSibling(n);
    }
    return n;
  },

  getPreviousElementSibling(node) {
    return node.__patched ? this._getPreviousElementSibling(node) :
      node.previousElementSibling;
  },

  _getPreviousElementSibling(node) {
    let n = node.__dom.$previousSibling;
    while (n && n.nodeType !== Node.ELEMENT_NODE) {
      n = this.getPreviousSibling(n);
    }
    return n;
  },

  saveChildNodes(node) {
    if (!this.hasChildNodes(node)) {
      node.__dom = node.__dom || {};
      node.__dom.$firstChild = node.firstChild;
      node.__dom.$lastChild = node.lastChild;
      let c$ = node.__dom.$childNodes = tree.arrayCopyChildNodes(node);
      for (let i=0, n; (i<c$.length) && (n=c$[i]); i++) {
        this.saveComposedData(n);
      }
    }
  },

  saveComposedData(node) {
    node.__dom = node.__dom || {};
    if (node.__dom.$parentNode === undefined) {
      node.__dom.$parentNode = node.parentNode;
    }
    if (node.__dom.$nextSibling === undefined) {
      node.__dom.$nextSibling = node.nextSibling;
    }
    if (node.__dom.$previousSibling === undefined) {
      node.__dom.$previousSibling = node.previousSibling;
    }
  },

  recordInsertBefore(node, container, ref_node) {
    container.__dom.$childNodes = null;
    // handle document fragments
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      // TODO(sorvell): remember this for patching:
      // the act of setting this info can affect patched nodes
      // getters; therefore capture childNodes before patching.
      for (let n=this.getFirstChild(node); n; n=this.getNextSibling(n)) {
        this._linkNode(n, container, ref_node);
      }
    } else {
      this._linkNode(node, container, ref_node);
    }
  },

  _linkNode(node, container, ref_node) {
    node.__dom = node.__dom || {};
    container.__dom = container.__dom || {};
    if (ref_node) {
      ref_node.__dom = ref_node.__dom || {};
    }
    // update ref_node.previousSibling <-> node
    node.__dom.$previousSibling = ref_node ? ref_node.__dom.$previousSibling :
      container.__dom.$lastChild;
    if (node.__dom.$previousSibling) {
      node.__dom.$previousSibling.__dom.$nextSibling = node;
    }
    // update node <-> ref_node
    node.__dom.$nextSibling = ref_node;
    if (node.__dom.$nextSibling) {
      node.__dom.$nextSibling.__dom.$previousSibling = node;
    }
    // update node <-> container
    node.__dom.$parentNode = container;
    if (ref_node) {
      if (ref_node === container.__dom.$firstChild) {
        container.__dom.$firstChild = node;
      }
    } else {
      container.__dom.$lastChild = node;
      if (!container.__dom.$firstChild) {
        container.__dom.$firstChild = node;
      }
    }
    // remove caching of childNodes
    container.__dom.$childNodes = null;
  },

  recordRemoveChild(node, container) {
    node.__dom = node.__dom || {};
    container.__dom = container.__dom || {};
    if (node === container.__dom.$firstChild) {
      container.__dom.$firstChild = node.__dom.$nextSibling;
    }
    if (node === container.__dom.$lastChild) {
      container.__dom.$lastChild = node.__dom.$previousSibling;
    }
    let p = node.__dom.$previousSibling;
    let n = node.__dom.$nextSibling;
    if (p) {
      p.__dom = p.__dom || {};
      p.__dom.$nextSibling = n;
    }
    if (n) {
      n.__dom = n.__dom || {};
      n.__dom.$previousSibling = p;
    }
    node.__dom.$parentNode = node.__dom.$previousSibling =
      node.__dom.$nextSibling = null;
    // remove caching of childNodes
    container.__dom.$childNodes = null;
  },

  clearChildNodes(node) {
    let c$ = this.getChildNodes(node);
    for (let i=0, c; i < c$.length; i++) {
      c = c$[i];
      this.recordRemoveChild(c, node);
      nativeRemoveChild.call(node, c)
    }
  },

  saveParentNode(node) {
    node.__dom = node.__dom || {};
    node.__dom.$parentNode = node.parentNode;
  },

  insertBefore(parentNode, newChild, refChild) {
    this.saveChildNodes(parentNode);
    // remove from current location.
    this._addChild(parentNode, newChild, refChild);
    return nativeInsertBefore.call(parentNode, newChild, refChild || null);
  },

  appendChild(parentNode, newChild) {
    this.saveChildNodes(parentNode);
    this._addChild(parentNode, newChild);
    return nativeAppendChild.call(parentNode, newChild);
  },

  removeChild(parentNode, node) {
    let currentParent = this.getParentNode(node);
    this.saveChildNodes(parentNode);
    this._removeChild(parentNode, node);
    if (currentParent === parentNode) {
      return nativeRemoveChild.call(parentNode, node);
    }
  },

  _addChild(parentNode, newChild, refChild) {
    let isFrag = (newChild.nodeType === Node.DOCUMENT_FRAGMENT_NODE);
    let oldParent = this.getParentNode(newChild);
    if (oldParent) {
      this._removeChild(oldParent, newChild);
    }
    if (isFrag) {
      let c$ = this.getChildNodes(newChild);
      for (let i=0; i < c$.length; i++) {
        let c = c$[i];
        // unlink document fragment children
        this._removeChild(newChild, c);
        this.recordInsertBefore(c, parentNode, refChild);
      }
    } else {
      this.recordInsertBefore(newChild, parentNode, refChild);
    }
  },

  _removeChild(parentNode, node) {
    this.recordRemoveChild(node, parentNode);
  }

};

// for testing...
let descriptors = {};
export function getNativeProperty(element, property) {
  if (!descriptors[property]) {
    descriptors[property] = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype, property) ||
    Object.getOwnPropertyDescriptor(
      Element.prototype, property) ||
    Object.getOwnPropertyDescriptor(
      Node.prototype, property);
  }
  return descriptors[property].get.call(element);
}

// for testing...
function assertNative(element, property, tracked) {
  let native = getNativeProperty(element, property);
  if (native != tracked && element.__patched) {
    window.console.warn('tracked', tracked, 'native', native);
  }
  return tracked;
}