module.exports = {
  dev: {
    files: {
      '<%= paths.dev %>/js/chordmaker.min.js': ['<%= paths.dev %>/js/chordmaker.<%= pkg.version %>.js'],
    }
  },
  dist: {
    files: {
      '<%= paths.dist %>/js/chordmaker.min.js': ['<%= paths.dist %>/js/chordmaker.<%= pkg.version %>.js'],
    }
  }
};