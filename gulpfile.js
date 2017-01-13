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

function minify(sourceName, fileName) {
  if (!fileName)
    fileName = sourceName;

  return rollup({
    entry: './entrypoints/' + sourceName + '-index.js',
    format: 'iife',
    moduleName: 'webcomponentsjs',
    sourceMap: true
  })
  .pipe(source(sourceName +'-index.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(babel(babiliConfig))
  .pipe(rename(fileName + '.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./'))
}

gulp.task('minify-none', () => {
  minify('webcomponents-none')
});

gulp.task('minify-hi', () => {
  minify('webcomponents-hi')
});

gulp.task('minify-hi-ce', () => {
  minify('webcomponents-hi-ce')
});

gulp.task('minify-hi-ce-sd', () => {
  minify('webcomponents-hi-ce-sd')
});

gulp.task('minify-hi-ce-sd-pf', () => {
  minify('webcomponents-hi-ce-sd-pf', 'webcomponents-lite')
});

gulp.task('default', ['minify-none', 'minify-hi', 'minify-hi-ce', 'minify-hi-ce-sd', 'minify-hi-ce-sd-pf']);
