module.exports = {
  options: {
    // index: "README.md"
    // layout:      'parallel'
    // template:   null
    // css:        null
    // extension:  null

  },
  src: {
    src: ['./README.md', '<%= jshint.src.src %>'],
    options: {
      out: '<%= paths.docs %>',
    }
  },
};