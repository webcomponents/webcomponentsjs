/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
window.HTMLImports.addModule(function(scope) {

/*
  xhr processor.
*/
var xhr = {
  async: true,

  ok: function(request) {
    return (request.status >= 200 && request.status < 300)
        || (request.status === 304)
        || (request.status === 0);
  },

  load: function(url, next, nextContext) {
    var request = new XMLHttpRequest();
    if (scope.flags.debug || scope.flags.bust) {
      url += '?' + Math.random();
    }
    request.open('GET', url, xhr.async);

    // Safari caches cross-origin resources in a ridiculous way.
    // We'll work around this annoyance by monkeypatching,
    // to ensure that we never ask for cached data.
    // https://bugs.webkit.org/show_bug.cgi?id=82672
    var isChromium = !!window.chrome; //http://browserhacks.com/#hack-dee2c3ab477a0324b6a2283c434108c8
    var isFF = !!navigator.userAgent.match(/firefox/i); //http://browserhacks.com/#hack-b3c30c5aee06b9717eda9a5266f0eb07
    var isIE = window.navigator.msPointerEnabled; //http://browserhacks.com/#hack-2f32c95ac8c021c463de0fdf685acb29
    if (!isChromium && !isFF && !isIE) {
      request.setRequestHeader("Cache-Control", "max-age=0, no-cache, no-store");
    }

    request.addEventListener('readystatechange', function(e) {
      if (request.readyState === 4) {
        // Servers redirecting an import can add a Location header to help us
        // polyfill correctly.
        var redirectedUrl = null;
        try {
          var locationHeader = request.getResponseHeader("Location");
          if (locationHeader) {
            redirectedUrl = (locationHeader.substr( 0, 1 ) === "/")
              ? location.origin + locationHeader  // Location is a relative path
              : locationHeader;                   // Full path
          }
        } catch ( e ) {
            console.error( e.message );
        }
        next.call(nextContext, !xhr.ok(request) && request,
            request.response || request.responseText, redirectedUrl);
      }
    });
    request.send();
    return request;
  },

  loadDocument: function(url, next, nextContext) {
    this.load(url, next, nextContext).responseType = 'document';
  }

};

// exports
scope.xhr = xhr;

});
