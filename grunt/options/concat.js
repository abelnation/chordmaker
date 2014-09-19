module.exports = function(grunt) {

  var srcFiles = [
    '<%= paths.dev %>/js/Chords.js',

    '<%= paths.dev %>/js/Theory.js',
    '<%= paths.dev %>/js/Voicing.js',
    '<%= paths.dev %>/js/Tuning.js',
    '<%= paths.dev %>/js/GuitarNote.js',
    '<%= paths.dev %>/js/ChordModel.js',
    '<%= paths.dev %>/js/ChordView.js',
    '<%= paths.dev %>/js/Voicings.js',

    // TODO: (aallison) uncomment to re-enable parser
    // '<%= paths.dev %>/js/lib/chordparser-peg.js',
    // '<%= paths.dev %>/js/ChordParser.js',

    '<%= paths.dev %>/js/GuitarNoteFactory.js',
    '<%= paths.dev %>/js/TuningFactory.js',
    '<%= paths.dev %>/js/ChordFactory.js',

    // TODO: (aallison) Integrate parser
    // '<%= paths.dev %>/js/lib/chordparser-peg.js'
  ];

  return {
    options: {
      separator: ';',
      banner: '<%= banner %>',
    },
    dev: {
      // TODO: (aallison) DRY
      src: srcFiles,
      dest: '<%= paths.dev %>/js/chordmaker.js',
    },
    dist: {
      src: srcFiles,
      dest: '<%= paths.dist %>/js/chordmaker.js',
    },
  };
};
