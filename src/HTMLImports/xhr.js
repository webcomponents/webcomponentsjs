/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
HTMLImports.addModule(function(scope) {

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
    request.addEventListener('readystatechange', function(e) {
      if (request.readyState === 4) {
        // Servers redirecting an import can add a Location header to help us
        // polyfill correctly.
        var locationHeader = request.getResponseHeader("Location");
        var redirectedUrl = null;
        if (locationHeader) {
          var redirectedUrl = (locationHeader.substr( 0, 1 ) === "/")
            ? location.origin + locationHeader  // Location is a relative path
            : locationHeader;                    // Full path
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
