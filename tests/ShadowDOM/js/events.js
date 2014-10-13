/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

htmlSuite('Events', function() {

  var unwrap = ShadowDOMPolyfill.unwrap;
  var wrap = ShadowDOMPolyfill.wrap;

  function createMouseOverEvent(relatedTarget) {
    var event = document.createEvent('MouseEvent');
    event.initMouseEvent(
        'mouseover',  // typeArg
        true,  // canBubbleArg
        false,  // cancelableArg
        window,  // viewArg
        0,  // detailArg
        0,  // screenXArg
        0,  // screenYArg
        0,  // clientXArg
        0,  // clientYArg
        false,  // ctrlKeyArg
        false,  // altKeyArg
        false,  // shiftKeyArg
        false,  // metaKeyArg
        0,  // buttonArg
        relatedTarget);  // relatedTargetArg
    return event;
  }

  var div, a, b, c, d, e, f, content, sr;

  function createTestTree() {
    var doc = wrap(document);
    div = doc.createElement('div');
    div.innerHTML = '<a></a><b><c></c><d></d></b>';
    a = div.firstChild;
    b = div.lastChild;
    c = b.firstChild;
    d = b.lastChild;

    sr = b.createShadowRoot();
    sr.innerHTML = '<e></e><content></content><f></f>';
    e = sr.firstChild;
    content = e.nextSibling;
    f = sr.lastChild;

    // dispatchEvent with a mouseover does not work in WebKit if the element
    // is not in the document.
    // https://bugs.webkit.org/show_bug.cgi?id=113336
    doc.body.appendChild(div);

    div.offsetWidth;  // trigger recalc
  }

  teardown(function() {
    if (div && div.parentNode)
      div.parentNode.removeChild(div);
    div = a = b = c = d = e = f = content = sr = undefined;
  });

  test('addEventListener', function() {
    div = document.createElement('div');
    wrap(document).body.appendChild(div);
    var div1 = div.appendChild(document.createElement('div'));
    var div2 = div.appendChild(document.createElement('div'));
    var calls = 0;
    function f(e) {
      calls++;
    }

    div1.addEventListener('click', f, true);
    div2.addEventListener('click', f, true);

    div1.click();
    div2.click();
    assert.equal(calls, 2);

    div1.removeEventListener('click', f, true);

    div1.click();
    div2.click();
    assert.equal(calls, 3);

    div2.removeEventListener('click', f, true);

    div1.click();
    div2.click();
    assert.equal(calls, 3);
  });

  test('removeEventListener', function() {
    div = document.createElement('div');
    wrap(document).body.appendChild(div);
    var calls = 0;
    function f(e) {
      calls++;
    }
    function g(e) {
      calls++;
    }

    div.addEventListener('click', f, true);
    div.addEventListener('click', g, true);

    div.click();
    assert.equal(calls, 2);

    div.removeEventListener('click', f, true);

    var event = document.createEvent('MouseEvent');
    event.initMouseEvent(
        'click',  // type
        true,  // canBubble
        true,  // cancelable
        window,  // view
        0,  // detail
        0,  // screenX
        0,  // screenY
        0,  // clientX
        0,  // clientY
        false,  // ctrlKey
        false,  // altKey
        false,  // shiftKey
        false,  // metaKey
        0,  // button
        null);  // relatedTarget
    div.dispatchEvent(event);
    assert.equal(calls, 3);
  });

  test('event', function() {
    var div = document.createElement('div');
    var calls = 0;
    var f;
    div.addEventListener('x', f = function(e) {
      calls++;
      assert.equal(this, div);
      assert.equal(e.target, div);
      assert.equal(e.currentTarget, div);
      assert.equal(e.type, 'x');
    }, false);
    var e = document.createEvent('Event');
    e.initEvent('x', true, true);
    div.dispatchEvent(e);
    assert.equal(calls, 1);

    div.removeEventListener('x', f, false);
    var e2 = document.createEvent('Event');
    e2.initEvent('x', true, true);
    div.dispatchEvent(e2);
    assert.equal(calls, 1);
  });

  test('mouse event', function() {
    div = document.createElement('div');
    wrap(document).body.appendChild(div);
    var called = false;
    div.addEventListener('click', function(e) {
      called = true;
      assert.equal(this, div);
      assert.equal(e.target, div);
      assert.equal(e.currentTarget, div);
      assert.equal(e.relatedTarget, null);
      assert.equal(e.type, 'click');
    }, false);
    div.click();
    assert.isTrue(called);
  });

  test('stopPropagation', function() {
    var a = document.createElement('a');
    a.innerHTML = '<b><c>d</c></b>';
    var b = a.firstChild;
    var c = b.firstChild;

    var log = [];
    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
      e.stopPropagation();
    }, true);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    c.click();
    assertArrayEqual(log, [a, Event.CAPTURING_PHASE, b, Event.CAPTURING_PHASE]);
  });

  test('stopPropagation during bubble', function() {
    var a = document.createElement('a');
    a.innerHTML = '<b><c>d</c></b>';
    var b = a.firstChild;
    var c = b.firstChild;

    var log = [];
    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
      e.stopPropagation();
    }, false);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    c.click();
    assertArrayEqual(log, [
      a, Event.CAPTURING_PHASE,
      b, Event.CAPTURING_PHASE,
      c, Event.AT_TARGET,
      c, Event.AT_TARGET,
      b, Event.BUBBLING_PHASE
    ]);
  });

  test('stopPropagation at target', function() {
    var a = document.createElement('a');
    a.innerHTML = '<b><c>d</c></b>';
    var b = a.firstChild;
    var c = b.firstChild;

    var log = [];
    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
      e.stopPropagation();
    }, true);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    c.click();
    assertArrayEqual(log, [
      a, Event.CAPTURING_PHASE,
      b, Event.CAPTURING_PHASE,
      c, Event.AT_TARGET,
      c, Event.AT_TARGET
    ]);
  });

  test('stopImmediatePropagation', function() {
    var a = document.createElement('a');
    a.innerHTML = '<b><c>d</c></b>';
    var b = a.firstChild;
    var c = b.firstChild;

    var log = [];
    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
      e.stopImmediatePropagation();
    }, true);

    b.addEventListener('click', function(e) {
      log.push('FAIL', e.currentTarget, e.eventPhase);
    }, true);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    c.click();
    assertArrayEqual(log, [a, Event.CAPTURING_PHASE, b, Event.CAPTURING_PHASE]);
  });

  test('click with shadow', function() {
    function addListener(target, currentTarget, opt_phase) {
      var phases;
      if (opt_phase === Event.AT_TARGET)
        phases = [opt_phase];
      else
        phases = [Event.CAPTURING_PHASE, Event.BUBBLING_PHASE];

      calls += phases.length;

      phases.forEach(function(phase) {
        var capture = phase === Event.CAPTURING_PHASE;
        currentTarget.addEventListener('click', function f(e) {
          calls--;
          if (e.target === e.currentTarget)
            phase = Event.AT_TARGET;
          assert.equal(e.eventPhase, phase);
          assert.equal(e.target, target);
          assert.equal(e.currentTarget, currentTarget);
          assert.equal(e.currentTarget, this);
          currentTarget.removeEventListener('click', f, capture);
        }, capture);
      });
    }

    var div = document.createElement('div');
    div.innerHTML = '<a><b></b></a>';
    var a = div.firstChild;
    var b = a.firstChild;
    var sr = div.createShadowRoot();
    sr.innerHTML = '<p><content></content></p>';
    var p = sr.firstChild;
    var content = p.firstChild;

    var calls = 0;

    addListener(b, div);
    addListener(b, sr);
    addListener(b, p);
    addListener(b, content);
    addListener(b, a);
    addListener(b, b, Event.AT_TARGET);
    b.click();
    assert.equal(calls, 0);

    addListener(div, div);
    addListener(content, sr);
    addListener(content, p);
    addListener(content, content, Event.AT_TARGET);
    content.click();
    assert.equal(calls, 0);

    var sr2 = div.createShadowRoot();
    sr2.innerHTML = '<q><shadow></shadow></q>';
    var q = sr2.firstChild;
    var shadow = q.firstChild;

    addListener(b, div);
    addListener(b, sr2);
    addListener(b, q);
    addListener(b, shadow);
    addListener(b, sr);
    addListener(b, p);
    addListener(b, content);
    addListener(b, a);
    addListener(b, b, Event.AT_TARGET);

    b.click();
    assert.equal(calls, 0);
  });

  test('mouseover retarget to host', function() {
    createTestTree();

    var calls = 0;
    var event = createMouseOverEvent(e);
    a.addEventListener('mouseover', function handler(event) {
      calls++;
      assert.equal(event.target, a);
      assert.equal(event.relatedTarget, b);  // adjusted to parent
      a.removeEventListener('mouseover', handler);
    });
    a.dispatchEvent(event);
    assert.equal(1, calls);
  });

  test('mouse over should not escape shadow dom', function() {
    createTestTree();

    var calls = 0;
    var event = createMouseOverEvent(e);
    a.addEventListener('mouseover', function handler(event) {
      calls++;
      a.removeEventListener('mouseover', handler);
    });
    a.addEventListener('mouseover', function handler(event) {
      calls++;
      a.removeEventListener('mouseover', handler, true);
    }, true);
    f.dispatchEvent(event);
    assert.equal(0, calls);
  });

  test('click listen on shadow root', function() {
    createTestTree();

    var calls = 0;
    sr.addEventListener('click', function handler(event) {
      calls++;
      assert.equal(event.target, f);
      assert.equal(event.currentTarget, sr);
      sr.removeEventListener('click', handler);
    });
    f.click();
    assert.equal(1, calls);
  });

  test('mouse over listen on shadow root', function() {
    // This one only works when we run fewer tests.
    // TODO(arv): Figure out why.
    return;

    createTestTree();

    var calls = 0;
    var event = createMouseOverEvent(e);
    sr.addEventListener('mouseover', function handler(event) {
      calls++;
      assert.equal(event.target, f);
      assert.equal(event.currentTarget, sr);
      assert.equal(event.relatedTarget, e);
      sr.removeEventListener('mouseover', handler);
    });
    f.dispatchEvent(event);
    assert.equal(1, calls);
  });

  test('click should be treated as AT_TARGET on the host when a click ' +
       'happened in its shadow', function() {
    createTestTree();

    var calls = 0;
    b.addEventListener('click', function handler(event) {
      calls++;
      assert.equal(event.eventPhase, Event.AT_TARGET);
      b.removeEventListener('click', handler, false);
    }, false);
    e.addEventListener('click', function handler(event) {
      calls++;
      e.removeEventListener('click', handler, false);
    }, false);
    e.click();
    assert.equal(2, calls);
  });

  test('Handle invalid event listener', function() {
    var div = document.createElement('div');
    div.addEventListener('click', undefined);
    div.click();
  });

  test('new Event', function() {
    var e = new Event('x', {bubbles: true, cancelable: true});
    assert.equal(e.type, 'x');
    assert.equal(e.bubbles, true);
    assert.equal(e.cancelable, true);
    assert.instanceOf(e, Event);
    assert.equal(Event, e.constructor);
  });

  test('new CustomEvent', function() {
    var e = new CustomEvent('x', {detail: 42});
    assert.equal(e.type, 'x');
    assert.equal(e.detail, 42);
    assert.instanceOf(e, CustomEvent);
    assert.equal(CustomEvent, e.constructor);
  });

  test('new MouseEvent', function() {
    var div = document.createElement('div');
    var e = new MouseEvent('mouseover', {relatedTarget: div});
    assert.equal(e.type, 'mouseover');
    assert.equal(e.relatedTarget, div);
    assert.instanceOf(e, MouseEvent);
    assert.equal(MouseEvent, e.constructor);
  });

  /**
   * Creates a deep tree, (all nodes but the leaf have 1 child)
   */
  function getPropagationTree() {
    var tree = {};
    var div = tree.div = document.createElement('div');
    div.innerHTML = '<a><b><c></c></b></a>';
    var a = tree.a = div.firstChild;
    var b = tree.b = a.firstChild;
    var c = tree.c = b.firstChild;
    var sr = tree.sr = b.createShadowRoot();
    sr.innerHTML = '<d><content></content></d>';
    var d = tree.d = sr.firstChild;
    var content = tree.content = d.firstChild;
    var sr2 = tree.sr2 = d.createShadowRoot();
    sr2.innerHTML = '<e><content></content></e>';
    var e = tree.e = sr2.firstChild;
    var content2 = tree.content2 = e.firstChild;

    return tree;
  }

  function getDisplayName(node) {
    if (!node)
      return String(node);
    return node.displayName;
  }

  function getPhaseName(event) {
    switch (event.eventPhase) {
      case Event.BUBBLING_PHASE:
        return 'BUBBLING_PHASE';
      case Event.AT_TARGET:
        return 'AT_TARGET';
      case Event.CAPTURING_PHASE:
        return 'CAPTURING_PHASE';
    }
  }

  function addListeners(tree, type, log) {
    Object.keys(tree).forEach(function(key) {
      var node = tree[key];
      node.displayName = key;
      [true, false].forEach(function(capture) {
        node.addEventListener(type, function f(e) {
          assert.equal(e.currentTarget, node);
          assert.equal(e.currentTarget, this);
          log.push(getDisplayName(node) + ', ' +
                   getDisplayName(e.target) + ', ' +
                   getDisplayName(e.relatedTarget) + ', ' +
                   getPhaseName(e));
        }, capture);
      });
    });
  }

  test('propagation (bubbles)', function() {
    var tree = getPropagationTree();
    var log = [];
    addListeners(tree, 'x', log);

    var e = new Event('x', {bubbles: true});
    tree.c.dispatchEvent(e);

    var expected = [
      'div, c, undefined, CAPTURING_PHASE',
      'a, c, undefined, CAPTURING_PHASE',
      'b, c, undefined, CAPTURING_PHASE',
      'sr, c, undefined, CAPTURING_PHASE',
      'd, c, undefined, CAPTURING_PHASE',
      'sr2, c, undefined, CAPTURING_PHASE',
      'e, c, undefined, CAPTURING_PHASE',
      'content2, c, undefined, CAPTURING_PHASE',
      'content, c, undefined, CAPTURING_PHASE',
      'c, c, undefined, AT_TARGET',
      'c, c, undefined, AT_TARGET',
      'content, c, undefined, BUBBLING_PHASE',
      'content2, c, undefined, BUBBLING_PHASE',
      'e, c, undefined, BUBBLING_PHASE',
      'sr2, c, undefined, BUBBLING_PHASE',
      'd, c, undefined, BUBBLING_PHASE',
      'sr, c, undefined, BUBBLING_PHASE',
      'b, c, undefined, BUBBLING_PHASE',
      'a, c, undefined, BUBBLING_PHASE',
      'div, c, undefined, BUBBLING_PHASE',
    ];
    assertArrayEqual(expected, log);

    log.length = 0;
    var e = new Event('x', {bubbles: true});
    tree.e.dispatchEvent(e);

    var expected = [
      'div, b, undefined, CAPTURING_PHASE',
      'a, b, undefined, CAPTURING_PHASE',
      'sr, d, undefined, CAPTURING_PHASE',
      'sr2, e, undefined, CAPTURING_PHASE',
      'e, e, undefined, AT_TARGET',
      'e, e, undefined, AT_TARGET',
      'sr2, e, undefined, BUBBLING_PHASE',
      'd, d, undefined, AT_TARGET',
      'd, d, undefined, AT_TARGET',
      'sr, d, undefined, BUBBLING_PHASE',
      'b, b, undefined, AT_TARGET',
      'b, b, undefined, AT_TARGET',
      'a, b, undefined, BUBBLING_PHASE',
      'div, b, undefined, BUBBLING_PHASE',
    ];
    assertArrayEqual(expected, log);
  });

  test('propagation (bubbles: false)', function() {
    var tree = getPropagationTree();
    var log = [];
    addListeners(tree, 'x', log);

    var e = new Event('x', {bubbles: false});
    tree.c.dispatchEvent(e);

    var expected = [
      'div, c, undefined, CAPTURING_PHASE',
      'a, c, undefined, CAPTURING_PHASE',
      'b, c, undefined, CAPTURING_PHASE',
      'sr, c, undefined, CAPTURING_PHASE',
      'd, c, undefined, CAPTURING_PHASE',
      'sr2, c, undefined, CAPTURING_PHASE',
      'e, c, undefined, CAPTURING_PHASE',
      'content2, c, undefined, CAPTURING_PHASE',
      'content, c, undefined, CAPTURING_PHASE',
      'c, c, undefined, AT_TARGET',
      'c, c, undefined, AT_TARGET'
    ];
    assertArrayEqual(expected, log);

    log.length = 0;
    var e = new Event('x', {bubbles: false});
    tree.e.dispatchEvent(e);

    var expected = [
      'div, b, undefined, CAPTURING_PHASE',
      'a, b, undefined, CAPTURING_PHASE',
      'sr, d, undefined, CAPTURING_PHASE',
      'sr2, e, undefined, CAPTURING_PHASE',
      'e, e, undefined, AT_TARGET',
      'e, e, undefined, AT_TARGET',
      'd, d, undefined, AT_TARGET',
      'd, d, undefined, AT_TARGET',
      'b, b, undefined, AT_TARGET',
      'b, b, undefined, AT_TARGET',
    ];
    assertArrayEqual(expected, log);
  });

  test('retarget order', function() {
    var tree = {};
    var div = tree.div = document.createElement('div');
    // wrap(document).body.appendChild(div);
    div.innerHTML = '<c></c><d></d>';
    var c = tree.c = div.firstChild;
    var d = tree.d = div.lastChild;
    var sr = tree.sr = div.createShadowRoot();
    sr.innerHTML = '<a><content></content></a>';
    var a = tree.a = sr.firstChild;
    var content = tree.content = a.firstChild;
    var sr2 = tree.sr2 = a.createShadowRoot();
    sr2.innerHTML = '<b><content></content></b>';
    var b = tree.b = sr2.firstChild;
    var content2 = tree.content2 = b.firstChild;
    var sr3 = tree.sr3 = b.createShadowRoot();
    sr3.innerHTML = '<content></content>';
    var content3 = tree.content3 = sr3.firstChild;

    var log = [];
    addListeners(tree, 'mouseover', log);

    // move from d to c, both in the light dom.
    var event = new MouseEvent('mouseover', {relatedTarget: d, bubbles: true});
    c.dispatchEvent(event);
    var expected = [
      'div, c, d, CAPTURING_PHASE',
      'sr, c, d, CAPTURING_PHASE',
      'a, c, d, CAPTURING_PHASE',
      'sr2, c, d, CAPTURING_PHASE',
      'b, c, d, CAPTURING_PHASE',
      'sr3, c, d, CAPTURING_PHASE',
      'content3, c, d, CAPTURING_PHASE',
      'content2, c, d, CAPTURING_PHASE',
      'content, c, d, CAPTURING_PHASE',
      'c, c, d, AT_TARGET',
      'c, c, d, AT_TARGET',
      'content, c, d, BUBBLING_PHASE',
      'content2, c, d, BUBBLING_PHASE',
      'content3, c, d, BUBBLING_PHASE',
      'sr3, c, d, BUBBLING_PHASE',
      'b, c, d, BUBBLING_PHASE',
      'sr2, c, d, BUBBLING_PHASE',
      'a, c, d, BUBBLING_PHASE',
      'sr, c, d, BUBBLING_PHASE',
      'div, c, d, BUBBLING_PHASE',
    ];
    assertArrayEqual(expected, log);

    // Move from c to b (b in light, c in a shadow)
    log.length = 0;
    var event = new MouseEvent('mouseover', {relatedTarget: c, bubbles: true});
    b.dispatchEvent(event);
    var expected = [
      'sr, a, c, CAPTURING_PHASE',
      'sr2, b, c, CAPTURING_PHASE',
      'b, b, c, AT_TARGET',
      'b, b, c, AT_TARGET',
      'sr2, b, c, BUBBLING_PHASE',
      'a, a, c, AT_TARGET',
      'a, a, c, AT_TARGET',
      'sr, a, c, BUBBLING_PHASE',
      'div, div, c, AT_TARGET',
      'div, div, c, AT_TARGET',
    ];
    assertArrayEqual(expected, log);

    // Move from b to c (b in light, c in a shadow)
    log.length = 0;
    var event = new MouseEvent('mouseover', {relatedTarget: b, bubbles: true});
    c.dispatchEvent(event);
    var expected = [
      'div, c, div, CAPTURING_PHASE',
      'sr, c, a, CAPTURING_PHASE',
      'a, c, a, CAPTURING_PHASE',
      'sr2, c, b, CAPTURING_PHASE',
      'b, c, b, CAPTURING_PHASE',
      'sr3, c, b, CAPTURING_PHASE',
      'content3, c, b, CAPTURING_PHASE',
      'content2, c, b, CAPTURING_PHASE',
      'content, c, a, CAPTURING_PHASE',
      'c, c, div, AT_TARGET',
      'c, c, div, AT_TARGET',
      'content, c, a, BUBBLING_PHASE',
      'content2, c, b, BUBBLING_PHASE',
      'content3, c, b, BUBBLING_PHASE',
      'sr3, c, b, BUBBLING_PHASE',
      'b, c, b, BUBBLING_PHASE',
      'sr2, c, b, BUBBLING_PHASE',
      'a, c, a, BUBBLING_PHASE',
      'sr, c, a, BUBBLING_PHASE',
      'div, c, div, BUBBLING_PHASE',
    ];
    assertArrayEqual(expected, log);

    // a
    // + sr
    //   + b

    // Move from a to b (both in shadow)
    log.length = 0;
    var event = new MouseEvent('mouseover', {relatedTarget: a, bubbles: true});
    b.dispatchEvent(event);
    var expected = [
      'sr2, b, a, CAPTURING_PHASE',
      'b, b, a, AT_TARGET',
      'b, b, a, AT_TARGET',
      'sr2, b, a, BUBBLING_PHASE',
    ];
    assertArrayEqual(expected, log);

    // Move from b to a (both in shadow)
    log.length = 0;
    var event = new MouseEvent('mouseover', {relatedTarget: b, bubbles: true});
    a.dispatchEvent(event);
    var expected = [];
    assertArrayEqual(expected, log);
  });

test('retarget order (multiple shadow roots)', function() {
    var tree = {};
    var div = tree.div = document.createElement('div');
    // wrap(document).body.appendChild(div);
    div.innerHTML = '<c></c><d></d>';
    var c = tree.c = div.firstChild;
    var d = tree.d = div.lastChild;
    var sr = tree.sr = div.createShadowRoot();
    sr.innerHTML = '<a><content></content></a>';
    var a = tree.a = sr.firstChild;
    var content = tree.content = a.firstChild;
    var sr2 = tree.sr2 = div.createShadowRoot();
    sr2.innerHTML = '<b><shadow></shadow></b>';
    var b = tree.b = sr2.firstChild;
    var shadow = tree.shadow = b.firstChild;
    var sr3 = tree.sr3 = div.createShadowRoot();
    sr3.innerHTML = '<shadow></shadow>';
    var shadow2 = tree.shadow2 = sr3.firstChild;

    var log = [];
    addListeners(tree, 'mouseover', log);

    // move from d to c, both in the light dom.
    var event = new MouseEvent('mouseover', {relatedTarget: d, bubbles: true});
    c.dispatchEvent(event);
    var expected = [
      'div, c, d, CAPTURING_PHASE',
      'sr3, c, d, CAPTURING_PHASE',
      'shadow2, c, d, CAPTURING_PHASE',
      'sr2, c, d, CAPTURING_PHASE',
      'b, c, d, CAPTURING_PHASE',
      'shadow, c, d, CAPTURING_PHASE',
      'sr, c, d, CAPTURING_PHASE',
      'a, c, d, CAPTURING_PHASE',
      'content, c, d, CAPTURING_PHASE',
      'c, c, d, AT_TARGET',
      'c, c, d, AT_TARGET',
      'content, c, d, BUBBLING_PHASE',
      'a, c, d, BUBBLING_PHASE',
      'sr, c, d, BUBBLING_PHASE',
      'shadow, c, d, BUBBLING_PHASE',
      'b, c, d, BUBBLING_PHASE',
      'sr2, c, d, BUBBLING_PHASE',
      'shadow2, c, d, BUBBLING_PHASE',
      'sr3, c, d, BUBBLING_PHASE',
      'div, c, d, BUBBLING_PHASE',
    ];
    assertArrayEqual(expected, log);


    // Move from c to b (b in light, c in a shadow)
    log.length = 0;
    var event = new MouseEvent('mouseover', {relatedTarget: c, bubbles: true});
    b.dispatchEvent(event);
    var expected = [
      'sr3, b, c, CAPTURING_PHASE',
      'shadow2, b, c, CAPTURING_PHASE',
      'sr2, b, c, CAPTURING_PHASE',
      'b, b, c, AT_TARGET',
      'b, b, c, AT_TARGET',
      'sr2, b, c, BUBBLING_PHASE',
      'shadow2, b, c, BUBBLING_PHASE',
      'sr3, b, c, BUBBLING_PHASE',
      'div, div, c, AT_TARGET',
      'div, div, c, AT_TARGET',
    ];
    assertArrayEqual(expected, log);

    // Move from b to c (b in light, c in a shadow)
    log.length = 0;
    var event = new MouseEvent('mouseover', {relatedTarget: b, bubbles: true});
    c.dispatchEvent(event);
    var expected = [
      'div, c, div, CAPTURING_PHASE',
      'sr3, c, b, CAPTURING_PHASE',
      'shadow2, c, b, CAPTURING_PHASE',
      'sr2, c, b, CAPTURING_PHASE',
      'b, c, b, CAPTURING_PHASE',
      'shadow, c, b, CAPTURING_PHASE',
      'sr, c, div, CAPTURING_PHASE',
      'a, c, div, CAPTURING_PHASE',
      'content, c, div, CAPTURING_PHASE',
      'c, c, div, AT_TARGET',
      'c, c, div, AT_TARGET',
      'content, c, div, BUBBLING_PHASE',
      'a, c, div, BUBBLING_PHASE',
      'sr, c, div, BUBBLING_PHASE',
      'shadow, c, b, BUBBLING_PHASE',
      'b, c, b, BUBBLING_PHASE',
      'sr2, c, b, BUBBLING_PHASE',
      'shadow2, c, b, BUBBLING_PHASE',
      'sr3, c, b, BUBBLING_PHASE',
      'div, c, div, BUBBLING_PHASE',
    ];
    assertArrayEqual(expected, log);

    // a
    // + sr
    //   + b

    // Move from a to b (both in shadow)
    log.length = 0;
    var event = new MouseEvent('mouseover', {relatedTarget: a, bubbles: true});
    b.dispatchEvent(event);
    var expected = [
      'sr3, b, a, CAPTURING_PHASE',
      'shadow2, b, a, CAPTURING_PHASE',
      'sr2, b, a, CAPTURING_PHASE',
      'b, b, a, AT_TARGET',
      'b, b, a, AT_TARGET',
      'sr2, b, a, BUBBLING_PHASE',
      'shadow2, b, a, BUBBLING_PHASE',
      'sr3, b, a, BUBBLING_PHASE',
    ];
    assertArrayEqual(expected, log);

    // Move from b to a (both in shadow)
    log.length = 0;
    var event = new MouseEvent('mouseover', {relatedTarget: b, bubbles: true});
    a.dispatchEvent(event);
    var expected = [
      'sr3, a, b, CAPTURING_PHASE',
      'shadow2, a, b, CAPTURING_PHASE',
      'sr2, a, b, CAPTURING_PHASE',
      'b, a, b, CAPTURING_PHASE',
      'shadow, a, b, CAPTURING_PHASE',
      'sr, a, div, CAPTURING_PHASE',
      'a, a, div, AT_TARGET',
      'a, a, div, AT_TARGET',
      'sr, a, div, BUBBLING_PHASE',
      'shadow, a, b, BUBBLING_PHASE',
      'b, a, b, BUBBLING_PHASE',
      'sr2, a, b, BUBBLING_PHASE',
      'shadow2, a, b, BUBBLING_PHASE',
      'sr3, a, b, BUBBLING_PHASE',
    ];
    assertArrayEqual(expected, log);
  });

  htmlTest('../html/on-load-test.html');
  htmlTest('../html/on-unload-test.html');

  test('event wrap round trip', function() {
    var e = new Event('x');
    assert.equal(e, wrap(unwrap(e)));
  });

  test('mouse event wrap round trip', function() {
    var e = new MouseEvent('x');
    assert.equal(e, wrap(unwrap(e)));
  });

  test('event path in presence of shadow element', function() {
    var div = document.createElement('div');

    var menuButton = document.createElement('menu-button');
    menuButton.innerHTML = '<a></a><b></b>';
    var a = menuButton.firstChild;
    var b = menuButton.lastChild;

    var menuButtonSr = menuButton.createShadowRoot();
    menuButtonSr.innerHTML = '<menu><content name="menu-button"></content></menu>';
    var menu = menuButtonSr.firstChild;
    var menuButtonContent = menu.firstChild;

    var selectorSr = menu.createShadowRoot();
    selectorSr.innerHTML = '<content name="selector"></content>';
    var selectorContent = selectorSr.firstChild;

    var menuSr = menu.createShadowRoot();
    menuSr.innerHTML = 'xxx<shadow name="menu"></shadow>xxx';
    var menuShadow = menuSr.firstElementChild;

    var tree = {
      div: div,
      menuButton: menuButton,
      a: a,
      b: b,
      menuButtonSr: menuButtonSr,
      menu: menu,
      menuButtonContent: menuButtonContent,
      menuSr: menuSr,
      menuShadow: menuShadow,
      selectorSr: selectorSr,
      selectorContent: selectorContent,
    };

    var log = [];
    addListeners(tree, 'x', log);

    a.dispatchEvent(new Event('x', {bubbles: true}));

    var expected = [
      'menuButton, a, undefined, CAPTURING_PHASE',
      'menuButtonSr, a, undefined, CAPTURING_PHASE',
      'menu, a, undefined, CAPTURING_PHASE',
      'menuSr, a, undefined, CAPTURING_PHASE',
      'menuShadow, a, undefined, CAPTURING_PHASE',
      'selectorSr, a, undefined, CAPTURING_PHASE',
      'selectorContent, a, undefined, CAPTURING_PHASE',
      'menuButtonContent, a, undefined, CAPTURING_PHASE',
      'a, a, undefined, AT_TARGET',
      'a, a, undefined, AT_TARGET',
      'menuButtonContent, a, undefined, BUBBLING_PHASE',
      'selectorContent, a, undefined, BUBBLING_PHASE',
      'selectorSr, a, undefined, BUBBLING_PHASE',
      'menuShadow, a, undefined, BUBBLING_PHASE',
      'menuSr, a, undefined, BUBBLING_PHASE',
      'menu, a, undefined, BUBBLING_PHASE',
      'menuButtonSr, a, undefined, BUBBLING_PHASE',
      'menuButton, a, undefined, BUBBLING_PHASE',
    ];
    assertArrayEqual(expected, log);
  });

  test('event path with multiple content select', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a><one></one><two></two></a>';
    var a = div.firstChild;
    var one = a.firstChild;
    var two = a.lastChild;

    var aRoot = a.createShadowRoot();
    aRoot.innerHTML = '<b><content></content></b>';
    var b = aRoot.firstChild;
    var contentOfA = b.firstChild;

    var bRoot = b.createShadowRoot();
    bRoot.innerHTML = '<content select="one"></content>' +
                      '<content select="two"></content>';
    var contentSelectOne = bRoot.firstChild;
    var contentSelectTwo = bRoot.lastChild;

    var tree = {
      a: a,
      one: one,
      two: two,
      aRoot: aRoot,
      b: b,
      contentOfA: contentOfA,
      bRoot: bRoot,
      contentSelectOne: contentSelectOne,
      contentSelectTwo: contentSelectTwo,
    };

    var log = [];
    addListeners(tree, 'x', log);

    one.dispatchEvent(new Event('x', {bubbles: true}));
    var expected = [
      'a, one, undefined, CAPTURING_PHASE',
      'aRoot, one, undefined, CAPTURING_PHASE',
      'b, one, undefined, CAPTURING_PHASE',
      'bRoot, one, undefined, CAPTURING_PHASE',
      'contentSelectOne, one, undefined, CAPTURING_PHASE',
      'contentOfA, one, undefined, CAPTURING_PHASE',
      'one, one, undefined, AT_TARGET',
      'one, one, undefined, AT_TARGET',
      'contentOfA, one, undefined, BUBBLING_PHASE',
      'contentSelectOne, one, undefined, BUBBLING_PHASE',
      'bRoot, one, undefined, BUBBLING_PHASE',
      'b, one, undefined, BUBBLING_PHASE',
      'aRoot, one, undefined, BUBBLING_PHASE',
      'a, one, undefined, BUBBLING_PHASE',
    ];
    assertArrayEqual(expected, log);

    var log = [];
    addListeners(tree, 'x', log);
    two.dispatchEvent(new Event('x', {bubbles: true}));
    var expected = [
      'a, two, undefined, CAPTURING_PHASE',
      'aRoot, two, undefined, CAPTURING_PHASE',
      'b, two, undefined, CAPTURING_PHASE',
      'bRoot, two, undefined, CAPTURING_PHASE',
      'contentSelectTwo, two, undefined, CAPTURING_PHASE',
      'contentOfA, two, undefined, CAPTURING_PHASE',
      'two, two, undefined, AT_TARGET',
      'two, two, undefined, AT_TARGET',
      'contentOfA, two, undefined, BUBBLING_PHASE',
      'contentSelectTwo, two, undefined, BUBBLING_PHASE',
      'bRoot, two, undefined, BUBBLING_PHASE',
      'b, two, undefined, BUBBLING_PHASE',
      'aRoot, two, undefined, BUBBLING_PHASE',
      'a, two, undefined, BUBBLING_PHASE',
    ];
    assertArrayEqual(expected, log);

    var log = [];
    addListeners(tree, 'x', log);
    contentOfA.dispatchEvent(new Event('x', {bubbles: true}));
    var expected = [
      'aRoot, contentOfA, undefined, CAPTURING_PHASE',
      'b, contentOfA, undefined, CAPTURING_PHASE',
      'contentOfA, contentOfA, undefined, AT_TARGET',
      'contentOfA, contentOfA, undefined, AT_TARGET',
      'b, contentOfA, undefined, BUBBLING_PHASE',
      'aRoot, contentOfA, undefined, BUBBLING_PHASE',
      'a, a, undefined, AT_TARGET',
      'a, a, undefined, AT_TARGET',
    ];
    assertArrayEqual(expected, log);

    var log = [];
    addListeners(tree, 'x', log);
    contentSelectOne.dispatchEvent(new Event('x', {bubbles: true}));
    var expected = [
      'aRoot, b, undefined, CAPTURING_PHASE',
      'bRoot, contentSelectOne, undefined, CAPTURING_PHASE',
      'contentSelectOne, contentSelectOne, undefined, AT_TARGET',
      'contentSelectOne, contentSelectOne, undefined, AT_TARGET',
      'bRoot, contentSelectOne, undefined, BUBBLING_PHASE',
      'b, b, undefined, AT_TARGET',
      'b, b, undefined, AT_TARGET',
      'aRoot, b, undefined, BUBBLING_PHASE',
      'a, a, undefined, AT_TARGET',
      'a, a, undefined, AT_TARGET',
    ];
    assertArrayEqual(expected, log);

    var log = [];
    addListeners(tree, 'x', log);
    contentSelectTwo.dispatchEvent(new Event('x', {bubbles: true}));
    var expected = [
      'aRoot, b, undefined, CAPTURING_PHASE',
      'bRoot, contentSelectTwo, undefined, CAPTURING_PHASE',
      'contentSelectTwo, contentSelectTwo, undefined, AT_TARGET',
      'contentSelectTwo, contentSelectTwo, undefined, AT_TARGET',
      'bRoot, contentSelectTwo, undefined, BUBBLING_PHASE',
      'b, b, undefined, AT_TARGET',
      'b, b, undefined, AT_TARGET',
      'aRoot, b, undefined, BUBBLING_PHASE',
      'a, a, undefined, AT_TARGET',
      'a, a, undefined, AT_TARGET',
    ];
    assertArrayEqual(expected, log);
  });

  test('onclick', function() {
    div = document.createElement('div');
    wrap(document).body.appendChild(div);

    var calls = 0;
    var event;

    function f(e) {
      event = e;
      calls++;
      assert.equal(this, div);
      assert.equal(e.target, div);
    }

    div.onclick = f;

    assert.equal(div.onclick, f);

    div.click();
    assert.equal(calls, 1);
    assert.isFalse(event.defaultPrevented);

    div.onclick = null;
    div.click();
    assert.equal(calls, 1);

    function g(e) {
      calls++;
      event = e;
      return false;
    }

    div.onclick = g;
    assert.equal(div.onclick, g);

    div.click();
    assert.equal(calls, 2);

    // defaultPrevented is broken in IE.
    // https://connect.microsoft.com/IE/feedback/details/790389/event-defaultprevented-returns-false-after-preventdefault-was-called
    if (!/Trident/.test(navigator.userAgent))
      assert.isTrue(event.defaultPrevented);
  });

  test('event.path (bubbles)', function() {
    var tree = getPropagationTree();
    var e = new Event('x', {bubbles: true});

    tree.e.addEventListener('x', function f(e) {
      assertArrayEqual(
          [
            tree.c,
            tree.content,
            tree.content2,
            tree.e,
            tree.sr2,
            tree.d,
            tree.sr,
            tree.b,
            tree.a,
            tree.div,
          ],
          e.path);

      tree.e.removeEventListener('x', f);
    });

    tree.sr.addEventListener('x', function f(e) {
      assertArrayEqual(
          [
            tree.c,
            tree.content,
            tree.content2,
            tree.e,
            tree.sr2,
            tree.d,
            tree.sr,
            tree.b,
            tree.a,
            tree.div,
          ],
          e.path);

      tree.sr.removeEventListener('x', f);
    });

    tree.c.addEventListener('x', function f(e) {
      assertArrayEqual(
          [
            tree.c,
            tree.content,
            tree.content2,
            tree.e,
            tree.sr2,
            tree.d,
            tree.sr,
            tree.b,
            tree.a,
            tree.div,
          ],
          e.path);

      tree.c.removeEventListener('x', f);
    });

    tree.c.dispatchEvent(e);
  });

  test('event.path on body (bubbles)', function() {
    var e = new Event('x', {bubbles: true});
    var doc = wrap(document);

    doc.body.addEventListener('x', function f(e) {
      assertArrayEqual(
          [
            doc.body,
            doc.documentElement,
            doc,
          ],
          e.path);

      doc.body.removeEventListener('x', f);
    });

    doc.documentElement.addEventListener('x', function f(e) {
      assertArrayEqual(
          [
            doc.body,
            doc.documentElement,
            doc,
          ],
          e.path);

      doc.documentElement.removeEventListener('x', f);
    });

    doc.body.dispatchEvent(e);
  });

  test('dispatch on text node', function() {
    var text = document.createTextNode('x');
    text.addEventListener('x', function f(e) {
      assert.equal(e.target, text);
      assert.equal(e.currentTarget, text);
      assert.equal(this, text);
      text.removeEventListener('x', f);
    });
    text.dispatchEvent(new Event('x'));
  });

  test('dispatch same event object twice', function() {
    var e = new Event('x', {bubbles: true});
    var doc = wrap(document);

    var count = 0;
    function handler(e) {
      count++;
    };

    doc.addEventListener('x', handler);

    document.dispatchEvent(e);
    assert.equal(count, 1);
    document.dispatchEvent(e);
    assert.equal(count, 2);
    document.dispatchEvent(e);
    assert.equal(count, 3);

    doc.removeEventListener('x', handler);
  });

  test('Ensure nested dispatch is not allowed', function() {
    var e = new Event('x', {bubbles: true});
    var doc = wrap(document);

    var count = 0;

    doc.addEventListener('x', function f(e) {
      count++;
      assert.throws(function() {
        doc.dispatchEvent(e);
      });
    });

    doc.dispatchEvent(e);
    assert.equal(count, 1);
  });

  test('manual relatedTarget', function() {
    var ce = new CustomEvent('x');
    ce.relatedTarget = 42;
    var count = 0;
    document.addEventListener('x', function f(e) {
      count++;
      assert.equal(e.relatedTarget, 42);
      document.removeEventListener('x', f);
    });
    document.dispatchEvent(ce);
    assert.equal(count, 1);
  });

  test('returnValue', function() {
    var e = new Event('x');
    assert.isFalse('returnValue' in e);
  });

  test('event propagation in shadow tree', function() {
    var host = document.createElement('host');
    host.innerHTML = ' <child></child> ';
    var child = host.firstElementChild;

    var root = host.createShadowRoot();
    root.textContent = 'waiting...';

    var data;
    host.addEventListener('test', function(e) {
      data = e.data;
    });

    function send(data) {
      var e = new Event('test', {bubbles: true});
      e.data = data;
      child.dispatchEvent(e);
    }

    send('a');
    assert.equal(data, 'a');

    host.offsetWidth;

    send('b');
    assert.equal(data, 'b');
  });

  test('dispatch should trigger default actions', function() {
    var div = document.createElement('div');
    div.innerHTML = '<input type="checkbox">';
    var checkbox = div.firstChild;
    assert.isFalse(checkbox.checked);
    checkbox.dispatchEvent(new MouseEvent('click'));
    assert.isTrue(checkbox.checked);
  });

  test('dispatch should trigger default actions 2', function() {
    var div = document.createElement('div');
    div.innerHTML = '<input type="checkbox">';
    var checkbox = div.firstChild;
    var sr = div.createShadowRoot();

    assert.isFalse(checkbox.checked);
    checkbox.dispatchEvent(new MouseEvent('click'));
    assert.isTrue(checkbox.checked);

    div.offsetWidth;
    checkbox.dispatchEvent(new MouseEvent('click'));
    assert.isFalse(checkbox.checked);
  });

  test('window.onerror', function() {
    var old = window.onerror;
    var f;
    var msg = 'Intentional error';
    var errorCount = 0;

    window.onerror = function(msg, source, lineNumber, columnNumber, err) {
      document.removeEventListener('click', f);
      window.onerror = old;
      assert.isTrue(msg.indexOf(msg) >= 0);
      assert.typeOf(source, 'string');
      assert.typeOf(lineNumber, 'number');
      // Firefox 28 does not pass the columnNumber, error
      // Safari 6 does not pass the columnNumber, error
      // IE11 does not pass the error
      if (arguments.length >= 4)
        assert.typeOf(columnNumber, 'number');
      if (arguments.length >= 5)
        assert.equal(err, error);

      errorCount++;
    };

    var error = new Error(msg);
    document.addEventListener('click', f = function(e) {
      throw error;
    });

    document.body.click();

    assert.equal(errorCount, 1);
  });

  test('add during dispatch', function() {
    div = document.createElement('div');
    document.body.appendChild(div);
    var fCount = 0;
    var gCount = 0;
    var hCount = 0;

    function f() {
      fCount++;
      div.addEventListener('click', g);
    }

    function g() {
      gCount++;
      div.addEventListener('click', h);
    }

    function h() {
      hCount++;
    }

    div.addEventListener('click', f);

    div.click();
    assert.equal(fCount, 1);

    div.click();
    assert.equal(fCount, 2);
    assert.equal(gCount, 1);

    div.click();
    assert.equal(fCount, 3);
    assert.equal(gCount, 2);
    assert.equal(hCount, 1);
  });

  test('Event reentrancy', function() {
    div = document.createElement('div');
    document.body.appendChild(div);
    var s = '';
    var depth = 0;

    function f() {
      s += 'f' + depth;
      if (depth === 0) {
        depth++;
        div.dispatchEvent(new Event('x'));
      } else if (depth === 1) {
        div.removeEventListener('x', g);
      }
    }

    function g() {
      s += 'g' + depth;
    }

    div.addEventListener('x', f);
    div.addEventListener('x', g);

    div.dispatchEvent(new Event('x'));

    assert.equal(s, 'f0f1');
  });
});
