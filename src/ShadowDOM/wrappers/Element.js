// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var ChildNodeInterface = scope.ChildNodeInterface;
  var GetElementsByInterface = scope.GetElementsByInterface;
  var Node = scope.wrappers.Node;
  var DOMTokenList = scope.wrappers.DOMTokenList;
  var ParentNodeInterface = scope.ParentNodeInterface;
  var SelectorsInterface = scope.SelectorsInterface;
  var addWrapNodeListMethod = scope.addWrapNodeListMethod;
  var enqueueMutation = scope.enqueueMutation;
  var mixin = scope.mixin;
  var oneOf = scope.oneOf;
  var registerWrapper = scope.registerWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var wrappers = scope.wrappers;

  var OriginalElement = window.Element;

  var matchesNames = [
    'matches',  // needs to come first.
    'mozMatchesSelector',
    'msMatchesSelector',
    'webkitMatchesSelector',
  ].filter(function(name) {
    return OriginalElement.prototype[name];
  });

  var matchesName = matchesNames[0];

  var originalMatches = OriginalElement.prototype[matchesName];

  function invalidateRendererBasedOnAttribute(element, name) {
    // Only invalidate if parent node is a shadow host.
    var p = element.parentNode;
    if (!p || !p.shadowRoot)
      return;

    var renderer = scope.getRendererForHost(p);
    if (renderer.dependsOnAttribute(name))
      renderer.invalidate();
  }

  function enqueAttributeChange(element, name, oldValue) {
    // This is not fully spec compliant. We should use localName (which might
    // have a different case than name) and the namespace (which requires us
    // to get the Attr object).
    enqueueMutation(element, 'attributes', {
      name: name,
      namespace: null,
      oldValue: oldValue
    });
  }

  var classListTable = new WeakMap();

  function Element(node) {
    Node.call(this, node);
  }
  Element.prototype = Object.create(Node.prototype);
  mixin(Element.prototype, {
    createShadowRoot: function() {
      var newShadowRoot = new wrappers.ShadowRoot(this);
      unsafeUnwrap(this).polymerShadowRoot_ = newShadowRoot;

      var renderer = scope.getRendererForHost(this);
      renderer.invalidate();

      return newShadowRoot;
    },

    get shadowRoot() {
      return unsafeUnwrap(this).polymerShadowRoot_ || null;
    },

    // getDestinationInsertionPoints added in ShadowRenderer.js

    setAttribute: function(name, value) {
      var oldValue = unsafeUnwrap(this).getAttribute(name);
      unsafeUnwrap(this).setAttribute(name, value);
      enqueAttributeChange(this, name, oldValue);
      invalidateRendererBasedOnAttribute(this, name);
    },

    removeAttribute: function(name) {
      var oldValue = unsafeUnwrap(this).getAttribute(name);
      unsafeUnwrap(this).removeAttribute(name);
      enqueAttributeChange(this, name, oldValue);
      invalidateRendererBasedOnAttribute(this, name);
    },

    matches: function(selector) {
      return originalMatches.call(unsafeUnwrap(this), selector);
    },

    get classList() {
      var list = classListTable.get(this);
      if (!list) {
        classListTable.set(this,
            list = new DOMTokenList(unsafeUnwrap(this).classList, this));
      }
      return list;
    },

    get className() {
      return unsafeUnwrap(this).className;
    },

    set className(v) {
      this.setAttribute('class', v);
    },

    get id() {
      return unsafeUnwrap(this).id;
    },

    set id(v) {
      this.setAttribute('id', v);
    }
  });

  matchesNames.forEach(function(name) {
    if (name !== 'matches') {
      Element.prototype[name] = function(selector) {
        return this.matches(selector);
      };
    }
  });

  if (OriginalElement.prototype.webkitCreateShadowRoot) {
    Element.prototype.webkitCreateShadowRoot =
        Element.prototype.createShadowRoot;
  }

  mixin(Element.prototype, ChildNodeInterface);
  mixin(Element.prototype, GetElementsByInterface);
  mixin(Element.prototype, ParentNodeInterface);
  mixin(Element.prototype, SelectorsInterface);

  registerWrapper(OriginalElement, Element,
                  document.createElementNS(null, 'x'));

  scope.invalidateRendererBasedOnAttribute = invalidateRendererBasedOnAttribute;
  scope.matchesNames = matchesNames;
  scope.wrappers.Element = Element;
})(window.ShadowDOMPolyfill);
