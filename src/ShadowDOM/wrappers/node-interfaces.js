// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var NodeList = scope.wrappers.NodeList;

  function forwardElement(node) {
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.nextSibling;
    }
    return node;
  }

  function backwardsElement(node) {
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.previousSibling;
    }
    return node;
  }

  var ParentNodeInterface = {
    get firstElementChild() {
      return forwardElement(this.firstChild);
    },

    get lastElementChild() {
      return backwardsElement(this.lastChild);
    },

    get childElementCount() {
      var count = 0;
      for (var child = this.firstElementChild;
           child;
           child = child.nextElementSibling) {
        count++;
      }
      return count;
    },

    get children() {
      var wrapperList = new NodeList();
      var i = 0;
      for (var child = this.firstElementChild;
           child;
           child = child.nextElementSibling) {
        wrapperList[i++] = child;
      }
      wrapperList.length = i;
      return wrapperList;
    },

    remove: function() {
      var p = this.parentNode;
      if (p)
        p.removeChild(this);
    }
  };

  var ChildNodeInterface = {
    get nextElementSibling() {
      return forwardElement(this.nextSibling);
    },

    get previousElementSibling() {
      return backwardsElement(this.previousSibling);
    }
  };

  scope.ChildNodeInterface = ChildNodeInterface;
  scope.ParentNodeInterface = ParentNodeInterface;

})(window.ShadowDOMPolyfill);
