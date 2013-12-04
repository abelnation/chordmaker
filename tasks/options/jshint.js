module.exports = {
  gruntfile: {
    options: {
      jshintrc: '.jshintrc'
    },
    src: 'Gruntfile.js'
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