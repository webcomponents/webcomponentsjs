/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTMLOptionElement', function() {

  test('form', function() {
    var form = document.createElement('form');
    var select = document.createElement('select');
    var option = document.createElement('option');
    form.appendChild(select);
    select.appendChild(option);
    assert.equal(option.form, form);
  });

  test('instanceof', function() {
    var option = document.createElement('option');
    assert.instanceOf(option, HTMLOptionElement);
    assert.instanceOf(option, Option);
    assert.instanceOf(option, HTMLElement);
  });

  test('constructor', function() {
    assert.equal(HTMLOptionElement,
                 document.createElement('option').constructor);
    assert.equal(HTMLOptionElement, new Option().constructor);
  });

  test('Option', function() {
    var option = new Option();
    assert.instanceOf(option, HTMLOptionElement);
    assert.instanceOf(option, Option);
    assert.instanceOf(option, HTMLElement);
  });

  test('Option arguments', function() {
    var option = new Option();
    assert.equal(option.text, '');
    assert.equal(option.value, '');
    assert.isFalse(option.defaultSelected);
    assert.isFalse(option.selected);

    var option = new Option(' more  text  ');
    assert.equal(option.text, 'more text');
    // on IE10, the value includes the surrounding spaces; trim to workaround
    assert.equal(option.value.trim(), 'more text');
    assert.isFalse(option.defaultSelected);
    assert.isFalse(option.selected);

    var option = new Option('text', 'value');
    assert.equal(option.text, 'text');
    assert.equal(option.value, 'value');
    assert.isFalse(option.defaultSelected);
    assert.isFalse(option.selected);

    var option = new Option('text', 'value', true);
    assert.equal(option.text, 'text');
    assert.equal(option.value, 'value');
    assert.isTrue(option.defaultSelected);
    assert.isFalse(option.selected);

    var option = new Option('text', 'value', true, true);
    assert.equal(option.text, 'text');
    assert.equal(option.value, 'value');
    assert.isTrue(option.defaultSelected);
    assert.isTrue(option.selected);
  });

  test('Option called as function', function() {
    assert.throws(Option, TypeError);
  });

  test('Option basics', function() {
    var option = new Option();
    assert.equal('option', option.localName);

    var select = document.createElement('select');
    select.appendChild(option);

    assert.equal(select.firstChild, option);
    assert.equal('<select><option></option></select>', select.outerHTML);
  });

});
