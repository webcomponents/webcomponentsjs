/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
window.HTMLImports.addModule(function(scope) {

/*
  Use a mutation observer to call a callback for all added nodes.
*/
var Observer = function(addCallback) {
  this.addCallback = addCallback;
  this.mo = new MutationObserver(this.handler.bind(this));
};

Observer.prototype = {

  // we track mutations for addedNodes, looking for imports
  handler: function(mutations) {
    for (var i=0, l=mutations.length, m; (i<l) && (m=mutations[i]); i++) {
      if (m.type === 'childList' && m.addedNodes.length) {
        this.addedNodes(m.addedNodes);
      }
    }
  },

  addedNodes: function(nodes) {
    if (this.addCallback) {
      this.addCallback(nodes);
    }
    for (var i=0, l=nodes.length, n, loading; (i<l) && (n=nodes[i]); i++) {
      if (n.children && n.children.length) {
        this.addedNodes(n.children);
      }
    }
  },

  observe: function(root) {
    this.mo.observe(root, {childList: true, subtree: true});
  }

};

// exports
scope.Observer = Observer;

});
