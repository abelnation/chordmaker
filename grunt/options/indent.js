module.exports = function(grunt) {
  return {
    options: {
      style: 'space',
      size: 2,
      change: 1
    },
    dev: {
      src: '<%= paths.dev %>/js/<%= pkg.name %>.js',
      dest: '<%= paths.dev %>/js/<%= pkg.name %>.js',
    },
    dist: {
      src: ['<%= paths.dist %>/js/<%= pkg.name %>.js'],
      dest: '<%= paths.dist %>/js/<%= pkg.name %>.js',
    },
  };
};
