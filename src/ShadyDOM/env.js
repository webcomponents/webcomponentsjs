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
import * as utils from './utils'
import {ShadyRoot, flush, enqueue} from './shady'
import * as patch from './patch'
import {getRootNode} from './element-mixin'
import * as events from './event-mixin'

window.ShadyDOM = {
  patch: patch.patchNode,
  isPatched: patch.isNodePatched,
  unpatch: patch.unpatchNode,
  isShadyRoot: utils.isShadyRoot,
  enqueue: enqueue,
  flush: flush,
  inUse: utils.settings.inUse
};

if (utils.settings.inUse) {

  let createRootAndEnsurePatched = function(node) {
    // TODO(sorvell): need to ensure ancestors are patched but this introduces
    // a timing problem with gathering composed children.
    // (1) currently the child list is crawled and patched when patching occurs
    // (this needs to change)
    // (2) we can only patch when an element has received its parsed children
    // because we cannot detect them when inserted by parser.
    // let ancestor = node;
    // while (ancestor) {
    //   patchNode(ancestor);
    //   ancestor = ancestor.parentNode || ancestor.host;
    // }
    patch.patchNode(node);
    let root = new ShadyRoot(node);
    patch.patchNode(root);
    return root;
  }

  Element.prototype.attachShadow = function() {
    return createRootAndEnsurePatched(this);
  }

  Node.prototype.addEventListener = events.addEventListener;
  Node.prototype.removeEventListener = events.removeEventListener;
  Event = events.PatchedEvent;
  CustomEvent = events.PatchedCustomEvent;
  MouseEvent = events.PatchedMouseEvent;

  Object.defineProperty(Node.prototype, 'isConnected', {
    get() {
      return document.contains(this);
    },
    configurable: true
  });

  Node.prototype.getRootNode = function(options) {
    return getRootNode(this, options);
  }

  // TODO(sorvell): super experimental auto patching of document fragment
  // via appendChild. This either needs to be expanded or contracted.
  // DocumentFragment.prototype.appendChild = function(node) {
  //   patchNode(this);
  //   return this.appendChild(node);
  // }

}
