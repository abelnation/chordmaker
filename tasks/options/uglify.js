module.exports = {
  dev: {
    files: {
      '<%= paths.dev %>/js/chordmaker.min.js': ['<%= paths.dev %>/js/chordmaker.js'],
    }
  },
  dist: {
    files: {
      '<%= paths.dist %>/js/chordmaker.min.js': ['<%= paths.dist %>/js/chordmaker.js'],
    }
  }
};