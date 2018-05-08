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

/* eslint-env node */
/* eslint-disable no-console */

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const rollup = require('gulp-rollup');
const del = require('del');
const runseq = require('run-sequence');
const closure = require('google-closure-compiler').gulp();
const babel = require('rollup-plugin-babel');

function debugify(sourceName, fileName, extraRollupOptions) {
  const outDir = fileName ? '.' : './bundles';

  if (!fileName) {
    fileName = sourceName;
  }

  const entry = `./entrypoints/${sourceName}-index.js`;
  const options = {
    input: entry,
    output: {
      format: 'iife',
      name: 'webcomponentsjs'
    },
    allowRealFiles: true
  };

  Object.assign(options, extraRollupOptions);

  return gulp.src(entry)
  .pipe(rollup(options))
  .pipe(rename(`${fileName}.js`))
  .pipe(gulp.dest(outDir))
}

function closurify(sourceName, fileName) {
  const outDir = fileName ? '.' : './bundles';

  if (!fileName) {
    fileName = sourceName;
  }

  const closureOptions = {
    compilation_level: 'ADVANCED',
    language_in: 'ES6_STRICT',
    language_out: 'ES5_STRICT',
    isolation_mode: 'NONE',
    output_wrapper_file: 'closure-output.txt',
    assume_function_wrapper: true,
    js_output_file: `${fileName}.js`,
    warning_level: 'VERBOSE',
    rewrite_polyfills: false,
    module_resolution: 'NODE',
    entry_point: `entrypoints/${sourceName}-index.js`,
    dependency_mode: 'STRICT',
    process_common_js_modules: true,
    externs: [
      'externs/webcomponents.js',
      'node_modules/@webcomponents/custom-elements/externs/custom-elements.js',
      'node_modules/@webcomponents/shadycss/externs/shadycss-externs.js',
      'node_modules/@webcomponents/shadydom/externs/shadydom.js'
    ]
  };

  return gulp.src([
      'entrypoints/*.js',
      'src/*.js',
      'node_modules/es-symbol/**/*.js',
      'node_modules/es6-promise/lib/es6-promise/**/*.js',
      'node_modules/@webcomponents/**/*.js',
      '!node_modules/@webcomponents/*/externs/*.js',
      '!node_modules/@webcomponents/*/node_modules/**',
      '!**/bower_components/**'
    ], {base: './', follow: true})
  .pipe(sourcemaps.init())
  .pipe(closure(closureOptions))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(outDir));
}

gulp.task('debugify-ce', () => {
  return debugify('webcomponents-ce')
});

gulp.task('debugify-sd-ce-pf', () => {
  // The es6-promise polyfill needs to set the correct context.
  // See https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
  const extraOptions = {
    context: 'window'
  };
  return debugify('webcomponents-sd-ce-pf', null, extraOptions)
});

gulp.task('debugify-sd-ce', () => {
  return debugify('webcomponents-sd-ce')
});

gulp.task('debugify-sd', () => {
  return debugify('webcomponents-sd')
});

gulp.task('debugify-bundle', () => {
  // The es6-promise polyfill needs to set the correct context.
  // See https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
  const extraOptions = {
    context: 'window'
  };
  return debugify('webcomponents-bundle', 'webcomponents-bundle', extraOptions);
})

gulp.task('closurify-ce', () => {
  return closurify('webcomponents-ce')
});

gulp.task('closurify-sd-ce-pf', () => {
  return closurify('webcomponents-sd-ce-pf')
});

gulp.task('closurify-sd-ce', () => {
  return closurify('webcomponents-sd-ce')
});

gulp.task('closurify-sd', () => {
  return closurify('webcomponents-sd')
});

gulp.task('closurify-bundle', () => {
  return closurify('webcomponents-bundle', 'webcomponents-bundle');
});

function singleLicenseComment() {
  let hasLicense = false;
  return (comment) => {
    if (hasLicense) {
      return false;
    }
    return hasLicense = /@license/.test(comment);
  }
}

const babelOptions = {
  presets: 'minify',
  shouldPrintComment: singleLicenseComment()
};

gulp.task('debugify-ce-es5-adapter', () => {
  return debugify('custom-elements-es5-adapter', 'custom-elements-es5-adapter', {plugins: [babel(babelOptions)]});
});

gulp.task('default', ['closure']);

gulp.task('clean', () => {
  return del([
    'custom-elements-es5-adapter.js{,.map}',
    'bundles',
    'webcomponents-bundle.js{,.map}'
  ]);
});

gulp.task('debug', (cb) => {
  const tasks = [
    'debugify-ce',
    'debugify-sd',
    'debugify-sd-ce',
    'debugify-sd-ce-pf',
    'debugify-bundle',
    'debugify-ce-es5-adapter'
  ];
  runseq('clean', tasks, cb);
});

gulp.task('closure', (cb) => {
  const tasks = [
    'closurify-ce',
    'closurify-sd',
    'closurify-sd-ce',
    'closurify-sd-ce-pf',
    'closurify-bundle',
    'debugify-ce-es5-adapter'
  ];
  runseq('clean', ...tasks, cb);
});