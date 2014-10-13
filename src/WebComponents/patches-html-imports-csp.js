/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(scope) {

if (!scope) {
  scope = window.HTMLImports = {flags:{}};
}

// Patches for running in a sandboxed iframe.
// The origin is set to null when we're running in a sandbox, so we
// ask the parent window to fetch the resources.

var xhr = {
  callbacks: {},
  load: function(url, next, nextContext) {
    xhr.callbacks[url] = {
      next: next,
      nextContext: nextContext
    };
    parent.postMessage({
      url: url,
      bust: scope.flags.debug || scope.flags.bust
    }, '*');
  },
  receive: function(url, err, resource) {
    var cb = xhr.callbacks[url];
    if (cb) {
      var next = cb.next;
      var nextContext = cb.nextContext;
      next.call(nextContext, err, resource, url);
    }
  }
};

xhr.loadDocument = xhr.load;

window.addEventListener('message', function(e) {
  xhr.receive(e.data.url, e.data.err, e.data.resource);
});

// exports

scope.xhr = xhr;

})(window.HTMLImports);
