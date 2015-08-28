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

  function removeItemAtNodeList(list, index) {
    var i, length;

    length = --list.length;

    for (i = index; i < length; i++) {
      list[i] = list[i + 1];
    }

    delete list[length];
  }

  function insertBeforeNodeList(list, item, ref) {
    var i;

    if (ref) {
      for (i = list.length++; i > 0 && list[i] !== ref; i--) {
        list[i] = list[i - 1];
      }
    } else {
      i = list.length++;
    }

    list[i] = item;
  }

  function indexOfNodeList(list, item) {
    var i;
    var length = list.length;

    for (i = 0; i < length; i++) {
      if (list[i] === item) {
        return i;
      }
    }

    return -1;
  }

  function clearNodeList(list) {
    var i, length = list.length;

    for (i = 0; i < length; i++) {
      delete list[i];
    }

    list.length = 0;
  }

  function copyNodeList(dest, src) {
    var i, length = src.length, oldLength = dest.length;

    for (i = 0; i < length; i++) {
      dest[i] = src[i];
    }

    while (i < oldLength) {
      delete dest[i++];
    }

    dest.length = length;
  }

  scope.wrappers.NodeList = NodeList;
  scope.addWrapNodeListMethod = addWrapNodeListMethod;
  scope.wrapNodeList = wrapNodeList;
  scope.removeItemAtNodeList = removeItemAtNodeList;
  scope.insertBeforeNodeList = insertBeforeNodeList;
  scope.clearNodeList = clearNodeList;
  scope.indexOfNodeList = indexOfNodeList;
  scope.copyNodeList = copyNodeList;

})(window.ShadowDOMPolyfill);
