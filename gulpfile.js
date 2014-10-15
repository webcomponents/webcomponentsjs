/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

var
  audit = require('gulp-audit'),
  concat = require('gulp-concat'),
  fs = require('fs'),
  gulp = require('gulp'),
  header = require('gulp-header'),
  path = require('path'),
  uconcat = require('unique-concat'),
  uglify = require('gulp-uglify')
  ;

var banner = fs.readFileSync('banner.txt', 'utf8');
var pkg = require('./package.json');

function defineBuildTask(name, output, folderName) {
  (function() {

    output = output || name;
    folderName = folderName || name;
    var manifest = './src/' + folderName + '/build.json';
    var list = readManifest(manifest);
    gulp.task(name + '-debug', function() {
      return gulp.src(list)
      .pipe(concat(output + '.debug.js'))
      .pipe(uglify({
        mangle: false,
        compress: false,
        output: {
          beautify: true
        }
      }))
      .pipe(header(banner, {pkg: pkg}))
      .pipe(gulp.dest('dist/'))
      ;
    });

    gulp.task(name, [name + '-debug'], function() {
      return gulp.src(list)
      .pipe(concat(output + '.js'))
      .pipe(uglify())
      .pipe(header(banner, {pkg: pkg}))
      .pipe(gulp.dest('dist/'))
      ;
    });

  })();
}

function readJSON(filename) {
  var blob = fs.readFileSync(filename, 'utf8');
  return JSON.parse(blob);
}

gulp.task('audit', ['default'], function() {
  return gulp.src('dist/*.js')
  .pipe(audit('build.log', {repos:['.']}))
  .pipe(gulp.dest('dist/'));
});

function readManifest(filename, modules) {
  modules = modules || [];
  var lines = readJSON(filename);
  var dir = path.dirname(filename);
  lines.forEach(function(line) {
    var fullpath = path.join(dir, line);
    if (line.slice(-5) == '.json') {
      // recurse
      modules = modules.concat(readManifest(fullpath, modules));
    } else {
      // TODO(dfreedm): make this smarter
      modules = uconcat(modules, [fullpath]);
    }
  });
  return modules;
}

defineBuildTask('WebComponents', 'webcomponents');
defineBuildTask('CustomElements');
defineBuildTask('HTMLImports');
defineBuildTask('ShadowDOM');

gulp.task('default', ['WebComponents', 'CustomElements', 'HTMLImports', 'ShadowDOM']);
