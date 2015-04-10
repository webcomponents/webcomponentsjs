function expectStructure(nodeOrWrapper, nonNullFields) {
  assert(nodeOrWrapper);
  assert.strictEqual(nodeOrWrapper.parentNode, nonNullFields.parentNode || null);
  assert.strictEqual(nodeOrWrapper.previousSibling,
    nonNullFields.previousSibling || null);
  assert.strictEqual(nodeOrWrapper.nextSibling, nonNullFields.nextSibling || null);
  assert.strictEqual(nodeOrWrapper.firstChild, nonNullFields.firstChild || null);
  assert.strictEqual(nodeOrWrapper.lastChild, nonNullFields.lastChild || null);
}

function unwrapAndExpectStructure(node, nonNullFields) {
  for (var p in nonNullFields) {
    //noinspection JSUnfilteredForInLoop
    nonNullFields[p] = ShadowDOMPolyfill.unwrap(nonNullFields[p]);
  }
  expectStructure(ShadowDOMPolyfill.unwrap(node), nonNullFields);
}

function assertArrayEqual(a, b, msg) {
  for (var i = 0; i < a.length; i++) {
    assert.equal(a[i], b[i], msg);
  }
  assert.equal(a.length, b.length, msg);
}

function expectMutationRecord(record, expected) {
  assert.equal(record.type,
    expected.type === undefined ? null : expected.type);
  assert.equal(record.target,
    expected.target === undefined ? null : expected.target);
  assertArrayEqual(record.addedNodes,
    expected.addedNodes === undefined ? [] : expected.addedNodes);
  assertArrayEqual(record.removedNodes,
    expected.removedNodes === undefined ? [] : expected.removedNodes);
  assert.equal(record.previousSibling,
    expected.previousSibling === undefined ?
      null : expected.previousSibling);
  assert.equal(record.nextSibling,
    expected.nextSibling === undefined ? null : expected.nextSibling);
  assert.equal(record.attributeName,
    expected.attributeName === undefined ? null : expected.attributeName);
  assert.equal(record.attributeNamespace,
    expected.attributeNamespace === undefined ?
      null : expected.attributeNamespace);
  assert.equal(record.oldValue,
    expected.oldValue === undefined ? null : expected.oldValue);
}

