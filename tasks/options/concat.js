module.exports = {
  options: {
    separator: ';',
  },
  dev: {
    src: [
      '<%= paths.dev %>/js/*.js',
      '<%= paths.dev %>/js/lib/underscore-min.js',
      '<%= paths.dev %>/js/lib/chordparser-peg.js'
    ],
    dest: '<%= paths.dev %>/js/chordmaker.<%= pkg.version %>.js',
  },
  dist: {
    src: [
      '<%= paths.dist %>/js/*.js',
      '<%= paths.dev %>/js/lib/underscore-min.js',
      '<%= paths.dev %>/js/lib/chordparser-peg.js'
    ],
    dest: '<%= paths.dist %>/js/chordmaker.<%= pkg.version %>.js',
  },
};