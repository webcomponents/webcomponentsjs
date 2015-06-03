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

var CSS_URL_REGEXP = /(url\()([^)]*)(\))/g;
var CSS_IMPORT_REGEXP = /(@import[\s]+(?!url\())([^;]*)(;)/g;

// path fixup: style elements in imports must be made relative to the main
// document. We fixup url's in url() and @import.
var path = {

  resolveUrlsInStyle: function(style, linkUrl) {
    var doc = style.ownerDocument;
    var resolver = doc.createElement('a');
    style.textContent = this.resolveUrlsInCssText(style.textContent, linkUrl, resolver);
    return style;
  },

  resolveUrlsInCssText: function(cssText, linkUrl, urlObj) {
    var r = this.replaceUrls(cssText, urlObj, linkUrl, CSS_URL_REGEXP);
    r = this.replaceUrls(r, urlObj, linkUrl, CSS_IMPORT_REGEXP);
    return r;
  },

  replaceUrls: function(text, urlObj, linkUrl, regexp) {
    return text.replace(regexp, function(m, pre, url, post) {
      var urlPath = url.replace(/["']/g, '');
      if (linkUrl) {
        urlPath = (new URL(urlPath, linkUrl)).href;
      }
      urlObj.href = urlPath;
      urlPath = urlObj.href;
      return pre + '\'' + urlPath + '\'' + post;
    });
  }

};

// exports
scope.path = path;

});
