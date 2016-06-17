/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/**
 * 2.3
 * http://w3c.github.io/webcomponents/spec/custom/#dfn-element-definition
 * @typedef {{
 *  name: string,
 *  localName: string,
 *  constructor: Function,
 *  connectedCallback: Function,
 *  disconnectedCallback: Function,
 *  attributeChangedCallback: Function,
 *  observedAttributes: Array<string>,
 * }}
 */
var CustomElementDefinition;

(function() {
  'use strict';

  var doc = document;
  var win = window;

  /**
   * @const
   * @type {Array<string>}
   */
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

  /**
   * @const
   */
  var customNameValidation = /^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$/;

  function getCallback(proto, calllbackName, elementName) {
    var callback = proto[calllbackName];
    if (callback !== undefined && typeof callback !== 'function') {
      throw new Error(`TypeError: ${elementName} '${calllbackName}' is not a Function`);
    }
    return callback;
  }

  function isReservedTag(name) {
    return reservedTagList.indexOf(name) !== -1;
  }

  /**
   * @property {Map<String, CustomElementDefinition>} _defintions
   * @property {MutationObserver} _observer
   * @property {MutationObserver} _attributeObserver
   * @property {HTMLElement} _newInstance
   * @property {boolean} polyfilled
   */
  class CustomElementsRegistry {

    constructor() {
      this._definitions = new Map();
      this._constructors = new Map();
      this._observer = new MutationObserver(this._handleMutations.bind(this));
      this._attributeObserver =
          new MutationObserver(this._handleAttributeChange.bind(this));
      this._newInstance = null;
      this.polyfilled = true;

      this._observeRoot(document);
    }

    define(name, constructor, options) {
      // 2.4.1
      if (typeof constructor !== 'function') {
        throw new TypeError('constructor must be a Constructor');
      }

      // 2.4.2
      name = name.toString().toLowerCase();

      // 2.4.3
      if (!customNameValidation.test(name)) {
        throw new SyntaxError(`CustomElementRegistry.define: The element name '${name}' is not valid.`);
      }
      if (isReservedTag(name)) {
        throw new SyntaxError(`CustomElementRegistry.define: The element name '${name}' is reserved.`);
      }

      // 2.4.4
      if (this._definitions.has(name)) {
        throw new Error(`NotSupportedError: CustomElementRegistry.define: An element with name '${name}' is already defined`);
      }

      // 2.4.5
      if (this._constructors.has(constructor)) {
        throw new Error(`NotSupportedError: CustomElementRegistry.define failed for '${name}'. The constructor is already used.`);
      }

      // 2.4.6
      var localName = name;

      // 2.4.7 & 2.4.8: not supporting extends

      // 2.4.9, 2.4.10
      var observedAttributes = constructor['observedAttributes'] || [];

      // 2.4.11
      var prototype = constructor.prototype;

      // 2.4.12
      if (typeof prototype !== 'object') {
        throw new TypeError('CustomElementRegistry.define: type of prototype is not "object"');
      }

      // 2.4.13 & 2.4.14
      var connectedCallback = getCallback(prototype, 'connectedCallback', localName);
      // 2.4.15 & 2.4.16
      var disconnectedCallback = getCallback(prototype, 'disconnectedCallback', localName);
      // 2.4.17 & 2.4.18
      var attributeChangedCallback = getCallback(prototype, 'attributeChangedCallback', localName);

      // 2.4.19
      // @type {CustomElementDefinition}
      var definition = {
        name: name,
        localName: localName,
        constructor: constructor,
        connectedCallback: connectedCallback,
        disconnectedCallback: disconnectedCallback,
        attributeChangedCallback: attributeChangedCallback,
        observedAttributes: observedAttributes,
      };

      // 2.4.20
      this._definitions.set(localName, definition);
      this._constructors.set(constructor, localName);

      // this causes an upgrade of the document
      this._addNodes(doc.childNodes);
    }

    // https://html.spec.whatwg.org/multipage/scripting.html#custom-elements-api
    get(localName) {
      const def = this._definitions.get(localName);
      return def ? def.constructor : undefined;
    }

    flush() {
      this._handleMutations(this._observer.takeRecords());
    }

    _setNewInstance(instance) {
      this._newInstance = instance;
    }

    _observeRoot(root) {
      this._observer.observe(root, {childList: true, subtree: true});
    }

    _handleMutations(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        if (mutation.type === 'childList') {
          this._addNodes(mutation.addedNodes);
          this._removeNodes(mutation.removedNodes);
        }
      }
    }

    /**
     * @param {NodeList} nodeList
     */
    _addNodes(nodeList) {
      for (var i = 0; i < nodeList.length; i++) {
        var root = nodeList[i];
        var walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
        do {
          var node = /** @type {HTMLElement} */ (walker.currentNode);
          var definition = this._definitions.get(node.localName);
          if (definition) {
            if (!node.__upgraded) {
              this._upgradeElement(node, definition, true);
            }
            if (node.__upgraded && !node.__attached) {
              node.__attached = true;
              if (definition && definition.connectedCallback) {
                definition.connectedCallback.call(node);
              }
            }
          }
          if (node.shadowRoot) {
            this._addNodes(node.shadowRoot.childNodes);
          }
        } while (walker.nextNode())
      }
    }

    /**
     * @param {NodeList} nodeList
     */
    _removeNodes(nodeList) {
      for (var i = 0; i < nodeList.length; i++) {
        var root = nodeList[i];
        var walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
        do {
          var node = walker.currentNode;
          if (node.__upgraded && node.__attached) {
            node.__attached = false;
            var definition = this._definitions.get(node.localName);
            if (definition && definition.disconnectedCallback) {
              definition.disconnectedCallback.call(node);
            }
          }
        } while (walker.nextNode())
      }
    }

    /**
     * @param {HTMLElement} element
     * @param {CustomElementDefinition} definition
     * @param {boolean} callConstructor
     */
    _upgradeElement(element, definition, callConstructor) {
      var prototype = definition.constructor.prototype;
      element.__proto__ = prototype;
      if (callConstructor) {
        this._setNewInstance(element);
        element.__upgraded = true;
        new (definition.constructor)();
        console.assert(this._newInstance == null);
      }
      if (definition.attributeChangedCallback && definition.observedAttributes.length > 0) {
        this._attributeObserver.observe(element, {
          attributes: true,
          attributeOldValue: true,
          attributeFilter: definition.observedAttributes,
        });
      }
    }

    /**
     * @private
     */
    _handleAttributeChange(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        if (mutation.type === 'attributes') {
          var name = mutation.attributeName;
          var oldValue = mutation.oldValue;
          var target = mutation.target;
          var newValue = target.getAttribute(name);
          var namespace = mutation.attributeNamespace;
          target['attributeChangedCallback'](name, oldValue, newValue, namespace);
        }
      }
    }
  }

  // Closure Compiler Exports
  window['CustomElementsRegistry'] = CustomElementsRegistry;
  CustomElementsRegistry.prototype['define'] = CustomElementsRegistry.prototype.define;
  CustomElementsRegistry.prototype['flush'] = CustomElementsRegistry.prototype.flush;
  CustomElementsRegistry.prototype['polyfilled'] = CustomElementsRegistry.prototype.polyfilled;

  // patch window.HTMLElement

  // TODO: patch up all built-in subclasses of HTMLElement to use the fake
  // HTMLElement.prototype
  var origHTMLElement = win.HTMLElement;
  win.HTMLElement = function() {
    var customElements = win['customElements'];
    if (customElements._newInstance) {
      var i = customElements._newInstance;
      customElements._newInstance = null;
      return i;
    }
    if (this.constructor) {
      var tagName = customElements._constructors.get(this.constructor);
      return doc._createElement(tagName, false);
    }
    throw new Error('unknown constructor. Did you call customElements.define()?');
  }
  HTMLElement.prototype = Object.create(origHTMLElement.prototype);
  Object.defineProperty(HTMLElement.prototype, 'constructor', {value: HTMLElement});

  // patch doc.createElement

  var rawCreateElement = doc.createElement;
  doc._createElement = function(tagName, callConstructor) {
    var customElements = win['customElements'];
    var element = rawCreateElement.call(doc, tagName);
    var definition = customElements._definitions.get(tagName.toLowerCase());
    if (definition) {
      customElements._upgradeElement(element, definition, callConstructor);
    }
    return element;
  };
  doc.createElement = function(tagName) {
    return doc._createElement(tagName, true);
  }

  // patch doc.createElementNS

  var HTMLNS = 'http://www.w3.org/1999/xhtml';
  var _origCreateElementNS = doc.createElementNS;
  doc.createElementNS = function(namespaceURI, qualifiedName) {
    if (namespaceURI === 'http://www.w3.org/1999/xhtml') {
      return doc.createElement(qualifiedName);
    } else {
      return _origCreateElementNS.call(document, namespaceURI, qualifiedName);
    }
  };

  // patch Element.attachShadow

  var _origAttachShadow = Element.prototype.attachShadow;
  if (_origAttachShadow) {
    Object.defineProperty(Element.prototype, 'attachShadow', {
      value: function(options) {
        var root = _origAttachShadow.call(this, options);
        var customElements = win['customElements'];
        customElements._observeRoot(root);
        return root;
      },
    });
  }

  /** @type {CustomElementsRegistry} */
  window['customElements'] = new CustomElementsRegistry();
})();
