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

import {calculateSplices} from './array-splice'
import * as utils from './utils'
import {tree} from './tree'
import Distributor from './distributor'

/**
  Implements a pared down version of ShadowDOM's scoping, which is easy to
  polyfill across browsers.
*/
export class ShadyRoot {

  constructor(host) {
    if (!host) {
      throw 'Must provide a host';
    }
    // NOTE: this strange construction is necessary because
    // DocumentFragment cannot be subclassed on older browsers.
    let frag = document.createDocumentFragment();
    frag.__proto__ = ShadyFragmentMixin;
    frag._init(host);
    return frag;
  }

}

let ShadyMixin = {

  _init(host) {
    // TODO(sorvell): set a fake local name so this element can be
    // distinguished from a DocumentFragment when patching.
    // FF doesn't allow this to be `localName`
    this.__localName = 'ShadyRoot';
    // root <=> host
    host.shadyRoot = this;
    this.host = host;
    // logical dom setup
    tree.Logical.saveChildNodes(host);
    tree.Logical.saveChildNodes(this);
    // state flags
    this._clean = true;
    this._hasRendered = false;
    this._distributor = new Distributor(this);
    this.update();
  },

  // async render the "top" distributor (this is all that is needed to
  // distribute this host).
  update() {
    let distributionRoot = this._findDistributionRoot(this.host);
    //console.log('update from', this.host, 'root', distributionRoot.host, distributionRoot._clean);
    if (distributionRoot._clean) {
      distributionRoot._clean = false;
      enqueue(function() {
        distributionRoot.render();
      });
    }
  },

  // returns the host that's the top of this host's distribution tree
  _findDistributionRoot(element) {
    let root = element.shadyRoot;
    while (element && this._elementNeedsDistribution(element)) {
      root = element.getRootNode();
      element = root && root.host;
    }
    return root;
  },

  // Return true if a host's children includes
  // an insertion point that selects selectively
  _elementNeedsDistribution(element) {
    let c$ = tree.Logical.getChildNodes(element);
    for (let i=0, c; i < c$.length; i++) {
      c = c$[i];
      if (this._distributor.isInsertionPoint(c)) {
        return element.getRootNode();
      }
    }
  },

  render() {
    if (!this._clean) {
      if (!this._skipUpdateInsertionPoints) {
        this.updateInsertionPoints();
      } else if (!this._hasRendered) {
        this._insertionPoints = [];
      }
      this._skipUpdateInsertionPoints = false;
      // TODO(sorvell): previous ShadyDom had a fast path here
      // that would avoid distribution for initial render if
      // no insertion points exist. We cannot currently do this because
      // it relies on elements being in the physical shadowRoot element
      // so that native methods will be used. The current append code
      // simply provokes distribution in this case and does not put the
      // nodes in the shadowRoot. This could be done but we'll need to
      // consider if the special processing is worth the perf gain.
      // if (!this._hasRendered && !this._insertionPoints.length) {
      //   tree.Composed.clearChildNodes(this.host);
      //   tree.Composed.appendChild(this.host, this);
      // } else {
      // logical
      this.distribute();
      // physical
      this.compose();
      // allow distributor to do post render tasks (e.g. fire events!)
      this._distributor.rendered();
      this._clean = true;
      this._hasRendered = true;
    }
  },

  forceRender() {
    this._clean = false;
    this.render();
  },

  distribute() {
    let dirtyRoots = this._distributor.distribute();
    for (let i=0; i<dirtyRoots.length; i++) {
      dirtyRoots[i].forceRender();
    }
  },

  updateInsertionPoints() {
    let i$ = this._insertionPoints = this._distributor.getInsertionPoints();
    // ensure insertionPoints's and their parents have logical dom info.
    // save logical tree info
    // a. for shadyRoot
    // b. for insertion points (fallback)
    // c. for parents of insertion points
    for (let i=0, c; i < i$.length; i++) {
      c = i$[i];
      tree.Logical.saveChildNodes(c);
      tree.Logical.saveChildNodes(tree.Logical.getParentNode(c));
    }
  },

  get _insertionPoints() {
    if (!this.__insertionPoints) {
      this.updateInsertionPoints();
    }
    return this.__insertionPoints || (this.__insertionPoints = []);
  },

  set _insertionPoints(insertionPoints) {
    this.__insertionPoints = insertionPoints;
  },

  hasInsertionPoint() {
    return this._distributor.hasInsertionPoint();
  },

  compose() {
    // compose self
    // note: it's important to mark this clean before distribution
    // so that attachment that provokes additional distribution (e.g.
    // adding something to your parentNode) works
    this._composeTree();
    // TODO(sorvell): notification.
    // NOTE: send a signal to insertion points that we have distributed
    // which informs effective children observers
    //notifyContentObservers(this);
    // TODO(sorvell): See fast paths here in Polymer v1
    // (these seem unnecessary)
    // NOTE: send a signal to any observers
    // to report the initial set of childNodes
  },

  // Reify dom such that it is at its correct rendering position
  // based on logical distribution.
  _composeTree() {
    this._updateChildNodes(this.host, this._composeNode(this.host));
    let p$ = this._insertionPoints || [];
    for (let i=0, l=p$.length, p, parent; (i<l) && (p=p$[i]); i++) {
      parent = tree.Logical.getParentNode(p);
      if ((parent !== this.host) && (parent !== this)) {
        this._updateChildNodes(parent, this._composeNode(parent));
      }
    }
  },

  // Returns the list of nodes which should be rendered inside `node`.
  _composeNode(node) {
    let children = [];
    let c$ = tree.Logical.getChildNodes(node.shadyRoot || node);
    for (let i = 0; i < c$.length; i++) {
      let child = c$[i];
      if (this._distributor.isInsertionPoint(child)) {
        let distributedNodes = child._distributedNodes ||
          (child._distributedNodes = []);
        for (let j = 0; j < distributedNodes.length; j++) {
          let distributedNode = distributedNodes[j];
          if (this.isFinalDestination(child, distributedNode)) {
            children.push(distributedNode);
          }
        }
      } else {
        children.push(child);
      }
    }
    return children;
  },

  isFinalDestination(insertionPoint, node) {
    return this._distributor.isFinalDestination(
      insertionPoint, node);
  },

  // Ensures that the rendered node list inside `container` is `children`.
  _updateChildNodes(container, children) {
    let composed = tree.Composed.getChildNodes(container);
    let splices = calculateSplices(children, composed);
    // process removals
    for (let i=0, d=0, s; (i<splices.length) && (s=splices[i]); i++) {
      for (let j=0, n; (j < s.removed.length) && (n=s.removed[j]); j++) {
        // check if the node is still where we expect it is before trying
        // to remove it; this can happen if we move a node and
        // then schedule its previous host for distribution resulting in
        // the node being removed here.
        if (tree.Composed.getParentNode(n) === container) {
          tree.Composed.removeChild(container, n);
        }
        composed.splice(s.index + d, 1);
      }
      d -= s.addedCount;
    }
    // process adds
    for (let i=0, s, next; (i<splices.length) && (s=splices[i]); i++) { //eslint-disable-line no-redeclare
      next = composed[s.index];
      for (let j=s.index, n; j < s.index + s.addedCount; j++) {
        n = children[j];
        tree.Composed.insertBefore(container, n, next);
        // TODO(sorvell): is this splice strictly needed?
        composed.splice(j, 0, n);
      }
    }
  },

  // TODO(sorvell): util
  getInsertionPointTag() {
    return this._distributor.insertionPointTag;
  }

}

let ShadyFragmentMixin = Object.create(DocumentFragment.prototype);
utils.extend(ShadyFragmentMixin, ShadyMixin);

// TODO(sorvell): observation...
// function notifyContentObservers(root) {
//   for (let i=0, c; i < root._insertionPoints.length; i++) {
//     c = root._insertionPoints[i];
//     if (DomApi.hasApi(c)) {
//       Polymer.dom(c).notifyObserver();
//     }
//   }
// }

// function notifyInitialDistribution(host) {
//   if (DomApi.hasApi(host)) {
//     Polymer.dom(host).notifyObserver();
//   }
// }

// let needsUpgrade = window.CustomElements && !CustomElements.useNative;

// function upgradeLogicalChildren(children) {
//   if (needsUpgrade && children) {
//     for (let i=0; i < children.length; i++) {
//       CustomElements.upgrade(children[i]);
//     }
//   }
// }

// render enqueuer/flusher
let customElements = window.CustomElements;
let flushList = [];
let scheduled;
export function enqueue(callback) {
  if (!scheduled) {
    scheduled = true;
    Promise.resolve().then(flush);
  }
  flushList.push(callback);
}

export function flush() {
  while (flushList.length) {
    flushList.shift()();
  }
  if (customElements) {
    customElements.takeRecords();
  }
  // continue flushing after elements are upgraded...
  if (flushList.length) {
    flush();
  }
}