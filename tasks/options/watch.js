module.exports = {
  readme: {
    files: 'README.md',
    tasks: ['groc']
  },
  gruntfile: {
    files: '<%= jshint.gruntfile.src %>',
    tasks: ['jshint:gruntfile']
  },
  demo: {
    files: ['<%= paths.src %>/demo/**'],
    tasks: [
      'copy:devdemo',
      'preprocess:dev',
    ]
  },
  js: {
    files: ['<%= jshint.src.src %>'],
    tasks: [
      'jshint:src',
      'jscs:src',
      'clean:devjscompiled',
      'copy:devjs',
      'concat:dev',
      'uglify:dev',
      'test',
    ],
  },
  peg: {
    files: "<%= paths.src %>/grammar/*",
    tasks: [
      'peg',
      'clean:devjscompiled',
      'copy:devjs',
      'concat:dev',
      'uglify:dev',
      'test',
    ]
  },
  sass: {
    files: '<%= paths.src %>/scss/**/*.scss',
    tasks: ['copy:devscss', 'sass:dev'],
  },
  tests: {
    files: ['<%= paths.src %>/test/**'],
    tasks: ['jshint:test', 'copy:devtest', 'test']
  },
  livereload: {
    options: { livereload: true, },
    files: ['<%= paths.dev %>/**', '<%= paths.docs %>/**'],
  }
};