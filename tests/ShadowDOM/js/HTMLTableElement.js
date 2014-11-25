/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('HTMLTableElement', function() {

  test('instanceof', function() {
    var table = createTable();
    assert.instanceOf(table, HTMLTableElement);
  });

  test('constructor', function() {
    assert.equal(HTMLTableElement,
                 document.createElement('table').constructor);
  });

  test('caption', function() {
    var table = createTable();
    assert.equal(table.caption.localName, 'caption');
  });

  test('createCaption', function() {
    var table = createTable();
    var caption = table.createCaption();
    assert.equal(caption.localName, 'caption');
    assert.instanceOf(caption, HTMLElement);
  });

  test('tHead', function() {
    var table = createTable();
    assert.equal(table.tHead.localName, 'thead');
    assert.instanceOf(table.tHead, HTMLTableSectionElement);
  });

  test('createTHead', function() {
    var table = createTable();
    var thead = table.createTHead();
    assert.equal(thead.localName, 'thead');
    assert.instanceOf(thead, HTMLTableSectionElement);
  });

  test('tFoot', function() {
    var table = createTable();
    assert.equal(table.tFoot.localName, 'tfoot');
    assert.instanceOf(table.tFoot, HTMLTableSectionElement);
  });

  test('createTFoot', function() {
    var table = createTable();
    var tfoot = table.createTFoot();
    assert.equal(tfoot.localName, 'tfoot');
    assert.instanceOf(tfoot, HTMLTableSectionElement);
  });

  test('tBodies', function() {
    var table = createTable();
    assert.instanceOf(table.tBodies, HTMLCollection);
    assert.equal(table.tBodies.length, 2);

    assert.equal(table.tBodies[0], table.querySelector('tbody'));
  });

  test('createTBody', function() {
    var table = createTable();
    var tbody = table.createTBody();
    assert.equal(tbody.localName, 'tbody');
    assert.instanceOf(tbody, HTMLTableSectionElement);
  });

  test('rows', function() {
    var table = createTable();
    assert.instanceOf(table.rows, HTMLCollection);
    assert.equal(table.rows.length, 8);
  });

  test('insertRow', function() {
    var table = createTable();
    var tr = table.insertRow(1);
    assert.instanceOf(tr, HTMLTableRowElement);
    assert.equal(tr.localName, 'tr');
  });

});
