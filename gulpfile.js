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

// Dan things
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const buffer = require('vinyl-buffer');
const rename = require('gulp-rename');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');

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

gulp.task('minify-hi', () => {
  return rollup({
    entry: './entrypoints/webcomponents-hi-index.js',
    format: 'iife',
    moduleName: 'webcomponentsjs',
    sourceMap: true
  })
  .pipe(source('webcomponents-hi-index.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(babel(babiliConfig))
  .pipe(rename('webcomponents-hi.min.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./'))
});

gulp.task('minify-hi-ce', () => {
  return rollup({
    entry: './entrypoints/webcomponents-hi-ce-index.js',
    format: 'iife',
    moduleName: 'webcomponentsjs',
    sourceMap: true
  })
  .pipe(source('webcomponents-hi-ce-index.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(babel(babiliConfig))
  .pipe(rename('webcomponents-hi-ce.min.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./'))
});

gulp.task('minify-hi-ce-sd', () => {
  return rollup({
    entry: './entrypoints/webcomponents-hi-ce-sd-index.js',
    format: 'iife',
    moduleName: 'webcomponentsjs',
    sourceMap: true
  })
  .pipe(source('webcomponents-hi-ce-sd-index.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(babel(babiliConfig))
  .pipe(rename('webcomponents-hi-ce-sd.min.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./'))
});

gulp.task('minify-hi-ce-sd-pf', () => {
  return rollup({
    entry: './entrypoints/webcomponents-hi-ce-sd-pf-index.js',
    format: 'iife',
    moduleName: 'webcomponentsjs',
    sourceMap: true
  })
  .pipe(source('webcomponents-hi-ce-sd-pf-index.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(babel(babiliConfig))
  .pipe(rename('webcomponents-hi-ce-sd-pf.min.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./'))
});

gulp.task('default', ['minify-hi', 'minify-hi-ce', 'minify-hi-ce-sd', 'minify-hi-ce-sd-pf']);
