/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('observe', function() {
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
    var proto = Object.create(HTMLElement.prototype);
    proto.value = inValue || 'value';
    document.registerElement(inName, {
      prototype: proto
    });
  }

  function testElements(node, selector, value) {
    Array.prototype.forEach.call(node.querySelectorAll(selector), function(n) {
      assert.equal(n.value, value);
    });
  }

  test('custom element automatically upgrades', function(done) {
    work.innerHTML = '<x-auto></x-auto>';
    var x = work.firstChild;
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
    CustomElements.takeRecords();
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
    CustomElements.takeRecords();
    testElements(target, 'x-auto-sub1', 'auto-sub1');
    testElements(target, 'x-auto-sub2', 'auto-sub2');
    done();
  });
});
