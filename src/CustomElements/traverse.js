/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

// helper methods for traversing through element trees
CustomElements.addModule(function(scope){

// imports
var IMPORT_LINK_TYPE = window.HTMLImports ? HTMLImports.IMPORT_LINK_TYPE : 'none';

// walk the subtree rooted at node, including descent into shadow-roots,
// applying 'cb' to each element
function forSubtree(node, cb) {
  //flags.dom && node.childNodes && node.childNodes.length && console.group('subTree: ', node);
  findAllElements(node, function(e) {
    if (cb(e)) {
      return true;
    }
    forRoots(e, cb);
  });
  forRoots(node, cb);
  //flags.dom && node.childNodes && node.childNodes.length && console.groupEnd();
}


// walk the subtree rooted at node, applying 'find(element, data)' function
// to each element
// if 'find' returns true for 'element', do not search element's subtree
function findAllElements(node, find, data) {
  var e = node.firstElementChild;
  if (!e) {
    e = node.firstChild;
    while (e && e.nodeType !== Node.ELEMENT_NODE) {
      e = e.nextSibling;
    }
  }
  while (e) {
    if (find(e, data) !== true) {
      findAllElements(e, find, data);
    }
    e = e.nextElementSibling;
  }
  return null;
}

// walk all shadowRoots on a given node.
function forRoots(node, cb) {
  var root = node.shadowRoot;
  while(root) {
    forSubtree(root, cb);
    root = root.olderShadowRoot;
  }
}

/*
Note that the import tree can consume itself and therefore special care
must be taken to avoid recursion.
*/
var processingDocuments;
function forDocumentTree(doc, cb) {
  processingDocuments = [];
  _forDocumentTree(doc, cb);
  processingDocuments = null;
}


function _forDocumentTree(doc, cb) {
  doc = wrap(doc);
  if (processingDocuments.indexOf(doc) >= 0) {
    return;
  }
  processingDocuments.push(doc);
  var imports = doc.querySelectorAll('link[rel=' + IMPORT_LINK_TYPE + ']');
  for (var i=0, l=imports.length, n; (i<l) && (n=imports[i]); i++) {
    if (n.import) {
      _forDocumentTree(n.import, cb);
    }
  }
  cb(doc);
}

// exports
scope.forDocumentTree = forDocumentTree;
scope.forSubtree = forSubtree;


});
