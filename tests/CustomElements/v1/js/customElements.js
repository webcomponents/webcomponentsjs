/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('customElements', function() {
  var work;
  var assert = chai.assert;
  var HTMLNS = 'http://www.w3.org/1999/xhtml';

  customElements.enableFlush = true;

  setup(function() {
    work = document.createElement('div');
    document.body.appendChild(work);
  });

  teardown(function() {
    document.body.removeChild(work);
  });

  test('customElements.define exists', function() {
    assert.isFunction(customElements.define);
  });

  test('customElements.define requires name argument', function() {
    assert.throws(function() {
      customElements.define();
    }, '', 'customElements.define failed to throw when given no arguments');
  });

  test('customElements.define requires name argument to contain a dash', function() {
    assert.throws(function () {
      customElements.define('xfoo', {prototype: Object.create(HTMLElement.prototype)});
    }, '', 'customElements.define failed to throw when given no arguments');
  });

  test('customElements.define second argument is not optional', function() {
    assert.throws(function () {
      customElements.define('x-no-options');
    }, '', 'customElements.define failed to function without ElementRegistionOptions argument');
  });

  test('customElements.define second argument prototype property is not optional', function() {
    assert.throws(function () {
      customElements.define('x-no-proto', {});
    }, '', 'customElements.define failed to function without ElementRegistionOptions prototype property');
  });

  test('customElements.define requires name argument to not conflict with a reserved name', function() {
    assert.throws(function() {
      customElements.define('font-face', {prototype: Object.create(HTMLElement.prototype)});
    }, '', 'Failed to execute \'defineElement\' on \'Document\': Registration failed for type \'font-face\'. The type name is invalid.');
  });

  test('customElements.define requires name argument to be unique', function() {
    class XDuplicate extends HTMLElement {}
    customElements.define('x-duplicate', XDuplicate);
    assert.throws(function() {
      customElements.define('x-duplicate', XDuplicate);
    }, '', 'customElements.define failed to throw when called multiple times with the same element name');
  });

  test('customElements.define create via new', function() {
    class XFoo extends HTMLElement {}
    // register x-foo
    customElements.define('x-foo', XFoo);
    // create an instance via new
    var xfoo = new XFoo();
    // test localName
    assert.equal(xfoo.localName, 'x-foo');
    // test instanceof
    assert.instanceOf(xfoo, XFoo);
    // attach content
    work.appendChild(xfoo).textContent = '[x-foo]';
    // reacquire
    var xfoo = work.querySelector('x-foo');
    // test textContent
    assert.equal(xfoo.textContent, '[x-foo]');
  });

  test('customElements.define create subclass via new', function() {
    class XSuper1 extends HTMLElement {}
    class XSub1 extends XSuper1 {}
    customElements.define('x-super-1', XSuper1);
    customElements.define('x-sub-1', XSub1);

    // create an instance via new
    var xsuper = new XSuper1();
    var xsub = new XSub1();

    // test localName
    assert.equal(xsuper.localName, 'x-super-1');
    assert.equal(xsub.localName, 'x-sub-1');

    // test instanceof
    assert.instanceOf(xsuper, XSuper1);
    assert.instanceOf(xsub, XSub1);
  });

  test('customElements.define create ES5 via new', function() {
    function XFooES5() {
      // Note the return is super (ahem) important!
      return HTMLElement.call(this);
    }
    XFooES5.prototype = Object.create(HTMLElement.prototype);
    Object.defineProperty(XFooES5.prototype, 'constructor', {value: XFooES5});
    // register x-foo
    customElements.define('x-foo-es5', XFooES5);
    // create an instance via new
    var xfoo = new XFooES5();
    // test localName
    assert.equal(xfoo.localName, 'x-foo-es5');
    // test instanceof
    assert.instanceOf(xfoo, XFooES5);
  });

  test('customElements.define create via createElement', function() {
    class XFoo2 extends HTMLElement {}
    // register x-foo
    var XFoo = customElements.define('x-foo2', XFoo2);
    // create an instance via createElement
    var xfoo = document.createElement('x-foo2');
    // test localName
    assert.equal(xfoo.localName, 'x-foo2');
    // test instanceof
    assert.instanceOf(xfoo, XFoo2);
    // attach content
    xfoo.textContent = '[x-foo2]';
    // test textContent
    assert.equal(xfoo.textContent, '[x-foo2]');
  });

  test('customElements.define create subclass via createElement', function() {
    class XSuper2 extends HTMLElement {}
    class XSub2 extends XSuper2 {}
    customElements.define('x-super-2', XSuper2);
    customElements.define('x-sub-2', XSub2);


    // create an instance via createElement
    var xsuper = document.createElement('x-super-2');
    var xsub = document.createElement('x-sub-2');

    // test localName
    assert.equal(xsuper.localName, 'x-super-2');
    assert.equal(xsub.localName, 'x-sub-2');

    // test instanceof
    assert.instanceOf(xsuper, XSuper2);
    assert.instanceOf(xsub, XSub2);
  });

  test('customElements.define create ES5 via createElement', function() {
    function XBarES5() {
      return HTMLElement.call(this);
    }
    XBarES5.prototype = Object.create(HTMLElement.prototype);
    Object.defineProperty(XBarES5.prototype, 'constructor', {value: XBarES5});
    // register x-foo
    customElements.define('x-bar-es5', XBarES5);
    // create an instance via createElement
    var xbar = document.createElement('x-bar-es5');
    // test localName
    assert.equal(xbar.localName, 'x-bar-es5');
    // test instanceof
    assert.instanceOf(xbar, XBarES5);
  });

  test('customElements.define create via createElementNS', function() {
    class XFoo3 extends HTMLElement {}
    // register x-foo
    customElements.define('x-foo3', XFoo3);
    // create an instance via createElementNS
    var xfoo = document.createElementNS(HTMLNS, 'x-foo3');
    // test instanceof
    assert.instanceOf(xfoo, XFoo3);
    // test localName
    assert.equal(xfoo.localName, 'x-foo3');
  });

  test('customElements.define treats names as case insensitive', function() {
    class XCase extends HTMLElement {
      constructor() {
        super();
        this.isXCase = true;
      }
    }
    customElements.define('X-CASE', XCase);
    // createElement
    var x = document.createElement('X-CASE');
    assert.equal(x.isXCase, true);
    x = document.createElement('x-case');
    assert.equal(x.isXCase, true);
    // createElementNS
    // NOTE: createElementNS is case sensitive, disable tests
    // x = document.createElementNS(HTMLNS, 'X-CASE');
    // assert.equal(x.isXCase, true);
    // x = document.createElementNS(HTMLNS, 'x-case');
    // assert.equal(x.isXCase, true);
    // upgrade

    // TODO: uncomment when upgrades implemented
    // work.innerHTML = '<X-CASE></X-CASE><x-CaSe></x-CaSe>';
    // customElements.flush();
    // assert.equal(work.firstChild.isXCase, true);
    // assert.equal(work.firstChild.nextSibling.isXCase, true);
  });

  test('customElements.define create multiple instances', function() {
    // create an instance
    var xfoo1 = document.createElement('x-foo');
    // create another instance
    var xfoo2 = document.createElement('x-foo');

    assert.notStrictEqual(xfoo1, xfoo2);
    // test textContent
    xfoo1.textContent = '[x-foo1]';
    xfoo2.textContent = '[x-foo2]';
    assert.equal(xfoo1.textContent, '[x-foo1]');
    assert.equal(xfoo2.textContent, '[x-foo2]');
  });

  test('customElements.define calls constructor only once', function() {
    var count = 0;
    class XConstructor extends HTMLElement {
      constructor() {
        super();
        count++;
      }
    }
    customElements.define('x-constructor', XConstructor);
    var xconstructor = new XConstructor();
    assert.equal(count, 1);
  });

  test('customElements.define [connected|disconnected]Callbacks', function() {
    class XCallbacks extends HTMLElement {
      constructor() {
        super();
        this.connected = false;
        this.disconnected = false;
      }

      connectedCallback() {
        this.connected = true;
      }

      disconnectedCallback() {
        this.disconnected = true;
      }
    }
    customElements.define('x-callbacks', XCallbacks);
    var e = new XCallbacks();
    assert.isFalse(e.connected);
    assert.isFalse(e.disconnected);

    work.appendChild(e);
    customElements.flush();
    assert.isTrue(e.connected);
    assert.isFalse(e.disconnected);

    work.removeChild(e);
    customElements.flush();
    assert.isTrue(e.connected);
    assert.isTrue(e.disconnected);
  });


  test('customElements.define attributeChangedCallback in prototype', function(done) {
    class XBoo extends HTMLElement {
      static get observedAttributes() {
        return ['foo'];
      }

      attributeChangedCallback(inName, inOldValue) {
        if (inName == 'foo' && inOldValue == 'bar'
            && this.attributes.foo.value == 'zot') {
          done();
        }
      }
    }
    customElements.define('x-boo-acp', XBoo);
    var xboo = new XBoo();
    xboo.setAttribute('foo', 'bar');
    xboo.setAttribute('foo', 'zot');
  });

  test('customElements.define connectedCallbacks in prototype', function() {
    var inserted = 0;
    class XBoo extends HTMLElement {
      connectedCallback() {
        inserted++;
      }
    }
    customElements.define('x-boo-at', XBoo);
    var xboo = new XBoo();
    assert.equal(inserted, 0, 'inserted must be 0');
    work.appendChild(xboo);
    customElements.flush();
    assert.equal(inserted, 1, 'inserted must be 1');
    work.removeChild(xboo);
    customElements.flush();
    assert(!xboo.parentNode);
    work.appendChild(xboo);
    customElements.flush();
    assert.equal(inserted, 2, 'inserted must be 2');
  });

  test('attributeChangedCallback for existing observed attributes', function () {
    var changed = [];
    class XBoo extends HTMLElement {
      static get observedAttributes () {
        return ['test1'];
      }
      attributeChangedCallback(name, oldValue, newValue) {
        changed.push({
          name: name,
          oldValue: oldValue,
          newValue: newValue
        });
      }
      connectedCallback() {
        this.innerHTML = 'testing';
      }
    }

    var element = document.createElement('x-boo-at1');
    element.setAttribute('test1', 'test1');
    element.setAttribute('test2', 'test2');
    work.appendChild(element);

    customElements.define('x-boo-at1', XBoo);
    customElements.flush();

    assert.equal(changed.length, 1, 'should only trigger for observed attributes');
    assert.equal(changed[0].name, 'test1', 'name');
    assert.equal(changed[0].oldValue, null, 'oldValue');
    assert.equal(changed[0].newValue, 'test1', 'newValue');
  });

  test('customElements.get', function () {
    class XBoo extends HTMLElement {}
    customElements.define('x-boo-get', XBoo);
    assert.equal(XBoo, customElements.get('x-boo-get'));
  });

  test.only('customElements.whenDefined', function () {
    var promise = customElements.whenDefined('x-when-defined').then(function (r) {
      assert.isUndefined(r);
    });
    class XDefined extends HTMLElement {}
    customElements.define('x-when-defined', XDefined);
    return promise;
  });

  test('document.registerElement disconnectedCallbacks in prototype', function() {
    var ready, inserted, removed;
    class XBoo extends HTMLElement {
      disconnectedCallback() {
        removed = true;
      }
    }
    customElements.define('x-boo-ir2', XBoo);
    var xboo = new XBoo();
    assert(!removed, 'removed must be false [XBoo]');
    work.appendChild(xboo);
    customElements.flush();
    work.removeChild(xboo);
    customElements.flush();
    assert(removed, 'removed must be true [XBoo]');

    ready = inserted = removed = false;
    class XBooBoo extends HTMLElement {
      disconnectedCallback() {
        removed = true;
      }
    }
    customElements.define('x-booboo-ir2', XBooBoo);
    var xbooboo = new XBooBoo();
    assert(!removed, 'removed must be false [XBooBoo]');
    work.appendChild(xbooboo);
    customElements.flush();
    work.removeChild(xbooboo);
    customElements.flush();
    assert(removed, 'removed must be true [XBooBoo]');
  });

  test('node.cloneNode does not upgrade until connected', function() {
    class XBoo extends HTMLElement {
      constructor() {
        super();
        this.__ready__ = true;
      }
    }
    customElements.define('x-boo-clone', XBoo);
    var xboo = new XBoo();
    work.appendChild(xboo);
    customElements.flush();
    var xboo2 = xboo.cloneNode(true);
    customElements.flush();
    assert.isNotOk(xboo2.__ready__, 'clone constructor must be called');
    work.appendChild(xboo2);
    customElements.flush();
    assert.isTrue(xboo2.__ready__, 'clone constructor must be called');
  });

  test('document.importNode upgrades', function() {
    class XImport extends HTMLElement {
      constructor() {
        super();
        this.__ready__ = true;
      }
    }
    customElements.define('x-import', XImport);
    var frag = document.createDocumentFragment();
    frag.appendChild(document.createElement('x-import'));
    assert.isTrue(frag.firstChild.__ready__, 'source element upgraded');
    var imported = document.importNode(frag, true);
    window.imported = imported;
    var importedEl = imported.firstChild;
    assert.isNotOk(importedEl.__ready__, 'imported element upgraded');
    work.appendChild(imported);
    customElements.flush();
    assert.isOk(importedEl.__ready__, 'imported element upgraded');
  });

  test('entered left apply to view', function() {
    var invocations = [];
    var tagName = 'x-entered-left';
    class XEnteredLeft extends HTMLElement {
      constructor() {
        super();
        invocations.push('constructor');
      }
      connectedCallback() {
        invocations.push('entered');
      }
      disconnectedCallback() {
        invocations.push('left');
      }
    }
    customElements.define(tagName, XEnteredLeft);

    var element = document.createElement(tagName);
    customElements.flush();
    assert.deepEqual(invocations, ['constructor'], 'created but not entered view');

    // // note, cannot use instanceof due to IE
    assert.equal(element.__proto__, XEnteredLeft.prototype, 'element is correct type');

    work.appendChild(element)
    customElements.flush();
    assert.deepEqual(invocations, ['constructor', 'entered'],
        'created and entered view');

    element.parentNode.removeChild(element);
    customElements.flush();
    assert.deepEqual(invocations, ['constructor', 'entered', 'left'],
        'created, entered then left view');
  });

  test('connectedCallback ordering', function() {
    var log = [];

    class XOrdering extends HTMLElement {
      connectedCallback() {
        log.push(this.id);
      }
    }

    customElements.define('x-ordering', XOrdering);

    work.innerHTML =
        '<x-ordering id=a>' +
          '<x-ordering id=b></x-ordering>' +
          '<x-ordering id=c>' +
            '<x-ordering id=d></x-ordering>' +
            '<x-ordering id=e></x-ordering>' +
          '</x-ordering>' +
        '</x-ordering>';

    customElements.flush();
    assert.deepEqual(['a', 'b', 'c', 'd', 'e'], log);
  });

  test('connected and disconnected in same turn', function() {
    var log = [];
    class XAD extends HTMLElement {
      connectedCallback() {
        log.push('connected');
      }
      disconnectedCallback() {
        log.push('disconnected');
      }
    }

    customElements.define('x-ad', XAD);
    var el = document.createElement('x-ad');
    work.appendChild(el);
    work.removeChild(el);
    customElements.flush();
    assert.deepEqual(['connected', 'disconnected'], log);
  });

  test('disconnected and re-connected in same turn', function() {
    var log = [];
    class XDA extends HTMLElement {
      connectedCallback() {
        log.push('connected');
      }
      disconnectedCallback() {
        log.push('disconnected');
      }
    }
    customElements.define('x-da', XDA);
    var el = document.createElement('x-da');
    work.appendChild(el);
    customElements.flush();
    log = [];
    work.removeChild(el);
    work.appendChild(el);
    customElements.flush();
    assert.deepEqual(['disconnected', 'connected'], log);
  });

  test('disconnectedCallback ordering', function() {
    var log = [];
    class XOrdering2 extends HTMLElement {
      disconnectedCallback() {
        log.push(this.id);
      }
    }
    customElements.define('x-ordering2', XOrdering2);

    work.innerHTML =
        '<x-ordering2 id=a>' +
          '<x-ordering2 id=b></x-ordering2>' +
          '<x-ordering2 id=c>' +
            '<x-ordering2 id=d></x-ordering2>' +
            '<x-ordering2 id=e></x-ordering2>' +
          '</x-ordering2>' +
        '</x-ordering2>';

      customElements.flush();
      work.removeChild(work.firstElementChild);
      customElements.flush();
      assert.deepEqual(['a', 'b', 'c', 'd', 'e'], log);
  });

  test('instanceof', function() {
    class XInstance extends HTMLElement {}
    customElements.define('x-instance', XInstance);
    var x = document.createElement('x-instance');
    assert.instanceOf(x, XInstance, 'instanceof failed for x-instance');

    x = document.createElementNS(HTMLNS, 'x-instance');
    assert.instanceOf(x, XInstance, 'instanceof failed for x-instance');

    class XInstance2 extends XInstance {}
    customElements.define('x-instance2', XInstance2);

    var x2 = document.createElement('x-instance2');
    assert.instanceOf(x2, XInstance2, 'instanceof failed for x-instance2');
    assert.instanceOf(x2, XInstance, 'instanceof failed for x-instance2');
    x2 = document.createElementNS(HTMLNS, 'x-instance2');
    assert.instanceOf(x2, XInstance2, 'instanceof failed for x-instance2');
    assert.instanceOf(x2, XInstance, 'instanceof failed for x-instance2');
  });

  var innerHTMLDescriptor =
      Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  var innerTestFn = innerHTMLDescriptor.configurable ? test : test.skip;

  test('innerHTML on disconnected elements customizes contents', function() {
    var passed = false;
    class XInner extends HTMLElement {
      constructor() {
        super();
        passed = true;
      }
    }
    customElements.define('x-inner', XInner);
    var div = document.createElement('div');
    div.innerHTML = '<x-inner></x-inner>';
    customElements.flush();
    assert.isTrue(passed);
  });


});
