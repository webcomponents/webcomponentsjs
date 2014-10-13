/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
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
