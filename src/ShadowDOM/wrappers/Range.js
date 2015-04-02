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

  var registerWrapper = scope.registerWrapper;
  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var unwrapIfNeeded = scope.unwrapIfNeeded;
  var wrap = scope.wrap;

  var OriginalRange = window.Range;

  var ShadowRoot = scope.wrappers.ShadowRoot;

  function isElement(node){
    return node && node.nodeType == Node.ELEMENT_NODE
  }

  function getHost(node){
    while(node && node.parentNode){
      if (node.parentNode && node.parentNode instanceof ShadowRoot){
        return node.parentNode.host;
      }
      node=node.parentNode;
    }
  }

  function hostNodeToShadowNode(refNode,offset){
    if (refNode.shadowRoot){
      // Note: if the refNode is an element, then selecting a range with and offset
      // equal to refNode.childNodes.length+1 is valid. That is why calling Math.min
      // is necessary to make sure we select valid children.
      var child = refNode.childNodes[Math.min(refNode.childNodes.length-1, offset)];
      if (child){
        var insertionPoint = ShadowDOMPolyfill.getDestinationInsertionPoints(child);
        if (insertionPoint.length>0){
          var parentNode = insertionPoint[0].parentNode;
          if (isElement(parentNode)){
            refNode=parentNode;
          }
        }
      }
    }
    return refNode;
  }

  function shadowNodeToHostNode(rangeNodeFieldName){
    var node = wrap(unsafeUnwrap(this)[rangeNodeFieldName]);
    var host = getHost(node);
    if (host){
      return host;
    }
    return node;
  }

  function Range(impl) {
    setWrapper(impl, this);
  }
  Range.prototype = {
    get startContainer() {
      // Never return a node in the shadow dom.
      return shadowNodeToHostNode.call(this,"startContainer");
    },
    get endContainer() {
      return shadowNodeToHostNode.call(this,"endContainer");
    },
    get commonAncestorContainer() {
      return shadowNodeToHostNode.call(this,"commonAncestorContainer");
    },
    setStart: function(refNode,offset) {
      refNode=hostNodeToShadowNode(refNode,offset);
      unsafeUnwrap(this).setStart(unwrapIfNeeded(refNode), offset);
    },
    setEnd: function(refNode,offset) {
      refNode=hostNodeToShadowNode(refNode,offset);
      unsafeUnwrap(this).setEnd(unwrapIfNeeded(refNode), offset);
    },
    setStartBefore: function(refNode) {
      unsafeUnwrap(this).setStartBefore(unwrapIfNeeded(refNode));
    },
    setStartAfter: function(refNode) {
      unsafeUnwrap(this).setStartAfter(unwrapIfNeeded(refNode));
    },
    setEndBefore: function(refNode) {
      unsafeUnwrap(this).setEndBefore(unwrapIfNeeded(refNode));
    },
    setEndAfter: function(refNode) {
      unsafeUnwrap(this).setEndAfter(unwrapIfNeeded(refNode));
    },
    selectNode: function(refNode) {
      unsafeUnwrap(this).selectNode(unwrapIfNeeded(refNode));
    },
    selectNodeContents: function(refNode) {
      unsafeUnwrap(this).selectNodeContents(unwrapIfNeeded(refNode));
    },
    compareBoundaryPoints: function(how, sourceRange) {
      return unsafeUnwrap(this).compareBoundaryPoints(how, unwrap(sourceRange));
    },
    extractContents: function() {
      return wrap(unsafeUnwrap(this).extractContents());
    },
    cloneContents: function() {
      return wrap(unsafeUnwrap(this).cloneContents());
    },
    insertNode: function(node) {
      unsafeUnwrap(this).insertNode(unwrapIfNeeded(node));
    },
    surroundContents: function(newParent) {
      unsafeUnwrap(this).surroundContents(unwrapIfNeeded(newParent));
    },
    cloneRange: function() {
      return wrap(unsafeUnwrap(this).cloneRange());
    },
    isPointInRange: function(node, offset) {
      return unsafeUnwrap(this).isPointInRange(unwrapIfNeeded(node), offset);
    },
    comparePoint: function(node, offset) {
      return unsafeUnwrap(this).comparePoint(unwrapIfNeeded(node), offset);
    },
    intersectsNode: function(node) {
      return unsafeUnwrap(this).intersectsNode(unwrapIfNeeded(node));
    },
    toString: function() {
      return unsafeUnwrap(this).toString();
    }
  };

  // IE9 does not have createContextualFragment.
  if (OriginalRange.prototype.createContextualFragment) {
    Range.prototype.createContextualFragment = function(html) {
      return wrap(unsafeUnwrap(this).createContextualFragment(html));
    };
  }

  registerWrapper(window.Range, Range, document.createRange());

  scope.wrappers.Range = Range;

})(window.ShadowDOMPolyfill);
