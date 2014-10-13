/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
HTMLImports.addModule(function(scope) {

// imports
var parser = scope.parser;
var importer = scope.importer;

// dynamic
// highlander object to manage elements dynamically added to imports
// for any observed document, dynamic:
// - tells the importer to load any imports that are added.
// - tells the parser to parse any added elements that need to be parsed.
// dynamic importer)
var dynamic = {
  // process (load/parse) any nodes added to imported documents.
  added: function(nodes) {
    var owner, parsed;
    for (var i=0, l=nodes.length, n; (i<l) && (n=nodes[i]); i++) {
      if (!owner) {
        owner = n.ownerDocument;
        parsed = parser.isParsed(owner);
      }
      // note: the act of loading kicks the parser, so we use parseDynamic's
      // 2nd argument to control if this added node needs to kick the parser.
      loading = this.shouldLoadNode(n);
      if (loading) {
        importer.loadNode(n);
      }
      if (this.shouldParseNode(n) && parsed) {
        parser.parseDynamic(n, loading);
      }
    }
  },

  shouldLoadNode: function(node) {
    return (node.nodeType === 1) && matches.call(node,
        importer.loadSelectorsForNode(node));
  },

  shouldParseNode: function(node) {
    return (node.nodeType === 1) && matches.call(node,
        parser.parseSelectorsForNode(node));  
  }
  
};

// let the dynamic element helper tie into the import observer.
importer.observer.addCallback = dynamic.added.bind(dynamic);

// x-plat matches
var matches = HTMLElement.prototype.matches || 
    HTMLElement.prototype.matchesSelector || 
    HTMLElement.prototype.webkitMatchesSelector ||
    HTMLElement.prototype.mozMatchesSelector ||
    HTMLElement.prototype.msMatchesSelector;

});
