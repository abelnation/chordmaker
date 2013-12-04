'use strict';

function loadConfig(path) {
  var glob = require('glob');
  var object = {};
  var key;
 
  glob.sync('*', {cwd: path}).forEach(function(option) {
    key = option.replace(/\.js$/,'');
    object[key] = require(path + option);
  });

  return object;
}

module.exports = function (grunt) {
  // Project configuration.
  require('load-grunt-tasks')(grunt);

  grunt.loadTasks('tasks');

  var config = {
    "name": "chordmaker",
    pkg: grunt.file.readJSON('package.json'),
    env: process.env,
    paths: {
      src: "./src",
      dist: "./build/dist",
      dev: "./build/dev"
    },
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
  };
  grunt.util._.extend(config, loadConfig('./tasks/options/'));
  grunt.initConfig(config);

  grunt.registerTask('dev', ['jshint', 'copy:dev', 'preprocess:dev', /* 'sass:dev', */ 'concat:dev', 'uglify:dev' /*, 'test' */]);
  grunt.registerTask('dist', ['clean:dist', 'jshint', 'copy:dist', 'preprocess:dist', 'strip:dist', /* 'sass:dist',*/ 'concat:dist', 'uglify:dist', 'clean:scrub_dist']);
  grunt.registerTask('test', ['copy:devtest', 'connect:test', 'jasmine:testlocalserver']);

  grunt.registerTask('default', ['dev']);
};
