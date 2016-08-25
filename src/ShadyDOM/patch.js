/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * Patches elements that interacts with ShadyDOM
 * such that tree traversal and mutation apis act like they would under
 * ShadowDOM.
 *
 * This import enables seemless interaction with ShadyDOM powered
 * custom elements, enabling better interoperation with 3rd party code,
 * libraries, and frameworks that use DOM tree manipulation apis.
 */

'use strict';
import {tree} from './tree'
import * as utils from './utils'
import {Mixins} from './element-mixin'

export let patchedCount = 0;

let log = false;

let patchImpl = {

  canPatchNode: function(node) {
    switch (node) {
      case document.head:
      case document.documentElement:
        return false;
      default:
        return true;
    }
  },

  hasPrototypeDescriptors: Boolean(Object.getOwnPropertyDescriptor(
    window.Node.prototype, 'textContent')),

  patch: function(node) {
    patchedCount++;
    log && window.console.warn('patch node', node);
    if (this.hasPrototypeDescriptors) {
      utils.patchPrototype(node, this.mixinForObject(node));
    } else {
      window.console.warn('Patching instance rather than prototype', node);
      utils.extend(node, this.mixinForNode(node));
    }
  },

  mixinForObject: function(obj) {
    switch (obj.nodeType) {
      case Node.ELEMENT_NODE:
        return Mixins.Element;
      case Node.DOCUMENT_FRAGMENT_NODE:
        return Mixins.Fragment;
      case Node.DOCUMENT_NODE:
        return Mixins.Document;
      case Node.TEXT_NODE:
      case Node.COMMENT_NODE:
        return Mixins.Node;
    }
  },

  unpatch: function(obj) {
    if (obj.__sourceProto) {
      obj.__proto__ = obj.__sourceProto;

    }
    // TODO(sorvell): implement unpatching for non-proto patchable browsers
  }

};

export function patchNode(node) {
  if (!utils.settings.inUse) {
    return;
  }
  if (!isNodePatched(node) && patchImpl.canPatchNode(node)) {
    tree.saveChildNodes(node);
    patchImpl.patch(node);
  }
}

export function unpatchNode(node) {
  patchImpl.unpatch(node);
}

export function isNodePatched(node) {
  return Boolean(node.__patched);
}

// TODO(sorvell): fake export
utils.common.patchNode = patchNode;