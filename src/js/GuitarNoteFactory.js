/* global GuitarNote, Tuning, Vex */

function GuitarNoteFactory(options) {
  // This first guard ensures that the callee has invoked our Class' constructor function
  // with the `new` keyword - failure to do this will result in the `this` keyword referring 
  // to the callee's scope (typically the window global) which will result in the following fields
  // (name and _age) leaking into the global namespace and not being set on this ob ect.
  if (!(this instanceof GuitarNoteFactory)) {
    throw new TypeError("GuitarNoteFactory constructor cannot be called as a function.");
  }
  if(!options) { options = {}; }

  this._init(options);
}

// CONSTANTS
GuitarNoteFactory.DEFAULT_OPTIONS = {
  tuning: "EADGBe",
  numFrets: 20,
  minFret: 0,
  maxFret: 20,
};

// TODO: chord voicing library
// GuitarNoteFactory.openChordVoicings = {
//   "guitar": {
//     "a": [0,0,2,2,2,0],
//     "am": [0,0,2,2,1,0],
//     "a7": [
//       [0,0,2,2,2,3],
//       [0,0,2,0,2,3],
//     ],
//     "b": []
//   }
  
// }

GuitarNoteFactory.prototype = {
  /**
   * Whenever you replace an Object's Prototype, you need to repoint
   * the base Constructor back at the original constructor Function, 
   * otherwise `instanceof` calls will fail.
   */
  constructor: GuitarNoteFactory,

  _init: function(options) {
    // Create config dict, filling in defaults where not provided
    _.defaults(options, GuitarNoteFactory.DEFAULT_OPTIONS);
    
    if(!options.numFrets || !_.isNumber(options.numFrets) || options.numFrets < 0) {
      throw TypeError("numFrets must be valid number >= 0");
    }

    this.tuning = new Tuning(options.tuning);
    this.numFrets = options.numFrets;
    this.minFret = options.minFret;
    this.maxFret = options.maxFret;

    if (this.numFrets < this.maxFret) { this.maxFret = this.numFrets; }

    this.music = new Vex.Flow.Music();
  },

  notesForNotesValues: function(notesValues) {
    if(!notesValues || !_.isArray(notesValues)) {
      throw TypeError("notesValues must be an array");
    }

    var notes = [];
    for (var i=0; i<notesValues.length; i++) {
      var noteVal = notesValues[i];

      if (!_.isNumber(noteVal)) {
        throw TypeError("noteValue must be a number: " + noteVal);
      } else if (noteVal < 0 || noteVal >= Vex.Flow.Music.NUM_TONES) {
        throw TypeError("noteValue must be 0 <= noteVal < 12: " + noteVal);
      }

      for (var string_num=0; string_num<this.tuning.getNumStrings(); string_num++) {
        var tuningNote = this.tuning.notes[string_num].toLowerCase();
        var string_base_value = this.music.getNoteValue(tuningNote);

        for (var fret_num=this.minFret; fret_num<this.maxFret; fret_num++) {
          var fret_value = (string_base_value + fret_num) % 12;
          if (noteVal === fret_value) {
            var note = new GuitarNote(string_num, fret_num);
            notes.push(note);
          }
        }
      }
    }
    return notes;
  },

  notesForNotesStr: function(notesStr) {
    var noteTokens = notesStr.split(" ");
    var notesValues = [];

    for (var i=0; i<noteTokens.length; i++) {
      var noteStr = noteTokens[i].toLowerCase();
      if (noteStr === "") { continue; }
      if(!_.has(Vex.Flow.Music.noteValues, noteStr)) {
        throw TypeError("Invalid noteStr in notesStr: " + noteStr + " in " + notesStr);
      }

      var note_value = this.music.getNoteValue(noteStr);
      notesValues.push(note_value);
    }
    return this.notesForNotesValues(notesValues);
  },

  notesForScale: function(key, scale) {
    if (_.isUndefined(key) || _.isNull(key) || !_.isString(key) || key === "") {
      throw TypeError("Key is required.");
    }
    if(!key || !_.has(Vex.Flow.Music.noteValues, key)) {
      throw TypeError("Invalid key: " + key);
    }
    if(!scale || !_.isString(scale) || !_.has(Vex.Flow.Music.scales, scale)) {
      throw TypeError("Invalid scale: " + scale);
    }

    var keyStr = key.toLowerCase();
    var keyVal = this.music.getNoteValue(keyStr);
    var scaleIntervals = Vex.Flow.Music.scales[scale];

    var noteValues = [];
    var curValue = keyVal;
    noteValues.push(keyVal);
    for (var i=0; i<scaleIntervals.length; i++) {
      var noteValue = (curValue + scaleIntervals[i]) % 12;
      noteValues.push(noteValue);
      curValue = noteValue;
    }
    return this.notesForNotesValues(noteValues);
  },

  notesForArpeggio: function(key, arpeggio) {
    if (_.isUndefined(key) || _.isNull(key) || !_.isString(key) || key === "") {
      throw TypeError("Key is required.");
    }
    if(!key || !_.has(Vex.Flow.Music.noteValues, key)) {
      throw TypeError("Invalid key: " + key);
    }
    if(!arpeggio || !_.isString(arpeggio) || !_.has(Vex.Flow.Music.arpeggios, arpeggio)) {
      throw TypeError("Invalid scale: " + arpeggio);
    }

    var keyStr = key.toLowerCase();
    var keyVal = this.music.getNoteValue(keyStr);
    var arpeggioIntervals = Vex.Flow.Music.arpeggios[arpeggio];

    var noteValues = [];
    var curValue = keyVal;
    noteValues.push(keyVal);
    for (var i=0; i<arpeggioIntervals.length; i++) {
      var noteValue = (curValue + arpeggioIntervals[i]) % 12;
      noteValues.push(noteValue);
      curValue = noteValue;
    }
    return this.notesForNotesValues(noteValues);
  },
};