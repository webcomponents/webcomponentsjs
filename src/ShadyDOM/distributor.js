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

import {tree} from './tree'

export default class {

  constructor(root) {
    this.root = root;
    this.insertionPointTag = 'slot';
  }

  getInsertionPoints() {
    return this.root.querySelectorAll(this.insertionPointTag);
  }

  hasInsertionPoint() {
    return Boolean(this.root._insertionPoints &&
      this.root._insertionPoints.length);
  }

  isInsertionPoint(node) {
    return node.localName && node.localName == this.insertionPointTag;
  }

  reset() {
    // light children
    let children = tree.Logical.getChildNodes(this.root.host);
    for (let i = 0; i < children.length; i++) {
      this.resetChild(children[i]);
    }
    // insertion points
    let p$ = this.root._insertionPoints;
    for (let j = 0; j < p$.length; j++) {
      this.resetInsertionPoint(p$[j]);
    }
  }

  resetChild(child) {
    child._assignedSlot = undefined;
  }

  resetInsertionPoint(insertionPoint) {
    insertionPoint._distributedNodes = [];
    insertionPoint._assignedNodes = [];
  }

  distribute() {
    if (this.hasInsertionPoint()) {
      this.reset();
      return this.distributePool(this.root, this.collectPool());
    }
    return [];
  }

  // Gather the pool of nodes that should be distributed. We will combine
  // these with the "content root" to arrive at the composed tree.
  collectPool() {
    return tree.arrayCopy(
      tree.Logical.getChildNodes(this.root.host));
  }

  // perform "logical" distribution; note, no actual dom is moved here,
  // instead elements are distributed into a `content._distributedNodes`
  // array where applicable.
  distributePool(node, pool) {
    let dirtyRoots = [];
    let p$ = this.root._insertionPoints;
    for (let i=0, l=p$.length, p; (i<l) && (p=p$[i]); i++) {
      this.distributeInsertionPoint(p, pool);
      // provoke redistribution on insertion point parents
      // must do this on all candidate hosts since distribution in this
      // scope invalidates their distribution.
      // only get logical parent.
      let parent = tree.Logical.getParentNode(p);
      if (parent && parent.shadyRoot &&
          this.hasInsertionPoint(parent.shadyRoot)) {
        dirtyRoots.push(parent.shadyRoot);
      }
    }
    return dirtyRoots;
  }

  distributeInsertionPoint(insertionPoint, pool) {
    // distribute nodes from the pool that this selector matches
    let anyDistributed = false;
    for (let i=0, l=pool.length, node; i < l; i++) {
      node=pool[i];
      // skip nodes that were already used
      if (!node) {
        continue;
      }
      // distribute this node if it matches
      if (this.matchesInsertionPoint(node, insertionPoint)) {
        this.distributeNodeInto(node, insertionPoint);
        // remove this node from the pool
        pool[i] = undefined;
        // since at least one node matched, we won't need fallback content
        anyDistributed = true;
      }
    }
    // Fallback content if nothing was distributed here
    if (!anyDistributed) {
      let children = tree.Logical.getChildNodes(insertionPoint);
      for (let j = 0; j < children.length; j++) {
        this.distributeNodeInto(children[j], insertionPoint);
      }
    }
    this.setDistributedNodesOnInsertionPoint(insertionPoint);
  }

  matchesInsertionPoint(node, insertionPoint) {
    let slotName = insertionPoint.getAttribute('name');
    slotName = slotName ? slotName.trim() : '';
    let slot = node.getAttribute && node.getAttribute('slot');
    slot = slot ? slot.trim() : '';
    return (slot == slotName);
  }

  distributeNodeInto(child, insertionPoint) {
    insertionPoint._assignedNodes.push(child);
    child._assignedSlot = insertionPoint;
  }

  setDistributedNodesOnInsertionPoint(insertionPoint) {
    let n$ = insertionPoint._assignedNodes;
    insertionPoint._distributedNodes = [];
    for (let i=0, n; (i<n$.length) && (n=n$[i]) ; i++) {
      if (this.isInsertionPoint(n)) {
        let d$ = n._distributedNodes;
        if (d$) {
          for (let j=0; j < d$.length; j++) {
            insertionPoint._distributedNodes.push(d$[j]);
          }
        }
      } else {
        insertionPoint._distributedNodes.push(n$[i]);
      }
    }
  }

  isFinalDestination(insertionPoint) {
    return !(insertionPoint._assignedSlot);
  }

  rendered() {
    let ip$ = this.root._insertionPoints;
    for (let i=0, slot; i < ip$.length; i++) {
      slot = ip$[i];
      if (slot.__eventListenerCount) {
        // NOTE: cannot bubble correctly here so not setting bubbles: true
        slot.dispatchEvent(new Event('slotchange', { cancelable: true }));
      }
    }
  }

}