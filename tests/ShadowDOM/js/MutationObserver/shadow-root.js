/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('MutationObserver', function() {

  suite('Shadow Root', function() {

    var unwrap = ShadowDOMPolyfill.unwrap;

    test('Make no notifications due to render', function() {
      var a = document.createElement('a');
      a.innerHTML = '<b></b>';
      var sr = a.createShadowRoot();
      sr.innerHTML = '<c></c><d><content></content></d>';

      var observer = new MutationObserver(function() {});

      observer.observe(a, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true
      });
      observer.observe(sr, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true
      });

      a.offsetHeight;

      var records = observer.takeRecords();
      assert.equal(records.length, 0);

      assert.equal(unwrap(a).outerHTML, '<a><c></c><d><b></b></d></a>');
    });

    test('Observe ShadowRoot', function() {
      var a = document.createElement('a');
      a.innerHTML = '<b></b>';
      var sr = a.createShadowRoot();
      sr.innerHTML = '<c></c><d><content></content></d>';
      var c = sr.firstChild;
      var d = c.nextSibling;
      var content = d.firstChild;

      var observer = new MutationObserver(function() {});

      observer.observe(sr, {
        childList: true,
        subtree: true
      });

      a.offsetHeight;

      var records = observer.takeRecords();
      assert.equal(records.length, 0);
      assert.equal(unwrap(a).outerHTML, '<a><c></c><d><b></b></d></a>');

      var e = document.createElement('e');
      e.innerHTML = '<f></f><g></g><h></h>';
      var f = e.firstChild;
      var g = f.nextSibling
      var h = e.lastChild;

      var observer2 = new MutationObserver(function() {});
      observer2.observe(e, {
        childList: true,
        subtree: true
      });

      d.insertBefore(g, content);

      assert.equal(unwrap(a).outerHTML, '<a><c></c><d><b></b></d></a>');
      a.offsetHeight;
      assert.equal(unwrap(a).outerHTML, '<a><c></c><d><g></g><b></b></d></a>');

      records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: d,
        addedNodes: [g],
        previousSibling: null,
        nextSibling: content
      });

      records = observer2.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: e,
        removedNodes: [g],
        previousSibling: f,
        nextSibling: h
      });
    });

  });

});