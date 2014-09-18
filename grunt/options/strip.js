module.exports = function(grunt) {
  return {
    dist: {
      src: ['<%= paths.dist %>/js/*.js'],
      options: {
        inline: true
      }
    }
  };
};
