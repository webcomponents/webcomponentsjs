/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

htmlSuite('Events', function() {

  var unwrap = ShadowDOMPolyfill.unwrap;
  var wrap = ShadowDOMPolyfill.wrap;

  try {
    document.createEvent('TouchEvent');
  } catch (ex) {
    // Touch events are not supported
    return;
  }

  function createMockTouch(nativeTarget) {
    return {
      clientX: 1,
      clientY: 2,
      screenX: 3,
      screenY: 4,
      pageX: 5,
      pageY: 6,
      identifier: 7,
      webkitRadiusX: 8,
      webkitRadiusY: 9,
      webkitRotationAngle: 10,
      webkitForce: 11,
      target: nativeTarget
    };
  }

  test('TouchEvent', function() {
    var e = document.createEvent('TouchEvent');
    assert.instanceOf(e, TouchEvent);
    assert.instanceOf(e, UIEvent);
    assert.instanceOf(e, Event);
  });

  test('constructor', function() {
    var e = document.createEvent('TouchEvent');
    assert.equal(TouchEvent, e.constructor);
  });

  test('Touch', function() {
    // There is no way to create a native Touch object so we use a mock impl.

    var target = document.createElement('div');
    var impl = createMockTouch(unwrap(target));
    var touch = new Touch(impl);

    assert.equal(touch.clientX, 1);
    assert.equal(touch.clientY, 2);
    assert.equal(touch.screenX, 3);
    assert.equal(touch.screenY, 4);
    assert.equal(touch.pageX, 5);
    assert.equal(touch.pageY, 6);
    assert.equal(touch.identifier, 7);
    assert.equal(touch.webkitRadiusX, 8);
    assert.equal(touch.webkitRadiusY, 9);
    assert.equal(touch.webkitRotationAngle, 10);
    assert.equal(touch.webkitForce, 11);
    assert.equal(touch.target, target);
  });

  test('TouchList', function() {

    function createMockTouchList(elements) {
      var arr = [];
      for (var i = 0; i < elements.length; i++) {
        arr[i] = createMockTouch(unwrap(elements[i]));
      }
      return arr;
    }

    var a = document.createElement('a');
    var b = document.createElement('b');
    var c = document.createElement('c');
    var d = document.createElement('d');
    var e = document.createElement('e');
    var f = document.createElement('f');

    var mockEvent = {
      __proto__: unwrap(document.createEvent('TouchEvent')).__proto__,
      touches: createMockTouchList([a]),
      targetTouches: createMockTouchList([b, c]),
      changedTouches: createMockTouchList([d, e, f])
    };

    var event = wrap(mockEvent);

    assert.instanceOf(event.touches, TouchList);
    assert.instanceOf(event.targetTouches, TouchList);
    assert.instanceOf(event.changedTouches, TouchList);

    assert.equal(event.touches.length, 1);
    assert.equal(event.targetTouches.length, 2);
    assert.equal(event.changedTouches.length, 3);

    assert.instanceOf(event.touches[0], Touch);
    assert.instanceOf(event.targetTouches[0], Touch);
    assert.instanceOf(event.targetTouches[1], Touch);
    assert.instanceOf(event.changedTouches[0], Touch);
    assert.instanceOf(event.changedTouches[1], Touch);
    assert.instanceOf(event.changedTouches[2], Touch);

    assert.equal(event.touches[0].target, a);
    assert.equal(event.targetTouches[0].target, b);
    assert.equal(event.targetTouches[1].target, c);
    assert.equal(event.changedTouches[0].target, d);
    assert.equal(event.changedTouches[1].target, e);
    assert.equal(event.changedTouches[2].target, f);
  });

});
