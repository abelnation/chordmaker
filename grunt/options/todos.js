'use strict';

module.exports = function(grunt) {
    return {
        options: {},
        js: {
            src: [
                "<%= jshint.src.src %>",
            ],
        },
        json: {
            src: [
                "./config/*.json",
                "./package.json",
            ],
        },
        test: {
            src: [
                "<%= paths.tests %>/**",
            ],
        },
        grunt: {
            src: [
                "./Gruntfile.js",
                "./grunt/**/*.js",
                "!./grunt/tasks/todos.js"
            ],
        },
    };
};
