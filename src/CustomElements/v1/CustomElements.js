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
 * 2.3
 * http://w3c.github.io/webcomponents/spec/custom/#dfn-element-definition
 *
 * @typedef {Object} Definition
 * @property {Function} name
 * @property {Function} localName
 * @property {Function} constructor
 * @property {Function} connectedCallback
 * @property {Function} disconnectedCallback
 * @property {Function} attributeChangedCallback
 * @property {String[]} observedAttributes
 * http://w3c.github.io/webcomponents/spec/custom/#dfn-element-definition-construction-stack
 * @property {Function[]} constructionStack
 */

(function() {
  'use strict';

  window.CustomElements = {};

  function CustomElementsRegistry() {}
  CustomElementsRegistry.prototype.define = function(name, constructor, options) {
    // 5.1.1
    if (typeof constructor !== 'function') {
      throw new TypeError('constructor must be a Constructor');
    }

    // 5.1.2
    name = name.toString().toLowerCase();

    // 5.1.3
    if (!customNameValidation.test(name)) {
      throw new Error(`NotSupportedError: Document.defineElement failed for '${name}'. The element name is not valid.`);
    }
    if (isReservedTag(name)) {
      throw new Error(`NotSupportedError: Document.defineElement failed for '${name}'. The element name is reserved.`);
    }

    // 5.1.4? Can't polyfill?

    // 5.1.5
    if (registry.has(name)) {
      throw new Error(`NotSupportedError: Document.defineElement an element with name '${name}' is already registered`);
    }

    // 5.1.6
    // IE11 doesn't support Map.values, only Map.forEach
    registry.forEach(function(value, key) {
      if (value.constructor === constructor) {
        throw new Error(`NotSupportedError: Document.defineElement failed for '${name}'. The constructor is already used.`);
      }
    });

    // 5.1.7
    var localName = name;

    // 5.1.8
    var _extends = options && options.extends || '';

    // 5.1.9
    if (_extends !== null) {
      // skip for now
    }

    // 5.1.10, 5.1.11
    var observedAttributes = constructor.observedAttributes || [];

    // 5.1.12
    var prototype = constructor.prototype;

    // 5.1.13?

    // 5.1.14
    var connectedCallback = prototype.connectedCallback;
    // 5.1.15
    checkCallback(connectedCallback, localName, 'connectedCallback');
    // 5.1.16
    var disconnectedCallback = prototype.disconnectedCallback;
    // 5.1.17
    checkCallback(disconnectedCallback, localName, 'disconnectedCallback');
    // 5.1.18
    var attributeChangedCallback = prototype.attributeChangedCallback;
    // 5.1.19
    checkCallback(attributeChangedCallback, localName, 'attributeChangedCallback');

    // 5.1.20
    // @type {Definition}
    var definition = {
      name: name,
      localName: localName,
      constructor: constructor,
      connectedCallback: connectedCallback,
      disconnectedCallback: disconnectedCallback,
      attributeChangedCallback: attributeChangedCallback,
      observedAttributes: observedAttributes,
    };

    // 5.1.21
    registry.set(localName, definition);

    // 5.1.22
    // The spec says we should upgrade all existing elements now, but if we
    // defer we can do less tree walks
    scheduleUpgrade();
  };

  window.customElements = new CustomElementsRegistry();

  function observeRoot(root) {
    if (!root.__observer) {
      var observer = new MutationObserver(handleMutations);
      observer.observe(root, {childList: true, subtree: true});
      root.__observer = observer;
    }
    return root.__observer;
  }
  var _observer = observeRoot(document);

  CustomElements.flush = function() {
    handleMutations(_observer.takeRecords());
  };

  var _newInstance;
  var _newTagName;

  CustomElements.setCurrentTag = function(tagName) {
    _newTagName = _newTagName || tagName;
  }

  function setNewInstance(instance) {
    console.assert(_newInstance == null);
    _newInstance = instance;
  }

  var origHTMLElement = HTMLElement;

  // TODO: patch up all built-in subclasses of HTMLElement to use the fake
  // HTMLElement.prototype
  window.HTMLElement = function() {
    if (_newInstance) {
      var i = _newInstance;
      _newInstance = null;
      _newTagName = null;
      return i;
    }
    if (_newTagName) {
      var tagName = _newTagName.toLowerCase();
      _newTagName = null;
      var element = rawCreateElement(tagName);
      var definition = registry.get(tagName);
      if (definition) {
        _upgradeElement(element, definition, false);
        return element;
      }
    }
    throw new Error('unknown constructor');
  }
  HTMLElement.prototype = Object.create(origHTMLElement.prototype);
  Object.defineProperty(HTMLElement.prototype, 'constructor', {
    writable: false,
    configurable: true,
    enumerable: false,
    value: HTMLElement,
  });

  var rawCreateElement = document.createElement.bind(document);
  document.createElement = function(tagName) {
    var element = rawCreateElement(tagName);
    var definition = registry.get(tagName.toLowerCase());
    if (definition) {
      _upgradeElement(element, definition, true);
    }
    return element;
  };

  var HTMLNS = 'http://www.w3.org/1999/xhtml';
  var _origCreateElementNS = document.createElementNS;
  document.createElementNS = function(namespaceURI, qualifiedName) {
    if (namespaceURI === 'http://www.w3.org/1999/xhtml') {
      return document.createElement(qualifiedName);
    } else {
      return _origCreateElementNS(namespaceURI, qualifiedName);
    }
  };

  // @type {Map<String, Definition>}
  var registry = new Map();

  var reservedTagList = [
    'annotation-xml',
    'color-profile',
    'font-face',
    'font-face-src',
    'font-face-uri',
    'font-face-format',
    'font-face-name',
    'missing-glyph',
  ];
  var customNameValidation = /^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$/;

  var microtaskScheduler = Promise.resolve();

  var upgradeTask = null;

  function scheduleMicrotask(task) {
    return microtaskScheduler.then(task);
  }

  function scheduleUpgrade() {
    if (upgradeTask !== null) {
      return
    }
    upgradeTask = scheduleMicrotask(upgrade);
  }

  function upgrade() {
    _upgrade(document.documentElement);
  }

  function _upgrade(element) {
    if (element.tagName === 'LINK' && element.import) {
      _upgrade(element.import.documentElement);
    } else {
      var children = element.children;
      if (element.shadowRoot) {
        children = children.concat(element.shadowRoot.children);
      }
      for (var i = 0; i < children.length; i++) {
        _upgrade(children[i]);
      }
    }
  }

  var attributeObserver = new MutationObserver(handleAttributeChange);
  function handleAttributeChange(mutations) {
    console.log('handleAttributeChange', arguments);
    for (var i = 0; i < mutations.length; i++) {
      var mutation = mutations[i];
      if (mutation.type === 'attributes') {
        var name = mutation.attributeName;
        var oldValue = mutation.oldValue;
        var target = mutation.target;
        var newValue = target.getAttribute(name);
        var namespace = mutation.attributeNamespace;
        target.attributeChangedCallback(name, oldValue, newValue, namespace);
      }
    }
  }

  function _upgradeElement(element, definition, callConstructor) {
    var prototype = definition.constructor.prototype;
    Object.setPrototypeOf(element, prototype);
    if (callConstructor) {
      setNewInstance(element);
      element.__upgraded = true;
      new (definition.constructor)();
      console.assert(_newInstance == null);
    }
    if (definition.attributeChangedCallback && definition.observedAttributes.length > 0) {
      attributeObserver.observe(element, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: definition.observedAttributes,
      });
    }
  }

  function checkCallback(callback, elementName, calllbackName) {
    if (callback !== undefined && typeof callback !== 'function') {
      console.warn(typeof callback);
      throw new Error(`TypeError: ${elementName} '${calllbackName}' is not a Function`);
    }
  }

  function isReservedTag(name) {
    return reservedTagList.indexOf(name) !== -1;
  }

  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

  function handleMutations(mutations) {
    // console.log('handleMutations', mutations);
    for (var i = 0; i < mutations.length; i++) {
      var mutation = mutations[i];
      if (mutation.type === 'childList') {
        addNodes(mutation.addedNodes);
        removeNodes(mutation.removedNodes);
      }
    }
  }

  function addNodes(nodeList) {
    for (var i = 0; i < nodeList.length; i++) {
      var root = nodeList[i];
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      do {
        var node = walker.currentNode;
        var definition = registry.get(node.localName);
        if (!definition) {
          continue;
        }
        if (!node.__upgraded) {
          _upgradeElement(node, definition, true);
        }
        if (node.__upgraded && !node.__attached) {
          node.__attached = true;
          var definition = registry.get(node.localName);
          if (definition && definition.connectedCallback) {
            definition.connectedCallback.call(node);
          }
        }
      } while (walker.nextNode())
    }
  }

  function removeNodes(nodeList) {
    for (var i = 0; i < nodeList.length; i++) {
      var root = nodeList[i];
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      do {
        var node = walker.currentNode;
        if (node.__upgraded && node.__attached) {
          node.__attached = false;
          var definition = registry.get(node.localName);
          if (definition && definition.disconnectedCallback) {
            definition.disconnectedCallback.call(node);
          }
        }
      } while (walker.nextNode())
    }
  }

  // recurse up the tree to check if an element is actually in the main document.
  function inDocument(element) {
    var p = element;
    // var doc = window.wrap(document);
    var doc = document;
    while (p = p.parentNode || ((p.nodeType === Node.DOCUMENT_FRAGMENT_NODE) && p.host)) {
      if (p === doc) {
        return true;
      }
    }
    return false;
  }
})();
