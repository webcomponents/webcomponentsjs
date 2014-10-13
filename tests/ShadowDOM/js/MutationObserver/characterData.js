/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('MutationObserver', function() {

  suite('characterData', function() {

    test('characterData', function() {
      var text = document.createTextNode('abc');
      var observer = new MutationObserver(function() {});
      observer.observe(text, {
        characterData: true
      });
      text.data = 'def';
      text.data = 'ghi';

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'characterData',
        target: text
      });
      expectMutationRecord(records[1], {
        type: 'characterData',
        target: text
      });
    });

    test('characterData with old value', function() {
      var text = document.createTextNode('abc');
      var observer = new MutationObserver(function() {});
      observer.observe(text, {
        characterData: true,
        characterDataOldValue: true
      });
      text.data = 'def';
      text.data = 'ghi';

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'characterData',
        target: text,
        oldValue: 'abc'
      });
      expectMutationRecord(records[1], {
        type: 'characterData',
        target: text,
        oldValue: 'def'
      });
    });

    test('characterData change in subtree should not generate a record',
        function() {
      var div = document.createElement('div');
      var text = div.appendChild(document.createTextNode('abc'));
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        characterData: true
      });
      text.data = 'def';
      text.data = 'ghi';

      var records = observer.takeRecords();
      assert.equal(records.length, 0);
    });

    test('characterData change in subtree',
        function() {
      var div = document.createElement('div');
      var text = div.appendChild(document.createTextNode('abc'));
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        characterData: true,
        subtree: true
      });
      text.data = 'def';
      text.data = 'ghi';

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'characterData',
        target: text
      });
      expectMutationRecord(records[1], {
        type: 'characterData',
        target: text
      });
    });

  });

});