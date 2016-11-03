import config from './config.json'

import fs from 'fs'

import gulp from 'gulp'
import sourcemaps from 'gulp-sourcemaps'
import sass from 'gulp-sass'
import template from 'gulp-template'
import file from 'gulp-file'
import data from 'gulp-data';
import s3 from 'gulp-s3-upload';
import size from 'gulp-size'
import webserver from 'gulp-webserver'

import del from 'del'
import runSequence from 'run-sequence'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import merge from 'merge-stream'
import inquirer from 'inquirer'

import rollup from 'rollup-stream'
// hack to use same presets for rollup, but with custom es2015
const babelrc = JSON.parse(fs.readFileSync('.babelrc'));
const presets = babelrc.presets.filter(p => p !== 'es2015');

const rollupPlugins = [
    require('rollup-plugin-json')(),
    require('rollup-plugin-string')({
        'include': '**/*.html'
    }),
    require('rollup-plugin-node-resolve')({
        'jsnext': true
    }),
    require('rollup-plugin-commonjs')({
        'include': ['node_modules/**']
    }),
    require('rollup-plugin-babel')({
        'presets': [['es2015', {'modules': false}], ...presets],
        'plugins': ['external-helpers'],
        'babelrc': false,
        'exclude': 'node_modules/**'
    })
];

const buildDir = '.build';
const cdnUrl = 'https://interactive.guim.co.uk';

function buildJS(filename) {
    // TODO: minification
    return () => {
        return rollup({
                'entry': `./src/js/${filename}`,
                'sourceMap': true,
                'plugins': rollupPlugins,
                'format': 'iife'
            })
            .pipe(source(filename, './src/js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({'loadMaps': true}))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(buildDir));
    }
}

function packageBuild(path) {
    let stream1 = gulp.src(`${buildDir}/**/*.@(css|js|html)`).pipe(template({path}));
    let stream2 = gulp.src(`${buildDir}/**/*.!(css|js|html)`);
    return merge(stream1, stream2);
}

function s3Upload(cacheControl, keyPrefix) {
    return s3()({
        'Bucket': 'gdn-cdn',
        'ACL': 'public-read',
        'CacheControl': cacheControl,
        'keyTransform': fn => `${keyPrefix}/${fn}`
    });
}

function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

gulp.task('clean', () => del(buildDir));

gulp.task('build:css', () => {
    return gulp.src('src/css/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            'outputStyle': 'compressed'
        }).on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(buildDir));
});

gulp.task('build:js.main', buildJS('main.js'));
gulp.task('build:js.app', buildJS('app.js'));
gulp.task('build:js', ['build:js.main', 'build:js.app']);

gulp.task('build:html', cb => {
    let render = requireUncached('./src/render.js').render;

    Promise.resolve(render()).then(html => {
        file('main.html', html, {'src': true})
            .pipe(gulp.dest(buildDir))
            .on('end', cb);
    }).catch(err => {
        console.log(err);
    });
});

gulp.task('build:assets', () => {
    return gulp.src('src/assets/**/*').pipe(gulp.dest(`${buildDir}/assets`));
});

gulp.task('_build', ['clean'], cb => {
    runSequence(['build:css', 'build:js', 'build:html', 'build:assets'], cb);
});

// TODO: less hacky build/_build?
gulp.task('build', ['_build'], () => {
    return gulp.src(`${buildDir}/**/!(*.map)`)
        .pipe(size({'gzip': true, 'showFiles': true}))
});

gulp.task('deploy', ['build'], cb => {
    let version = `v/${Date.now()}`;
    let s3Path = `atoms/${config.path}`;
    let s3VersionPath = `${s3Path}/${version}`;

    inquirer.prompt({
        type: 'list',
        name: 'env',
        message: 'Where would you like to deploy to?',
        choices: ['preview', 'live']
    }).then(res => {
        packageBuild(`${cdnUrl}/${s3VersionPath}`)
            .pipe(s3Upload('max-age=31536000', s3VersionPath))
            .on('end', () => {
                gulp.src('config.json')
                    .pipe(file(res.env, version))
                    .pipe(s3Upload('max-age=30', s3Path))
                    .on('end', cb);
            });
    });
});

gulp.task('url', () => {
    console.log(`Atom URL: https://content.guardianapis.com/atom/interactive/${config.path}`);
});

gulp.task('atomise', ['build'], () => {
    return gulp.src('harness/*')
        .pipe(data(() => ({
            'css': fs.readFileSync(`${buildDir}/main.css`),
            'html': fs.readFileSync(`${buildDir}/main.html`),
            'js': fs.readFileSync(`${buildDir}/main.js`)
        })))
        .pipe(template())
        .pipe(gulp.dest(buildDir));
});

gulp.task('default', ['atomise'], () => {
    gulp.watch('src/**/*', ['atomise']).on('change', evt => {
        console.log(`File ${evt.path} was ${evt.type}`);
    });

    gulp.src(buildDir).pipe(webserver());
});
