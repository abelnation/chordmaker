module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('./package.json');
  var paths = pkg.domains;

  var exports = {
    options: {
      banner: "<%= banner %>",
      preserveComments: 'some',
      mangle: {
        except: ['jQuery', '_', 'Raphael'],
      },
      compress: {
        drop_console: true
      }
    },

    // For individual variant target
    // e.g. grunt uglify:variant:<product_name>:<variant_name>

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

  return exports;
};
