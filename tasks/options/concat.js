module.exports = {
  options: {
    separator: ';',
  },
  dev: {
    src: ['<%= paths.dev %>/js/*.js'],
    dest: '<%= paths.dev %>/js/chordmaker.<%= pkg.version %>.js',
  },
  dist: {
    src: ['<%= paths.dist %>/js/*.js'],
    dest: '<%= paths.dist %>/js/chordmaker.<%= pkg.version %>.js',
  },
};