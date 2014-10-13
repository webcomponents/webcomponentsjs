/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/**
 * Implements `document.registerElement`
 * @module register
*/

/**
 * Polyfilled extensions to the `document` object.
 * @class Document
*/

CustomElements.addModule(function(scope) {

// imports
var upgradeDocumentTree = scope.upgradeDocumentTree;
var upgrade = scope.upgrade;
var upgradeWithDefinition = scope.upgradeWithDefinition;
var implementPrototype = scope.implementPrototype;
var useNative = scope.useNative;

/**
 * Registers a custom tag name with the document.
 *
 * When a registered element is created, a `readyCallback` method is called
 * in the scope of the element. The `readyCallback` method can be specified on
 * either `options.prototype` or `options.lifecycle` with the latter taking
 * precedence.
 *
 * @method register
 * @param {String} name The tag name to register. Must include a dash ('-'),
 *    for example 'x-component'.
 * @param {Object} options
 *    @param {String} [options.extends]
 *      (_off spec_) Tag name of an element to extend (or blank for a new
 *      element). This parameter is not part of the specification, but instead
 *      is a hint for the polyfill because the extendee is difficult to infer.
 *      Remember that the input prototype must chain to the extended element's
 *      prototype (or HTMLElement.prototype) regardless of the value of
 *      `extends`.
 *    @param {Object} options.prototype The prototype to use for the new
 *      element. The prototype must inherit from HTMLElement.
 *    @param {Object} [options.lifecycle]
 *      Callbacks that fire at important phases in the life of the custom
 *      element.
 *
 * @example
 *      FancyButton = document.registerElement("fancy-button", {
 *        extends: 'button',
 *        prototype: Object.create(HTMLButtonElement.prototype, {
 *          readyCallback: {
 *            value: function() {
 *              console.log("a fancy-button was created",
 *            }
 *          }
 *        })
 *      });
 * @return {Function} Constructor for the newly registered type.
 */
function register(name, options) {
  //console.warn('document.registerElement("' + name + '", ', options, ')');
  // construct a defintion out of options
  // TODO(sjmiles): probably should clone options instead of mutating it
  var definition = options || {};
  if (!name) {
    throw new Error('document.registerElement: first argument `name` must not be empty');
  }
  if (name.indexOf('-') < 0) {
    throw new Error('document.registerElement: first argument (\'name\') must contain a dash (\'-\'). Argument provided was \'' + String(name) + '\'.');
  }
  // prevent registering reserved names
  if (isReservedTag(name)) {
    throw new Error('Failed to execute \'registerElement\' on \'Document\': Registration failed for type \'' + String(name) + '\'. The type name is invalid.');
  }
  // elements may only be registered once
  if (getRegisteredDefinition(name)) {
    throw new Error('DuplicateDefinitionError: a type with name \'' + String(name) + '\' is already registered');
  }
  // prototype is optional, default to an extension of HTMLElement
  if (!definition.prototype) {
    definition.prototype = Object.create(HTMLElement.prototype);
  }
  // record name
  definition.__name = name.toLowerCase();
  // ensure a lifecycle object so we don't have to null test it
  definition.lifecycle = definition.lifecycle || {};
  // build a list of ancestral custom elements (for native base detection)
  // TODO(sjmiles): we used to need to store this, but current code only
  // uses it in 'resolveTagName': it should probably be inlined
  definition.ancestry = ancestry(definition.extends);
  // extensions of native specializations of HTMLElement require localName
  // to remain native, and use secondary 'is' specifier for extension type
  resolveTagName(definition);
  // some platforms require modifications to the user-supplied prototype
  // chain
  resolvePrototypeChain(definition);
  // overrides to implement attributeChanged callback
  overrideAttributeApi(definition.prototype);
  // 7.1.5: Register the DEFINITION with DOCUMENT
  registerDefinition(definition.__name, definition);
  // 7.1.7. Run custom element constructor generation algorithm with PROTOTYPE
  // 7.1.8. Return the output of the previous step.
  definition.ctor = generateConstructor(definition);
  definition.ctor.prototype = definition.prototype;
  // force our .constructor to be our actual constructor
  definition.prototype.constructor = definition.ctor;
  // if initial parsing is complete
  if (scope.ready) {
    // upgrade any pre-existing nodes of this type
    upgradeDocumentTree(document);
  }
  return definition.ctor;
}

// attribute watching
function overrideAttributeApi(prototype) {
  // overrides to implement callbacks
  // TODO(sjmiles): should support access via .attributes NamedNodeMap
  // TODO(sjmiles): preserves user defined overrides, if any
  if (prototype.setAttribute._polyfilled) {
    return;
  }
  var setAttribute = prototype.setAttribute;
  prototype.setAttribute = function(name, value) {
    changeAttribute.call(this, name, value, setAttribute);
  };
  var removeAttribute = prototype.removeAttribute;
  prototype.removeAttribute = function(name) {
    changeAttribute.call(this, name, null, removeAttribute);
  };
  prototype.setAttribute._polyfilled = true;
}

// https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/custom/
// index.html#dfn-attribute-changed-callback
function changeAttribute(name, value, operation) {
  name = name.toLowerCase();
  var oldValue = this.getAttribute(name);
  operation.apply(this, arguments);
  var newValue = this.getAttribute(name);
  if (this.attributeChangedCallback &&
      (newValue !== oldValue)) {
    this.attributeChangedCallback(name, oldValue, newValue);
  }
}

function isReservedTag(name) {
  for (var i = 0; i < reservedTagList.length; i++) {
    if (name === reservedTagList[i]) {
      return true;
    }
  }
}

var reservedTagList = [
  'annotation-xml', 'color-profile', 'font-face', 'font-face-src',
  'font-face-uri', 'font-face-format', 'font-face-name', 'missing-glyph'
];

function ancestry(extnds) {
  var extendee = getRegisteredDefinition(extnds);
  if (extendee) {
    return ancestry(extendee.extends).concat([extendee]);
  }
  return [];
}

function resolveTagName(definition) {
  // if we are explicitly extending something, that thing is our
  // baseTag, unless it represents a custom component
  var baseTag = definition.extends;
  // if our ancestry includes custom components, we only have a
  // baseTag if one of them does
  for (var i=0, a; (a=definition.ancestry[i]); i++) {
    baseTag = a.is && a.tag;
  }
  // our tag is our baseTag, if it exists, and otherwise just our name
  definition.tag = baseTag || definition.__name;
  if (baseTag) {
    // if there is a base tag, use secondary 'is' specifier
    definition.is = definition.__name;
  }
}

function resolvePrototypeChain(definition) {
  // if we don't support __proto__ we need to locate the native level
  // prototype for precise mixing in
  if (!Object.__proto__) {
    // default prototype
    var nativePrototype = HTMLElement.prototype;
    // work out prototype when using type-extension
    if (definition.is) {
      var inst = document.createElement(definition.tag);
      var expectedPrototype = Object.getPrototypeOf(inst);
      // only set nativePrototype if it will actually appear in the definition's chain
      if (expectedPrototype === definition.prototype) {
        nativePrototype = expectedPrototype;
      }
    }
    // ensure __proto__ reference is installed at each point on the prototype
    // chain.
    // NOTE: On platforms without __proto__, a mixin strategy is used instead
    // of prototype swizzling. In this case, this generated __proto__ provides
    // limited support for prototype traversal.
    var proto = definition.prototype, ancestor;
    while (proto && (proto !== nativePrototype)) {
      ancestor = Object.getPrototypeOf(proto);
      proto.__proto__ = ancestor;
      proto = ancestor;
    }
    // cache this in case of mixin
    definition.native = nativePrototype;
  }
}

// SECTION 4

function instantiate(definition) {
  // 4.a.1. Create a new object that implements PROTOTYPE
  // 4.a.2. Let ELEMENT by this new object
  //
  // the custom element instantiation algorithm must also ensure that the
  // output is a valid DOM element with the proper wrapper in place.
  //
  return upgradeWithDefinition(domCreateElement(definition.tag), definition);
}

// element registry (maps tag names to definitions)

var registry = {};

function getRegisteredDefinition(name) {
  if (name) {
    return registry[name.toLowerCase()];
  }
}

function registerDefinition(name, definition) {
  registry[name] = definition;
}

function generateConstructor(definition) {
  return function() {
    return instantiate(definition);
  };
}

var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
function createElementNS(namespace, tag, typeExtension) {
  // NOTE: we do not support non-HTML elements,
  // just call createElementNS for non HTML Elements
  if (namespace === HTML_NAMESPACE) {
    return createElement(tag, typeExtension);
  } else {
    return domCreateElementNS(namespace, tag);
  }
}

function createElement(tag, typeExtension) {
  // TODO(sjmiles): ignore 'tag' when using 'typeExtension', we could
  // error check it, or perhaps there should only ever be one argument
  var definition = getRegisteredDefinition(typeExtension || tag);
  if (definition) {
    if (tag == definition.tag && typeExtension == definition.is) {
      return new definition.ctor();
    }
    // Handle empty string for type extension.
    if (!typeExtension && !definition.is) {
      return new definition.ctor();
    }
  }
  var element;
  if (typeExtension) {
    element = createElement(tag);
    element.setAttribute('is', typeExtension);
    return element;
  }
  element = domCreateElement(tag);
  // Custom tags should be HTMLElements even if not upgraded.
  if (tag.indexOf('-') >= 0) {
    implementPrototype(element, HTMLElement);
  }
  return element;
}

function cloneNode(deep) {
  // call original clone
  var n = domCloneNode.call(this, deep);
  // upgrade the element and subtree
  upgrade(n);
  // return the clone
  return n;
}

// capture native createElement before we override it
var domCreateElement = document.createElement.bind(document);
var domCreateElementNS = document.createElementNS.bind(document);
// capture native cloneNode before we override it
var domCloneNode = Node.prototype.cloneNode;

// Create a custom 'instanceof'. This is necessary when CustomElements
// are implemented via a mixin strategy, as for example on IE10.
var isInstance;
if (!Object.__proto__ && !useNative) {
  isInstance = function(obj, ctor) {
    var p = obj;
    while (p) {
      // NOTE: this is not technically correct since we're not checking if
      // an object is an instance of a constructor; however, this should
      // be good enough for the mixin strategy.
      if (p === ctor.prototype) {
        return true;
      }
      p = p.__proto__;
    }
    return false;
  };
} else {
  isInstance = function(obj, base) {
    return obj instanceof base;
  };
}

// exports
document.registerElement = register;
document.createElement = createElement; // override
document.createElementNS = createElementNS; // override
Node.prototype.cloneNode = cloneNode; // override
scope.registry = registry;
scope.instanceof = isInstance;
scope.reservedTagList = reservedTagList;
scope.getRegisteredDefinition = getRegisteredDefinition;

// bc
document.register = document.registerElement;

});
