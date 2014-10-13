// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var ChildNodeInterface = scope.ChildNodeInterface;
  var Node = scope.wrappers.Node;
  var enqueueMutation = scope.enqueueMutation;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;

  var OriginalCharacterData = window.CharacterData;

  function CharacterData(node) {
    Node.call(this, node);
  }
  CharacterData.prototype = Object.create(Node.prototype);
  mixin(CharacterData.prototype, {
    get textContent() {
      return this.data;
    },
    set textContent(value) {
      this.data = value;
    },
    get data() {
      return unsafeUnwrap(this).data;
    },
    set data(value) {
      var oldValue = unsafeUnwrap(this).data;
      enqueueMutation(this, 'characterData', {
        oldValue: oldValue
      });
      unsafeUnwrap(this).data = value;
    }
  });

  mixin(CharacterData.prototype, ChildNodeInterface);

  registerWrapper(OriginalCharacterData, CharacterData,
                  document.createTextNode(''));

  scope.wrappers.CharacterData = CharacterData;
})(window.ShadowDOMPolyfill);
