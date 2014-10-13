/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('MutationObserver', function() {

  suite('transient', function() {

    test('attr', function() {
      var div = document.createElement('div');
      var child = div.appendChild(document.createElement('div'));
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        attributes: true,
        subtree: true
      });
      div.removeChild(child);
      child.setAttribute('a', 'A');

      var records = observer.takeRecords();
      assert.equal(records.length, 1);

      expectMutationRecord(records[0], {
        type: 'attributes',
        target: child,
        attributeName: 'a',
        attributeNamespace: null
      });

      child.setAttribute('b', 'B');

      records = observer.takeRecords();
      assert.equal(records.length, 1);

      expectMutationRecord(records[0], {
        type: 'attributes',
        target: child,
        attributeName: 'b',
        attributeNamespace: null
      });
    });

    test('attr callback', function(cont) {
      var div = document.createElement('div');
      var child = div.appendChild(document.createElement('div'));
      var i = 0;
      var observer = new MutationObserver(function(records) {
        i++;
        if (i > 1)
          expect().fail();

        assert.equal(records.length, 1);

        expectMutationRecord(records[0], {
          type: 'attributes',
          target: child,
          attributeName: 'a',
          attributeNamespace: null
        });

        // The transient observers are removed before the callback is called.
        child.setAttribute('b', 'B');
        records = observer.takeRecords();
        assert.equal(records.length, 0);

        cont();
      });

      observer.observe(div, {
        attributes: true,
        subtree: true
      });

      div.removeChild(child);
      child.setAttribute('a', 'A');
    });

    test('attr, make sure transient gets removed', function(cont) {
      var div = document.createElement('div');
      var child = div.appendChild(document.createElement('div'));
      var i = 0;
      var observer = new MutationObserver(function(records) {
        i++;
        if (i > 1)
          expect().fail();

        assert.equal(records.length, 1);

        expectMutationRecord(records[0], {
          type: 'attributes',
          target: child,
          attributeName: 'a',
          attributeNamespace: null
        });

        step2();
      });

      observer.observe(div, {
        attributes: true,
        subtree: true
      });

      div.removeChild(child);
      child.setAttribute('a', 'A');

      function step2() {
        var div2 = document.createElement('div');
        var observer2 = new MutationObserver(function(records) {
          i++;
          if (i > 2)
            expect().fail();

          assert.equal(records.length, 1);

          expectMutationRecord(records[0], {
            type: 'attributes',
            target: child,
            attributeName: 'b',
            attributeNamespace: null
          });

          cont();
        });

        observer2.observe(div2, {
          attributes: true,
          subtree: true,
        });

        div2.appendChild(child);
        child.setAttribute('b', 'B');
      }
    });

    test('characterData', function() {
      var div = document.createElement('div');
      var child = div.appendChild(document.createTextNode('text'));
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        characterData: true,
        subtree: true
      });
      div.removeChild(child);
      child.data = 'changed';

      var records = observer.takeRecords();
      assert.equal(records.length, 1);

      expectMutationRecord(records[0], {
        type: 'characterData',
        target: child
      });

      child.data += ' again';

      records = observer.takeRecords();
      assert.equal(records.length, 1);

      expectMutationRecord(records[0], {
        type: 'characterData',
        target: child
      });
    });

    test('characterData callback', function(cont) {
      var div = document.createElement('div');
      var child = div.appendChild(document.createTextNode('text'));
      var i = 0;
      var observer = new MutationObserver(function(records) {
        i++;
        if (i > 1)
          expect().fail();

        assert.equal(records.length, 1);

        expectMutationRecord(records[0], {
          type: 'characterData',
          target: child
        });

        // The transient observers are removed before the callback is called.
        child.data += ' again';
        records = observer.takeRecords();
        assert.equal(records.length, 0);

        cont();
      });
      observer.observe(div, {
        characterData: true,
        subtree: true
      });
      div.removeChild(child);
      child.data = 'changed';
    });

    test('childList', function() {
      var div = document.createElement('div');
      var child = div.appendChild(document.createElement('div'));
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true,
        subtree: true
      });
      div.removeChild(child);
      var grandChild = child.appendChild(document.createElement('span'));

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        removedNodes: [child]
      });

      expectMutationRecord(records[1], {
        type: 'childList',
        target: child,
        addedNodes: [grandChild]
      });

      child.removeChild(grandChild);

      records = observer.takeRecords();
      assert.equal(records.length, 1);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: child,
        removedNodes: [grandChild]
      });
    });

    test('childList callback', function(cont) {
      var div = document.createElement('div');
      var child = div.appendChild(document.createElement('div'));
      var i = 0;
      var observer = new MutationObserver(function(records) {
        i++;
        if (i > 1)
          expect().fail();

        assert.equal(records.length, 2);

        expectMutationRecord(records[0], {
          type: 'childList',
          target: div,
          removedNodes: [child]
        });

        expectMutationRecord(records[1], {
          type: 'childList',
          target: child,
          addedNodes: [grandChild]
        });

        // The transient observers are removed before the callback is called.
        child.removeChild(grandChild);

        records = observer.takeRecords();
        assert.equal(records.length, 0);

        cont();
      });
      observer.observe(div, {
        childList: true,
        subtree: true
      });
      div.removeChild(child);
      var grandChild = child.appendChild(document.createElement('span'));
    });

    // https://dom.spec.whatwg.org/#notify-mutation-observers
    test('removed at end of microtask', function(done) {
      var div = document.createElement('div');
      var child = div.appendChild(document.createTextNode('text'));
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        characterData: true,
        subtree: true
      });
      div.removeChild(child);

      records = observer.takeRecords();
      assert.equal(records.length, 0);

      // Run after all other end-of-microtask things, like observers, have
      // had their chance to run. Use `setTimeout(4)` to keep the test isolated
      // from details of the MutationObserver system and to have it run late
      // enough on browsers without true microtasks.
      setTimeout(function() {
        child.data = 'changed';

        records = observer.takeRecords();
        assert.equal(records.length, 0);

        done();
      }, 4);
    });

  });

});