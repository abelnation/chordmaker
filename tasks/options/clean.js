module.exports = {
  all: ['build/**'],
  requirejs: ['build/js/chordmaker.js'],
  dev: ['build/dev'],
  dist: ['build/dist'],
  scrub_dist: [
    'build/dist/scss',
    'build/dist/test',
  ],
  scrub_dev: [
    'build/dev/scss',
    'build/dev/test'
  ]
};