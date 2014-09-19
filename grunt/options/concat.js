module.exports = function(grunt) {
  return {
    options: {
      separator: ';',
      banner: '<%= banner %>',
    },
    dev: {
      src: [
        '<%= paths.dev %>/js/Chords.js',

        '<%= paths.dev %>/js/Theory.js',
        '<%= paths.dev %>/js/Voicing.js',
        '<%= paths.dev %>/js/Tuning.js',
        '<%= paths.dev %>/js/GuitarNote.js',
        '<%= paths.dev %>/js/ChordModel.js',
        '<%= paths.dev %>/js/ChordView.js',
        '<%= paths.dev %>/js/GuitarNoteFactory.js',
        '<%= paths.dev %>/js/TuningFactory.js',
        '<%= paths.dev %>/js/ChordFactory.js',

        '<%= paths.dev %>/js/lib/underscore-min.js',

        // TODO: (aallison) Integrate parser
        // '<%= paths.dev %>/js/lib/chordparser-peg.js'
      ],
      dest: '<%= paths.dev %>/js/chordmaker.js',
    },
    dist: {
      src: [
        '<%= paths.dist %>/js/*.js',
        '<%= paths.dist %>/js/lib/underscore-min.js',
        '<%= paths.dist %>/js/lib/chordparser-peg.js'
      ],
      dest: '<%= paths.dist %>/js/chordmaker.js',
    },
  };
};
