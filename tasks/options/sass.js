module.exports = {
  dist: { 
    options: {
      style: 'compressed',
      compass: true,
    },
    files: {
      '<%= paths.dist %>/css/main.min.css': '<%= paths.dist %>/scss/main.scss',
    }
  },
  dev: {
    options: {
      style: 'expanded',
      compass: true,
      lineNumbers: true,
    },
    files: {
      '<%= paths.dev %>/css/main.css': '<%= paths.dev %>/scss/main.scss',
    }
  }
};