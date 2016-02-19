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
var path = scope.path;
var rootDocument = scope.rootDocument;
var flags = scope.flags;
var isIE = scope.isIE;
var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;
var IMPORT_SELECTOR = 'link[rel=' + IMPORT_LINK_TYPE + ']';

// importParser
// highlander object to manage parsing of imports
// parses import related elements and ensures proper parse order
// parse order is enforced by crawling the tree and monitoring which elements
// have been parsed;
// elements can be dynamically added to imports. These are maintained in a
// separate queue and parsed after all other elements.
var importParser = {

  // parse selectors for main document elements
  documentSelectors: IMPORT_SELECTOR,

  // parse selectors for import document elements
  importsSelectors: [
    IMPORT_SELECTOR,
    'link[rel=stylesheet]:not([type])',
    'style:not([type])',
    'script:not([type])',
    'script[type="application/javascript"]',
    'script[type="text/javascript"]'
  ].join(','),

  map: {
    link: 'parseLink',
    script: 'parseScript',
    style: 'parseStyle'
  },

  dynamicElements: [],

  // try to parse the next import in the tree
  parseNext: function() {
    var next = this.nextToParse();
    if (next) {
      this.parse(next);
    }
  },

  parse: function(elt) {
    if (this.isParsed(elt)) {
      flags.parse && console.log('[%s] is already parsed', elt.localName);
      return;
    }
    var fn = this[this.map[elt.localName]];
    if (fn) {
      this.markParsing(elt);
      fn.call(this, elt);
    }
  },

  // marks an element for dynamic parsing and attempts to parse the next element
  parseDynamic: function(elt, quiet) {
    this.dynamicElements.push(elt);
    if (!quiet) {
      this.parseNext();
    }
  },

  // only 1 element may be parsed at a time; parsing is async so each
  // parsing implementation must inform the system that parsing is complete
  // via markParsingComplete.
  // To prompt the system to parse the next element, parseNext should then be
  // called.
  // Note, parseNext used to be included at the end of markParsingComplete, but
  // we must not do this so that, for example, we can (1) mark parsing complete
  // then (2) fire an import load event, and then (3) parse the next resource.
  markParsing: function(elt) {
    flags.parse && console.log('parsing', elt);
    this.parsingElement = elt;
  },

  markParsingComplete: function(elt) {
    elt.__importParsed = true;
    this.markDynamicParsingComplete(elt);
    if (elt.__importElement) {
      elt.__importElement.__importParsed = true;
      this.markDynamicParsingComplete(elt.__importElement);
    }
    this.parsingElement = null;
    flags.parse && console.log('completed', elt);
  },

  markDynamicParsingComplete: function(elt) {
    var i = this.dynamicElements.indexOf(elt);
    if (i >= 0) {
      this.dynamicElements.splice(i, 1);
    }
  },

  parseImport: function(elt) {
    elt.import = elt.__doc;
    if (window.HTMLImports.__importsParsingHook) {
      window.HTMLImports.__importsParsingHook(elt);
    }
    if (elt.import) {
      elt.import.__importParsed = true;
    }
    this.markParsingComplete(elt);
    // fire load event
    if (elt.__resource && !elt.__error) {
      elt.dispatchEvent(new CustomEvent('load', {bubbles: false}));
    } else {
      elt.dispatchEvent(new CustomEvent('error', {bubbles: false}));
    }
    // TODO(sorvell): workaround for Safari addEventListener not working
    // for elements not in the main document.
    if (elt.__pending) {
      var fn;
      while (elt.__pending.length) {
        fn = elt.__pending.shift();
        if (fn) {
          fn({target: elt});
        }
      }
    }
    this.parseNext();
  },

  parseLink: function(linkElt) {
    if (nodeIsImport(linkElt)) {
      this.parseImport(linkElt);
    } else {
      // make href absolute
      linkElt.href = linkElt.href;
      this.parseGeneric(linkElt);
    }
  },

  parseStyle: function(elt) {
    // TODO(sorvell): style element load event can just not fire so clone styles
    var src = elt;
    elt = cloneStyle(elt);
    src.__appliedElement = elt;
    elt.__importElement = src;
    this.parseGeneric(elt);
  },

  parseGeneric: function(elt) {
    this.trackElement(elt);
    this.addElementToDocument(elt);
  },

  rootImportForElement: function(elt) {
    var n = elt;
    while (n.ownerDocument.__importLink) {
      n = n.ownerDocument.__importLink;
    }
    return n;
  },

  addElementToDocument: function(elt) {
    var port = this.rootImportForElement(elt.__importElement || elt);
    port.parentNode.insertBefore(elt, port);
  },

  // tracks when a loadable element has loaded
  trackElement: function(elt, callback) {
    var self = this;
    var done = function(e) {
      // make sure we don't get multiple load/error signals (FF seems to do
      // this sometimes when <style> elments change)
      elt.removeEventListener('load', done);
      elt.removeEventListener('error', done);
      if (callback) {
        callback(e);
      }
      self.markParsingComplete(elt);
      self.parseNext();
    };
    elt.addEventListener('load', done);
    elt.addEventListener('error', done);

    // NOTE: IE does not fire "load" event for styles that have already loaded
    // This is in violation of the spec, so we try our hardest to work around it
    if (isIE && elt.localName === 'style') {
      var fakeLoad = false;
      // If there's not @import in the textContent, assume it has loaded
      if (elt.textContent.indexOf('@import') == -1) {
        fakeLoad = true;
      // if we have a sheet, we have been parsed
      } else if (elt.sheet) {
        fakeLoad = true;
        var csr = elt.sheet.cssRules;
        var len = csr ? csr.length : 0;
        // search the rules for @import's
        for (var i = 0, r; (i < len) && (r = csr[i]); i++) {
          if (r.type === CSSRule.IMPORT_RULE) {
            // if every @import has resolved, fake the load
            fakeLoad = fakeLoad && Boolean(r.styleSheet);
          }
        }
      }
      // dispatch a fake load event and continue parsing
      if (fakeLoad) {
        // Fire async, to prevent reentrancy
        setTimeout(function() {
          elt.dispatchEvent(new CustomEvent('load', {bubbles: false}));
        });
      }
    }
  },

  // NOTE: execute scripts by injecting them and watching for the load/error
  // event. Inline scripts are handled via dataURL's because browsers tend to
  // provide correct parsing errors in this case. If this has any compatibility
  // issues, we can switch to injecting the inline script with textContent.
  parseScript: function(scriptElt) {
    var script = document.createElement('script');
    script.__importElement = scriptElt;
    script.src = scriptElt.src ? scriptElt.src :
        generateScriptDataUrl(scriptElt);
    // keep track of executing script to help polyfill `document.currentScript`
    scope.currentScript = scriptElt;
    this.trackElement(script, function(e) {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      scope.currentScript = null;
    });
    this.addElementToDocument(script);
  },

  // determine the next element in the tree which should be parsed
  // crawl the document tree to find the next unparsed element
  // then process any dynamically added elements (these should process in 'add'
  // order.
  nextToParse: function() {
    this._mayParse = [];
    return !this.parsingElement && (this.nextToParseInDoc(rootDocument) ||
        this.nextToParseDynamic());
  },

  nextToParseInDoc: function(doc, link) {
    // use `marParse` list to avoid looping into the same document again
    // since it could cause an iloop.
    if (doc && this._mayParse.indexOf(doc) < 0) {
      this._mayParse.push(doc);
      var nodes = doc.querySelectorAll(this.parseSelectorsForNode(doc));
      for (var i=0, l=nodes.length, n; (i<l) && (n=nodes[i]); i++) {
        if (!this.isParsed(n)) {
          if (this.hasResource(n)) {
            return nodeIsImport(n) ? this.nextToParseInDoc(n.__doc, n) : n;
          } else {
            return;
          }
        }
      }
    }
    // all nodes have been parsed, ready to parse import, if any
    return link;
  },

  // note dynamically added elements are stored in a separate queue
  nextToParseDynamic: function() {
    return this.dynamicElements[0];
  },

  // return the set of parse selectors relevant for this node.
  parseSelectorsForNode: function(node) {
    var doc = node.ownerDocument || node;
    return doc === rootDocument ? this.documentSelectors :
        this.importsSelectors;
  },

  isParsed: function(node) {
    return node.__importParsed;
  },

  needsDynamicParsing: function(elt) {
    return (this.dynamicElements.indexOf(elt) >= 0);
  },

  hasResource: function(node) {
    if (nodeIsImport(node) && (node.__doc === undefined)) {
      return false;
    }
    return true;
  }

};

function nodeIsImport(elt) {
  return (elt.localName === 'link') && (elt.rel === IMPORT_LINK_TYPE);
}

function generateScriptDataUrl(script) {
  var scriptContent = generateScriptContent(script);
  return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(scriptContent);
}

function generateScriptContent(script) {
  return script.textContent + generateSourceMapHint(script);
}

// calculate source map hint
function generateSourceMapHint(script) {
  var owner = script.ownerDocument;
  owner.__importedScripts = owner.__importedScripts || 0;
  var moniker = script.ownerDocument.baseURI;
  var num = owner.__importedScripts ? '-' + owner.__importedScripts : '';
  owner.__importedScripts++;
  return '\n//# sourceURL=' + moniker + num + '.js\n';
}

// style/stylesheet handling

// clone style with proper path resolution for main document
// NOTE: styles are the only elements that require direct path fixup.
function cloneStyle(style) {
  var clone = style.ownerDocument.createElement('style');
  clone.textContent = style.textContent;
  path.resolveUrlsInStyle(clone);
  return clone;
}

// exports
scope.parser = importParser;
scope.IMPORT_SELECTOR = IMPORT_SELECTOR;

});
