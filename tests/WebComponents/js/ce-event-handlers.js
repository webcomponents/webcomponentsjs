test('Event binding works with both variations of useCapture', function(done) {
    var p = Object.create(HTMLElement.prototype);
    p.attachedCallback = function() {
        var handler = sinon.stub();
        document.addEventListener('click', handler, true);
        document.body.click();
        assert.ok(handler.called);
        handler.reset();

        var handler2 = sinon.stub();
        document.addEventListener('click', handler2);
        document.body.click();
        assert.ok(handler.called);
        assert.ok(handler2.called);
        handler.reset();
        handler2.reset();

        document.removeEventListener('click', handler2);
        document.body.click();
        assert.ok(handler.called);
        assert.notOk(handler2.called);

        done();
    }

    document.registerElement('my-element', {
        prototype: p
    });

    var el = document.createElement('my-element');
    document.body.appendChild(el);
})
