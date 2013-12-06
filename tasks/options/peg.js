module.exports = {
  chordparser: {
    src: "<%= paths.src %>/grammar/chordparser.peg",
    dest: "<%= paths.src %>/js/lib/chordparser-peg.js",
    options: {
      exportVar: "ChordParserPEG"
    }
  }
};