/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTMLTextAreaElement', function() {

  test('form', function() {
    var form = document.createElement('form');
    var textArea = document.createElement('textarea');
    form.appendChild(textArea);
    assert.equal(textArea.form, form);
  });

  test('instanceof', function() {
    assert.instanceOf(document.createElement('textarea'), HTMLTextAreaElement);
  });

  test('constructor', function() {
    assert.equal(HTMLTextAreaElement,
                 document.createElement('textarea').constructor);
  });

});
