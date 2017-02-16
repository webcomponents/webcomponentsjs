/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const buffer = require('vinyl-buffer');
const rename = require('gulp-rename');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const del = require('del');
const bower = require('bower');
const runseq = require('run-sequence');

function singleLicenseComment() {
  let hasLicense = false;
  return (comment) => {
    if (hasLicense) {
      return false;
    }
    return hasLicense = /@license/.test(comment);
  }
}

const babiliConfig = {
  presets: ['babili'],
  shouldPrintComment: singleLicenseComment()
};

function minify(sourceName, fileName, needsContext) {
  if (!fileName)
    fileName = sourceName;

  var options = {
    entry: './entrypoints/' + sourceName + '-index.js',
    format: 'iife',
    moduleName: 'webcomponentsjs',
    sourceMap: true
  }

  // The es6-promise polyfill needs to set the correct context.
  // See https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
  if (needsContext) {
    options.context = 'window';
  };

  return rollup(options)
  .pipe(source(sourceName +'-index.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(babel(babiliConfig))
  .pipe(rename(fileName + '.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./'))
}

gulp.task('minify-hi', () => {
  return minify('webcomponents-hi')
});

gulp.task('minify-hi-ce', () => {
  return minify('webcomponents-hi-ce')
});

gulp.task('minify-hi-sd-ce', () => {
  return minify('webcomponents-hi-sd-ce')
});

gulp.task('minify-hi-sd-ce-pf', () => {
  return minify('webcomponents-hi-sd-ce-pf', 'webcomponents-lite', true)
});

gulp.task('minify-sd-ce', () => {
  return minify('webcomponents-sd-ce')
});

gulp.task('refresh-bower', () => {
  return del('bower_components').then(() => {
    let resolve, reject;
    let p = new Promise((res, rej) => {resolve = res; reject = rej});
    bower.commands.install().on('end', () => resolve()).on('error', (e) => reject(e));
    return p;
  });
});

gulp.task('default', (cb) => {
  runseq('refresh-bower', 'build', cb);
});

gulp.task('build', ['minify-hi', 'minify-hi-ce', 'minify-hi-sd-ce', 'minify-hi-sd-ce-pf', 'minify-sd-ce']);
