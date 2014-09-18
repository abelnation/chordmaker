module.exports = function(grunt) {
  return {
    dev: ['<%= paths.build %>/dev'],
    dist: ['<%= paths.build %>/dist'],
  };
};
