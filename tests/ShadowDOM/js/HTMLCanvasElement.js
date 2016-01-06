/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('HTMLCanvasElement', function() {

  var iconUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHklEQVQ4T2Nk+A+EFADGUQMYRsOAYTQMgHloGKQDAJXkH/HZpKBrAAAAAElFTkSuQmCC';

  test('getContext null', function() {
    var canvas = document.createElement('canvas');
    // IE10 returns undefined instead of null
    assert.isTrue(canvas.getContext('unknown') == null);
  });

  test('getContext 2d', function() {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    assert.instanceOf(context, CanvasRenderingContext2D);
    assert.equal(context.canvas, canvas);
  });

  test('getContext webgl', function() {
    // IE10 does not have WebGL.
    if (typeof WebGLRenderingContext === 'undefined')
      return;

    var canvas = document.createElement('canvas');
    var context = null;
    // Firefox throws exception if graphics card is not supported
    try {
      context = canvas.getContext('webgl');
    }
    catch(ex) {
    }
    // Chrome returns null if the graphics card is not supported
    assert.isTrue(context === null || context instanceof WebGLRenderingContext);

    if (context != null)
      assert.equal(context.canvas, canvas);
  });

  test('context instance properties', function() {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    assert.isString(context.fillStyle);
    assert.isString(context.strokeStyle);
    assert.isString(context.textBaseline);
    assert.isString(context.textAlign);
    assert.isString(context.font);

    // lineDashOffset is not available in Firefox 25
    // assert.isNumber(context.lineDashOffset);

    assert.isString(context.shadowColor);
    assert.isNumber(context.shadowBlur);
    assert.isNumber(context.shadowOffsetY);
    assert.isNumber(context.shadowOffsetX);
    assert.isNumber(context.miterLimit);
    assert.isString(context.lineJoin);
    assert.isString(context.lineCap);
    assert.isNumber(context.lineWidth);
    assert.isNumber(context.globalAlpha);
  });

  test('2d drawImage using new Image', function(done) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    // var img = new Image();
    var img = document.createElement('img');
    img.width = img.height = 32;
    img.onload = function() {
      context.drawImage(img, 0, 0);
      done();
    };
    img.src = iconUrl;
  });

  test('2d drawImage', function(done) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var img = document.createElement('img');
    img.onload = function() {
      context.drawImage(img, 0, 0);
      done();
    };
    img.src = iconUrl;
  });

  test('2d createPattern', function(done) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var img = document.createElement('img');
    img.onload = function() {
      var pattern = context.createPattern(img, 'repeat');
      done();
    };
    img.src = iconUrl;
  });

  test('WebGL texImage2D', function(done) {
    var canvas = document.createElement('canvas');
    var gl = null;
    // Firefox throws exception if graphics card is not supported
    try {
      gl = canvas.getContext('webgl');
    } catch (ex) {
      console.error(ex);
    }
    // IE10 does not have WebGL.
    // Chrome returns null if the graphics card is not supported
    if (!gl) {
      done();
      return;
    }

    var imageData = document.createElement('canvas').getContext('2d').
        createImageData(16, 16);
    var arrayBufferView = new Uint8Array(16 * 16 * 4);

    var img = document.createElement('img');
    img.onload = function() {
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                    imageData);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                    16, 16, 0,
                    gl.RGBA, gl.UNSIGNED_BYTE, arrayBufferView);

      done();
    };
    img.src = iconUrl;
  });

  test('WebGL context instance properties', function() {
    var canvas = document.createElement('canvas');
    var gl = null;
    // Firefox throws exception if graphics card is not supported
    try {
      gl = canvas.getContext('webgl');
    } catch (ex) {
    }
    // IE10 does not have WebGL.
    // Chrome returns null if the graphics card is not supported
    if (!gl) {
      return;
    }

    assert.isNumber(gl.drawingBufferHeight);
    assert.isNumber(gl.drawingBufferWidth);
  });

  test('WebGL texSubImage2D', function(done) {
    var canvas = document.createElement('canvas');
    var gl = null;
    // Firefox throws exception if graphics card is not supported
    try {
      gl = canvas.getContext('webgl');
    } catch(ex) {
    }
    // IE10 does not have WebGL.
    // Chrome returns null if the graphics card is not supported
    if (!gl) {
      done();
      return;
    }

    var arrayBufferView = new Uint8Array(16 * 16 * 4);

    var img = document.createElement('img');
    img.onload = function() {
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0,
          16, 16,
          gl.RGBA, gl.UNSIGNED_BYTE, arrayBufferView);
      done();
    };
    img.src = iconUrl;
  });

  test('width', function() {
    var canvas = document.createElement('canvas');
    assert.isNumber(canvas.width);
  });

  test('height', function() {
    var canvas = document.createElement('canvas');
    assert.isNumber(canvas.height);
  });

  test('instanceof', function() {
    assert.instanceOf(document.createElement('canvas'), HTMLCanvasElement);
  });

  test('constructor', function() {
    assert.equal(HTMLCanvasElement,
                 document.createElement('canvas').constructor);
  });

});
