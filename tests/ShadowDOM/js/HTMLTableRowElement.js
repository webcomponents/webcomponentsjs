/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
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
