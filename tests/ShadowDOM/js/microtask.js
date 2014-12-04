/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('Microtask', function() {

  var setEndOfMicrotask = ShadowDOMPolyfill.setEndOfMicrotask;

  test('single', function(done) {
    setEndOfMicrotask(done);
  });

  test('multiple', function(done) {
    var count = 0;
    setEndOfMicrotask(function() {
      count++;
      assert.equal(2, count);
    });
    setEndOfMicrotask(function() {
      count++;
      assert.equal(3, count);
    });
    setEndOfMicrotask(function() {
      count++;
      assert.equal(4, count);
      done();
    });
    count++;
  });

  test('nested', function(done) {
    var count = 0;
    setEndOfMicrotask(function() {
      assert.equal(1, count);
      setEndOfMicrotask(function() {
        assert.equal(2, count);
        done();
      });
      count++;
    });
    count++;
  });

});
