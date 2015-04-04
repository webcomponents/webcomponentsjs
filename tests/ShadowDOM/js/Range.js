/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('Range', function() {

  var wrap = ShadowDOMPolyfill.wrap;
  var unwrap = ShadowDOMPolyfill.unwrap;
  var wrapIfNeeded = ShadowDOMPolyfill.wrapIfNeeded;
  var isNativeShadowDomSupported;

  var hosts;
  var customElementPrefix = "range-custom-element-";
  var nativeCustomElementPrefix = "range-native-element-";
  var customElementIndex = 0;
  var nativeCustomElementIndex = 0;

  setup(function() {
    isNativeShadowDomSupported =
                !!unwrap(document.createElement('div')).createShadowRoot;
  });

  function removeHosts() {
    if (hosts) {
      hosts.forEach(function(host) {
        if (host && host.parentNode) {
          host.parentNode.removeChild(wrapIfNeeded(host));
        }
      });
      hosts = undefined;
    }
  }

  function getNewCustomElementType() {
    return customElementPrefix + customElementIndex++;
  }

  function getNewNativeCustomElementType() {
    return nativeCustomElementPrefix + nativeCustomElementIndex++;
  }

  function createCustomElement(name, shadowDomContentsArray, native) {

    var prototype = Object.create(HTMLElement.prototype);
    prototype.createdCallback = function() {
      var element = this;
      if (native) {
        element = unwrap(this);
      }
      createShadowDom(element, shadowDomContentsArray);
    };

    return document.registerElement(name, {prototype: prototype});
  }

  // If the host has native shadow dom then we need to return native
  // range. Native range is just a polyfill Range unwrapped.
  function createRangeForHost(host) {
    var range = document.createRange();

    // If we are dealing with native shadow dom, expose the range object
    // as a native range object by just unwrapping it.
    //noinspection JSUnresolvedVariable
    if (hasNativeShadowRoot(host)) {
      range = unwrap(range);
    }

    return range;
  }

  function hasNativeShadowRoot(node) {
    return node && node.shadowRoot && !(node.shadowRoot instanceof ShadowRoot);
  }

  function createCustomElementWithPolyfillShadowDom(shadowDomContentsArray) {
    var customElementType = getNewCustomElementType();
    createCustomElement(customElementType, shadowDomContentsArray);
    return document.createElement(customElementType);
  }

  function createStandardElementWithPolyfillShadowDom(shadowDomContentsArray,
                                                      elementType) {
    var element = document.createElement(elementType);
    return createShadowDom(element, shadowDomContentsArray);
  }

  function createHostWithPolyfillShadowDom(shadowDomContentsArray,
                                           elementType) {
    if (!elementType) {
      return createCustomElementWithPolyfillShadowDom(shadowDomContentsArray);
    } else {
      return createStandardElementWithPolyfillShadowDom(shadowDomContentsArray,
        elementType);
    }
  }

  function createShadowDom(element, shadowDomContentsArray) {
    shadowDomContentsArray.forEach(function(shadowDomContent) {
      element.createShadowRoot().innerHTML = shadowDomContent;
    });
    return element;
  }

  function createStandardElementWithNativeShadowDom(shadowDomContentsArray,
                                                    elementType) {
    var element = document.createElement(elementType);
    return createShadowDom(unwrap(element), shadowDomContentsArray);
  }

  function createCustomElementWithNativeShadowDom(shadowDomContentsArray) {
    var element;
    var nativeElementType = getNewNativeCustomElementType();
    createCustomElement(nativeElementType, shadowDomContentsArray, true);
    element = document.createElement(nativeElementType);
    element = unwrap(element);
    assert.isNotNull(element.shadowRoot);
  }

  function createHostWithNativeShadowDom(shadowDomContentsArray, elementType) {

    if (!isNativeShadowDomSupported) {
      return;
    }

    if (!elementType) {
      return createCustomElementWithNativeShadowDom(shadowDomContentsArray,
        elementType);
    } else {
      return createStandardElementWithNativeShadowDom(shadowDomContentsArray,
        elementType);
    }
  }

  // Create hosts with polyfill shadow dom and native shadow dom
  // if available. The two hosts then will be tested by setting
  // the innerHTML of those hosts and using the polyfill range or
  // the native range. The results should be the same in both cases.
  function createHostsWithShadowDom(shadowDomContentsArray, elementType) {

    var hostWithPolyFillShadowDom =
      createHostWithPolyfillShadowDom(shadowDomContentsArray, elementType);
    var hostWithNativeShadowDom =
      createHostWithNativeShadowDom(shadowDomContentsArray, elementType);

    var hosts = [];
    assert.isObject(hostWithPolyFillShadowDom);

    hosts.push(hostWithPolyFillShadowDom);
    if (hostWithNativeShadowDom) {
      hosts.push(hostWithNativeShadowDom);
    }

    return hosts;
  }

  // This function sets the innerHTML for some host element. The host could
  // have native shadow dom or polyfill shadow dom. Then we start selecting
  // the range based on the set innerHTML and the range has to work
  // regardless of the structure of the shadow dom.
  function testRangeWith3SpansHTML(host) {

    host.innerHTML = "<span>One</span><span>Two</span><span>Three</span>";

    assert.isNotNull(host.shadowRoot);

    // Force rendering for the host with the polyfill shadow dom.
    // Of course the host with native shadow dom does not need it.
    host.offsetWidth;

    var range = createRangeForHost(host);

    // We are using the polyfill selection for native and polyfill ranges.
    // It has no impact on the tests results.
    var selection = document.getSelection();
    if (selection.rangeCount > 0) {
      selection.removeAllRanges();
    }

    // We do not really have to add the range to the selection.
    // It provides visual feedback of the range while we are debugging.

    range.setStart(host, 0);
    range.setEnd(host, 2);
    selection.addRange(range);

    assert.isTrue(range.startContainer === host);
    assert.isTrue(range.endContainer === host);
    assert.isTrue(range.commonAncestorContainer === host);
    assert.isTrue(range.toString() === "OneTwo");

    range.setStart(host, 0);
    range.setEnd(host, 1);
    assert.isTrue(range.toString() === "One");
    selection.removeAllRanges();
    selection.addRange(range);

    range.setStart(host, 1);
    range.setEnd(host, 2);
    assert.isTrue(range.toString() === "Two");
    selection.removeAllRanges();
    selection.addRange(range);

    range.setStart(host, 2);
    range.setEnd(host, 3);
    assert.isTrue(range.toString() === "Three");
    selection.removeAllRanges();
    selection.addRange(range);

    range.setStart(host, 0);
    range.setEnd(host, 3);
    assert.isTrue(range.toString() === "OneTwoThree");
    selection.removeAllRanges();
    selection.addRange(range);

    // Make sure we can select without specifying the host

    // Test selecting the spans inside the spans
    var span0 = host.childNodes[0];
    var span2 = host.childNodes[2];
    range.setStart(span0, 1);
    range.setEnd(span2, 0);
    assert.isTrue(range.toString() === "Two");
    selection.removeAllRanges();
    selection.addRange(range);

    // create span0TextNode and span2TextNode for test readability.
    // Test selecting the text nodes inside the spans
    var span0TextNode = span0.childNodes[0];
    var span2TextNode = span2.childNodes[0];
    range.setStart(span0TextNode, 1);
    range.setEnd(span2TextNode, 1);
    selection.removeAllRanges();
    selection.addRange(range);
    assert.isTrue(range.toString() === "neTwoT");
  }

  function testRangeWithHosts(hosts) {
    hosts.forEach(function(host) {
      document.body.appendChild(wrapIfNeeded(host));
      testRangeWith3SpansHTML(host);
    });
  }

  suite('Standard elements (no Shadow Dom)', function() {
    var div;

    teardown(function() {
      if (div && div.parentNode)
        div.parentNode.removeChild(div);
      div = undefined;
    });

    test('instanceof', function() {
      var range = document.createRange();
      assert.instanceOf(range, Range);

      var range2 = wrap(document).createRange();
      assert.instanceOf(range2, Range);
    });

    test('constructor', function() {
      var range = document.createRange();
      assert.equal(Range, range.constructor);
    });

    test('createContextualFragment', function() {
      // IE9 does not support createContextualFragment.
      if (!Range.prototype.createContextualFragment)
        return;

      var range = document.createRange();
      var container = document.body || document.head;

      range.selectNode(container);

      var fragment = range.createContextualFragment('<b></b>');

      assert.instanceOf(fragment, DocumentFragment);
      assert.equal(fragment.firstChild.localName, 'b');
      assert.equal(fragment.childNodes.length, 1);
    });

    test('WebIDL attributes', function() {
      var range = document.createRange();

      assert.isTrue('collapsed' in range);
      assert.isFalse(range.hasOwnProperty('collapsed'));

      assert.isTrue('commonAncestorContainer' in range);
      assert.isFalse(range.hasOwnProperty('commonAncestorContainer'));

      assert.isTrue('endContainer' in range);
      assert.isFalse(range.hasOwnProperty('endContainer'));

      assert.isTrue('endOffset' in range);
      assert.isFalse(range.hasOwnProperty('endOffset'));

      assert.isTrue('startContainer' in range);
      assert.isFalse(range.hasOwnProperty('startContainer'));

      assert.isTrue('startOffset' in range);
      assert.isFalse(range.hasOwnProperty('startOffset'));
    });

    test('toString', function() {
      var range = document.createRange();
      div = document.createElement('div');
      document.body.appendChild(div);
      div.innerHTML = '<a>a</a><b>b</b><c>c</c>';
      var a = div.firstChild;
      var b = a.nextSibling;
      range.selectNode(b);
      assert.equal(range.toString(), 'b');
    });

  });

  suite('Standard+Custom elements with Shadow Dom', function() {

    teardown(function() {
      removeHosts();
    });

    // create a prototype for each test, so we don't get into some
    // other issues that has nothing to do with the Range.
    test('custom - <content>', function() {
      if (!document.registerElement)
        return;
      var shadowDomContent = "<content></content>";
      hosts = createHostsWithShadowDom([shadowDomContent]);
      testRangeWithHosts(hosts);
    });

    test('custom - <shadow>', function() {
      if (!document.registerElement)
        return;
      var shadowDomContent = "<shadow></shadow>";
      hosts = createHostsWithShadowDom([shadowDomContent]);
      testRangeWithHosts(hosts);
    });

    test("custom - <content> wrapped in a div container", function() {
      if (!document.registerElement)
        return;
      var shadowDomContent = "<div id='container'><content></content></div>";
      hosts = createHostsWithShadowDom([shadowDomContent]);
      testRangeWithHosts(hosts);
    });

    test("custom - <shadow> wrapped in a div container</div>", function() {
      if (!document.registerElement)
        return;
      var shadowDomContent = "<div id='container'><shadow></shadow></div>";
      hosts = createHostsWithShadowDom([shadowDomContent]);
      testRangeWithHosts(hosts);
    });

    test("custom - <content> wrapped and more", function() {
      if (!document.registerElement)
        return;
      var shadowDomContent = "<div>before</div>";
      shadowDomContent += "<div id='container'><content></content></div>";
      shadowDomContent += "<div>after</div>";
      hosts = createHostsWithShadowDom([shadowDomContent]);
      testRangeWithHosts(hosts);
    });

    test("custom - <shadow> wrapped and more", function() {
      if (!document.registerElement)
        return;
      var shadowDomContent = "<div>before</div>";
      shadowDomContent += "<div id='container'><shadow></shadow></div>";
      shadowDomContent += "<div>after</div>";
      hosts = createHostsWithShadowDom([shadowDomContent]);
      testRangeWithHosts(hosts);
    });

    test("div - <content> wrapped and more", function() {
      var shadowDomContent = "<div>before</div>";
      shadowDomContent += "<div id='container'><content></content></div>";
      shadowDomContent += "<div>after</div>";
      hosts = createHostsWithShadowDom([shadowDomContent], "div");
      testRangeWithHosts(hosts);
    });

    test("div - <shadow> wrapped and more", function() {
      var shadowDomContent = "<div>before</div>";
      shadowDomContent += "<div id='container'><shadow></shadow></div>";
      shadowDomContent += "<div>after</div>";
      hosts = createHostsWithShadowDom([shadowDomContent], "div");
      testRangeWithHosts(hosts);
    });

  });

  suite("Standard+Custom elements with oldest+youngest Shadow Dom", function() {

    teardown(function() {
      removeHosts();
    });

    test("div with <content> and <shadow>", function() {
      var shadowDomContentsArray = [
        "<content></content>",
        "<shadow></shadow>"
      ];

      hosts = createHostsWithShadowDom(shadowDomContentsArray, "div");
      testRangeWithHosts(hosts);
    });

    test("custom with <content> and <shadow>", function() {
      if (!document.registerElement)
        return;

      var shadowDomContentsArray = [
        "<content></content>",
        "<shadow></shadow>"
      ];

      hosts = createHostsWithShadowDom(shadowDomContentsArray);
      testRangeWithHosts(hosts);
    });

    test("div with wrapped <content> and <shadow>", function() {
      var shadowDomContentsArray = [
        "<div id='container_oldest'><content></content></div>",
        "<div id='container_youngest'><shadow></shadow></div>"
      ];

      hosts = createHostsWithShadowDom(shadowDomContentsArray, "div");
      testRangeWithHosts(hosts);
    });

    test("custom with wrapped <content> and <shadow> and more", function() {
      if (!document.registerElement)
        return;

      var oldestShadowDom = "<div>In Oldest shadow dom before</div>" +
        "<div id='container_oldest'><content></content>" +
        "</div><div>In Oldest shadow dom after</div>";

      var youngestShadowDom = "<div>In youngest shadow dom before</div>" +
        "<div id='container_oldest'><shadow></shadow>" +
        "</div><div>In youngest shadow dom after</div>";

      var shadowDomContentsArray = [oldestShadowDom, youngestShadowDom];

      hosts = createHostsWithShadowDom(shadowDomContentsArray);
      testRangeWithHosts(hosts);
    })

  });

  suite("multiple <content> with select (not supported)", function() {

    teardown(function() {
      removeHosts();
    });

    // Maybe someone can make sense of what range in
    // different trees means.
    function testRangeWithWithFragmentedContent(host) {

      host.innerHTML = "<b>bold1</b><i>italic1</i>" +
                        "<b>bold2</b><i>italic2</i>" +
                        "<div>some text</div>";

      assert.isNotNull(host.shadowRoot);

      // Force rendering for the host with the polyfill
      // shadow dom. Of course the host with native shadow
      // dom does not need it.
      host.offsetWidth;

      var range = createRangeForHost(host);

      // We are using the polyfill selection for native
      // and polyfill ranges. It has no impact on the tests results.
      var selection = document.getSelection();
      if (selection.rangeCount > 0) {
        selection.removeAllRanges();
      }

      // Just make sure we do not throw an exception
      range.setStart(host, 0);
      range.setEnd(host, 2);

      range.setStart(host, 0);
      range.setEnd(host, 1);

      range.setStart(host, 0);
      range.setEnd(host, host.childNodes.length + 1);

      assert.isTrue(range.startContainer === host);
      assert.isTrue(range.endContainer === host);
      assert.isTrue(range.commonAncestorContainer === host);
      //assert.isTrue(range.toString() === "bold1italic1");
    }

    test.skip("div with multiple <content> wrapped", function() {
      var shadowDomContent = "Bold tags:<div id='bold_container'>" +
        "<content select='b'></content></div><br>" +
        "Italic tags:<div id='italic_container'>" +
        "<content select='i'></content></div><br>" +
        "Others:<div id='main_container'><content></content></div>";

      hosts = createHostsWithShadowDom([shadowDomContent], "div");
      hosts.forEach(function(host) {
        document.body.appendChild(wrapIfNeeded(host));
        testRangeWithWithFragmentedContent(host);
      });
    });

    test.skip("div with multiple <content>", function() {
      var shadowDomContent = "Bold tags:<content select='b'>" +
        "</content><br>Italic tags:<content select='i'>" +
        "</content><br>Others:<content></content>";

      hosts = createHostsWithShadowDom([shadowDomContent], "div");
      hosts.forEach(function(host) {
        // I am not sure even the native chrome implementation makes
        // sense. The meaning of selecting range in different trees needs to
        // be defined. Not sure if it even makes sense. It did not to me.
        document.body.appendChild(wrapIfNeeded(host));
        testRangeWithWithFragmentedContent(host);
      });
    });

  });

});
