/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(scope) {
  'use strict';

  var GetElementsByInterface = scope.GetElementsByInterface;
  var Node = scope.wrappers.Node;
  var ParentNodeInterface = scope.ParentNodeInterface;
  var NonElementParentNodeInterface = scope.NonElementParentNodeInterface;
  var Selection = scope.wrappers.Selection;
  var SelectorsInterface = scope.SelectorsInterface;
  var ShadowRoot = scope.wrappers.ShadowRoot;
  var TreeScope = scope.TreeScope;
  var cloneNode = scope.cloneNode;
  var defineGetter = scope.defineGetter;
  var defineWrapGetter = scope.defineWrapGetter;
  var elementFromPoint = scope.elementFromPoint;
  var forwardMethodsToWrapper = scope.forwardMethodsToWrapper;
  var matchesNames = scope.matchesNames;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var renderAllPending = scope.renderAllPending;
  var rewrap = scope.rewrap;
  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;
  var wrapEventTargetMethods = scope.wrapEventTargetMethods;
  var wrapNodeList = scope.wrapNodeList;

  var implementationTable = new WeakMap();

  function Document(node) {
    Node.call(this, node);
    this.treeScope_ = new TreeScope(this, null);
  }
  Document.prototype = Object.create(Node.prototype);

  defineWrapGetter(Document, 'documentElement');

  // Conceptually both body and head can be in a shadow but supporting that seems
  // overkill at this point.
  defineWrapGetter(Document, 'body');
  defineWrapGetter(Document, 'head');

  defineGetter(Document, 'activeElement', function() {
    var unwrappedActiveElement = unwrap(this).activeElement;
    if (!unwrappedActiveElement || !unwrappedActiveElement.nodeType) return null;

    var activeElement = wrap(unwrappedActiveElement);

    // Loop while activeElement is not a shallow child of this document.
    while (!this.contains(activeElement)) {
      // Iterate until we hit activeElement's containing ShadowRoot (which
      // isn't this one) or document.
      while (activeElement.parentNode) {
        activeElement = activeElement.parentNode;
      }

      // If we've reached a ShadowRoot, move to its host.
      if (activeElement.host) {
        activeElement = activeElement.host;
      // Otherwise, we've reached a different document - this document is
      // not an ancestor of the active element.
      } else {
        return null;
      }
    }

    return activeElement;
  });

  // document cannot be overridden so we override a bunch of its methods
  // directly on the instance.

  function wrapMethod(name) {
    var original = document[name];
    Document.prototype[name] = function() {
      return wrap(original.apply(unsafeUnwrap(this), arguments));
    };
  }

  [
    'createComment',
    'createDocumentFragment',
    'createElement',
    'createElementNS',
    'createEvent',
    'createEventNS',
    'createRange',
    'createTextNode',
  ].forEach(wrapMethod);

  var originalAdoptNode = document.adoptNode;

  function adoptNodeNoRemove(node, doc) {
    originalAdoptNode.call(unsafeUnwrap(doc), unwrap(node));
    adoptSubtree(node, doc);
  }

  function adoptSubtree(node, doc) {
    if (node.shadowRoot)
      doc.adoptNode(node.shadowRoot);
    if (node instanceof ShadowRoot)
      adoptOlderShadowRoots(node, doc);
    for (var child = node.firstChild; child; child = child.nextSibling) {
      adoptSubtree(child, doc);
    }
  }

  function adoptOlderShadowRoots(shadowRoot, doc) {
    var oldShadowRoot = shadowRoot.olderShadowRoot;
    if (oldShadowRoot)
      doc.adoptNode(oldShadowRoot);
  }

  var originalGetSelection = document.getSelection;

  mixin(Document.prototype, {
    adoptNode: function(node) {
      if (node.parentNode)
        node.parentNode.removeChild(node);
      adoptNodeNoRemove(node, this);
      return node;
    },
    elementFromPoint: function(x, y) {
      return elementFromPoint(this, this, x, y);
    },
    importNode: function(node, deep) {
      return cloneNode(node, deep, unsafeUnwrap(this));
    },
    getSelection: function() {
      renderAllPending();
      return new Selection(originalGetSelection.call(unwrap(this)));
    },
    getElementsByName: function(name) {
      return SelectorsInterface.querySelectorAll.call(this,
          '[name=' + JSON.stringify(String(name)) + ']');
    }
  });

  var originalCreateTreeWalker = document.createTreeWalker;
  var TreeWalkerWrapper = scope.wrappers.TreeWalker;
  Document.prototype.createTreeWalker = function(root, whatToShow,
                                              filter, expandEntityReferences) {

    var newFilter = null; // IE does not like undefined.

    // Support filter as a function or object with function defined as
    // acceptNode. IE supports filter as a function only.
    // Chrome and FF support both formats.
    if (filter) {
      if (filter.acceptNode && typeof filter.acceptNode === 'function') {
        newFilter = {
          acceptNode: function(node) {
            return filter.acceptNode(wrap(node));
          }
        };
      } else if (typeof filter === 'function') {
        newFilter = function(node) {
          return filter(wrap(node));
        }
      }
    }

    return new TreeWalkerWrapper(
                originalCreateTreeWalker.call(unwrap(this), unwrap(root),
      whatToShow, newFilter, expandEntityReferences));
  };

  if (document.registerElement) {
    var originalRegisterElement = document.registerElement;
    Document.prototype.registerElement = function(tagName, object) {
      var prototype, extendsOption;
      if (object !== undefined) {
        prototype = object.prototype;
        extendsOption = object.extends;
      }

      if (!prototype)
        prototype = Object.create(HTMLElement.prototype);

      // If we already used the object as a prototype for another custom
      // element.
      if (scope.nativePrototypeTable.get(prototype)) {
        // TODO(arv): DOMException
        throw new Error('NotSupportedError');
      }

      // Find first object on the prototype chain that already have a native
      // prototype. Keep track of all the objects before that so we can create
      // a similar structure for the native case.
      var proto = Object.getPrototypeOf(prototype);
      var nativePrototype;
      var prototypes = [];
      while (proto) {
        nativePrototype = scope.nativePrototypeTable.get(proto);
        if (nativePrototype)
          break;
        prototypes.push(proto);
        proto = Object.getPrototypeOf(proto);
      }

      if (!nativePrototype) {
        // TODO(arv): DOMException
        throw new Error('NotSupportedError');
      }

      // This works by creating a new prototype object that is empty, but has
      // the native prototype as its proto. The original prototype object
      // passed into register is used as the wrapper prototype.

      var newPrototype = Object.create(nativePrototype);
      for (var i = prototypes.length - 1; i >= 0; i--) {
        newPrototype = Object.create(newPrototype);
      }

      // Add callbacks if present.
      // Names are taken from:
      //   https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/bindings/v8/CustomElementConstructorBuilder.cpp&sq=package:chromium&type=cs&l=156
      // and not from the spec since the spec is out of date.
      [
        'createdCallback',
        'attachedCallback',
        'detachedCallback',
        'attributeChangedCallback',
      ].forEach(function(name) {
        var f = prototype[name];
        if (!f)
          return;
        newPrototype[name] = function() {
          // if this element has been wrapped prior to registration,
          // the wrapper is stale; in this case rewrap
          if (!(wrap(this) instanceof CustomElementConstructor)) {
            rewrap(this);
          }
          f.apply(wrap(this), arguments);
        };
      });

      var p = {prototype: newPrototype};
      if (extendsOption)
        p.extends = extendsOption;

      function CustomElementConstructor(node) {
        if (!node) {
          if (extendsOption) {
            return document.createElement(extendsOption, tagName);
          } else {
            return document.createElement(tagName);
          }
        }
        setWrapper(node, this);
      }
      CustomElementConstructor.prototype = prototype;
      CustomElementConstructor.prototype.constructor = CustomElementConstructor;

      scope.constructorTable.set(newPrototype, CustomElementConstructor);
      scope.nativePrototypeTable.set(prototype, newPrototype);

      // registration is synchronous so do it last
      var nativeConstructor = originalRegisterElement.call(unwrap(this),
          tagName, p);
      return CustomElementConstructor;
    };

    forwardMethodsToWrapper([
      window.HTMLDocument || window.Document,  // Gecko adds these to HTMLDocument
    ], [
      'registerElement',
    ]);
  }

  // We also override some of the methods on document.body and document.head
  // for convenience.
  forwardMethodsToWrapper([
    window.HTMLBodyElement,
    window.HTMLDocument || window.Document,  // Gecko adds these to HTMLDocument
    window.HTMLHeadElement,
    window.HTMLHtmlElement,
  ], [
    'appendChild',
    'compareDocumentPosition',
    'contains',
    'getElementsByClassName',
    'getElementsByTagName',
    'getElementsByTagNameNS',
    'insertBefore',
    'querySelector',
    'querySelectorAll',
    'removeChild',
    'replaceChild',
  ]);

  forwardMethodsToWrapper([
    window.HTMLBodyElement,
    window.HTMLHeadElement,
    window.HTMLHtmlElement,
  ], matchesNames);

  forwardMethodsToWrapper([
    window.HTMLDocument || window.Document,  // Gecko adds these to HTMLDocument
  ], [
    'adoptNode',
    'importNode',
    'contains',
    'createComment',
    'createDocumentFragment',
    'createElement',
    'createElementNS',
    'createEvent',
    'createEventNS',
    'createRange',
    'createTextNode',
    'createTreeWalker',
    'elementFromPoint',
    'getElementById',
    'getElementsByName',
    'getSelection',
  ]);

  mixin(Document.prototype, GetElementsByInterface);
  mixin(Document.prototype, ParentNodeInterface);
  mixin(Document.prototype, SelectorsInterface);
  mixin(Document.prototype, NonElementParentNodeInterface);

  mixin(Document.prototype, {
    get implementation() {
      var implementation = implementationTable.get(this);
      if (implementation)
        return implementation;
      implementation =
          new DOMImplementation(unwrap(this).implementation);
      implementationTable.set(this, implementation);
      return implementation;
    },

    get defaultView() {
      return wrap(unwrap(this).defaultView);
    }
  });

  registerWrapper(window.Document, Document,
      document.implementation.createHTMLDocument(''));

  // Both WebKit and Gecko uses HTMLDocument for document. HTML5/DOM only has
  // one Document interface and IE implements the standard correctly.
  if (window.HTMLDocument)
    registerWrapper(window.HTMLDocument, Document);

  wrapEventTargetMethods([
    window.HTMLBodyElement,
    window.HTMLDocument || window.Document,  // Gecko adds these to HTMLDocument
    window.HTMLHeadElement,
  ]);

  function DOMImplementation(impl) {
    setWrapper(impl, this);
  }

  var originalCreateDocument = document.implementation.createDocument;
  DOMImplementation.prototype.createDocument = function() {
    arguments[2] = unwrap(arguments[2]);
    return wrap(originalCreateDocument.apply(unsafeUnwrap(this), arguments));
  };

  function wrapImplMethod(constructor, name) {
    var original = document.implementation[name];
    constructor.prototype[name] = function() {
      return wrap(original.apply(unsafeUnwrap(this), arguments));
    };
  }

  function forwardImplMethod(constructor, name) {
    var original = document.implementation[name];
    constructor.prototype[name] = function() {
      return original.apply(unsafeUnwrap(this), arguments);
    };
  }

  wrapImplMethod(DOMImplementation, 'createDocumentType');
  wrapImplMethod(DOMImplementation, 'createHTMLDocument');
  forwardImplMethod(DOMImplementation, 'hasFeature');

  registerWrapper(window.DOMImplementation, DOMImplementation);

  forwardMethodsToWrapper([
    window.DOMImplementation,
  ], [
    'createDocument',
    'createDocumentType',
    'createHTMLDocument',
    'hasFeature',
  ]);

  scope.adoptNodeNoRemove = adoptNodeNoRemove;
  scope.wrappers.DOMImplementation = DOMImplementation;
  scope.wrappers.Document = Document;

})(window.ShadowDOMPolyfill);
