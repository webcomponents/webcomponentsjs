// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var rewrap = scope.rewrap;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;

  var OriginalHTMLOptionElement = window.HTMLOptionElement;

  function trimText(s) {
    return s.replace(/\s+/g, ' ').trim();
  }

  function HTMLOptionElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLOptionElement.prototype = Object.create(HTMLElement.prototype);
  mixin(HTMLOptionElement.prototype, {
    get text() {
      return trimText(this.textContent);
    },
    set text(value) {
      this.textContent = trimText(String(value));
    },
    get form() {
      return wrap(unwrap(this).form);
    }
  });

  registerWrapper(OriginalHTMLOptionElement, HTMLOptionElement,
                  document.createElement('option'));

  function Option(text, value, defaultSelected, selected) {
    if (!(this instanceof Option)) {
      throw new TypeError(
          'DOM object constructor cannot be called as a function.');
    }

    var node = unwrap(document.createElement('option'));
    HTMLElement.call(this, node);
    rewrap(node, this);

    if (text !== undefined)
      node.text = text;
    if (value !== undefined)
      node.setAttribute('value', value);
    if (defaultSelected === true)
      node.setAttribute('selected', '');
    node.selected = selected === true;
  }

  Option.prototype = HTMLOptionElement.prototype;

  scope.wrappers.HTMLOptionElement = HTMLOptionElement;
  scope.wrappers.Option = Option;
})(window.ShadowDOMPolyfill);
