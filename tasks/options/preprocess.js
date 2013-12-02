module.exports = {
  options : {
    inline: true,
  },
  dev : {
    options: {
      context: {
        TARGET: "dev",
        RANDOM: Math.random(),
        VERSION: "<%= pkg.version %>",
      }
    },
    files: [
      {
        expand: true,     
        src: ['<%= paths.dev %>/demo/*.html'],
      }
    ],
  },
  dist : {
    options: {
      context: {
        TARGET: "dist",
        RANDOM: Math.random(),
        VERSION: "<%= pkg.version %>",
      }
    },
    files: [
      {
        expand: true,     
        src: ['<%= paths.dist %>/demo/*.html'],
      }
    ]
  }
};