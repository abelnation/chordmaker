module.exports = function(grunt) {
  return {
    chordparser: {
      src: "<%= paths.src %>/grammar/chordparser.v2.peg",
      dest: "<%= paths.src %>/js/lib/chordparser-peg.js",
      options: {
        exportVar: "ChordParserPEG"
      }
    }
  };
};
