/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

// jshint node: true

'use strict';

var
  audit = require('gulp-audit'),
  concat = require('gulp-concat'),
  exec = require('child_process').exec,
  fs = require('fs'),
  gulp = require('gulp'),
  header = require('gulp-header'),
  path = require('path'),
  runseq = require('run-sequence'),
  uglify = require('gulp-uglify')
;

var isRelease = process.env.RELEASE !== undefined;

var banner = fs.readFileSync('banner.txt', 'utf8');

var pkg;

function defineBuildTask(name, manifest) {
  (function() {

    manifest = manifest || './src/' + name + '/build.json';
    var output = name;
    var list = readManifest(manifest);
    gulp.task(name + '-debug', ['version'], function() {
      return gulp.src(list)
      .pipe(concat(output + '.js'))
      .pipe(uglify({
        mangle: false,
        compress: false,
        output: {
          beautify: true,
          indent_level: 2
        }
      }))
      .pipe(header(banner, {pkg: pkg}))
      .pipe(gulp.dest('dist/'))
      ;
    });

    gulp.task(name, ['version', name + '-debug'], function() {
      return gulp.src(list)
      .pipe(concat(output + '.min.js'))
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

gulp.task('audit', function() {
  return gulp.src('dist/*.js')
  .pipe(audit('build.log', {repos:['.']}))
  .pipe(gulp.dest('dist/'));
});

gulp.task('version', function(cb) {
  pkg = require('./package.json');
  var cmd = ['git', 'rev-parse', '--short', 'HEAD'].join(' ');
  if (!isRelease) {
    exec(cmd, function(err, stdout, stderr) {
      if (err) {
        return cb(err);
      }
      if (stdout) {
        stdout = stdout.trim();
      }
      pkg.version = pkg.version + '-' + stdout;
      cb();
    });
  } else {
    cb();
  }
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
      modules.push(fullpath);
    }
  });
  var tmp = Object.create(null);
  for (var i = 0; i < modules.length; i++) {
    tmp[modules[i]] = 1;
  }
  modules = Object.keys(tmp);
  return modules;
}

gulp.task('copy-bower', function() {
  return gulp.src(['bower.json','README.md']).pipe(gulp.dest('dist/'));
});

defineBuildTask('webcomponents', './src/WebComponents/build.json');
defineBuildTask('webcomponents-lite', './src/WebComponents/build-lite.json');
defineBuildTask('CustomElements');
defineBuildTask('HTMLImports');
defineBuildTask('ShadowDOM');

gulp.task('build', ['webcomponents', 'webcomponents-lite', 'CustomElements', 
  'HTMLImports', 'ShadowDOM', 'copy-bower']);

gulp.task('release', function(cb) {
  isRelease = true;
  runseq('build', 'audit', cb);
});

gulp.task('default', function(cb) {
  runseq('build', 'audit', cb);
});
