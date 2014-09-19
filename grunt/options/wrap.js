module.exports = function(grunt) {
  return {
    options: {
      header: '<%= paths.src %>/js/wrapper/header.jswrapper',
      footer: '<%= paths.src %>/js/wrapper/footer.jswrapper',
    },
    dist: {
      files: {
        '.': ['<%= paths.dist %>/js/<%= pkg.name %>.js'],
      }
    },
    dev: {
      files: {
        '.': ['<%= paths.dev %>/js/<%= pkg.name %>.js'],
      }
    },
  };
};
