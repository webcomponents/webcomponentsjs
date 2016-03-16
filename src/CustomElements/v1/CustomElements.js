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
 * @property {Function} attachedCallback
 * @property {Function} detachedCallback
 * @property {Function} attributeChangedCallback
 * @property {String[]} observedAttributes
 * http://w3c.github.io/webcomponents/spec/custom/#dfn-element-definition-construction-stack
 * @property {Function[]} constructionStack
 */

(function() {
  'use strict';

  window.CustomElements = {};

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
      var tagName = _newTagName;
      _newTagName = null;
      return document.createElement(tagName);
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

  document.defineElement = function(name, constructor, options) {
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
    var attachedCallback = prototype.attachedCallback;
    // 5.1.15
    checkCallback(attachedCallback);
    // 5.1.16
    var detachedCallback = prototype.detachedCallback;
    // 5.1.17
    checkCallback(detachedCallback);
    // 5.1.18
    var attributeChangedCallback = prototype.attributeChangedCallback;
    // 5.1.19
    checkCallback(attributeChangedCallback);

    // 5.1.20
    // @type {Definition}
    var definition = {
      name: name,
      localName: localName,
      constructor: constructor,
      attachedCallback: attachedCallback,
      detachedCallback: detachedCallback,
      attributeChangedCallback: attributeChangedCallback,
    };

    // 5.1.21
    registry.set(localName, definition);

    // 5.1.22
    // The spec says we should upgrade all existing elements now, but if we
    // defer we can do less tree walks
    scheduleUpgrade();
  }

  var _origCreateElement = document.createElement;
  document.createElement = function(tagName) {
    var instance = _origCreateElement.call(document, tagName);
    var registration = registry.get(tagName);
    if (registration) {
      var prototype = registration.constructor.prototype;
      Object.setPrototypeOf(instance, prototype);
      setNewInstance(instance);
      new (registration.constructor)();
      console.assert(_newInstance == null);
    }
    return instance;
  };

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

  function checkCallback(callback, elementName, calllbackName) {
    if (callback !== undefined && !typeof callback !== 'function') {
      throw new Error(`TypeError: ${elementName} '$[calllbackName]' is not a Function`);
    }
  }

  function isReservedTag(name) {
    return reservedTagList.indexOf(name) !== -1;
  }
})();
