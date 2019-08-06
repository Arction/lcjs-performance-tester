// gulpfile.js
const gulp = require('gulp')
const mocha = require('gulp-mocha')
const wstream = require('webpack-stream')
const tslint = require('gulp-tslint')
const eslint = require('gulp-eslint')
const del = require('del')
const parser = require('yargs-parser')
const fs = require('fs')
const config = require('./config')
const generator = require('./scripts/generator')
const replace = require('gulp-replace')
const allFiles = ['src/**/*.ts', 'test/**/*.ts', '!node_modules/**', 'content/src/**/*.js']
const params = parser(process.argv.slice(2), {
    alias: {
        branch: ['b'],
        dist: ['d', 'p', 'prod', 'production']
    },
    boolean: ['dist']
})
// Get branch from params. Default branch is master. --branch cn
const branch = params.branch || 'master'
// Get mode from params. Affects the build path and build configs. Default 'dev'.
const mode = params.dist ? 'dist' : 'dev'
let ownDomains = config.ownDomains
/**
 * Should the webpack constants be replaced with packing specific data
 */
let packMode = false
/**
 * Cleaning function
 */
const clean = () => del([`${mode}/${branch}`])
/**
 * Object containing building functions
 */
const _build = {
    /**
     * Build webpack
     */
    Webpack: function () {
        const conf = require('./webpack.config')(undefined, { mode: mode === 'dist' ? 'production' : 'development' })
        if (packMode) {
            conf.plugins[0].definitions.CONTENT_BASE_URL = JSON.stringify('')
            conf.plugins[0].definitions.OWN_DOMAINS = JSON.stringify(ownDomains)
        }
        return gulp.src('index.ts')
            .pipe(wstream(conf, require('webpack')))
            .pipe(gulp.dest(`${mode}/${branch}`))
    },
    /**
     * Build HTML
     */
    HTML: function () {
        return gulp.src('templates/index.html')
            .pipe(gulp.dest(`${mode}/${branch}`))
    },
    /**
     * Build dependencies
     */
    ExtDependencies: function () {
        return gulp.src([
            'node_modules/@arction/lcjs/dist/lcjs.iife.js',
            'node_modules/@arction/xydata/dist/xydata.iife.js',
            'node_modules/@babel/polyfill/dist/polyfill.min.js'
        ])
            .pipe(gulp.dest(`${mode}/${branch}`))
    },
    /**
     * Build watcher
     */
    Watcher: () => gulp.watch(allFiles, gulp.parallel(_build.GenerateEx, _build.ExtDependencies)),
    /**
     * IE frame
     */
    IEFrame: function () {
        return gulp.src('templates/ieframe.html')
            .pipe(replace('IEFRAME_TARGET', ownDomains.map(v => `e.origin === '${v}' `).join('||')))
            .pipe(gulp.dest(`${mode}/${branch}`))
    },
    /**
     * Generate example
     */
    GenerateEx: function () {
        return Promise.all([
            generator.getTestToolsDir()
                .then(generator.getCode),
            generator.getTestDirs()
                .then(testPaths => {
                    return testPaths.map(generator.getCode)
                })
        ]).then((cache) => {
            generator.writeDataJs(
                generator.generateDataJs(cache[1], cache[0])
            )
        }
        )
    }
}
/**
 * Build pack
 */
const build = gulp.series(
    clean,
    _build.GenerateEx,
    _build.Webpack,
    _build.HTML,
    _build.IEFrame,
    _build.ExtDependencies
)
/**
 * Build watch
 */
const buildWatch = gulp.series(_build.GenerateEx, _build.ExtDependencies, _build.Watcher)
/**
 * Object containing testing tasks
 */
const _test = {
    /**
     * Test's runner
     */
    Runner: function () {
        process.env.TS_NODE_PROJECT = './tsconfig-test.json'
        process.env.TS_NODE_FILES = true

        // Create a dummy data.js file to use with tests if it doesn't exist. The actual data is mocked during tests
        if (!fs.existsSync('examples/generated/data.js')) {
            if (!fs.existsSync('examples/'))
                fs.mkdirSync('examples/')
            if (!fs.existsSync('examples/generated'))
                fs.mkdirSync('examples/generated')
            fs.writeFileSync('examples/generated/data.js', 'module.exports = { getData:()=>({})}')
        }

        return gulp
            .src('./test/runner/**/*.tsx', {
                read: false
            })
            .pipe(mocha({
                require: ['ignore-styles', 'ts-node/register', 'tsconfig-paths/register'],
                color: true,
                reporter: 'spec'
            }))
    },
    /**
     * Test's build
     */
    Build: function () {
        return gulp
            .src('./test/build/**/*.js', {
                read: false
            })
            .pipe(mocha({
                color: true,
                reporter: 'spec'
            }))
    },
    /**
     * Test watch task
     */
    // Note: Tests are currently broken. 
    // When fixed, change the line below to 
    // Watch: function (done) {
    //    gulp.series(test, _test.Watcher)
    //    done()
    // }  
    Watcher: () => gulp.watch(allFiles, test),
    Watch: function (done) {
        console.log('\x1b[33m', 'Tests are disabled', '\x1b[0m')
        done()
    }
}
/**
 * Testing task. 
 * Note: Tests are currently broken.  
 * When fixed change the line below to const test = gulp.series(_test.Runner, _test.Build)
 */
const test = (done) => {
    console.log('\x1b[33m', 'Tests are disabled', '\x1b[0m')
    done()
}
const _lint = {
    /**
     * Lint TypeScript
     */
    TS: function () {
        return gulp.src(['src/**/*.ts', 'src/**/*.tsx'])
            .pipe(tslint({
                formatter: 'verbose'
            }))
            .pipe(tslint.report({
                allowWarnings: true
            }))
    },
    /**
     * Lint EcmaScript
     */
    ES: function () {
        return gulp.src(['scripts/**/*.js'])
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failAfterError())
    },
    Watcher: () => gulp.watch(['src/**/*.ts', 'src/**/*.tsx'], gulp.series(lint))
}
/**
 * Linting Tasks
 */
const lint = gulp.series(_lint.ES, _lint.TS)
/**
 * Lint watch task
 */
const lintWatch = gulp.series(lint, _lint.Watcher)
/**
 * Object containing pack functions
 */
const _pack = {
    /**
     * Package init
     * @param done Empty callback
     */
    Init: function (done) {
        ownDomains = ['http://localhost:8080']
        packMode = true
        done()
    },
    /**
     * Copy pack
     */
    Copy: function () {
        return gulp.src([`${mode}/${branch}/**/*`])
            .pipe(gulp.dest('dist/pack/dist'))
    },
    /**
     * Pack package
     */
    Package: function () {
        return gulp.src(['pack/package.json'])
            .pipe(gulp.dest('dist/pack'))
    }
}
/**
 * Pack runner
 */
const pack = gulp.series(
    _pack.Init,
    build,
    _pack.Copy,
    _pack.Package
)
// Export functions for gulp CLI
// Build package
exports.build = build
// Build watch
exports.buildWatch = buildWatch
// Start testing
exports.test = test
// Start test watching
exports.testWatch = _test.Watch
// Start linting
exports.lint = lint
// Start lint watching
exports.lintWatch = lintWatch
// Pack
exports.pack = pack
// Default case: build
exports.default = build
