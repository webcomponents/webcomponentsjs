/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('TreeWalker', function() {

  var wrap = ShadowDOMPolyfill.wrap;
  var unwrap = ShadowDOMPolyfill.unwrap;
  var isWrapper = ShadowDOMPolyfill.isWrapper;
  var containerDiv, childDiv, a, b, c;

  teardown(function() {
    if (containerDiv && containerDiv.parentNode)
      containerDiv.parentNode.removeChild(containerDiv);
    containerDiv = childDiv = a = b = c = undefined;
  });

  setup(function() {
    containerDiv = document.createElement('div');
    childDiv = document.createElement('div');
    childDiv.innerHTML = '<a title="a">a</a><b title="b">b</b><c title="c">c</c>';
    a = childDiv.firstChild;
    b = a.nextSibling;
    c = childDiv.lastChild;
    containerDiv.appendChild(childDiv);
    document.body.appendChild(containerDiv);
  });

  test('createTreeWalker with document', function() {
    var treeWalker = document.createTreeWalker(childDiv, NodeFilter.SHOW_ELEMENT, null, null);

    assert.instanceOf(treeWalker,TreeWalker);
    assert.equal(TreeWalker, treeWalker.constructor);

    var found;
    while (treeWalker.nextNode()) {
      assert(isWrapper(treeWalker.currentNode));
      if (treeWalker.currentNode.hasAttribute("title")){
        found=treeWalker.currentNode.getAttribute("title")==='a';
        break;
      }
    }
    assert.isTrue(found);
  });

  test('createTreeWalker with wrapped document', function() {
    var treeWalker = wrap(document).createTreeWalker(childDiv, NodeFilter.SHOW_ELEMENT, null);

    assert.instanceOf(treeWalker,TreeWalker);
    assert.equal(TreeWalker, treeWalker.constructor);

    var found;
    while (treeWalker.nextNode()) {
      assert(isWrapper(treeWalker.currentNode));
      if (treeWalker.currentNode.hasAttribute("title")){
        found=treeWalker.currentNode.getAttribute("title")==='a';
        break;
      }
    }
    assert.isTrue(found);
  });

  test('createTreeWalker returns wrapped nodes', function() {
    var treeWalker = document.createTreeWalker(childDiv, NodeFilter.SHOW_ELEMENT, null);

    assert(isWrapper(treeWalker.root));
    assert(isWrapper(treeWalker.nextNode()));
    assert(isWrapper(treeWalker.parentNode()));
    assert(isWrapper(treeWalker.firstChild()));
    assert(isWrapper(treeWalker.lastChild()) ||
                          isWrapper(treeWalker.lastChild())===null);
    assert(isWrapper(treeWalker.previousSibling()) ||
                          isWrapper(treeWalker.previousSibling())===null);
    assert(isWrapper(treeWalker.previousNode()));

  });

  test('createTreeWalker with filter as object with acceptNode function', function() {

    //  NodeFilter.acceptNode as filter does not work in IE.
    // https://dom.spec.whatwg.org/#nodefilter
    if (/Trident/.test(navigator.userAgent))
      return;

    var treeWalker = document.createTreeWalker(childDiv, NodeFilter.SHOW_ELEMENT, {
      acceptNode:function(node){
        assert(isWrapper(node));
        if (node.hasAttribute("title") && node.getAttribute("title")==='a'){
          return NodeFilter.FILTER_ACCEPT;  
        }
        return false;
      }
    });
    
    assert.isNotNull(treeWalker.filter);
    // in FF and IE treeWalker.filter is just a js object
    //assert.instanceOf(treeWalker.filter, NodeFilter);

    // we should have one node only.
    assert.isNotNull(treeWalker.nextNode());
    assert.isNull(treeWalker.nextNode());

  });

  test('createTreeWalker with filter as a function (works under IE and others)', function() {

    var treeWalker = document.createTreeWalker(childDiv, NodeFilter.SHOW_ELEMENT, function(node){
        assert(isWrapper(node));
        if (node.hasAttribute("title") && node.getAttribute("title")==='a'){
          return NodeFilter.FILTER_ACCEPT;
        }
        return false;
      });

    assert.isNotNull(treeWalker.filter);

    // we should have one node only.
    assert.isNotNull(treeWalker.nextNode());
    assert.isNull(treeWalker.nextNode());

  });

  test('createTreeWalker with bogus filter', function() {

    var treeWalker = document.createTreeWalker(childDiv, NodeFilter.SHOW_ELEMENT, {});

    // we should have one node only.
    assert.isNotNull(treeWalker.nextNode());
    assert.isNotNull(treeWalker.nextNode());
    assert.isNotNull(treeWalker.nextNode());
    assert.isNull(treeWalker.nextNode());

  });

  test('get/set currentNode', function() {

    var treeWalker = wrap(document).createTreeWalker(childDiv, NodeFilter.SHOW_ELEMENT);

    assert(treeWalker.currentNode.isEqualNode(childDiv));
    assert(treeWalker.root.isEqualNode(childDiv));

    treeWalker.lastChild();
    assert(treeWalker.currentNode.isEqualNode(c));
    

    treeWalker.currentNode = a;
    assert(treeWalker.currentNode.isEqualNode(a));
    treeWalker.nextNode();
    assert(treeWalker.currentNode.isEqualNode(b));

  });

});
