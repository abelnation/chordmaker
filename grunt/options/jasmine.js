module.exports = function(grunt) {

  return {
    options: {
      summary: false,
      host: 'http://127.0.0.1:8082',
      keepRunner: true,
    },

    // For individual variant target
    // e.g. grunt jasmine:variant:<product_name>:<variant_name>
    testlocalserver: {
      src: [
        '<%= paths.dev %>/js/chordmaker.js',
      ],
      options: {
        specs: '<%= paths.dev %>/test/*Spec.js',
        vendor: [
          '<%= paths.dev %>/js/lib/jasmine-jquery/jquery-2.0.3.min.js',
          '<%= paths.dev %>/js/lib/jasmine-jquery/jasmine-jquery.js',
          '<%= paths.dev %>/js/lib/raphael-min.js',
          '<%= paths.dev %>/js/lib/underscore-min.js',
        ],
        // helpers: '<%= paths.dev %>/test/**/*Helper.js',
        keepRunner: true,
        version: '2.0.1',
      }
    }

  };
};
