/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
(function(scope){

// imports
var useNative = scope.useNative;
var initializeModules = scope.initializeModules;

var isIE = scope.isIE;

// If native, setup stub api and bail.
// NOTE: we fire `WebComponentsReady` under native for api compatibility
if (useNative) {
  // stub
  var nop = function() {};

  // exports
  scope.watchShadow = nop;
  scope.upgrade = nop;
  scope.upgradeAll = nop;
  scope.upgradeDocumentTree = nop;
  scope.upgradeSubtree = nop;
  scope.takeRecords = nop;

  scope.instanceof = function(obj, base) {
    return obj instanceof base;
  };

} else {
  // Initialize polyfill modules. Note, polyfill modules are loaded but not
  // executed; this is a convenient way to control which modules run when
  // the polyfill is required and allows the polyfill to load even when it's
  // not needed.
  initializeModules();
}

// imports
var upgradeDocumentTree = scope.upgradeDocumentTree;
var upgradeDocument = scope.upgradeDocument;

// ShadowDOM polyfill wraps elements but some elements like `document`
// cannot be wrapped so we help the polyfill by wrapping some elements.
if (!window.wrap) {
  if (window.ShadowDOMPolyfill) {
    window.wrap = window.ShadowDOMPolyfill.wrapIfNeeded;
    window.unwrap = window.ShadowDOMPolyfill.unwrapIfNeeded;
  } else {
    window.wrap = window.unwrap = function(node) {
      return node;
    };
  }
}

// eagarly upgrade imported documents
if (window.HTMLImports) {
  window.HTMLImports.__importsParsingHook = function(elt) {
    if (elt.import) {
      upgradeDocument(wrap(elt.import));
    }
  };
}

// bootstrap parsing
function bootstrap() {
  // one more upgrade to catch out of order registrations
  upgradeDocumentTree(window.wrap(document));
  // install upgrade hook if HTMLImports are available
  // set internal 'ready' flag, now document.registerElement will trigger
  // synchronous upgrades
  window.CustomElements.ready = true;
  // async to ensure *native* custom elements upgrade prior to this
  // DOMContentLoaded can fire before elements upgrade (e.g. when there's
  // an external script)
  // Delay doubly to help workaround
  // https://code.google.com/p/chromium/issues/detail?id=516550.
  // CustomElements must use requestAnimationFrame in attachedCallback
  // to query style/layout data. The WebComponentsReady event is intended
  // to convey overall readiness, which ideally should be after elements
  // are attached. Adding a slight extra delay to WebComponentsReady
  // helps preserve this guarantee.
  var requestAnimationFrame = window.requestAnimationFrame || function(f) {
    setTimeout(f, 16);
  };
  requestAnimationFrame(function() {
    setTimeout(function() {
      // capture blunt profiling data
      window.CustomElements.readyTime = Date.now();
      if (window.HTMLImports) {
        window.CustomElements.elapsed = window.CustomElements.readyTime - window.HTMLImports.readyTime;
      }
      // notify the system that we are bootstrapped
      document.dispatchEvent(
        new CustomEvent('WebComponentsReady', {bubbles: true})
      );
    });
  });
}

// When loading at readyState complete time (or via flag), boot custom elements
// immediately.
// If relevant, HTMLImports must already be loaded.
if (document.readyState === 'complete' || scope.flags.eager) {
  bootstrap();
// When loading at readyState interactive time, bootstrap only if HTMLImports
// are not pending. Also avoid IE as the semantics of this state are unreliable.
} else if (document.readyState === 'interactive' && !window.attachEvent &&
    (!window.HTMLImports || window.HTMLImports.ready)) {
  bootstrap();
// When loading at other readyStates, wait for the appropriate DOM event to
// bootstrap.
} else {
  var loadEvent = window.HTMLImports && !window.HTMLImports.ready ?
      'HTMLImportsLoaded' : 'DOMContentLoaded';
  window.addEventListener(loadEvent, bootstrap);
}

})(window.CustomElements);
