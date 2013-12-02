module.exports = {
  dev: {
    options: {
      port: 8081,
      base: 'build/dev/',
      keepalive: true,
      debug: true,
      livereload: true,
      open: 'http://127.0.0.1:8081/demo/gypsy.html',
    }
  },
  dist: {
    options: {
      port: 8081,
      base: 'build/dist/',
      debug: true,
      keepalive: true,
    }
  },
  test: {
    options: {
      port: 8082,
      base: './',
    }
  }
};