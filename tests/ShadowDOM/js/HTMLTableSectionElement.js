/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('HTMLTableSectionElement', function() {

  test('instanceof', function() {
    var table = createTable();
    var thead = table.querySelector('thead');
    assert.instanceOf(thead, HTMLTableSectionElement);
    var tfoot = table.querySelector('tfoot');
    assert.instanceOf(tfoot, HTMLTableSectionElement);
  });

  test('constructor', function() {
    var table = createTable();
    var thead = table.querySelector('thead');
    assert.equal(HTMLTableSectionElement, thead.constructor);
    var tfoot = table.querySelector('tfoot');
    assert.equal(HTMLTableSectionElement, tfoot.constructor);
  });

  test('rows', function() {
    var table = createTable();
    var thead = table.querySelector('thead');
    assert.instanceOf(thead.rows, HTMLCollection);
    assert.equal(thead.rows.length, 2);

    var tbody = table.querySelector('tbody');
    assert.instanceOf(tbody.rows, HTMLCollection);
    assert.equal(tbody.rows.length, 2);

    var tfoot = table.querySelector('tfoot');
    assert.instanceOf(tfoot.rows, HTMLCollection);
    assert.equal(tfoot.rows.length, 2);
  });

  test('insertRow', function() {
    var table = createTable();
    var thead = table.querySelector('thead');
    var tr = thead.insertRow(1);
    assert.instanceOf(tr, HTMLTableRowElement);
    assert.equal(tr.localName, 'tr');

    var tbody = table.querySelector('tbody');
    tr = thead.insertRow(1);
    assert.instanceOf(tr, HTMLTableRowElement);
    assert.equal(tr.localName, 'tr');

    var tfoot = table.querySelector('tfoot');
    tr = thead.insertRow(1);
    assert.instanceOf(tr, HTMLTableRowElement);
    assert.equal(tr.localName, 'tr');
  });

});
