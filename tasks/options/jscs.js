module.exports = {
  options: {
      config: ".jscs.jquery.json",
  },
  src: {
    files: {
        src: "<%= jshint.src.src %>"
    }
  },
  test: {
    files: {
      src: [ "<%= jshint.test.src %>" ]
    } 
  }
};