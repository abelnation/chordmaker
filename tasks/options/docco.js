module.exports = {
  dev: {
    src: ['<%= jshint.src.src %>'],
    options: {
      output: '<%= paths.dev %>/docs/',
      layout:     'parallel'
      // template:   null
      // css:        null
      // extension:  null
    }
  },
  dist: {
    src: ['<%= jshint.src.src %>'],
    options: {
      output: '<%= paths.dist %>/docs/',
      layout:     'parallel'
      // template:   null
      // css:        null
      // extension:  null
    }
  },

};