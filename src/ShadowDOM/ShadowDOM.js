/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function() {

var thisFile = 'ShadowDOM.js';
var base = '';
Array.prototype.forEach.call(document.querySelectorAll('script[src]'), function(s) {
  var src = s.getAttribute('src');
  var re = new RegExp(thisFile + '[^\\\\]*');
  var match = src.match(re);
  if (match) {
    base = src.slice(0, -match[0].length);
  }
});

[
  '../WeakMap/WeakMap.js',
  'wrappers.js',
  'ArraySplice.js',
  'microtask.js',
  'MutationObserver.js',
  'TreeScope.js',
  'wrappers/events.js',
  'wrappers/TouchEvent.js',
  'wrappers/NodeList.js',
  'wrappers/HTMLCollection.js',
  'wrappers/Node.js',
  'querySelector.js',
  'wrappers/node-interfaces.js',
  'wrappers/CharacterData.js',
  'wrappers/Text.js',
  'wrappers/DOMTokenList.js',
  'wrappers/Element.js',
  'wrappers/HTMLElement.js',
  'wrappers/HTMLCanvasElement.js',
  'wrappers/HTMLContentElement.js',
  'wrappers/HTMLFormElement.js',
  'wrappers/HTMLImageElement.js',
  'wrappers/HTMLShadowElement.js',
  'wrappers/HTMLTemplateElement.js',
  'wrappers/HTMLMediaElement.js',
  'wrappers/HTMLAudioElement.js',
  'wrappers/HTMLOptionElement.js',
  'wrappers/HTMLSelectElement.js',
  'wrappers/HTMLTableElement.js',
  'wrappers/HTMLTableSectionElement.js',
  'wrappers/HTMLTableRowElement.js',
  'wrappers/HTMLUnknownElement.js',
  'wrappers/SVGElement.js',
  'wrappers/SVGUseElement.js',
  'wrappers/SVGElementInstance.js',
  'wrappers/CanvasRenderingContext2D.js',
  'wrappers/WebGLRenderingContext.js',
  'wrappers/generic.js',
  'wrappers/ShadowRoot.js',
  'wrappers/Range.js',
  'ShadowRenderer.js',
  'wrappers/elements-with-form-property.js',
  'wrappers/Selection.js',
  'wrappers/TreeWalker.js',
  'wrappers/Document.js',
  'wrappers/Window.js',
  'wrappers/DataTransfer.js',
  'wrappers/FormData.js',
  'wrappers/XMLHttpRequest.js',
  'wrappers/override-constructors.js'
].forEach(function(src) {
  document.write('<script src="' + base + src + '"></script>');
});

})();
