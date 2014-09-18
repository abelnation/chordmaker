module.exports = function(grunt) {
  return {
    gruntfile: {
      options: {
        jshintrc: '.jshintrc'
      },
      src: 'Gruntfile.js'
    },
    grunttasks: {
      options: {
        jshintrc: '.jshintrc'
      },
      src: [
        '<%= paths.grunt %>/**/*.js',
        '<%= paths.grunt %>/*.js'
      ]
    },
    src: {
      options: {
        jshintrc: '<%= paths.src %>/js/.jshintrc'
      },
      src: ['<%= paths.src %>/js/*.js']
    },
    test: {
      options: {
        jshintrc: '<%= paths.src %>/test/.jshintrc'
      },
      src: ['<%= paths.src %>/test/*.js']
    },
  };
};
