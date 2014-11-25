/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
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
