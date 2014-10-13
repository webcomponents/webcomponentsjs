/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTMLLegendElement', function() {

  test('form', function() {
    var form = document.createElement('form');
    var fieldSet = document.createElement('fieldset');
    var legend = document.createElement('legend');
    form.appendChild(fieldSet);
    fieldSet.appendChild(legend);
    assert.equal(legend.form, form);
  });

  test('instanceof', function() {
    assert.instanceOf(document.createElement('legend'), HTMLLegendElement);
  });

  test('constructor', function() {
    assert.equal(HTMLLegendElement,
                 document.createElement('legend').constructor);
  });


});
