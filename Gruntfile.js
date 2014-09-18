'use strict';

var _ = require("underscore");
var timer = require("grunt-timer");

function loadConfig(grunt, path) {
    var glob = require('glob');
    var object = {};
    var key;

    glob.sync('*', {cwd: path}).forEach(function(option) {
        key = option.replace(/\.js$/,'');
        object[key] = require(path + option)(grunt);
    });

    return object;
}

module.exports = function (grunt) {

    // Project configuration.
    require("load-grunt-tasks")(grunt);

    // Enable task timer
    timer.init(grunt, { friendlyTime: true });

    // Load rest of tasks from ./grunt/tasks/*.js
    grunt.loadTasks('grunt/tasks');

    var getBanner = require("./grunt/helpers/bannerHelper")(grunt);
    var pkg = grunt.file.readJSON('package.json');

    var config = {
        pkg: pkg,
        name: "<% pkg.title || pkg.name %>",
        banner: getBanner(),
        paths: pkg.paths,
        env: process.env,
    };

    // Load task config objects from ./grunt/options/*.js
    grunt.util._.extend(config, loadConfig(grunt, './grunt/options/'));
    grunt.initConfig(config);

    grunt.registerTask('default', [ 'build' ]);
};
