/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('XMLHttpRequest', function() {

  var wrap = ShadowDOMPolyfill.wrap;
  var unwrap = ShadowDOMPolyfill.unwrap;

  test('instanceof', function() {
    var xhr = new XMLHttpRequest();
    assert.instanceOf(xhr, XMLHttpRequest);
  });

  test('send', function() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', location.href);
    xhr.send(new FormData());
  });

});
