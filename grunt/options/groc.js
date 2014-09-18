module.exports = function(grunt) {
  return {
    options: {
      // index: "README.md"
      // layout:      'parallel'
      // template:   null
      // css:        null
      // extension:  null
      "whitespace-after-token": true
    },
    src: {
      src: ['./README.md', '<%= jshint.src.src %>', '<%= paths.src %>/grammar/**'],
      options: {
        out: '<%= paths.docs %>',
      }
    },
  };
};
