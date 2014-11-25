/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

var assert = chai.assert;

var thisFile = 'tests.js';
var base;
(function() {
  var s$ = document.querySelectorAll('script[src]');
  Array.prototype.forEach.call(s$, function(s) {
    var src = s.getAttribute('src');
    var re = new RegExp(thisFile + '[^\\\\]*');
    var match = src.match(re);
    if (match) {
      base = src.slice(0, -match[0].length);
    }
  });
})();

function expectStructure(nodeOrWrapper, nonNullFields) {
  assert(nodeOrWrapper);
  assert.strictEqual(nodeOrWrapper.parentNode, nonNullFields.parentNode || null);
  assert.strictEqual(nodeOrWrapper.previousSibling,
      nonNullFields.previousSibling || null);
  assert.strictEqual(nodeOrWrapper.nextSibling, nonNullFields.nextSibling || null);
  assert.strictEqual(nodeOrWrapper.firstChild, nonNullFields.firstChild || null);
  assert.strictEqual(nodeOrWrapper.lastChild, nonNullFields.lastChild || null);
}

function unwrapAndExpectStructure(node, nonNullFields) {
  for (var p in nonNullFields) {
    nonNullFields[p] = ShadowDOMPolyfill.unwrap(nonNullFields[p]);
  }
  expectStructure(ShadowDOMPolyfill.unwrap(node), nonNullFields);
}

function assertArrayEqual(a, b, msg) {
  for (var i = 0; i < a.length; i++) {
    assert.equal(a[i], b[i], msg);
  }
  assert.equal(a.length, b.length, msg);
}

function expectMutationRecord(record, expected) {
  assert.equal(record.type,
      expected.type === undefined ? null : expected.type);
  assert.equal(record.target,
      expected.target === undefined ? null : expected.target);
  assertArrayEqual(record.addedNodes,
      expected.addedNodes === undefined ? [] : expected.addedNodes);
  assertArrayEqual(record.removedNodes,
      expected.removedNodes === undefined ? [] : expected.removedNodes);
  assert.equal(record.previousSibling,
      expected.previousSibling === undefined ?
          null : expected.previousSibling);
  assert.equal(record.nextSibling,
      expected.nextSibling === undefined ? null : expected.nextSibling);
  assert.equal(record.attributeName,
      expected.attributeName === undefined ? null : expected.attributeName);
  assert.equal(record.attributeNamespace,
      expected.attributeNamespace === undefined ?
          null : expected.attributeNamespace);
  assert.equal(record.oldValue,
      expected.oldValue === undefined ? null : expected.oldValue);
}

mocha.setup({
  ui: 'tdd',
  globals: ['console', 'getInterface']
})

var modules = [
  'ChildNodeInterface.js',
  'Comment.js',
  'DOMTokenList.js',
  'Document.js',
  'Element.js',
  'FormData.js',
  'HTMLAudioElement.js',
  'HTMLBodyElement.js',
  'HTMLButtonElement.js',
  'HTMLCanvasElement.js',
  'HTMLContentElement.js',
  'HTMLElement.js',
  'HTMLFieldSetElement.js',
  'HTMLFormElement.js',
  'HTMLHeadElement.js',
  'HTMLHtmlElement.js',
  'HTMLImageElement.js',
  'HTMLInputElement.js',
  'HTMLKeygenElement.js',
  'HTMLLabelElement.js',
  'HTMLLegendElement.js',
  'HTMLObjectElement.js',
  'HTMLOptionElement.js',
  'HTMLOutputElement.js',
  'HTMLSelectElement.js',
  'HTMLShadowElement.js',
  'HTMLTableElement.js',
  'HTMLTableRowElement.js',
  'HTMLTableSectionElement.js',
  'HTMLTemplateElement.js',
  'HTMLTextAreaElement.js',
  'MutationObserver.js',
  'MutationObserver/attributes.js',
  'MutationObserver/callback.js',
  'MutationObserver/characterData.js',
  'MutationObserver/childList.js',
  'MutationObserver/mixed.js',
  'MutationObserver/options.js',
  'MutationObserver/shadow-root.js',
  'MutationObserver/transient.js',
  'Node.js',
  'ParentNodeInterface.js',
  'Range.js',
  'SVGElement.js',
  'SVGElementInstance.js',
  'Selection.js',
  'ShadowRoot.js',
  'Text.js',
  'TouchEvent.js',
  'TreeScope.js',
  'Window.js',
  'XMLHttpRequest.js',
  //'build-json.js',
  'createTable.js',
  'custom-element.js',
  'events.js',
  'microtask.js',
  'paralleltrees.js',
  'reprojection.js',
  'rerender.js',
  'test.js',
  'wrappers.js',
];

modules.forEach(function(inSrc) {
  document.write('<script src="' + base + 'js/' + inSrc + '"></script>');
});
