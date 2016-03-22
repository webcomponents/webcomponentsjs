/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
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
    class XFoo extends HTMLElement {
      constructor() {
        CustomElements.setCurrentTag('x-foo');
        super();
      }
    }
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
    class XSuper1 extends HTMLElement {
      constructor() {
        CustomElements.setCurrentTag('x-super-1');
        super();
      }
    }
    class XSub1 extends XSuper1 {
      constructor() {
        CustomElements.setCurrentTag('x-sub-1');
        super();
      }
    }
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
      CustomElements.setCurrentTag('x-foo-es5');
      // Note the return is super (ahem) important!
      return HTMLElement.call(this);
    }
    XFooES5.prototype = Object.create(HTMLElement.prototype);
    XFooES5.prototype.constructor = XFooES5;
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
    class XFoo2 extends HTMLElement {
      constructor() {
        CustomElements.setCurrentTag('x-foo');
        super();
      }
    }
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
    class XSuper2 extends HTMLElement {
      constructor() {
        CustomElements.setCurrentTag('x-super-1');
        super();
      }
    }
    class XSub2 extends XSuper2 {
      constructor() {
        CustomElements.setCurrentTag('x-sub-1');
        super();
      }
    }
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
      CustomElements.setCurrentTag('x-bar-es5');
      return HTMLElement.call(this);
    }
    XBarES5.prototype = Object.create(HTMLElement.prototype);
    XBarES5.prototype.constructor = XBarES5;
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
    class XFoo3 extends HTMLElement {
      constructor() {
        CustomElements.setCurrentTag('x-foo3');
        super();
      }
    }
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
        CustomElements.setCurrentTag('x-case');
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
    // CustomElements.takeRecords();
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
        CustomElements.setCurrentTag('x-constructor');
        super();
        count++;
      }
    }
    customElements.define('x-constructor', XConstructor);
    var xconstructor = new XConstructor();
    assert.equal(count, 1);
  });

  test('customElements.define [attached|detached]Callbacks', function(done) {
    class XCallbacks extends HTMLElement {
      constructor() {
        CustomElements.setCurrentTag('x-callbacks');
        super();
        this.attached = false;
        this.detached = false;
      }

      attachedCallback() {
        this.attached = true;
      }

      detachedCallback() {
        this.detached = true;
      }
    }
    customElements.define('x-callbacks', XCallbacks);
    var e = new XCallbacks();
    assert.isFalse(e.attached);
    assert.isFalse(e.detached);

    work.appendChild(e);
    CustomElements.flush();
    assert.isTrue(e.attached);
    assert.isFalse(e.detached);

    work.removeChild(e);
    CustomElements.flush();
    assert.isTrue(e.attached);
    assert.isTrue(e.detached);

    done();
  });


  test('customElements.define attributeChangedCallback in prototype', function(done) {
    class XBoo extends HTMLElement {
      static get observedAttributes() {
        return ['foo'];
      }

      constructor() {
        CustomElements.setCurrentTag('x-boo-acp');
        super();
      }
      attributeChangedCallback(inName, inOldValue) {
        if (inName == 'foo' && inOldValue=='bar'
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

  test('customElements.define attachedCallbacks in prototype', function(done) {
    var inserted = 0;
    class XBoo extends HTMLElement {
      constructor() {
        CustomElements.setCurrentTag('x-boo-at');
        super();
      }
      attachedCallback() {
        inserted++;
      }
    }
    customElements.define('x-boo-at', XBoo);
    var xboo = new XBoo();
    assert.equal(inserted, 0, 'inserted must be 0');
    work.appendChild(xboo);
    CustomElements.flush();
    assert.equal(inserted, 1, 'inserted must be 1');
    work.removeChild(xboo);
    CustomElements.flush();
    assert(!xboo.parentNode);
    work.appendChild(xboo);
    CustomElements.flush();
    assert.equal(inserted, 2, 'inserted must be 2');
    done();
  });

  test('document.registerElement detachedCallbacks in prototype', function(done) {
    var ready, inserted, removed;
    class XBoo extends HTMLElement {
      constructor() {
        CustomElements.setCurrentTag('x-boo-ir2');
        super();
      }
      detachedCallback() {
        removed = true;
      }
    }
    customElements.define('x-boo-ir2', XBoo);
    var xboo = new XBoo();
    assert(!removed, 'removed must be false [XBoo]');
    work.appendChild(xboo);
    CustomElements.flush();
    work.removeChild(xboo);
    CustomElements.flush();
    assert(removed, 'removed must be true [XBoo]');

    ready = inserted = removed = false;
    class XBooBoo extends HTMLElement {
      constructor() {
        CustomElements.setCurrentTag('x-booboo-ir2');
        super();
      }
      detachedCallback() {
        removed = true;
      }
    }
    customElements.define('x-booboo-ir2', XBooBoo);
    var xbooboo = new XBooBoo();
    assert(!removed, 'removed must be false [XBooBoo]');
    work.appendChild(xbooboo);
    CustomElements.flush();
    work.removeChild(xbooboo);
    CustomElements.flush();
    assert(removed, 'removed must be true [XBooBoo]');
    done();
  });

  // test('document.registerElement can use Functions as definitions', function() {
  //   // function used as Custom Element defintion
  //   function A$A() {
  //     this.alive = true;
  //   }
  //   A$A.prototype = Object.create(HTMLElement.prototype);
  //   // bind createdCallback to function body
  //   A$A.prototype.createdCallback = A$A;
  //   A$A = document.registerElement('a-a', A$A);
  //   // test via new
  //   var a = new A$A();
  //   assert.equal(a.alive, true);
  //   // test via parser upgrade
  //   work.innerHTML = '<a-a></a-a>';
  //   CustomElements.takeRecords();
  //   assert.equal(work.firstElementChild.alive, true);
  // });

  test('node.cloneNode does not upgrade until attach', function(done) {
    class XBoo extends HTMLElement {
      constructor() {
        CustomElements.setCurrentTag('x-boo-clone');
        super();
        this.__ready__ = true;
      }
    }
    customElements.define('x-boo-clone', XBoo);
    var xboo = new XBoo();
    work.appendChild(xboo);
    CustomElements.flush();
    var xboo2 = xboo.cloneNode(true);
    CustomElements.flush();
    assert.isNotOk(xboo2.__ready__, 'clone createdCallback must be called');
    work.appendChild(xboo2);
    CustomElements.flush();
    assert.isTrue(xboo2.__ready__, 'clone createdCallback must be called');
    done();
  });

  test('document.importNode upgrades', function() {
    class XImport extends HTMLElement {
      constructor() {
        CustomElements.setCurrentTag('x-import');
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
    CustomElements.flush();
    assert.isOk(importedEl.__ready__, 'imported element upgraded');
  });

  // test('entered left apply to view', function() {
  //   var invocations = [];
  //   var elementProto = Object.create(HTMLElement.prototype);
  //   elementProto.createdCallback = function() {
  //     invocations.push('created');
  //   }
  //   elementProto.attachedCallback = function() {
  //     invocations.push('entered');
  //   }
  //   elementProto.detachedCallback = function() {
  //     invocations.push('left');
  //   }
  //   var tagName = 'x-entered-left-view';
  //   var CustomElement = document.registerElement(tagName, { prototype: elementProto });
  //
  //   var docB = document.implementation.createHTMLDocument('');
  //   docB.body.innerHTML = '<' + tagName + '></' + tagName + '>';
  //   CustomElements.upgradeDocumentTree(docB);
  //   CustomElements.takeRecords();
  //   assert.deepEqual(invocations, ['created'], 'created but not entered view');
  //
  //   var element = docB.body.childNodes[0];
  //   // note, cannot use instanceof due to IE
  //   assert.equal(element.__proto__, CustomElement.prototype, 'element is correct type');
  //
  //   work.appendChild(element)
  //   CustomElements.takeRecords();
  //   assert.deepEqual(invocations, ['created', 'entered'],
  //       'created and entered view');
  //
  //   docB.body.appendChild(element);
  //   CustomElements.takeRecords();
  //   assert.deepEqual(invocations, ['created', 'entered', 'left'],
  //       'created, entered then left view');
  // });
  //
  // test('attachedCallback ordering', function() {
  //   var log = [];
  //   var p = Object.create(HTMLElement.prototype);
  //   p.attachedCallback = function() {
  //     log.push(this.id);
  //   };
  //   document.registerElement('x-boo-ordering', {prototype: p});
  //
  //   work.innerHTML =
  //       '<x-boo-ordering id=a>' +
  //         '<x-boo-ordering id=b></x-boo-ordering>' +
  //         '<x-boo-ordering id=c>' +
  //           '<x-boo-ordering id=d></x-boo-ordering>' +
  //           '<x-boo-ordering id=e></x-boo-ordering>' +
  //         '</x-boo-ordering>' +
  //       '</x-boo-ordering>';
  //
  //   CustomElements.takeRecords();
  //   assert.deepEqual(['a', 'b', 'c', 'd', 'e'], log);
  // });
  //
  // test('attached and detached in same turn', function(done) {
  //   var log = [];
  //   var p = Object.create(HTMLElement.prototype);
  //   p.attachedCallback = function() {
  //     log.push('attached');
  //   };
  //   p.detachedCallback = function() {
  //     log.push('detached');
  //   };
  //   document.registerElement('x-ad', {prototype: p});
  //   var el = document.createElement('x-ad');
  //   work.appendChild(el);
  //   work.removeChild(el);
  //   setTimeout(function() {
  //     assert.deepEqual(['attached', 'detached'], log);
  //     done();
  //   });
  // });
  //
  // test('detached and re-attached in same turn', function(done) {
  //   var log = [];
  //   var p = Object.create(HTMLElement.prototype);
  //   p.attachedCallback = function() {
  //     log.push('attached');
  //   };
  //   p.detachedCallback = function() {
  //     log.push('detached');
  //   };
  //   document.registerElement('x-da', {prototype: p});
  //   var el = document.createElement('x-da');
  //   work.appendChild(el);
  //   CustomElements.takeRecords();
  //   log = [];
  //   work.removeChild(el);
  //   work.appendChild(el);
  //   setTimeout(function() {
  //     assert.deepEqual(['detached', 'attached'], log);
  //     done();
  //   });
  // });
  //
  // test('detachedCallback ordering', function() {
  //   var log = [];
  //   var p = Object.create(HTMLElement.prototype);
  //   p.detachedCallback = function() {
  //    log.push(this.id);
  //   };
  //   document.registerElement('x-boo2-ordering', {prototype: p});
  //
  //   work.innerHTML =
  //       '<x-boo2-ordering id=a>' +
  //         '<x-boo2-ordering id=b></x-boo2-ordering>' +
  //         '<x-boo2-ordering id=c>' +
  //           '<x-boo2-ordering id=d></x-boo2-ordering>' +
  //           '<x-boo2-ordering id=e></x-boo2-ordering>' +
  //         '</x-boo2-ordering>' +
  //       '</x-boo2-ordering>';
  //
  //     CustomElements.takeRecords();
  //     work.removeChild(work.firstElementChild);
  //     CustomElements.takeRecords();
  //     assert.deepEqual(['a', 'b', 'c', 'd', 'e'], log);
  // });
  //
  // test('instanceof', function() {
  //   var p = Object.create(HTMLElement.prototype);
  //   var PCtor = document.registerElement('x-instance', {prototype: p});
  //   var x = document.createElement('x-instance');
  //   assert.isTrue(CustomElements.instanceof(x, PCtor), 'instanceof failed for x-instance');
  //   x = document.createElementNS(HTMLNS, 'x-instance');
  //   assert.isTrue(CustomElements.instanceof(x, PCtor), 'instanceof failed for x-instance');
  //
  //   var p2 = Object.create(PCtor.prototype);
  //   var P2Ctor = document.registerElement('x-instance2', {prototype: p2});
  //   var x2 = document.createElement('x-instance2');
  //   assert.isTrue(CustomElements.instanceof(x2, P2Ctor), 'instanceof failed for x-instance2');
  //   assert.isTrue(CustomElements.instanceof(x2, PCtor), 'instanceof failed for x-instance2');
  //   x2 = document.createElementNS(HTMLNS, 'x-instance2');
  //   assert.isTrue(CustomElements.instanceof(x2, P2Ctor), 'instanceof failed for x-instance2');
  //   assert.isTrue(CustomElements.instanceof(x2, PCtor), 'instanceof failed for x-instance2');
  // });
  //
  //
  // test('instanceof typeExtension', function() {
  //   var p = Object.create(HTMLButtonElement.prototype);
  //   var PCtor = document.registerElement('x-button-instance', {prototype: p, extends: 'button'});
  //   var x = document.createElement('button', 'x-button-instance');
  //   assert.isTrue(CustomElements.instanceof(x, PCtor), 'instanceof failed for x-button-instance');
  //   assert.isTrue(CustomElements.instanceof(x, HTMLButtonElement), 'instanceof failed for x-button-instance');
  //   x = document.createElementNS(HTMLNS, 'button', 'x-button-instance');
  //   assert.isTrue(CustomElements.instanceof(x, PCtor), 'instanceof failed for x-button-instance');
  //   assert.isTrue(CustomElements.instanceof(x, HTMLButtonElement), 'instanceof failed for x-button-instance');
  //
  //   var p2 = Object.create(PCtor.prototype);
  //   var P2Ctor = document.registerElement('x-button-instance2', {prototype: p2, extends: 'button'});
  //   var x2 = document.createElement('button','x-button-instance2');
  //   assert.isTrue(CustomElements.instanceof(x2, P2Ctor), 'instanceof failed for x-button-instance2');
  //   assert.isTrue(CustomElements.instanceof(x2, PCtor), 'instanceof failed for x-button-instance2');
  //   assert.isTrue(CustomElements.instanceof(x2, HTMLButtonElement), 'instanceof failed for x-button-instance2');
  //   x2 = document.createElementNS(HTMLNS, 'button','x-button-instance2');
  //   assert.isTrue(CustomElements.instanceof(x2, P2Ctor), 'instanceof failed for x-button-instance2');
  //   assert.isTrue(CustomElements.instanceof(x2, PCtor), 'instanceof failed for x-button-instance2');
  //   assert.isTrue(CustomElements.instanceof(x2, HTMLButtonElement), 'instanceof failed for x-button-instance2');
  // });
  //
  // test('extends and prototype mismatch', function() {
  //   var p = Object.create(HTMLElement.prototype);
  //   var PCtor = document.registerElement('not-button', {
  //     extends: 'button',
  //     prototype: p
  //   });
  //
  //   var e = document.createElement('button', 'not-button');
  //
  //   // NOTE: firefox has a hack for instanceof that uses element tagname mapping
  //   // Work around by checking prototype manually
  //   //
  //   var ff = document.createElement('button'); ff.__proto__ = null;
  //   if (ff instanceof HTMLButtonElement) {
  //     // Base proto will be one below custom proto
  //     var proto = e.__proto__.__proto__;
  //     assert.isFalse(proto === HTMLButtonElement.prototype);
  //     assert.isTrue(proto === HTMLElement.prototype);
  //   } else {
  //     assert.isFalse(CustomElements.instanceof(e, HTMLButtonElement));
  //     assert.isTrue(CustomElements.instanceof(e, HTMLElement));
  //   }
  // });

});
