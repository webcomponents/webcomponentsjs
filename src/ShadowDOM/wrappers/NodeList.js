// Copyright 2012 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var unsafeUnwrap = scope.unsafeUnwrap;
  var wrap = scope.wrap;

  var nonEnumDescriptor = {enumerable: false};

  function nonEnum(obj, prop) {
    Object.defineProperty(obj, prop, nonEnumDescriptor);
  }

  function NodeList() {
    this.length = 0;
    nonEnum(this, 'length');
  }
  NodeList.prototype = {
    item: function(index) {
      return this[index];
    }
  };
  nonEnum(NodeList.prototype, 'item');

  function wrapNodeList(list) {
    if (list == null)
      return list;
    var wrapperList = new NodeList();
    for (var i = 0, length = list.length; i < length; i++) {
      wrapperList[i] = wrap(list[i]);
    }
    wrapperList.length = length;
    return wrapperList;
  }

  function addWrapNodeListMethod(wrapperConstructor, name) {
    wrapperConstructor.prototype[name] = function() {
      return wrapNodeList(
          unsafeUnwrap(this)[name].apply(unsafeUnwrap(this), arguments));
    };
  }

  scope.wrappers.NodeList = NodeList;
  scope.addWrapNodeListMethod = addWrapNodeListMethod;
  scope.wrapNodeList = wrapNodeList;

})(window.ShadowDOMPolyfill);
