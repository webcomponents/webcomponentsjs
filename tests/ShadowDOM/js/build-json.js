/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
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
