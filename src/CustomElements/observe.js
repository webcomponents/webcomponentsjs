/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/**
 * Implements custom element observation and attached/detached callbacks
 * @module observe
*/

CustomElements.addModule(function(scope){

// imports
var flags = scope.flags;
var forSubtree = scope.forSubtree;
var forDocumentTree = scope.forDocumentTree;

/*
  Manage nodes attached to document trees
*/

// manage lifecycle on added node and it's subtree; upgrade the node and
// entire subtree if necessary and process attached for the node and entire
// subtree
function addedNode(node) {
  return added(node) || addedSubtree(node);
}

// manage lifecycle on added node; upgrade if necessary and process attached
function added(node) {
  if (scope.upgrade(node)) {
    return true;
  }
  attached(node);
}

// manage lifecycle on added node's subtree only; allows the entire subtree
// to upgrade if necessary and process attached
function addedSubtree(node) {
  forSubtree(node, function(e) {
    if (added(e)) {
      return true;
    }
  });
}

function attachedNode(node) {
  attached(node);
  // only check subtree if node is actually in document
  if (inDocument(node)) {
    forSubtree(node, function(e) {
      attached(e);
    });
  }
}

// On platforms without MutationObserver, mutations may not be
// reliable and therefore attached/detached are not reliable.
// To make these callbacks less likely to fail, we defer all inserts and removes
// to give a chance for elements to be attached into dom.
// This ensures attachedCallback fires for elements that are created and
// immediately added to dom.
var hasPolyfillMutations = (!window.MutationObserver ||
    (window.MutationObserver === window.JsMutationObserver));
scope.hasPolyfillMutations = hasPolyfillMutations;

var isPendingMutations = false;
var pendingMutations = [];
function deferMutation(fn) {
  pendingMutations.push(fn);
  if (!isPendingMutations) {
    isPendingMutations = true;
    setTimeout(takeMutations);
  }
}

function takeMutations() {
  isPendingMutations = false;
  var $p = pendingMutations;
  for (var i=0, l=$p.length, p; (i<l) && (p=$p[i]); i++) {
    p();
  }
  pendingMutations = [];
}

function attached(element) {
  if (hasPolyfillMutations) {
    deferMutation(function() {
      _attached(element);
    });
  } else {
    _attached(element);
  }
}

// NOTE: due to how MO works (see comments below), an element may be attached
// multiple times so we protect against extra processing here.
function _attached(element) {
  // track element for insertion if it's upgraded and cares about insertion
  if (element.__upgraded__ &&
    (element.attachedCallback || element.detachedCallback)) {
    // bail if the element is already marked as attached and proceed only
    // if it's actually in the document at this moment.
    if (!element.__attached && inDocument(element)) {
      element.__attached = true;
      if (element.attachedCallback) {
        element.attachedCallback();
      }
    }
  }
}

/*
  Manage nodes detached from document trees
*/

// manage lifecycle on detached node and it's subtree; process detached
// for the node and entire subtree
function detachedNode(node) {
  detached(node);
  forSubtree(node, function(e) {
    detached(e);
  });
}

function detached(element) {
  if (hasPolyfillMutations) {
    deferMutation(function() {
      _detached(element);
    });
  } else {
    _detached(element);
  }
}

// NOTE: due to how MO works (see comments below), an element may be detached
// multiple times so we protect against extra processing here.
function _detached(element) {
  // track element for removal if it's upgraded and cares about removal
  if (element.__upgraded__ &&
    (element.attachedCallback || element.detachedCallback)) {
    // bail if the element is already marked as not attached and proceed only
    // if it's actually *not* in the document at this moment.
    if (element.__attached && !inDocument(element)) {
      element.__attached = false;
      if (element.detachedCallback) {
        element.detachedCallback();
      }
    }
  }
}

// recurse up the tree to check if an element is actually in the main document.
function inDocument(element) {
  var p = element;
  var doc = wrap(document);
  while (p) {
    if (p == doc) {
      return true;
    }
    p = p.parentNode || ((p.nodeType === Node.DOCUMENT_FRAGMENT_NODE) && p.host);
  }
}

//  Install an element observer on all shadowRoots owned by node.
function watchShadow(node) {
  if (node.shadowRoot && !node.shadowRoot.__watched) {
    flags.dom && console.log('watching shadow-root for: ', node.localName);
    // watch all unwatched roots...
    var root = node.shadowRoot;
    while (root) {
      observe(root);
      root = root.olderShadowRoot;
    }
  }
}

/*
  NOTE: In order to process all mutations, it's necessary to recurse into
  any added nodes. However, it's not possible to determine a priori if a node
  will get its own mutation record. This means
  *nodes can be seen multiple times*.

  Here's an example:

  (1) In this case, recursion is required to see `child`:

      node.innerHTML = '<div><child></child></div>'

  (2) In this case, child will get its own mutation record:

      node.appendChild(div).appendChild(child);
*/
function handler(mutations) {
  // for logging only
  if (flags.dom) {
    var mx = mutations[0];
    if (mx && mx.type === 'childList' && mx.addedNodes) {
        if (mx.addedNodes) {
          var d = mx.addedNodes[0];
          while (d && d !== document && !d.host) {
            d = d.parentNode;
          }
          var u = d && (d.URL || d._URL || (d.host && d.host.localName)) || '';
          u = u.split('/?').shift().split('/').pop();
        }
    }
    console.group('mutations (%d) [%s]', mutations.length, u || '');
  }
  // handle mutations
  mutations.forEach(function(mx) {
    if (mx.type === 'childList') {
      forEach(mx.addedNodes, function(n) {
        if (!n.localName) {
          return;
        }
        addedNode(n);
      });
      forEach(mx.removedNodes, function(n) {
        if (!n.localName) {
          return;
        }
        detachedNode(n);
      });
    }
  });
  flags.dom && console.groupEnd();
};


/*
  When elements are added to the dom, upgrade and attached/detached may be
  asynchronous. `CustomElements.takeRecords` can be called to process any
  pending upgrades and attached/detached callbacks synchronously.
*/
function takeRecords(node) {
  node = wrap(node);
  // If the optional node is not supplied, assume we mean the whole document.
  if (!node) {
    node = wrap(document);
  }
  // Find the root of the tree, which will be an Document or ShadowRoot.
  while (node.parentNode) {
    node = node.parentNode;
  }
  var observer = node.__observer;
  if (observer) {
    handler(observer.takeRecords());
    takeMutations();
  }
}

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);


// observe a node tree; bail if it's already being observed.
function observe(inRoot) {
  if (inRoot.__observer) {
    return;
  }
  // For each ShadowRoot, we create a new MutationObserver, so the root can be
  // garbage collected once all references to the `inRoot` node are gone.
  var observer = new MutationObserver(handler);
  observer.observe(inRoot, {childList: true, subtree: true});
  inRoot.__observer = observer;
}

// upgrade an entire document and observe it for elements changes.
function upgradeDocument(doc) {
  doc = wrap(doc);
  flags.dom && console.group('upgradeDocument: ', (doc.baseURI).split('/').pop());
  addedNode(doc);
  observe(doc);
  flags.dom && console.groupEnd();
}

/*
This method is intended to be called when the document tree (including imports)
has pending custom elements to upgrade. It can be called multiple times and
should do nothing if no elements are in need of upgrade.
*/
function upgradeDocumentTree(doc) {
  forDocumentTree(doc, upgradeDocument);
}


// Patch `createShadowRoot()` if Shadow DOM is available, otherwise leave
// undefined to aid feature detection of Shadow DOM.
var originalCreateShadowRoot = Element.prototype.createShadowRoot;
if (originalCreateShadowRoot) {
  Element.prototype.createShadowRoot = function() {
    var root = originalCreateShadowRoot.call(this);
    CustomElements.watchShadow(this);
    return root;
  };
}

// exports
scope.watchShadow = watchShadow;
scope.upgradeDocumentTree = upgradeDocumentTree;
scope.upgradeSubtree = addedSubtree;
scope.upgradeAll = addedNode;
scope.attachedNode = attachedNode;
scope.takeRecords = takeRecords;

});
