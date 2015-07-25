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

// imports
var flags = scope.flags;
var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;
var IMPORT_SELECTOR = scope.IMPORT_SELECTOR;
var rootDocument = scope.rootDocument;
var Loader = scope.Loader;
var Observer = scope.Observer;
var parser = scope.parser;

// importer
// highlander object to manage loading of imports
// for any document, importer:
// - loads any linked import documents (with deduping)
// - whenever an import is loaded, prompts the parser to try to parse
// - observes imported documents for new elements (these are handled via the
// dynamic importer)
var importer = {

  documents: {},

  // nodes to load in the mian document
  documentPreloadSelectors: IMPORT_SELECTOR,

  // nodes to load in imports
  importsPreloadSelectors: [
    IMPORT_SELECTOR
  ].join(','),

  loadNode: function(node) {
    importLoader.addNode(node);
  },

  // load all loadable elements within the parent element
  loadSubtree: function(parent) {
    var nodes = this.marshalNodes(parent);
    // add these nodes to loader's queue
    importLoader.addNodes(nodes);
  },

  marshalNodes: function(parent) {
    // all preloadable nodes in inDocument
    return parent.querySelectorAll(this.loadSelectorsForNode(parent));
  },

  // find the proper set of load selectors for a given node
  loadSelectorsForNode: function(node) {
    var doc = node.ownerDocument || node;
    return doc === rootDocument ? this.documentPreloadSelectors :
        this.importsPreloadSelectors;
  },

  loaded: function(url, elt, resource, err, redirectedUrl) {
    flags.load && console.log('loaded', url, elt);
    // store generic resource
    // TODO(sorvell): fails for nodes inside <template>.content
    // see https://code.google.com/p/chromium/issues/detail?id=249381.
    elt.__resource = resource;
    elt.__error = err;
    if (isImportLink(elt)) {
      var doc = this.documents[url];
      // if we've never seen a document at this url
      if (doc === undefined) {
        // generate an HTMLDocument from data
        doc = err ? null : makeDocument(resource, redirectedUrl || url);
        if (doc) {
          doc.__importLink = elt;
          // note, we cannot use MO to detect parsed nodes because
          // SD polyfill does not report these as mutations.
          this.bootDocument(doc);
        }
        // cache document
        this.documents[url] = doc;
      }
      // don't store import record until we're actually loaded
      // store document resource
      elt.__doc = doc;
    }
    parser.parseNext();
  },

  bootDocument: function(doc) {
    this.loadSubtree(doc);
    // observe documents for new elements being added
    this.observer.observe(doc);
    parser.parseNext();
  },

  loadedAll: function() {
    parser.parseNext();
  }

};

// loader singleton to handle loading imports
var importLoader = new Loader(importer.loaded.bind(importer),
    importer.loadedAll.bind(importer));

// observer singleton to handle observing elements in imports
// NOTE: the observer has a node added callback and this is set
// by the dynamic importer module.
importer.observer = new Observer();

function isImportLink(elt) {
  return isLinkRel(elt, IMPORT_LINK_TYPE);
}

function isLinkRel(elt, rel) {
  return elt.localName === 'link' && elt.getAttribute('rel') === rel;
}

function hasBaseURIAccessor(doc) {
  return !! Object.getOwnPropertyDescriptor(doc, 'baseURI');
}

function makeDocument(resource, url) {
  // create a new HTML document
  var doc = document.implementation.createHTMLDocument(IMPORT_LINK_TYPE);
  // cache the new document's source url
  doc._URL = url;
  // establish a relative path via <base>
  var base = doc.createElement('base');
  base.setAttribute('href', url);
  // add baseURI support to browsers (IE) that lack it.
  if (!doc.baseURI && !hasBaseURIAccessor(doc)) {
    // Use defineProperty since Safari throws an exception when using assignment.
    Object.defineProperty(doc, 'baseURI', {value:url});
  }
  // ensure UTF-8 charset
  var meta = doc.createElement('meta');
  meta.setAttribute('charset', 'utf-8');

  doc.head.appendChild(meta);
  doc.head.appendChild(base);
  // install html
  doc.body.innerHTML = resource;
  // TODO(sorvell): ideally this code is not aware of Template polyfill,
  // but for now the polyfill needs help to bootstrap these templates
  if (window.HTMLTemplateElement && HTMLTemplateElement.bootstrap) {
    HTMLTemplateElement.bootstrap(doc);
  }
  return doc;
}

// Polyfill document.baseURI for browsers without it.
if (!document.baseURI) {
  var baseURIDescriptor = {
    get: function() {
      var base = document.querySelector('base');
      return base ? base.href : window.location.href;
    },
    configurable: true
  };

  Object.defineProperty(document, 'baseURI', baseURIDescriptor);
  Object.defineProperty(rootDocument, 'baseURI', baseURIDescriptor);
}

// exports
scope.importer = importer;
scope.importLoader = importLoader;

});
