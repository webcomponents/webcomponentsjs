/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('upgrade', function() {
  var work;
  var assert = chai.assert;

  setup(function() {
    work = document.createElement('div');
    document.body.appendChild(work);
  });

  teardown(function() {
    document.body.removeChild(work);
  });

  function registerTestComponent(inName, inValue) {
    var C = class extends HTMLElement {
      constructor() {
        customElements.currentTag = 'inName';
        super();
      }
    };
    C.prototype.value = inValue || 'value';
    customElements.define(inName, C);
  }

  function testElements(node, selector, value) {
    Array.prototype.forEach.call(node.querySelectorAll(selector), function(n) {
      assert.equal(n.value, value);
    });
  }

  test('custom element automatically upgrades', function(done) {
    work.innerHTML = '<x-auto></x-auto>';
    var x = work.firstChild;
    // must flush after mutations to avoid false passes
    customElements.flush();
    assert.isUndefined(x.value);
    registerTestComponent('x-auto', 'auto');
    assert.equal(x.value, 'auto');
    done();
  });

  test('custom element automatically upgrades in subtree', function(done) {
    work.innerHTML = '<div></div>';
    var target = work.firstChild;
    target.innerHTML = '<x-auto-sub></x-auto-sub>';
    var x = target.firstChild;
    // must flush after mutations to avoid false passes
    customElements.flush();
    assert.isUndefined(x.value);
    registerTestComponent('x-auto-sub', 'auto-sub');
    assert.equal(x.value, 'auto-sub');
    done();
  });

  test('custom elements automatically upgrade', function(done) {
    registerTestComponent('x-auto1', 'auto1');
    registerTestComponent('x-auto2', 'auto2');
    work.innerHTML = '<div><div><x-auto1></x-auto1><x-auto1></x-auto1>' +
      '</div></div><div><x-auto2><x-auto1></x-auto1></x-auto2>' +
      '<x-auto2><x-auto1></x-auto1></x-auto2></div>';
    customElements.flush();
    testElements(work, 'x-auto1', 'auto1');
    testElements(work, 'x-auto2', 'auto2');
    done();
  });

  test('custom elements automatically upgrade in subtree', function(done) {
    registerTestComponent('x-auto-sub1', 'auto-sub1');
    registerTestComponent('x-auto-sub2', 'auto-sub2');
    work.innerHTML = '<div></div>';
    var target = work.firstChild;
    target.innerHTML = '<div><div><x-auto-sub1></x-auto-sub1><x-auto-sub1></x-auto-sub1>' +
      '</div></div><div><x-auto-sub2><x-auto-sub1></x-auto-sub1></x-auto-sub2>' +
      '<x-auto-sub2><x-auto-sub1></x-auto-sub1></x-auto-sub2></div>';
    customElements.flush();
    testElements(target, 'x-auto-sub1', 'auto-sub1');
    testElements(target, 'x-auto-sub2', 'auto-sub2');
    done();
  });

  test('CustomElements.upgrade upgrades custom element syntax', function() {
    registerTestComponent('x-foo31', 'foo');
    work.innerHTML = '<x-foo31>Foo</x-foo31>';
    var xfoo = work.firstChild;
    customElements.flush();
    assert.equal(xfoo.value, 'foo');
  });

  test('mutation observer upgrades custom element syntax', function(done) {
    registerTestComponent('x-foo32', 'foo');
    work.innerHTML = '<x-foo32>Foo</x-foo32>';
    customElements.flush();
    var xfoo = work.firstChild;
    assert.equal(xfoo.value, 'foo');
    done();
  });

  test('document.register upgrades custom element syntax', function() {
    work.innerHTML = '<x-foo33>Foo</x-foo33>';
    registerTestComponent('x-foo33', 'foo');
    var xfoo = work.firstChild;
    assert.equal(xfoo.value, 'foo');
  });

  test('CustomElements.upgrade upgrades custom element syntax', function() {
    registerTestComponent('x-zot', 'zot');
    registerTestComponent('x-zim', 'zim');
    work.innerHTML = '<x-zot><x-zim></x-zim></x-zot>';
    var xzot = work.firstChild, xzim = xzot.firstChild;
    customElements.flush();
    assert.equal(xzot.value, 'zot');
    assert.equal(xzim.value, 'zim');
  });
});
