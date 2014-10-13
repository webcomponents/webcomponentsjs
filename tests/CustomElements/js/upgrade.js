/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('upgradeElements', function() {
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
  
  test('CustomElements.upgrade upgrades custom element syntax', function() {
    registerTestComponent('x-foo31', 'foo');
    work.innerHTML = '<x-foo31>Foo</x-foo31>';
    var xfoo = work.firstChild;
    CustomElements.upgradeAll(xfoo);
    assert.equal(xfoo.value, 'foo');
  });

  test('mutation observer upgrades custom element syntax', function(done) {
    registerTestComponent('x-foo32', 'foo');
    work.innerHTML = '<x-foo32>Foo</x-foo32>';
    CustomElements.takeRecords();
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
    CustomElements.upgradeAll(work);
    assert.equal(xzot.value, 'zot');
    assert.equal(xzim.value, 'zim');
  });
  
  test('CustomElements.upgrade upgrades native extendor', function() {
    var XButtonProto = Object.create(HTMLButtonElement.prototype);
    XButtonProto.test = 'xbutton';
    document.registerElement('x-button', {
      extends: 'button',
      prototype: XButtonProto
    });
    
    work.innerHTML = '<button is="x-button"></button>';
    var xbutton = work.firstChild;
    CustomElements.upgradeAll(xbutton);
    assert.equal(xbutton.test, 'xbutton');
  });
  
  
  test('CustomElements.upgrade upgrades extendor of native extendor', function() {
    var XInputProto = Object.create(HTMLInputElement.prototype);
    XInputProto.xInput = 'xInput';
    var XInput = document.registerElement('x-input', {
      extends: 'input',
      prototype: XInputProto
    });
    var XSpecialInputProto = Object.create(XInput.prototype);
    XSpecialInputProto.xSpecialInput = 'xSpecialInput';
    var XSpecialInput = document.registerElement('x-special-input', {
      extends: 'input',
      prototype: XSpecialInputProto
    });
    work.innerHTML = '<input is="x-special-input">';
    var x = work.firstChild;
    CustomElements.upgradeAll(x);
    assert.equal(x.xInput, 'xInput');
    assert.equal(x.xSpecialInput, 'xSpecialInput');
  });
  
  
  test('CustomElements.upgrade upgrades native extendor', function() {
    var YButtonProto = Object.create(HTMLButtonElement.prototype);
    YButtonProto.test = 'ybutton';
    document.registerElement('y-button', {
      extends: 'button',
      prototype: YButtonProto
    });
    
    work.innerHTML = '<button is="y-button">0</button>' +
      '<div><button is="y-button">1</button></div>' +
      '<div><div><button is="y-button">2</button></div></div>';
    CustomElements.upgradeAll(work);
    var b$ = work.querySelectorAll('[is=y-button]');
    Array.prototype.forEach.call(b$, function(b, i) {
      assert.equal(b.test, 'ybutton');
      assert.equal(b.textContent, i);
    });
  });

});