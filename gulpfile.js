/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

var 
  gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  path = require('path'),
  uconcat = require('unique-concat'),
  fs = require('fs')
  ;

function defineBuildTask(name, output, folderName) {
  gulp.task(name, function() {
    output = output || name;
    folderName = folderName || name;
    var manifest = './src/' + folderName + '/build.json';
    var list = readManifest(manifest);
    gulp.src(list)
      .pipe(concat(output + '.js'))
      .pipe(uglify({
        mangle: false,
        compress: false,
        output: {
          beautify: true
        }
      }))
      .pipe(gulp.dest('dist/'))
    ;
    
    gulp.src(list)
      .pipe(concat(output + '.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('dist/'))
    ;
  });
}

function readJSON(filename) {
  var blob = fs.readFileSync(filename, 'utf8');
  return JSON.parse(blob);
}

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

gulp.task('default', ['WebComponents', 'CustomElements', 'HTMLImports', 
  'ShadowDOM']);