/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(scope) {

  'use strict';

  // polyfill performance.now

  if (!window.performance) {
    var start = Date.now();
    // only at millisecond precision
    window.performance = {now: function(){ return Date.now() - start }};
  }

  // polyfill for requestAnimationFrame

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function() {
      var nativeRaf = window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;

      return nativeRaf ?
        function(callback) {
          return nativeRaf(function() {
            callback(performance.now());
          });
        } :
        function( callback ){
          return window.setTimeout(callback, 1000 / 60);
        };
    })();
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (function() {
      return  window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        function(id) {
          clearTimeout(id);
        };
    })();
  }

  // Make a stub for Polymer() for polyfill purposes; under the HTMLImports
  // polyfill, scripts in the main document run before imports. That means
  // if (1) polymer is imported and (2) Polymer() is called in the main document
  // in a script after the import, 2 occurs before 1. We correct this here
  // by specfiically patching Polymer(); this is not necessary under native
  // HTMLImports.
  var elementDeclarations = [];

  var polymerStub = function(name, dictionary) {
    if ((typeof name !== 'string') && (arguments.length === 1)) {
      Array.prototype.push.call(arguments, document._currentScript);
    }
    elementDeclarations.push(arguments);
  };
  window.Polymer = polymerStub;

  // deliver queued delcarations
  scope.consumeDeclarations = function(callback) {
    scope.consumeDeclarations = function() {
     throw 'Possible attempt to load Polymer twice';
    };
    if (callback) {
      callback(elementDeclarations);
    }
    elementDeclarations = null;
  };

  function installPolymerWarning() {
    if (window.Polymer === polymerStub) {
      window.Polymer = function() {
        throw new Error('You tried to use polymer without loading it first. To ' +
          'load polymer, <link rel="import" href="' + 
          'components/polymer/polymer.html">');
      };
    }
  }

  // Once DOMContent has loaded, any main document scripts that depend on
  // Polymer() should have run. Calling Polymer() now is an error until
  // polymer is imported.
  if (HTMLImports.useNative) {
    installPolymerWarning();
  } else {
    addEventListener('DOMContentLoaded', installPolymerWarning);
  }

})(window.WebComponents);
