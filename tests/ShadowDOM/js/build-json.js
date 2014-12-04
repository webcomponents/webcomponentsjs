/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('build.json', function() {

  teardown(function() {
    delete document.write;
  });

  test('Ensure lists match', function(done) {
    var xhrJson = new XMLHttpRequest;
    // karma serves the test runner at /context.html, need to adjust xhr request url to match
    var requestBase = window.__karma__ ? '/base/ShadowDOM/' : '../';
    xhrJson.open('GET', requestBase + 'build.json');
    xhrJson.onload = function() {
      var buildJson = JSON.parse(xhrJson.responseText);

      var xhrJs = new XMLHttpRequest;
      xhrJs.open('GET', requestBase + 'shadowdom.js');
      xhrJs.onload = function() {
        var sources = [];

        document.write = function(s) {
          var path =
              s.slice(('<script src="' + requestBase).length, - '"><\/script>'.length);
          sources.push(path);
        };

        ('global', eval)(xhrJs.responseText);

        assert.deepEqual(buildJson, sources);

        done();
      };
      xhrJs.send(null);
    };
    xhrJson.send();
  });

});
