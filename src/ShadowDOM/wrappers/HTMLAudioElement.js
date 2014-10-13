// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLMediaElement = scope.wrappers.HTMLMediaElement;
  var registerWrapper = scope.registerWrapper;
  var unwrap = scope.unwrap;
  var rewrap = scope.rewrap;

  var OriginalHTMLAudioElement = window.HTMLAudioElement;

  if (!OriginalHTMLAudioElement) return;

  function HTMLAudioElement(node) {
    HTMLMediaElement.call(this, node);
  }
  HTMLAudioElement.prototype = Object.create(HTMLMediaElement.prototype);

  registerWrapper(OriginalHTMLAudioElement, HTMLAudioElement,
                  document.createElement('audio'));

  function Audio(src) {
    if (!(this instanceof Audio)) {
      throw new TypeError(
          'DOM object constructor cannot be called as a function.');
    }

    var node = unwrap(document.createElement('audio'));
    HTMLMediaElement.call(this, node);
    rewrap(node, this);

    node.setAttribute('preload', 'auto');
    if (src !== undefined)
      node.setAttribute('src', src);
  }

  Audio.prototype = HTMLAudioElement.prototype;

  scope.wrappers.HTMLAudioElement = HTMLAudioElement;
  scope.wrappers.Audio = Audio;
})(window.ShadowDOMPolyfill);
