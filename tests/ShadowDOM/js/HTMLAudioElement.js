/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTMLAudioElement', function() {

  test('instanceof', function() {
    var audio = document.createElement('audio');
    assert.instanceOf(audio, HTMLAudioElement);
    assert.instanceOf(audio, Audio);
    assert.instanceOf(audio, HTMLMediaElement);
    assert.instanceOf(audio, HTMLElement);
  });

  test('constructor', function() {
    var audio = document.createElement('audio');
    assert.equal(audio.constructor, HTMLAudioElement);
  });

  test('Audio', function() {
    var audio = new Audio();
    assert.instanceOf(audio, HTMLAudioElement);
    assert.instanceOf(audio, Audio);
    assert.instanceOf(audio, HTMLMediaElement);
    assert.instanceOf(audio, HTMLElement);
  });

  test('Audio arguments', function() {
    var audio = new Audio();
    assert.isFalse(audio.hasAttribute('src'));
    assert.equal(audio.getAttribute('preload'), 'auto');

    var src = 'foo.wav';
    var audio = new Audio(src);
    assert.equal(audio.getAttribute('src'), 'foo.wav');
  });

  test('Audio called as function', function() {
    assert.throws(Audio, TypeError);
  });

  test('Audio basics', function() {
    var audio = new Audio();
    assert.equal('audio', audio.localName);

    var div = document.createElement('div');
    div.appendChild(audio);

    assert.equal(div.firstChild, audio);
    assert.equal('<div><audio preload="auto"></audio></div>', div.outerHTML);
  });

});
