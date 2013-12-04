module.exports = {
  all: ['build/**'],
  // requirejs: ['build/js/chordmaker.js'],
  dev: ['build/dev'],
  dist: ['build/dist'],

  devjscompiled: ['build/dev/js/chordmaker.*.js', 'build/dev/js/chordmaker.min.js'],
  
  scrub_dist: [
    'build/dist/scss',
    'build/dist/test',
  ],
  scrub_dev: [
    'build/dev/scss',
    'build/dev/test'
  ]
};