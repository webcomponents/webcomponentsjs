/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTMLTableRowElement', function() {

  test('instanceof', function() {
    var table = createTable();
    var row = table.querySelector('tr');
    assert.instanceOf(row, HTMLTableRowElement);
  });

  test('constructor', function() {
    var table = createTable();
    var row = table.querySelector('tr');
    assert.equal(HTMLTableRowElement, row.constructor);
  });

  test('cells', function() {
    var table = createTable();
    var row = table.querySelector('tr');
    assert.instanceOf(row.cells, HTMLCollection);
    assert.equal(row.cells.length, 3);
  });

  test('insertCell', function() {
    var table = createTable();
    var row = table.querySelector('tr');
    var newCell = row.insertCell(0);
    assert.equal(newCell.localName, 'td');
  });

});
