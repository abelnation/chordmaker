module.exports = {
  testlocalserver: {
    src: [
      '<%= paths.dev %>/js/chordmaker.<%= pkg.version %>.js',
    ],
    options: {
      host: 'http://127.0.0.1:8082',
      specs: '<%= paths.dev %>/test/*Spec.js',
      // helpers: '<%= paths.dev %>/test/**/*Helper.js',
      keepRunner: true,
      version: '1.3.0',
    }
  }
};