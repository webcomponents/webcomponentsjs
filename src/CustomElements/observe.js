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

window.CustomElements.addModule(function(scope){

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
function addedNode(node, isAttached) {
  return added(node, isAttached) || addedSubtree(node, isAttached);
}

// manage lifecycle on added node; upgrade if necessary and process attached
function added(node, isAttached) {
  if (scope.upgrade(node, isAttached)) {
    // Return true to indicate
    return true;
  }
  if (isAttached) {
    attached(node);
  }
}

// manage lifecycle on added node's subtree only; allows the entire subtree
// to upgrade if necessary and process attached
function addedSubtree(node, isAttached) {
  forSubtree(node, function(e) {
    if (added(e, isAttached)) {
      return true;
    }
  });
}

// On platforms without MutationObserver, mutations may not be
// reliable and therefore attached/detached are not reliable. We think this
// occurs sometimes under heavy DOM operation load, but it is not easy to
// reproduce.
// To make these callbacks less likely to fail in this scenario,
// we *optionally* defer all inserts and removes
// to give a chance for elements to be attached into dom.
// This helps ensure attachedCallback fires for elements that are created and
// immediately added to dom.
// This change can significantly alter the performance characteristics
// of attaching elements and therefore we only enable it if the user has
// explicitly provided the `throttle-attached` flag.
var hasThrottledAttached = (window.MutationObserver._isPolyfilled &&
    flags['throttle-attached']);
// bc
scope.hasPolyfillMutations = hasThrottledAttached;
// exposed for testing
scope.hasThrottledAttached = hasThrottledAttached;

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
  if (hasThrottledAttached) {
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
  // bail if the element is already marked as attached
  if (element.__upgraded__ && !element.__attached) {
    element.__attached = true;
    if (element.attachedCallback) {
      element.attachedCallback();
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
  if (hasThrottledAttached) {
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
  // bail if the element is already marked as not attached
  if (element.__upgraded__ && element.__attached) {
    element.__attached = false;
    if (element.detachedCallback) {
      element.detachedCallback();
    }
  }
}

// recurse up the tree to check if an element is actually in the main document.
function inDocument(element) {
  var p = element;
  var doc = window.wrap(document);
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

  We cannot know ahead of time if we need to walk into the node in (1) so we
  do and see child; however, if it was added via case (2) then it will have its
  own record and therefore be seen 2x.
*/
function handler(root, mutations) {
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
  // NOTE: do an `inDocument` check dynamically here. It's possible that `root`
  // is a document in which case the answer here can never change; however
  // `root` may be an element like a shadowRoot that can be added/removed
  // from the main document.
  var isAttached = inDocument(root);
  mutations.forEach(function(mx) {
    if (mx.type === 'childList') {
      forEach(mx.addedNodes, function(n) {
        if (!n.localName) {
          return;
        }
        addedNode(n, isAttached);
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
  node = window.wrap(node);
  // If the optional node is not supplied, assume we mean the whole document.
  if (!node) {
    node = window.wrap(document);
  }
  // Find the root of the tree, which will be an Document or ShadowRoot.
  while (node.parentNode) {
    node = node.parentNode;
  }

  // The node is a ShadowRoot, an IE will have a memory leak if you put the observer
  // directly on the ShadowRoot, so put it on the head so it does not leak
  var observer = node.head.__observer;
  if (observer) {
    handler(node, observer.takeRecords());
    takeMutations();
  }
}

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

// observe a node tree; bail if it's already being observed.
function observe(inRoot) {
  
  if (inRoot && inRoot.head && inRoot.head.__observer) {
    return;
  }
  // For each ShadowRoot, we create a new MutationObserver, so the root can be
  // garbage collected once all references to the `inRoot` node are gone.
  // Give the handler access to the root so that an 'in document' check can
  // be done.

  // originally the observer was on the ShadowRoot (inRoot) (single observer); 
  // this causes a memory leak within IE.  To fix this, we must put a an observer
  // on both the head and body nodes on the ShadowRoot
  var observer = new MutationObserver(handler.bind(this, inRoot));
  observer.observe(inRoot.head, {childList: true, subtree: true});
  observer.observe(inRoot.body, {childList: true, subtree: true});

  // this needs to be on head or it will leak in IE
  // IE does not like it when you have non-standard attributes on root dom's, so put
  // the observer on the head element
  // this is used to check if the observer has been attached already (above)
  inRoot.head.__observer = observer;
}

// upgrade an entire document and observe it for elements changes.
function upgradeDocument(doc) {
  doc = window.wrap(doc);
  flags.dom && console.group('upgradeDocument: ', (doc.baseURI).split('/').pop());
  var isMainDocument = (doc === window.wrap(document));
  addedNode(doc, isMainDocument);
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
    window.CustomElements.watchShadow(this);
    return root;
  };
}

// exports
scope.watchShadow = watchShadow;
scope.upgradeDocumentTree = upgradeDocumentTree;
scope.upgradeDocument = upgradeDocument;
scope.upgradeSubtree = addedSubtree;
scope.upgradeAll = addedNode;
scope.attached = attached;
scope.takeRecords = takeRecords;

});
