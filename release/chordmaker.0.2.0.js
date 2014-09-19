/* global require, module, _ */

// Our module bootstrap
//
// In the browser context, our module lives in window.YAHOO.Chords
// In the node context, our module lives in this.YAHOO.Chords
//
// All submodules are install inside `this.YAHOO.Chords`

// UMD Bootstrap
// Boilerplate that allows the library to be loaded as either
//   1) a global variable
//   2) via requirejs
//   3) via node.js's require()
//
// See: https://github.com/umdjs/umd/blob/master/returnExportsGlobal.js

// Uses Node, AMD or browser globals to create a module. This example creates
// a global even when AMD is used. This is useful if you have some scripts
// that are loaded by an AMD loader, but they still want access to globals.
// If you do not need to export a global for the AMD case,
// see returnExports.js.

// If you want something that will work in other stricter CommonJS environments,
// or if you need to create a circular dependency, see commonJsStrictGlobal.js

// Defines a module "returnExportsGlobal" that depends another module called
// "b". Note that the name of the module is implied by the file name. It is
// best if the file name and the exported global have matching names.

// If the 'b' module also uses this type of boilerplate, then
// in the browser, it will create a global .b that is used below.

// NOTE: (aallison)
// `this` is either window or the global node context
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'jquery',
            'underscore',
            'Raphael'
        ], function($, _, Raphael) {
        // define(['b'], function (b) {
            return (root.Chords = factory($, _, Raphael));
        });
    } else {
        // TODO: (aallison) can we get underscore in without concatenating it in our code?
        // Browser globals
        root.Chords = factory($, _, Raphael);
    }
}(this, function($, _, Raphael) {

  //     chordmaker.js 0.2.0
  //     https://github.com/abelnation/chordmaker/
  //     2014-09-19
  //
  //     Contributors:
  //     Abel Allison (abel.allison@gmail.com)

  // This is our root object into which all submodules are installed
  // It's declaration preceeds that of all submodules.
  var Chords = {};
  ;/* global _, Chords */

  // Theory
  // ------

  // AexFlow - Music Engraving for HTML5
  // Copyright Mohit Muthanna 2010
  //
  // This class implements some standard music theory routines.

  (function(exports) {

    // TODO: (aallison) get rid of RERR
    var Aex = {
      RERR: function(type, msg) {
        this.type = type;
        this.msg = msg;
      }
    };

    var Theory = function() {};

    _.extend(Theory, {
      // Music Theory Data
      // -----------------

      NUM_TONES: 12,
      roots: [ "c", "d", "e", "f", "g", "a", "b" ],
      root_values: [ 0, 2, 4, 5, 7, 9, 11 ],

      // Valid note symbols
      root_indices: {
        "c": 0,
        "d": 1,
        "e": 2,
        "f": 3,
        "g": 4,
        "a": 5,
        "b": 6
      },

      // Valid accidental symbols
      accidentals: [ "bb", "b", "n", "#", "##" ],

      // A mapping of integers to note names
      canonical_notes: [
        "c", "c#", "d", "d#",
        "e", "f", "f#", "g",
        "g#", "a", "a#", "b"
      ],

      // Valid note names mapped to root and note values
      noteValues: {
        'c':   { root_index: 0, int_val: 0 },
        'cn':  { root_index: 0, int_val: 0 },
        'c#':  { root_index: 0, int_val: 1 },
        'c##': { root_index: 0, int_val: 2 },
        'cb':  { root_index: 0, int_val: 11 },
        'cbb': { root_index: 0, int_val: 10 },
        'd':   { root_index: 1, int_val: 2 },
        'dn':  { root_index: 1, int_val: 2 },
        'd#':  { root_index: 1, int_val: 3 },
        'd##': { root_index: 1, int_val: 4 },
        'db':  { root_index: 1, int_val: 1 },
        'dbb': { root_index: 1, int_val: 0 },
        'e':   { root_index: 2, int_val: 4 },
        'en':  { root_index: 2, int_val: 4 },
        'e#':  { root_index: 2, int_val: 5 },
        'e##': { root_index: 2, int_val: 6 },
        'eb':  { root_index: 2, int_val: 3 },
        'ebb': { root_index: 2, int_val: 2 },
        'f':   { root_index: 3, int_val: 5 },
        'fn':  { root_index: 3, int_val: 5 },
        'f#':  { root_index: 3, int_val: 6 },
        'f##': { root_index: 3, int_val: 7 },
        'fb':  { root_index: 3, int_val: 4 },
        'fbb': { root_index: 3, int_val: 3 },
        'g':   { root_index: 4, int_val: 7 },
        'gn':  { root_index: 4, int_val: 7 },
        'g#':  { root_index: 4, int_val: 8 },
        'g##': { root_index: 4, int_val: 9 },
        'gb':  { root_index: 4, int_val: 6 },
        'gbb': { root_index: 4, int_val: 5 },
        'a':   { root_index: 5, int_val: 9 },
        'an':  { root_index: 5, int_val: 9 },
        'a#':  { root_index: 5, int_val: 10 },
        'a##': { root_index: 5, int_val: 11 },
        'ab':  { root_index: 5, int_val: 8 },
        'abb': { root_index: 5, int_val: 7 },
        'b':   { root_index: 6, int_val: 11 },
        'bn':  { root_index: 6, int_val: 11 },
        'b#':  { root_index: 6, int_val: 0 },
        'b##': { root_index: 6, int_val: 1 },
        'bb':  { root_index: 6, int_val: 10 },
        'bbb': { root_index: 6, int_val: 9 }
      },

      diatonic_intervals: [
        "unison", "m2", "M2", "m3", "M3",
        "p4", "dim5", "p5", "m6", "M6",
        "b7", "M7", "octave"
      ],

      diatonic_accidentals: {
        "unison": { note: 0, accidental: 0 },
        "m2":     { note: 1, accidental: -1 },
        "M2":     { note: 1, accidental: 0 },
        "m3":     { note: 2, accidental: -1 },
        "M3":     { note: 2, accidental: 0 },
        "p4":     { note: 3, accidental: 0 },
        "dim5":   { note: 4, accidental: -1 },
        "p5":     { note: 4, accidental: 0 },
        "m6":     { note: 5, accidental: -1 },
        "M6":     { note: 5, accidental: 0 },
        "b7":     { note: 6, accidental: -1 },
        "M7":     { note: 6, accidental: 0 },
        "octave": { note: 7, accidental: 0 }
      },

      intervals: {
        "u":  0,
        "unison": 0,
        "m2": 1,
        "b2": 1,
        "min2": 1,
        "S": 1,
        "H": 1,
        "2": 2,
        "M2": 2,
        "maj2": 2,
        "T": 2,
        "W": 2,
        "m3": 3,
        "b3": 3,
        "min3": 3,
        "M3": 4,
        "3": 4,
        "maj3": 4,
        "4":  5,
        "p4":  5,
        "#4": 6,
        "b5": 6,
        "aug4": 6,
        "dim5": 6,
        "5":  7,
        "p5":  7,
        "#5": 8,
        "b6": 8,
        "aug5": 8,
        "6":  9,
        "M6":  9,
        "maj6": 9,
        "b7": 10,
        "m7": 10,
        "min7": 10,
        "dom7": 10,
        "M7": 11,
        "maj7": 11,
        "8": 12,
        "octave": 12
      },

      // Scales specified as sequence of intervals
      scales: {
        'major':         [ 2, 2, 1, 2, 2, 2, 1 ],
        'dorian':        [ 2, 1, 2, 2, 2, 1, 2 ],
        'phrygian':      [ 1, 2, 2, 2, 1, 2, 2 ],
        'lydian':        [ 2, 2, 2, 1, 2, 2, 1 ],
        'mixolydian':    [ 2, 2, 1, 2, 2, 1, 2 ],
        'minor':         [ 2, 1, 2, 2, 1, 2, 2 ],
        'locrian':       [ 1, 2, 2, 1, 2, 2, 2 ],
        'minpent':       [ 3, 2, 2, 3, 2 ],
        'majpent':       [ 2, 2, 3, 2, 3 ],
        'blues':         [ 3, 2, 1, 1, 3, 2 ],
        'harmonicminor': [ 2, 1, 2, 2, 1, 3, 1 ],
        'wholetone':     [ 2, 2, 2, 2, 2, 2 ],
      },

      // Arpeggios specified as sequence of intervals
      arpeggios: {
        'maj':     [ 4, 3, 5 ],
        'maj7':    [ 4, 3, 4, 1 ],
        'maj6':    [ 4, 3, 2, 3 ],
        'maj9':    [ 2, 2, 3, 4, 1 ],
        'min':     [ 3, 4, 5 ],
        'minmaj7': [ 3, 4, 4, 1 ],
        'm7':      [ 3, 4, 3, 2 ],
        'm6':      [ 3, 4, 2, 3 ],
        'm69':     [ 2, 1, 4, 2, 3 ],
        'm7b5':    [ 3, 3, 4, 2 ],
        '7':       [ 4, 3, 3, 2 ],
        '9':       [ 2, 2, 3, 3, 2 ],
        '13':      [ 4, 3, 2, 1, 2 ],
        '13(9)':   [ 2, 2, 3, 2, 1, 2 ],
        '7b9':     [ 1, 3, 3, 3, 2 ],
        '13b9':    [ ],
        'b13b9':   [ ],
        'dim':     [ 3, 3, 3, 3 ]
      },

    });

    _.extend(Theory.prototype, {
      // Convenience Methods
      // -------------------

      // **isValidNoteValue** Validates integer note value
      isValidNoteValue: function(note) {
        // - `note` : integer

        if (note == null || note < 0 || note >= Theory.NUM_TONES) {
          return false;
        }
        return true;
      },

      // **isValidIntervalValue** Validates interval value
      isValidIntervalValue: function(interval) {
        // - `interval` : integer

        // TODO: (aallison) Support Intervals greater than an octave
        return this.isValidNoteValue(interval);
      },

      // **getNoteParts** Splits note string into root and accidental
      getNoteParts: function(noteString) {
        // - `noteString` : string

        //     music.getNoteParts("c#") -> { root: "c", accidental: "#" }

        if (!noteString || noteString.length < 1) {
          throw new Aex.RERR("BadArguments", "Invalid note name: " + noteString);
        }
        if (noteString.length > 3) {
          throw new Aex.RERR("BadArguments", "Invalid note name: " + noteString);
        }

        var note = noteString.toLowerCase();

        var regex = /^([cdefgab])(b|bb|n|#|##)?$/;
        var match = regex.exec(note);

        if (match != null) {
          var root = match[1];
          var accidental = match[2];

          return {
            'root': root,
            'accidental': accidental
          };
        } else {
          throw new Aex.RERR("BadArguments", "Invalid note name: " + noteString);
        }
      },

      // **getKeyParts** Splits key string into root, accidental, and scale type
      getKeyParts: function(keyString) {
        //  - `keyString` : string

        //     music.getKeyParts("c#m") -> { root: "c", accidental: "#", type: "m" }

        if (!keyString || keyString.length < 1) {
          throw new Aex.RERR("BadArguments", "Invalid key: " + keyString);
        }

        var key = keyString.toLowerCase();

        // Support Major, Minor, Melodic Minor, and Harmonic Minor key types.
        // TODO: (aallison) Integrate with scale dicts
        var regex = /^([cdefgab])(b|#)?(mel|harm|m|M)?$/;
        var match = regex.exec(key);

        if (match != null) {
          var root = match[1];
          var accidental = match[2];
          var type = match[3];

          // Unspecified type implies major
          if (!type) { type = "M"; }

          return {
            'root': root,
            'accidental': accidental,
            'type': type
          };
        } else {
          throw new Aex.RERR("BadArguments", "Invalid key: " + keyString);
        }
      },

      // **getNoteValue** Returns integer note value for a note string (including accidentals)
      getNoteValue: function(noteString) {
        // - `noteString` : string

        //     music.getNoteValue("c#") -> 1

        var value = Theory.noteValues[noteString.toLowerCase()];
        if (value == null) {
          throw new Aex.RERR("BadArguments", "Invalid note name: " + noteString);
        }

        return value.int_val;
      },

      // **getIntervalValue** Returns integer value representing distance of an interval
      getIntervalValue: function(intervalString) {
        // - `intervalString` : string

        //     music.getIntervalValue("m3") -> 3

        var value = Theory.intervals[intervalString];
        if (value == null) {
          throw new Aex.RERR("BadArguments",
                             "Invalid interval name: " + intervalString);
        }

        return value;
      },

      // **getCanonicalNoteName** Returns a note name for a given note value
      getCanonicalNoteName: function(noteValue) {
        // - `noteValue` : integer

        //     music.getCanonicalNoteName(6) -> "f#"

        if (!this.isValidNoteValue(noteValue)) {
          throw new Aex.RERR("BadArguments",
                             "Invalid note value: " + noteValue);
        }

        return Theory.canonical_notes[noteValue];
      },

      // **getCanonicalIntervalName** Returns an interval name for a given interval value
      getCanonicalIntervalName: function(intervalValue) {
        // - `intervalValue` : integer

        //     music.getCanonicalIntervalName(6) -> "dim5"

        if (!this.isValidIntervalValue(intervalValue)) {
          throw new Aex.RERR("BadArguments",
                             "Invalid interval value: " + intervalValue);
        }

        return Theory.diatonic_intervals[intervalValue];
      },

      // **getRelativeNoteValue** Calculates noteValue of an intervale based a a note
      getRelativeNoteValue: function(noteValue, intervalValue, direction) {
        // - `noteValue` : integer
        // - `intervalValue` : integer
        // - `direction` : `1` or `-1`

        //     music.getRelativeNoteValue(0, 3, 1) -> 3
        //     music.getRelativeNoteValue(2, 3, -1) -> 11

        if (direction == null) { direction = 1; }
        if (direction != 1 && direction != -1) {
          throw new Aex.RERR("BadArguments", "Invalid direction: " + direction);
        }

        var sum = (noteValue + (direction * intervalValue)) % Theory.NUM_TONES;
        if (sum < 0) { sum += Theory.NUM_TONES; }

        return sum;
      },

      // **getScaleTones** Returns scale tones, given intervals. Each successive interval is
      // relative to the previous one, e.g., Major Scale:
      //
      // TTSTTTS = `[2,2,1,2,2,2,1]`
      //
      // When used with key = 0, returns C scale (which is isomorphic to
      // interval list).
      getScaleTones: function(keyValue, intervals) {
        // - `key` : integer
        // - `intervals` : array (e.g. `[ 2, 2, 1, 2, 2, 2, 1 ]`)

        //     music.getScaleTones(2, [2,2,1]) -> [2,4,6,7]

        var tones = [];
        tones.push(keyValue);

        var nextNote = keyValue;
        for (var i = 0; i < intervals.length; ++i) {
          nextNote = this.getRelativeNoteValue(nextNote, intervals[i]);
          if (nextNote != keyValue) { tones.push(nextNote); }
        }

        return tones;
      },

      // **getIntervalBetween** Distance between two notes
      getIntervalBetween: function(note1, note2, direction) {
        // - `note1` : integer
        // - `note2` : integer
        // - `direction` : -1 or 1

        //     music.getIntervalBetween(2, 4, -1) -> 10

        if (direction == null) { direction = 1; }
        if (direction != 1 && direction != -1) {
          throw new Aex.RERR("BadArguments", "Invalid direction: " + direction);
        }
        if (!this.isValidNoteValue(note1) || !this.isValidNoteValue(note2)) {
          throw new Aex.RERR("BadArguments",
                             "Invalid notes: " + note1 + ", " + note2);
        }

        var difference;
        if (direction == 1) {
          difference = note2 - note1;
        } else {
          difference = note1 - note2;
        }

        if (difference < 0) { difference += Theory.NUM_TONES; }
        return difference;
      },
    });

    _.extend(exports, {
      Theory: Theory
    });

  })(Chords);
  ;/* global Chords, Theory */

  // Tuning
  // ------

  (function(exports) {

    var theory = new exports.Theory();
    var Tuning = function Tuning(tuningStr) {
      // This first guard ensures that the callee has invoked our Class' constructor function
      // with the `new` keyword - failure to do this will result in the `this` keyword referring
      // to the callee's scope (typically the window global) which will result in the following fields
      // (name and _age) leaking into the global namespace and not being set on this object.
      if (!(this instanceof Tuning)) {
        throw new TypeError("tuningStr cannot be called as a function.");
      }
      this._init(tuningStr);
    };

    _.extend(Tuning, {
      instruments: {
        "guitar": {
          "default": "EADGBe",
          "standard": "EADGBe",
          "drop-d": "DADGBe",
          "open-g": "DGDGBD",
          "open-g-dobro": "GBDGBD",
          "open-d": "DADF#AD",
          // TODO: (aallison) add more?
        },
        "banjo": {
          "default": "gDGBD",
          "open-g": "gDGBD",
          "g-modal": "gDGCD",
          "open-g-minor": "gDGA#D",
          "standard-c": "gCGBD",
          "open-d": "f#DF#AD"
          // TODO: (aallison) add more?
        },
        "mandolin": {
          "default": "GDAE",
          // TODO: (aallison) fill in
        },
        "bass": {
          "default": "EADG",
          // TODO: (aallison) fill in
        },
      },
      defaultTuning: "EADGBe",

      isValidTuningString: function(tuningStr) {
        if (!tuningStr || !_.isString(tuningStr) || tuningStr.length === 0) { return false; }
        return tuningStr.match(/^([abcdefg#]\s?)+$/gi) !== null;
      },

      parseTuningString: function(tuningStr) {
        if (!Tuning.isValidTuningString(tuningStr)) {
          throw TypeError("Invalid tuning string: " + tuningStr);
        }
        if (tuningStr.match(/(bb[ABCDEFGabcdefg])|(b[ABCDEFGacdefg])/g) !== null) {
          throw TypeError("Ambiguous tuning string. Flats confused with B Notes.  Use spaces between notes: " + tuningStr);
        }

        var notes = [];
        var tokens = tuningStr.split(" ");

        for (var i in tokens) {
          var token = tokens[i];
          var match = token.match(/[ABCDEFGabcdefg](bb|b|n|##|#)?/g);
          for (var j = 0; j < match.length; j++) {
            notes.push(match[j]);
          }
        }

        return notes;
      },

    });

    _.extend(Tuning.prototype, {
      /**
       * Whenever you replace an Object's Prototype, you need to repoint
       * the base Constructor back at the original constructor Function,
       * otherwise `instanceof` calls will fail.
       */
      constructor: Tuning,
      _init: function(tuningStr) {
        if (!tuningStr) {
          tuningStr = Tuning.defaultTuning;
        }
        if (!Tuning.isValidTuningString(tuningStr)) {
          throw TypeError("Invalid tuningStr: " + tuningStr);
        }

        this.tuningStr = tuningStr;
        this.notes = Tuning.parseTuningString(tuningStr);
      },

      getNumStrings: function() {
        return this.notes.length;
      },
      noteValForString: function(stringNum) {
        return theory.getNoteValue(this.noteNameForString(stringNum));
      },
      noteNameForString: function(stringNum) {
        return this.notes[stringNum];
      },

      equals: function(tuning) {
        if (this.getNumStrings() !== tuning.getNumStrings()) { return false; }
        for (var i = 0; i < this.getNumStrings(); i++) {
          if (this.notes[i] !== tuning.notes[i]) { return false; }
        }
        return true;
      },

      toString: function() {
        return this.tuningStr;
      },
    });

    _.extend(exports, {
      Tuning: Tuning
    });
  })(Chords);
  ;/* global _, Chords */

  (function(exports) {
    var GuitarNote = function GuitarNote(string, fret, options) {
      // This first guard ensures that the callee has invoked our Class' constructor function
      // with the `new` keyword - failure to do this will result in the `this` keyword referring
      // to the callee's scope (typically the window global) which will result in the following fields
      // (name and _age) leaking into the global namespace and not being set on this object.
      if (!(this instanceof GuitarNote)) {
        throw new TypeError("GuitarNote constructor cannot be called as a function.");
      }

      this._init(string, fret, options || {});
    };

    _.extend(GuitarNote, {
      // CONSTANTS
      DEFAULT_OPTIONS: {
        muted: false,
        finger: null,
      },
      DEF_MUTE_ANNOTATION: "x",
      MUTE_ANNOTATION: "xXmM",
      THUMB_ANNOTATION: "tT",
    });

    _.extend(GuitarNote.prototype, {

      _init: function(string, fret, options) {
        // Create config dict, filling in defaults where not provided
        this.options = options;
        _.defaults(this.options, GuitarNote.DEFAULT_OPTIONS);

        if (string === undefined || string === null ||
            !_.isNumber(string) || string < 0) {
          throw TypeError("Please provide a valid string number >= 0: " + string);
        }
        if (!this.options.muted && (fret === undefined || fret === null)) {
          throw TypeError("Please provide a valid fret: " + fret);
        } else if (!this.options.muted && !_.isNumber(fret) && !this.isMuteAnnotation(fret)) {
          throw TypeError("Please provide a valid fret: " + fret);
        } else if (_.isNumber(fret) && fret < 0) {
          throw TypeError("Fret number must be >= 0: " + fret);
        }

        if (this.isMuteAnnotation(fret) ||
            this.options.finger && this.isMuteAnnotation(this.options.finger)) {
          this.options.muted = true;
        }

        this.string = string;
        this.fret = fret;
        this.finger = this.options.finger;
      },

      isOpen: function() {
        return this.fret === 0;
      },
      isMuted: function() {
        return this.options.muted ? true : false;
      },

      getKey: function() {
        if (this.isMuted()) {
          return this.string + " " + GuitarNote.DEF_MUTE_ANNOTATION;
        } else {
          return this.string + " " + this.fret;
        }
      },
      equals: function(note) {
        if ( !note ||
            this.string !== note.string ||
            this.fret !== note.fret ||
            this.finger !== note.finger) {
          return false;
        } else if (this.isMuted() != note.isMuted()) {
          return false;
        }

        return true;
      },

      isMuteAnnotation: function(str) {
        return (GuitarNote.MUTE_ANNOTATION.indexOf(str) !== -1);
      },
      isThumbAnnotation: function(str) {
        return (GuitarNote.THUMB_ANNOTATION.indexOf(str) !== -1);
      },
      toString: function() {
        // TODO: (aallison) implement
        var result = "String: " + this.string + ", Fret: " + this.fret;
        if (this.isMuted()) {
          result += ", Finger: " + GuitarNote.DEF_MUTE_ANNOTATION;
        } else if (this.finger) {
          result += ", Finger: " + this.finger;
        }
        return result;
      },
    });

    _.extend(exports, {
      GuitarNote: GuitarNote
    });

  })(Chords);
  ;/* global _, Chords */

  // ChordModel
  // ----------

  (function(exports) {

    var Tuning = exports.Tuning;
    var GuitarNote = exports.GuitarNote;

    var ChordModel = function ChordModel(options) {
      // - `options` : config object

      // This first guard ensures that the callee has invoked our Class' constructor function
      // with the `new` keyword - failure to do this will result in the `this` keyword referring
      // to the callee's scope (typically the window global) which will result in the following fields
      // (name and _age) leaking into the global namespace and not being set on this object.
      if (!(this instanceof ChordModel)) {
        throw new TypeError("ChordModel cannot be called as a function.");
      }

      this._init(options || {});
    };

    _.extend(ChordModel, {

      // Options
      // -------

      // Default options are for 6-stringed guitar in standard tuning
      DEFAULT_OPTIONS: {
        // numFrets: 5,

        // // TODO: (aallison) doesn't make sense that a chord with a nut is based at fret 1, not 0
        // baseFret: 1,

        // Name/label for the chord
        label: "",

        // Tuning, expressed a a tuning string (see Tuning.js)
        tuning: "EADGBe"
      }
    });

    _.extend(ChordModel.prototype, {
      _init: function(options) {
        // Create config dict, filling in defaults where not provided

        _.defaults(options, ChordModel.DEFAULT_OPTIONS);

        this.tuningStr = options.tuning;
        this.tuning = new Tuning(this.tuningStr);
        this.min_fret = -1;
        this.max_fret = -1;

        // if (_.isUndefined(options.numFrets) || _.isNull(options.numFrets) || !_.isNumber(options.numFrets) || options.numFrets < 0) {
        //   throw TypeError("numFrets must be a valid integer greater than 0: " + options.numFrets);
        // }
        // this.numFrets = options.numFrets;

        // if (_.isUndefined(options.baseFret) || _.isNull(options.baseFret) ||
        //     !_.isNumber(options.baseFret) ||
        //     options.baseFret < 0 || options.baseFret >= this.numFrets) {
        //   throw TypeError("baseFret must be a valid integer greater than 0: " + options.baseFret);
        // }
        // this.baseFret = options.baseFret;

        if (!_.isString(options.label)) {
          throw TypeError("label must be a string");
        }
        this.label = options.label;

        this.notes = {};
        if (options.notes) {
          this.addNotes(options.notes);
          _.each(options.notes, function(note) {
            this.notes[note.getKey()] = note;
          }, this);
        }
      },

      getNotes: function() {
        return this.notes;
      },
      getNumNotes: function() {
        return _.keys(this.notes).length;
      },
      getNumStrings: function() {
        return this.tuning.getNumStrings();
      },
      // getBaseFret: function() {
      //   return this.baseFret;
      // },
      // getNumFrets: function() {
      //   return this.numFrets;
      // },
      getTuning: function() {
        return this.tuning;
      },
      getLabel: function() {
        return this.label;
      },
      getMinFret: function() { return this.min_fret; },
      getMaxFret: function() { return this.max_fret; },

      addNotes: function(notes) {
        if (!_.isArray(notes)) {
          throw TypeError("addNotes takes an array of notes: " + notes);
        }
        for (var i = 0; i < notes.length; i++) {
          var note = notes[i];
          this.addNote(note);
        }
      },
      addNote: function(note) {
        if (_.isUndefined(note) || _.isNull(note)) {
          throw TypeError("Note is undefined");
        } else if (!(note instanceof GuitarNote)) {
          throw TypeError("addNote requires a valid note string or GuitarNote object: " + note);
        } else if (note.string < 0 || note.string >= this.getNumStrings()) {
          throw TypeError("note stringNum is not valid for this chord: " + note.string);
        }

        // TODO: (aallison) notify listeners
        this.notes[note.getKey()] = note;
        if (_.isNumber(note.fret) && note.fret !== 0 && (this.min_fret == -1 || note.fret < this.min_fret)) { this.min_fret = note.fret; }
        if (_.isNumber(note.fret) && note.fret !== 0 && (this.max_fret == -1 || note.fret > this.max_fret)) { this.max_fret = note.fret; }
      },
      removeNote: function(note) {
        var key = this._keyForNote(note);

        // TODO: (aallison) notify listeners
        delete this.notes[key];
      },
      empty: function() {
        this.notes = {};
      },

      // **transposeByInterval** : Move all frets by an interval
      // Frets shifted off the neck will be shown as muted
      transposeByInterval: function(interval, direction) {
        // - `interval` : amount of semi-tones to shift notes by
        // - `direction` : direction to shift notes (`1` or `-1`)

        // just create a new notes dict because keys will change
        // TODO: (aallison) does this cause issues for ChordView?
        var newNotes = {};
        var transposeOffset = (interval * direction);
        for (var noteKey in this.notes) {
          var note = this.notes[noteKey];
          var newFret = note.fret + transposeOffset;
          if (newFret < 0) {
            throw Error("Transposing causes negative fret values: " + interval + " " + direction);
          }
          note.fret = newFret;
          newNotes[note.getKey()] = note;
        }
        this.notes = newNotes;
        this.min_fret += transposeOffset;
        this.max_fret += transposeOffset;
      },

      // **transposeByInterval** : Move all frets to a new key
      // This method causes side effects on the object.
      // Frets and key will be changed.
      transposeToKey: function(key, originalKey) {
        // - `key` : key to transpose to
        // - `originalKey` : (optional) original key of chordmodel
        if (!this.options.key && !originalKey) {
          throw TypeError("No key assigned to chordmodel or passed as an argument");
        }
        // TODO: (aallison) implement
      },

      equals: function(model) {
        if (this.getNumStrings() != model.getNumStrings() ||
            this.getNumNotes() != model.getNumNotes() ||
            !this.getTuning().equals(model.getTuning()) ||
            this.getLabel() != model.getLabel()) {
          return false;
        }

        // Compare each note's key
        var modelNotes = model.getNotes();
        var note1;
        var note2;
        for (var noteKey in this.getNotes()) {
          // Compare keys first
          if (!_.has(modelNotes, noteKey)) { return false; }
          // Then check equality on note objects
          note1 = this.getNotes()[noteKey];
          note2 = modelNotes[noteKey];
          if (!note1.equals(note2)) { return false; }
        }

        return true;
      },
      toString: function() {
        var i;
        var lines = [];

        for (i = 0; i < this.getTuning().notes.length; i++) {
          lines[i] = this.getTuning().notes[i] + " |--";
        }
        for (var noteKey in this.getNotes()) {
          var note = this.notes[noteKey];
          lines[note.string] += note.fret + "-";
        }
        for (i = 0; i < this.getTuning().notes.length; i++) {
          lines[i] += "-|";
        }
        return lines.reverse().join("\n");
      },

      _keyForNote: function(note) {
        if (!(note instanceof GuitarNote)) {
          throw TypeError("addNote requires a valid note string or GuitarNote object: " + note);
        }
        return note.string + " " + note.fret;
      },
    });

    _.extend(exports, {
      ChordModel: ChordModel
    });

  })(Chords);
  ;/* global _, Chords, Raphael */

  // ChordView Class
  // ---------------

  (function(exports) {

    var ChordModel = exports.ChordModel;
    var GuitarNote = exports.GuitarNote;

    var ChordView = function ChordView(container, options, model) {
      // This first guard ensures that the callee has invoked our Class' constructor function
      // with the `new` keyword - failure to do this will result in the `this` keyword referring
      // to the callee's scope (typically the window global) which will result in the following fields
      // (name and _age) leaking into the global namespace and not being set on this object.
      if (!(this instanceof ChordView)) {
        throw new TypeError("ChordView constructor cannot be called as a function.");
      }
      if (!options) { options = {}; }
      if (!model) { model = new ChordModel(); }

      this._init(container, options, model);
    };

    _.extend(ChordView, {
      // CONSTANTS
      // ---------

      // Diagram orientation constants
      NUT_TOP: -1,
      NUT_LEFT: -2,

      // Finger position constants
      FINGER_TOP: -1,
      FINGER_LEFT: -2,
      FINGER_ONNOTE: -3,
    });
    _.extend(ChordView, {
      NOTE_COLORS: {
        'black': '#000',
        'white': '#fff',
        'blue' : '#22f',
        'red'  : '#f22',
        'green': '#0f0'
      },
      NOTE_GRADIENTS: {
        'black': '90-#000:5-#555:95',
        'white': '90-#eee:5-#fff:95',
        'blue' : '90-#22f:5-#55f:95',
        'red'  : '90-#f22:5-#f55:95',
        'green': '90-#0f0:5-#0f0:95'
      },

      // Positions on neck of neck marker dots
      // TODO: (aallison) only applicable for guitar
      NECK_MARKERS: [
        [ 5, 1 ],
        [ 7, 2 ],
        [ 9, 1 ],
        [ 12, 2 ],
        [ 15, 1 ],
        [ 17, 1 ]
      ],

      // Render Options
      // --------------

      // Render attributes are configurable via the ChordView's options object.
      // Render options tend to contain measurement, color, and boolean values.

      // Default options for a standard chord diagram.  These can be over-ridden
      // by passing in a config object to the ChordView constructor.
      UNSCALABLE: [
        'base_fret',
        'num_frets',
        'min_frets',
        'fret_pad',
        'scale',
        'orientation',
        'finger_position',
      ],
      DEFAULT_OPTIONS: {
        // Constant factor to scale all subsquent values by.
        scale: 0.5,

        // Orientation. Side view is useful for longer neck diagrams.
        orientation: ChordView.NUT_TOP,

        string_gap: 30,
        fret_gap: 30,

        // Neck range
        fret_pad: 1,
        min_frets: 5,
        // num_frets: 5,
        // base_fret: 1,

        // Finger number annotations
        show_fingers: true,
        finger_anno_y: 10,
        finger_position: ChordView.FINGER_TOP,
        anno_font_size: 18,
        // TODO: (aallison) open annotations not really related to finger annotations
        open_note_radius: 6,

        // Note markers
        note_radius: 10,
        note_stroke_width: 1.5,
        note_gradient: true,
        note_color: 'white',
        tonic_color: 'black',

        neck_marker_radius: 8,
        neck_marker_color: "#eee",

        // Nut (zero-th fret) marker
        nut_height: 5,

        // Offset from origin of neck grid
        grid_x: 0,
        grid_y: 0,
        grid_stroke_width: 1.5,

        grid_padding_bottom: 20,
        grid_padding_right: 20,
        grid_padding_left: 20,

        // Chord label
        show_label: true,
        label_font_size: 36,
        label_y_offset: 20,
        label_height: 40,

        // Instrument tuning annotation
        show_tuning: true,
        tuning_label_font_size: 18,
        tuning_label_offset: 14,

        // Base fret annotation (when chord is offset from the nut)
        base_fret_font_size: 26,
        base_fret_label_width: 20,
        base_fret_offset: 16
      },

      // Pre-set for compact tiny format
      OPTIONS_COMPACT: {
        scale: 0.3,
        show_tuning: false,
        show_fingers: false,
        note_stroke_width: 1.0,
        note_color: 'black',
        note_gradient: false,
        base_fret_font_size: 36,
        base_fret_offset: 20,
        grid_padding_right: 40,
        num_frets: 5
      },

      // Pre-set suitable for longer neck diagram
      OPTIONS_NECK: {
        scale: 1.0,
        orientation: ChordView.NUT_LEFT,
        show_tuning: true,
        fret_gap: 50,
        num_frets: 15,
      },
    });
    _.extend(ChordView, {
      OPTIONS: {
        "default": ChordView.DEFAULT_OPTIONS,
        "compact": ChordView.OPTIONS_COMPACT,
        "neck": ChordView.OPTIONS_NECK
      },
    });

    _.extend(ChordView.prototype, {

      _init: function(container, options, model) {
        if (_.isString(container)) {
          this.containerId = container.replace("#", "");
        } else if (container instanceof jQuery) {
          this.containerId = container.attr("id");
        } else if (_.isElement(container)) {
          this.containerId = $(container).attr("id");
        } else {
          throw TypeError("container must be a DOM elem or DOM ID string.");
        }

        // Create fresh copy of options object in case they have passed in one of
        // the static pre-set options objects
        this.options = {};
        if (_.isString(options)) {
          if (!_.has(ChordView.OPTIONS, options)) {
            throw TypeError("Invalid options string: " + options);
          }
          _.defaults(this.options, ChordView.OPTIONS[options]);
        } else if (_.isObject(options)) {
          _.defaults(this.options, options);
        }
        _.defaults(this.options, ChordView.DEFAULT_OPTIONS);

        this.model = model;

        this.options.grid_x = this.options.grid_padding_left;
        this.options.grid_y = this.options.anno_font_size + 4;

        if (this.options.orientation === ChordView.NUT_TOP && this.model.getLabel() !== "") {
          this.options.grid_y += this.options.label_height;
        }

        // Scaling is done by scaling all the constant factors in the render code
        console.log("scale: " + this.options.scale);
        if (this.options.scale != 1) {
          this._scaleSize();
        }

        // if both are num_frets and base_fret are not provided, auto-calc missing values
        if (!(_.has(this.options, 'num_frets') && _.has(this.options, 'base_fret'))) {
          this._calcFretRange();
        }

        this.diagram_glyphs = {};
        this.neck = {
          glyphs: {},
          width: 0,
          height: 0
        };
        this.noteGlyphs = {};

        this.transform_str = "";
        // TODO: (aallison) decomp out this calculation
        this.width = this.options.grid_x + this.model.getNumStrings() * this.options.string_gap + this.options.base_fret_label_width + this.options.grid_padding_right;
        this.height = this.options.grid_y + this.options.num_frets * this.options.fret_gap + this.options.tuning_label_font_size + this.options.grid_padding_bottom;

        if (window.jQuery) {
          $(container).html("");
        } else if (_.isElement(container)) {
          container.innerHtml = "";
        } else {
          console.log(container);
        }

        // var ratio = 1.0;
        // console.log("Width: " + this.width);
        // console.log("Height: " + this.height);
        // console.log("Container Width: " + $(container).parent().width());
        // console.log("Orientation: " + this.options.orientation);
        // if (this.options.orientation == ChordView.NUT_LEFT &&
        //     this.height > $(container).parent().width()) {

        //   ratio = $(container).parent().width() / this.height;
        //   console.log("Auto-scaling to: " + ratio);
        //   this._scaleSize(ratio);
        // } else if (this.options.orientation == ChordView.NUT_TOP &&
        //     this.width > $(container).parent().width()) {

        //   ratio = $(container).parent().width() / this.width;
        //   console.log("Container Width: " + $(container).parent().width());
        //   console.log("Auto-scaling to: " + ratio);
        //   this._scaleSize(ratio);
        // }

        this.r = null;
        console.log(this.containerId);
        this.r = Raphael(this.containerId, this.width, this.height);

        this._render();
        this._setOrientation(this.options.orientation);

        var svgWidth = $("#" + this.containerId).width();
        var parentWidth = $("#" + this.containerId).parent().width();
        if (svgWidth > parentWidth) {
          console.log("shrinking container to fit");
          $("#" + this.containerId).css("width", "" + parentWidth + "px");
        }

      },

      getCode: function() {
        // TODO: (aallison) implement
        throw Error("Not implemented yet");
      },
      getModel: function() {
        return this.model;
      },

      _scaleSize: function() {
        _.each(ChordView.DEFAULT_OPTIONS, function(num, key) {
          // TODO: (aallison) improve the fact that we're using negative numbers to distinguish values from consts
          if (_.indexOf(ChordView.UNSCALABLE, key) == -1 && _.isNumber(this.options[key])) {

            this.options[key] = this.options[key] * this.options.scale;
          }
        }, this);
      },

      _calcFretRange: function() {
        var fret_range = this.model.getMaxFret() - this.model.getMinFret();
        var ideal_num_frets = fret_range + this.options.fret_pad;
        var ideal_base_fret = Math.max(this.model.getMinFret(), 1);

        if (!_.has(this.options, 'base_fret')) {
          this.options.base_fret = ideal_base_fret;
        }
        if (!_.has(this.options, 'num_frets')) {
          this.options.num_frets = Math.max(
            this.options.min_frets,
            ideal_num_frets + (ideal_base_fret - this.options.base_fret)
          );
        }

      },

      _render: function() {
        this.neck.width = (this.model.getNumStrings() - 1) * this.options.string_gap;
        this.neck.height = this.options.num_frets * this.options.fret_gap;

        this._drawNeck(
          this.options.grid_x, this.options.grid_y,
          this.neck.width, this.neck.height,
          this.model.getNumStrings() - 1, this.options.num_frets, "#000"
        );

        if (this.options.base_fret == 1) {
          this._drawNut();
        } else {
          this._drawBaseFret(this.options.base_fret);
        }

        if (this.options.orientation === ChordView.NUT_TOP && this.options.show_label) {
          this._drawLabel();
        }
        if (this.options.show_tuning) {
          this._drawTuningLabel();
        }
        this._drawNotes();
      },

      _setOrientation: function(orientation) {
        if (_.isString(orientation)) {
          if (orientation == "left") {
            this._setOrientation(ChordView.NUT_LEFT);
            return;
          } else if (orientation == "top") {
            this._setOrientation(ChordView.NUT_TOP);
            return;
          } else {
            throw TypeError("Invalid orientation string: " + orientation);
          }
        }
        if (!_.include([ ChordView.NUT_TOP, ChordView.NUT_LEFT ], orientation)) {
          throw TypeError("Invalid orientation: " + orientation);
        }

        // TODO: (aallison) Deal correctly with chord label

        if (orientation == ChordView.NUT_TOP) {

          this.transform_str = "";
          this.width = this.options.grid_x + this.model.getNumStrings() * this.options.string_gap + this.options.base_fret_label_width + this.options.grid_padding_right;
          this.height = this.options.grid_y + this.options.num_frets * this.options.fret_gap + this.options.tuning_label_font_size + this.options.grid_padding_bottom;
          this.r.setSize(this.width, this.height);

        } else if (orientation == ChordView.NUT_LEFT) {
          // Rotate Horizontally
          // var transform_str = "t-"+this.neck.height+",0" + "r-90,"+this.options.grid_x+","+this.options.grid_y;

          var rotate_o_x = (this.options.grid_x + (this.neck.width / 2));
          var rotate_o_y = (this.options.grid_y + (this.neck.height / 2));
          var translate_x = -(this.width - this.height) / 2;
          var translate_y = (this.height - this.width) / 2;

          // TODO: (aallison) explain this transformation
          // don't include right padding for sideways layouts
          // TODO: (aallison) position base fret label differently depending on orientation
          this.transform_str = "r-90,0,0" + "t-" + (this.width - (this.options.base_fret_label_width + this.options.grid_padding_right)) + ",0";

          this.height = this.options.grid_x + this.model.getNumStrings() * this.options.string_gap;
          this.width = this.options.grid_y + this.options.num_frets * this.options.fret_gap + this.options.tuning_label_font_size + this.options.grid_padding_bottom;

          this.r.setSize(this.width, this.height);
        }
        _.each(_.values(this.neck.glyphs), function(glyph) {
          if (_.isArray(glyph)) {
            _.each(glyph, function(glyph) {
              glyph.transform(this.transform_str);
            }, this);
          } else {
            glyph.transform(this.transform_str);
          }
        }, this);
        _.each(_.values(this.noteGlyphs), function(note) {
          _.each(_.values(note), function(glyph) {
            if (orientation == ChordView.NUT_LEFT) {
              glyph.transform(this.transform_str + "r90");
            } else {
              glyph.transform(this.transform_str);
            }
          }, this);
        }, this);
      },

      _drawNeck: function(x, y, w, h, wv, hv, color) {
        color = color || "#000";
        var path = [ "M", Math.round(x) + 0.5, Math.round(y) + 0.5, "L", Math.round(x + w) + 0.5, Math.round(y) + 0.5, Math.round(x + w) + 0.5, Math.round(y + h) + 0.5, Math.round(x) + 0.5, Math.round(y + h) + 0.5, Math.round(x) + 0.5, Math.round(y) + 0.5 ];
        var rowHeight = h / hv;
        var columnWidth = w / wv;

        for (var i = 1; i < hv; i++) {
          path = path.concat([ "M", Math.round(x) + 0.5, Math.round(y + i * rowHeight) + 0.5, "H", Math.round(x + w) + 0.5 ]);
        }
        for (i = 1; i < wv; i++) {
          path = path.concat([ "M", Math.round(x + i * columnWidth) + 0.5, Math.round(y) + 0.5, "V", Math.round(y + h) + 0.5 ]);
        }

        // this.neck.glyphs['grid_back'] = this.r.rect(this.options.grid_x, this.options.grid_y, this.neck.width, this.neck.height).attr("fill", "white");
        this._drawNeckMarkers();
        this.neck.glyphs['grid'] = this.r.path(path.join(",")).attr({
          'stroke': color,
          'stroke-width': this.options.grid_stroke_width
        });
      },

      _drawNeckMarkers: function() {
        this.neck.glyphs['neck-markers'] = [];

        for (var i = 0; i < ChordView.NECK_MARKERS.length; i++) {
          var marker = ChordView.NECK_MARKERS[i];
          if (marker[0] > this.options.base_fret &&
             marker[0] < this.options.base_fret + this.options.num_frets) {
            this._drawNeckMarker(marker);
          }
        }
      },

      _drawNeckMarker: function(neck_marker) {
        if (_.isUndefined(neck_marker)) { return; }

        var y = this.options.grid_y + ((neck_marker[0] - (this.options.base_fret - 1)) * this.options.fret_gap) - (this.options.fret_gap / 2);
        var marker_style = {
          fill: this.options.neck_marker_color,
          stroke: "none"
        };

        if (neck_marker[1] == 1) {
          var x = this.options.grid_x + this.neck.width / 2;

          var glyph = this.r.circle(x, y, this.options.neck_marker_radius);
          glyph.attr(marker_style);
          this.neck.glyphs['neck-markers'].push(glyph);

        } else if (neck_marker[1] == 2) {
          var x1 = this.options.grid_x + (1.2 * this.options.string_gap);
          var x2 = this.options.grid_x + (3.8 * this.options.string_gap);

          var glyph1 = this.r.circle(x1, y, this.options.neck_marker_radius);
          glyph1.attr(marker_style);
          this.neck.glyphs['neck-markers'].push(glyph1);

          var glyph2 = this.r.circle(x2, y, this.options.neck_marker_radius);
          glyph2.attr(marker_style);
          this.neck.glyphs['neck-markers'].push(glyph2);
        }
      },

      _drawNut: function() {
        var glyph = this.r.rect(
          this.options.grid_x, this.options.grid_y,
          (this.model.getNumStrings() - 1) * this.options.string_gap,
          this.options.nut_height).attr({ fill: "black" }
        );

        this.neck.glyphs['nut'] = glyph;
        //this.neck.push(glyph);
      },

      _drawTuningLabel: function() {
        var font_attr = {
          'font-size': this.options.tuning_label_font_size
        };

        this.neck.glyphs['tuning-labels'] = [];

        for (var i = 0; i < this.model.getNumStrings(); i++) {
          var note = this.model.getTuning().notes[i];

          var x = this.options.grid_x + (i * this.options.string_gap);
          var y = this.options.grid_y + this.neck.height + this.options.tuning_label_offset;

          var glyph = this.r.text(x, y, "" + note).attr(font_attr);
          this.neck.glyphs['tuning-labels'].push(glyph);
        }
      },

      _drawBaseFret: function(base_fret) {
        var x = this.options.grid_x + this.neck.width + this.options.base_fret_offset;
        var y = this.options.grid_y + this.options.fret_gap / 2;

        this.r.text(x, y, "" + base_fret + "fr.").attr({
          'text-anchor': 'start',
          'font-size': this.options.base_fret_font_size
        });
      },

      _drawNotes: function() {
        _.each(this.model.getNotes(), this._drawNote, this);
      },

      _drawNote: function(note) {
        if (_.isUndefined(note) || _.isNull(note)) {
          throw TypeError("Model has undefined note");
        }

        if (note instanceof GuitarNote) {
          if (_.isUndefined(this.noteGlyphs[note.getKey()])) {
            this.noteGlyphs[note.getKey()] = {};
          }
          if (note.isMuted()) {
            this._drawMuteStringAnnotatation(note).transform(this.transform_str);
          } else if (note.isOpen()) {
            this._drawOpenStringAnnotatation(note).transform(this.transform_str);
          } else {
            var marker = this._drawFretMarker(note);
            if (marker) {
              marker.transform(this.transform_str);
            }
            if (this.options.show_fingers && note.finger) {
              this._drawFingerAnnotation(note).transform(this.transform_str);
            }
          }
        }
      },

      _drawFretMarker: function(note) {
        if (_.isUndefined(note.fret) || note.fret === 0) { return; }

        if (note.fret < this.options.base_fret ||
            note.fret >= this.options.base_fret + this.options.num_frets) { return; }

        var x = this.options.grid_x + (note.string * this.options.string_gap) + 0.5;
        var y = this.options.grid_y + ((note.fret - this.options.base_fret + 1) * this.options.fret_gap) - (this.options.fret_gap / 2) + 0.5;

        var note_style = {
          fill: this._colorValueForName(this.options.note_color)
        };
        note_style['stroke-width'] = this.options.note_stroke_width;
        if (note.options.color) {
          note_style['fill'] = this._colorValueForName(note.options.color);
        }
        if (note.options.tonic) {
          note_style['fill'] = this._colorValueForName(this.options.tonic_color);
          // note_style['stroke-width'] = this.options.note_stroke_width;
          note_style['stroke'] = "black";
        }

        var class_str = "chord-note";
        if (note.class) { class_str = class_str + " " + note.class; }

        var glyph = this.r.circle(x, y, this.options.note_radius);
        glyph.node.setAttribute("class", class_str);
        glyph.attr(note_style);

        this.noteGlyphs[note.getKey()]['fret-marker'] = glyph;
        return glyph;
      },

      _drawMuteStringAnnotatation: function(note) {
        if (_.isUndefined(note.string)) { return; }
        var x = this.options.grid_x + (note.string * this.options.string_gap);
        var y = this.options.grid_y - this.options.finger_anno_y;

        var glyph = this.r.text(x, y, "X").attr({ 'font-size': this.options.anno_font_size });
        this.noteGlyphs[note.getKey()]['finger-annotation'] = glyph;
        return glyph;
      },

      _drawOpenStringAnnotatation: function(note) {
        if (_.isUndefined(note.string)) { return; }
        var x = this.options.grid_x + (note.string * this.options.string_gap);
        var y = this.options.grid_y - this.options.finger_anno_y;

        var glyph = this.r.circle(x, y, this.options.open_note_radius).attr({
          stroke: "black",
          fill: "white",
          "stroke-width": this.options.note_stroke_width
        });
        this.noteGlyphs[note.getKey()]['finger-annotation'] = glyph;
        return glyph;
      },

      _drawFingerAnnotation: function(note) {
        if (_.isUndefined(note.string) || _.isUndefined(note.finger)) { return; }

        var x;
        var y;
        var annotation_style = {
          fill: "black"
        };
        var font_style = {
          'font-size': this.options.anno_font_size
        };

        if (this.options.finger_position === ChordView.FINGER_TOP) {
          x = this.options.grid_x + (note.string * this.options.string_gap);
          y = this.options.grid_y - this.options.finger_anno_y;
        } else if (this.options.finger_position === ChordView.FINGER_LEFT) {
          x = this.options.grid_x + (note.string * this.options.string_gap) - (this.options.note_radius * 2) + 0.5;
          y = this.options.grid_y + ((note.fret - this.options.base_fret + 1) * this.options.fret_gap) - (this.options.fret_gap / 2) + 0.5;
        } else if (this.options.finger_position === ChordView.FINGER_ONNOTE) {
          x = this.options.grid_x + (note.string * this.options.string_gap) + 0.5;
          y = this.options.grid_y + ((note.fret - this.options.base_fret + 1) * this.options.fret_gap) - (this.options.fret_gap / 2) + 0.5;
        } else {
          throw TypeError("Invalid finger_position: " + this.options.finger_position);
        }

        var glyph = this.r.text(x, y, "" + note.finger).attr(font_style);
        this.noteGlyphs[note.getKey()]['finger-annotation'] = glyph;
        return glyph;
      },

      _drawLabel: function() {
        var x = this.options.grid_x + (this.neck.width / 2);
        var y = this.options.label_y_offset;
        var fancy_label = this.model.getLabel()
          .replace(/b/g, "♭")
          .replace(/\#/g, "♯")
          .replace(/\*/g, "￮");
        this.r.text(x, y, fancy_label).attr({ "text-anchor": "middle", "font-size": this.options.label_font_size });
      },

      _colorValueForName: function(colorName) {
        if (this.options.note_gradient) {
          return ChordView.NOTE_GRADIENTS[colorName];
        } else {
          return ChordView.NOTE_COLORS[colorName];
        }
      }
    });

    _.extend(exports, {
      ChordView: ChordView
    });

  })(Chords);
  ;/* global _, Chords, Aex */

  // Voicings
  // --------

  // Library of both open and closed chord voicings for various
  // instruments.

  (function(exports) {
    var GuitarNote = exports.GuitarNote;
    var Tuning = exports.Tuning;
    var ChordModel = exports.ChordModel;
    var Theory = exports.Theory;
    var theoryObj = new Theory();

    var Voicings = function Voicings() {
      throw new Error("Voicings is a singleton. Do not call the constructor");
    };

    _.extend(Voicings, {
      // Chord Data
      // ---------
      //
      // Chord data is defined here.
      voicings: {
        // - `key` : root of the chord
        // - `label` : type of chord (e.g. "M", "M7")
        // - `notes` : list of fret numbers from lowest (bass) string to highest
        // - `fingers` : list of fingerings for corresponding frets in notes `array`
        // - `bass` : if an inversion, notes which note relative to to the tonic is in the bass
        "guitar": {
          "eadgbe" : [
            // Major Chords
            { "key":"c", "label": "maj",      "notes": [3,3,5,5,5,"x"],       "fingers": [1,1,3,3,3,"x"],     "bass": 7,  "tags": "gypsy", },
            { "key":"c", "label": "maj",      "notes": [8,10,10,9,8,8],       "fingers": ["T",3,4,2,1,1],                 "tags": "gypsy", },
            { "key":"c", "label": "maj",      "notes": [12,"x",10,12,13,"x"], "fingers": [2,"x",1,3,4,"x"],   "bass": 4,  "tags": "gypsy", },
            { "key":"c", "label": "maj",      "notes": [12,"x",14,12,13,"x"], "fingers": ["T","x",3,1,2,"x"], "bass": 4,  "tags": "gypsy", },

            // Maj7
            { "key":"c", "label": "maj7",     "notes": ["x",3,5,4,5,"x"],     "fingers": ["x",1,3,2,4,"x"],               "tags": "jazz", },
            { "key":"c", "label": "maj7",     "notes": ["x",3,5,4,5,3],       "fingers": ["x",1,3,2,4,1],                 "tags": "jazz", },
            { "key":"c", "label": "maj7",     "notes": ["x",3,2,4,5,"x"],     "fingers": ["x",2,1,3,4,"x"],               "tags": "jazz", },
            { "key":"c", "label": "maj7",     "notes": ["x",3,5,5,5,7],       "fingers": ["x",1,3,3,3,4],                 "tags": "jazz", },
            { "key":"g", "label": "maj7",     "notes": [3,"x",4,4,3,"x"],     "fingers": [1,"x",3,4,2,"x"],               "tags": "jazz", },
            { "key":"g", "label": "maj7",     "notes": [3,5,"x",4,7,"x"],     "fingers": [1,3,"x",2,4,"x"],               "tags": "jazz", },
            { "key":"g", "label": "maj7",     "notes": [7,"x",5,7,7,"x"],     "fingers": [2,"x",1,3,4,"x"],   "bass": 4,  "tags": "jazz", },
            { "key":"g", "label": "maj7",     "notes": ["x",10,9,7,7,7],      "fingers": ["x",4,3,1,1,1],                 "tags": "jazz", },
            { "key":"c", "label": "maj7",     "notes": ["x","x",10,9,8,7],    "fingers": ["x","x",4,3,2,1],               "tags": "jazz", },
            { "key":"g", "label": "maj7",     "notes": ["x",2,4,4,3,"x"],     "fingers": ["x",1,3,4,2,"x"],   "base": 4,  "tags": "jazz", },

            // 6
            { "key":"g", "label": "6",     "notes": [3,"x",2,4,3,"x"],     "fingers": [2,"x",1,4,3,"x"],               "tags": "jazz", },
            { "key":"g", "label": "6",     "notes": [3,5,"x",4,5,"x"],     "fingers": [1,3,"x",2,4,"x"],               "tags": "jazz", },
            { "key":"g", "label": "6",     "notes": ["x",7,5,7,5,"x"],     "fingers": ["x",3,1,4,1,"x"],   "base": 9,  "tags": "jazz", },
            { "key":"g", "label": "6",     "notes": ["x",7,5,4,3,"x"],     "fingers": ["x",4,3,2,1,"x"],   "base": 9,  "tags": "jazz", },
            { "key":"g", "label": "6",     "notes": ["x",7,5,4,3,3],       "fingers": ["x",4,3,2,1,1],     "base": 9,  "tags": "jazz", },
            { "key":"g", "label": "6",     "notes": ["x",7,9,9,8,7],       "fingers": ["x",1,3,4,2,1],     "base": 9,  "tags": "jazz", },
            { "key":"g", "label": "6",     "notes": ["x",7,9,7,8,"x"],     "fingers": ["x",1,3,1,2,"x"],   "base": 9,  "tags": "jazz", },
            { "key":"c", "label": "6",     "notes": ["x",4,3,3,6,"x"],     "fingers": ["x",2,1,1,4,"x"],               "tags": "jazz", },
            { "key":"c", "label": "6",     "notes": ["x",3,5,5,5,5],       "fingers": ["x",1,3,3,3,3],                 "tags": "jazz", },
            { "key":"d", "label": "6",     "notes": ["x",5,4,4,3,"x"],     "fingers": ["x",4,2,3,1,"x"],               "tags": "jazz", },
            { "key":"c", "label": "6",     "notes": [3,3,5,5,5,5],         "fingers": [1,1,3,3,3,3],       "bass": 7,  "tags": "gypsy", },
            { "key":"c", "label": "6",     "notes": [8,7,5,5,5,5],         "fingers": [4,3,1,1,1,1],                   "tags": "gypsy", },
            { "key":"c", "label": "6",     "notes": [8,"x",10,9,10,8],     "fingers": ["T","x",3,2,4,1],               "tags": "gypsy", },

            // 9
            { "key":"f", "label": "maj9",     "notes": [5,7,5,5,5,8],         "fingers": [1,3,1,1,1,4],    "bass": 4,  "tags": "jazz", },
            { "key":"f", "label": "maj9",     "notes": [5,7,5,5,8,"x"],       "fingers": [1,3,1,1,4,"x"],  "bass": 4,  "tags": "jazz", },
            { "key":"c", "label": "maj9",     "notes": ["x",3,2,4,3,"x"],     "fingers": ["x",2,1,4,3],                "tags": "jazz", },
            { "key":"a", "label": "maj9",     "notes": ["x",4,6,4,5,"x"],     "fingers": ["x",1,3,1,2,"x"],"bass": 4,  "tags": "jazz", },
            { "key":"a", "label": "maj9",     "notes": ["x",4,6,4,5,7],       "fingers": ["x",1,3,1,2,4],  "bass": 4,  "tags": "jazz", },

            // 6/9
            { "key":"c", "label": "6/9",   "notes": ["x",3,2,2,3,3],       "fingers": ["x",2,1,1,3,3],                 "tags": "jazz", },
            { "key":"g", "label": "6/9",   "notes": [3,"x",2,2,3,3],       "fingers": [2,"x",1,1,3,3],                 "tags": "jazz", },
            { "key":"d", "label": "6/9",   "notes": ["x",2,2,2,3,"x"],     "fingers": ["x",1,1,1,2,"x"],   "bass": 9,  "tags": "jazz", },
            { "key":"c", "label": "6/9",   "notes": [3,3,2,2,3,3],         "fingers": [2,2,1,1,3,4],       "bass": 7,  "tags": "gypsy", },
            { "key":"c", "label": "6/9",   "notes": [8,7,7,7,8,8],         "fingers": [2,1,1,1,3,4],                   "tags": "gypsy", },
            { "key":"c", "label": "6/9",   "notes": [8,10,10,9,10,10],     "fingers": ["T",2,2,1,3,3],                 "tags": "gypsy", },

            // dominant 7 Chords
            { "key":"f", "label": "7",      "notes": ["x","x",5,4,5,3],     "fingers": ["x","x",3,2,4,1],               "tags": "jazz", },
            { "key":"f", "label": "7",      "notes": ["x",5,7,7,7,8],       "fingers": ["x",1,3,3,3,4],                 "tags": "jazz", },
            { "key":"c", "label": "7",      "notes": [3,3,5,3,5,3],         "fingers": [1,1,3,1,4,1],                   "tags": "gypsy", },
            { "key":"c", "label": "7",      "notes": [8,"x",8,9,8,"x"],     "fingers": ["T","x",1,3,2,"x"],             "tags": "gypsy", },
            { "key":"c", "label": "7",      "notes": [8,10,8,9,8,8],        "fingers": [1,3,1,2,1,1],                   "tags": "gypsy", },
            { "key":"c", "label": "7",      "notes": [3,3,2,3,1,"x"],       "fingers": [3,3,2,4,1,"x"],     "bass": 7,  "tags": "gypsy", },
            { "key":"c", "label": "7",      "notes": [8,10,10,9,11],        "fingers": ["T",2,2,1,4,"x"],               "tags": "gypsy", },
            { "key":"c", "label": "7",      "notes": [6,"x",5,5,5,"x"],     "fingers": [2,"x",1,1,1,"x"],   "bass": 10, "tags": "gypsy", },
            { "key":"c", "label": "7",      "notes": [3,3,5,3,5,6],         "fingers": [1,1,2,1,3,4,"x"],   "bass": 7,  "tags": "gypsy", },
            { "key":"c", "label": "7",      "notes": [8,"x",8,9,8,8],       "fingers": ["T","x",1,4,2,3],               "tags": "gypsy", },

            // 7(b5)
            { "key":"b", "label": "7(b5)",  "notes": [7,"x",7,8,6,"x"],     "fingers": [2,"x",3,4,1,"x"],               "tags": "jazz", },
            { "key":"d", "label": "7(b5)",  "notes": [4,"x",4,5,3,"x"],     "fingers": [2,"x",3,4,1,"x"],   "bass": 6,  "tags": "jazz", },

            // 7(#5)
            { "key":"a", "label": "7(#5)",  "notes": [5,"x",5,6,6,"x"],     "fingers": [1,"x",2,3,4,"x"],               "tags": "jazz", },
            { "key":"a", "label": "7(#5)",  "notes": [5,"x",5,6,6,"x"],     "fingers": ["T","x",1,2,2,"x"],             "tags": "jazz", },
            { "key":"d", "label": "7(#5)",  "notes": ["x",5,4,5,"x",6],     "fingers": ["x",2,1,3,"x",4],               "tags": "jazz", },

            // 7(b9)
            { "key":"bb", "label": "7(b9)", "notes": [6,"x",6,7,6,7],       "fingers": ["T","x",1,3,2,4],               "tags": "jazz", },
            { "key":"e", "label": "7(b9)",  "notes": ["x",7,6,7,6,"x"],     "fingers": ["x",2,1,3,1,"x"],               "tags": "jazz", },
            { "key":"c", "label": "7(b9)",  "notes": [3,3,2,3,2,"x"],       "fingers": [2,2,1,3,1,"x"],     "bass": 7,  "tags": "gypsy jazz", },
            { "key":"c", "label": "7(b9)",  "notes": [12,"x",14,12,14,"x"], "fingers": ["T","x",2,1,3,"x"], "bass": 4,  "tags": "gypsy jazz", },

            // dominant 9 Chords
            { "key":"c", "label": "9",      "notes": ["x",3,2,3,3,"x"],     "fingers": ["x",2,1,3,3,"x"],               "tags": "jazz", },
            { "key":"c", "label": "9",      "notes": ["x",3,2,3,3,3],       "fingers": ["x",2,1,3,3,3],                 "tags": "jazz", },
            { "key":"g", "label": "9",      "notes": [3,5,3,4,3,5],         "fingers": [1,3,1,2,1,4],                   "tags": "jazz", },
            { "key":"g", "label": "9",      "notes": ["x",2,3,2,3,"x"],     "fingers": ["x",1,3,2,4,"x"],   "bass": 4,  "tags": "jazz", },

            // dominant 11 Chords
            { "key":"d", "label": "11",     "notes": [5,"x",5,5,3,"x"],     "fingers": [2,"x",3,4,1,"x"],   "bass": 7,  "tags": "jazz", },
            { "key":"g", "label": "11",     "notes": ["x",5,3,5,3,3],       "fingers": ["x",3,1,4,1,1],     "bass": 7,  "tags": "jazz", },
            { "key":"c", "label": "11",     "notes": ["x",3,5,3,6,"x"],     "fingers": ["x",1,3,1,4,"x"],               "tags": "jazz", },

            // dominant 13 Chords
            { "key":"a", "label": "13",     "notes": [5,"x",5,6,7,"x"],     "fingers": [1,"x",2,3,4,"x"],               "tags": "jazz", },
            { "key":"a", "label": "13",     "notes": [5,"x",5,6,7,"x"],     "fingers": ["T","x",1,2,4,"x"],             "tags": "jazz", },
            { "key":"a", "label": "13",     "notes": ["x",10,9,6,7,"x"],    "fingers": ["x",4,3,1,2,"x"],   "bass": 11, "tags": "jazz", },
            { "key":"d", "label": "13",     "notes": ["x",5,4,5,5,7],       "fingers": ["x",2,1,3,3,4],                 "tags": "jazz", },
            { "key":"d", "label": "13",     "notes": ["x","x",10,9,7,7],    "fingers": ["x","x",4,3,1,1],   "bass": 11, "tags": "jazz", },

            // "Minor
            { "key":"c", "label": "m",      "notes": [3,3,5,5,4,3],         "fingers": [1,1,3,4,2,1],       "bass": 7,  "tags": "gypsy", },
            { "key":"c", "label": "m",      "notes": [8,10,10,8,8,8],       "fingers": ["T",3,4,1,1,1],                 "tags": "gypsy", },
            { "key":"c", "label": "m",      "notes": [11,"x",10,12,13],     "fingers": [2,"x",1,3,4,"x"],   "bass": 3,  "tags": "gypsy", },
            { "key":"c", "label": "m",      "notes": [11,"x",13,12,13,"x"], "fingers": ["T","x",2,1,3,"x"], "bass": 3,  "tags": "gypsy", },

            // Minor 7
            { "key":"c", "label": "m7",     "notes": [8,"x",8,8,8,"x"],     "fingers": [2,"x",3,3,3,"x"],               "tags": "jazz", },
            { "key":"e", "label": "m7",     "notes": ["x",7,5,7,5,"x"],     "fingers": ["x",3,1,4,1,"x"],               "tags": "jazz", },
            { "key":"e", "label": "m7",     "notes": ["x",7,9,7,8,"x"],     "fingers": ["x",1,3,1,2,"x"],               "tags": "jazz", },
            { "key":"e", "label": "m7",     "notes": ["x",7,9,7,8,7],       "fingers": ["x",1,3,1,2,1],                 "tags": "jazz", },
            { "key":"e", "label": "m7",     "notes": ["x",7,9,7,8,10],      "fingers": ["x",1,3,1,2,4],                 "tags": "jazz", },
            { "key":"e", "label": "m7",     "notes": ["x",7,5,7,8,"x"],     "fingers": ["x",2,1,3,4,"x"],               "tags": "jazz", },
            { "key":"b", "label": "m7",     "notes": [7,9,7,7,7,10],        "fingers": [1,3,1,1,1,4],                   "tags": "jazz", },
            { "key":"b", "label": "m7",     "notes": [7,9,7,7,10,"x"],      "fingers": [1,3,1,1,4,"x"],                 "tags": "jazz", },
            { "key":"c", "label": "m7",     "notes": [8,"x",8,8,8,8],       "fingers": [2,"x",3,3,3,3],                 "tags": "gypsy jazz", },
            { "key":"c", "label": "m7",     "notes": [3,3,5,3,4,3],         "fingers": [1,1,3,1,2,1],       "bass": 7,  "tags": "gypsy", },
            { "key":"c", "label": "m7",     "notes": [3,"x",1,3,4,"x"],     "fingers": [3,"x",1,3,4,"x"],   "bass": 7,  "tags": "gypsy", },
            { "key":"c", "label": "m7",     "notes": [8,10,8,8,8,8],        "fingers": ["T",3,1,1,1,1],                 "tags": "gypsy", },

            // Minor 7(b5)
            { "key":"c", "label": "m7(b5)", "notes": ["x",3,4,3,4,"x"],     "fingers": ["x",1,3,2,4,"x"],               "tags": "gypsy", },
            { "key":"c", "label": "m7(b5)", "notes": [8,"x",8,8,7,"x"],     "fingers": [2,"x",3,4,1,"x"],               "tags": "gypsy", },
            { "key":"c", "label": "m7(b5)", "notes": [11,"x",10,11,11,11],  "fingers": [2,"x",1,3,3,3],     "bass": 3,  "tags": "gypsy", },
            { "key":"c", "label": "m7(b5)", "notes": [11,13,13,11,13,"x"],  "fingers": ["T",2,2,1,3,"x"],   "bass": 3,  "tags": "gypsy", },
            { "key":"c", "label": "m7(b5)", "notes": [8,"x",8,8,7,8],       "fingers": ["T","x",2,2,1,3],               "tags": "gypsy", },

            // Minor 6
            { "key":"c", "label": "m6",     "notes": [5,6,7,8,8,8],         "fingers": [1,2,3,4,4,4],       "bass": 9,  "tags": "jazz", },
            { "key":"c", "label": "m6",     "notes": [5,"x",5,5,4,"x"],     "fingers": [2,"x",3,4,1,"x"],   "bass": 9,  "tags": "jazz", },
            { "key":"c", "label": "m6",     "notes": [5,"x",4,5,5,"x"],     "fingers": [2,"x",1,3,3,"x"],               "tags": "jazz", },
            { "key":"c", "label": "m6",     "notes": [8,"x",7,8,8,8],       "fingers": [2,"x",1,3,3,3],                 "tags": "gypsy", },
            { "key":"c", "label": "m6",     "notes": ["x",12,13,12,13,"x"], "fingers": ["x",1,3,2,4,"x"],   "bass": 9,  "tags": "gypsy jazz", },
            { "key":"c", "label": "m6",     "notes": [3,3,5,5,4,5],         "fingers": [1,1,3,1,2,1],       "bass": 7,  "tags": "gypsy", },
            { "key":"c", "label": "m6",     "notes": [8,10,10,8,10,"x"],    "fingers": ["T",2,2,1,3,"x"],               "tags": "gypsy", },
            { "key":"c", "label": "m6",     "notes": [8,"x",10,8,10,"x"],   "fingers": ["T","x",3,1,4,"x"],             "tags": "gypsy", },

            // Minor 9
            { "key":"d", "label": "m9",     "notes": ["x",5,3,5,5,5],         "fingers": ["x",2,1,3,4,4],               "tags": "jazz", },
            { "key":"d", "label": "m9",     "notes": ["x",5,3,5,5,"x"],       "fingers": ["x",2,1,3,4,"x"],             "tags": "jazz", },
            { "key":"a", "label": "m9",     "notes": [5,"x",5,5,5,7],         "fingers": [2,"x",3,3,3,4],               "tags": "jazz", },
            { "key":"g", "label": "m9",     "notes": ["x","x",8,7,6,5],       "fingers": ["x","x",4,3,2,1], "bass": 4,  "tags": "jazz", },
            { "key":"d", "label": "m9",     "notes": ["x",8,7,5,5,"x"],       "fingers": ["x",4,3,1,1,"x"], "bass": 4,  "tags": "jazz", },

            { "key":"c", "label": "m6/9",   "notes": [8,10,10,8,10,10],     "fingers": ["T",2,2,1,3,3],                 "tags": "gypsy", },

            // "Diminished
            { "key":"c", "label": "*7",     "notes": ["x",3,4,2,4,"x"],     "fingers": ["x",2,3,1,4,"x"],               "tags": "gypsy", },
            { "key":"c", "label": "*7",     "notes": [8,"x",7,8,7,"x"],     "fingers": [2,"x",1,3,1,"x"],               "tags": "gypsy", },

          ]
        },
        "banjo": {},
        "mandolin": {},
        "test": {
          "eadgbe" : [
            // 5th in the bass
            { "key":"c", "label": "M",    "notes": [3,3,5,5,5,"x"],       "fingers": [1,1,3,3,3,"x"],     "bass": 7 },
            { "key":"c", "label": "M",    "notes": [8,10,10,9,8,8],       "fingers": ["T",3,4,2,1,1],               },
            { "key":"c", "label": "M",    "notes": [12,"x",10,12,13,"x"], "fingers": [2,"x",1,3,4,"x"],   "bass": 4,},
            { "key":"c", "label": "M6",   "notes": [3,3,5,5,5,5],         "fingers": [1,1,3,3,3,3],       "bass": 7 },
            { "key":"c", "label": "M6",   "notes": [8,8,10,10,9,10],      "fingers": ["T","x",3,1,2,"x"],           },
            { "key":"c", "label": "M6/9", "notes": [8,10,10,9,10,10],     "fingers": ["T",2,2,1,3,3],               },
          ]
        }
      },

      // **getChordList** Returns list of chord types for an instrument and tuning
      getChordList: function(instrument, tuning) {
        // - `instrument` : string (e.g. "guitar")
        // - `tuning` : string (e.g. "EADGBe")

        var chordDataList = Voicings.voicings[instrument.toLowerCase()][tuning.toLowerCase()];
        var result = [];

        for (var i = 0; i < chordDataList.length; i++) {
          var label = chordDataList[i].label;
          if (_.indexOf(result, label) === -1) {
            result.push(label);
          }
        }

        return result;
      },

      // **chordModelFromVoicing** Returns a ChordModel for a given voicin,
      // `key` transposes chord to proper key, `variation` index
      chordModelFromVoicing: function(instrument, tuning, chord, key, variation, matchExact) {
        // - `instrument` : string (e.g. "guitar")
        // - `tuning` : string (e.g. "EADGBe")
        // - `chord` : string (e.g. "M", "m7", "M6/9(b7)")
        // - `key` : string (e.g. "d#", "gb")
        // - `variation` : integer (to choose a different variation of the chord)
        // - `matchExact` : boolean (default true)
        //   (match chord string exactly or substring match e.g. "M" returns "M","M6","M6/9"
        //   if `matchExact` set to false)

        // Optional args default values
        if (variation === undefined) { variation = 0; }
        if (matchExact === undefined) { matchExact = true; }

        // Get voicing data
        var chordData = Voicings._getChordVoicingData(instrument, tuning, chord, variation, matchExact);
        if (!chordData) { return null; }

        // Get key note values
        if (!key) { key = chordData.key; }
        key = key.toLowerCase();
        var key_value = theoryObj.getNoteValue(key);
        var chord_key_value = theoryObj.getNoteValue(chordData.key);

        // Calc bass note for inversions
        var bassNote = Voicings._bassNoteForKeyAndOffset(key, chordData.bass);
        var chordLabel = key.toUpperCase() + chordData.label;
        if (bassNote !== "") {
          chordLabel += "/" + bassNote.toUpperCase();
        }

        // Create GuitarNotes
        var tuningObj = new Tuning(tuning);
        var notes = [];
        for (var i = 0; i < chordData.notes.length; i++) {
          var stringNum = i;
          var fretNum = chordData.notes[i];
          var noteOptions = { finger: chordData.fingers[i] };

          // Check for tonic
          if (_.isNumber(fretNum)) {
            var noteVal = theoryObj.getRelativeNoteValue(tuningObj.noteValForString(stringNum), fretNum, 1);
            if (noteVal === chord_key_value) {
              noteOptions.color = "black";
            }
          }

          var note = new GuitarNote(stringNum, fretNum, noteOptions);
          notes.push(note);
        }
        var model = new ChordModel({ notes: notes, tuning: tuning, key: key, label: chordLabel });

        // Transpose chord
        var dist_down = theoryObj.getIntervalBetween(chord_key_value, key_value, -1);
        var dist_up = theoryObj.getIntervalBetween(chord_key_value, key_value, 1);
        var min_fret = model.getMinFret();
        if(min_fret - dist_down >= 0) {
          model.transposeByInterval(dist_down, -1);
        } else {
          model.transposeByInterval(dist_up, 1);
        }

        return model;
      },

      // **getNumVariations** returns number of variations for a chord type.
      getNumVariations: function(instrument, tuning, chord, matchExact) {
        // - `instrument` : string (e.g. "guitar")
        // - `tuning` : string (e.g. "EADGBe")
        // - `chord` : string (e.g. "M", "m7", "M6/9(b7)")
        // - `matchExact` : boolean (default true)
        //   (match chord string exactly or substring match e.g. "M" returns "M","M6","M6/9"
        //   if `matchExact` set to false)

        // default mat
        if (matchExact === undefined) { matchExact = true; }
        var chordDataList = Voicings.voicings[instrument.toLowerCase()][tuning.toLowerCase()];
        var result = 0;
        for (var i = 0; i < chordDataList.length; i++) {
          var chordData = chordDataList[i];
          if (!matchExact && chordData.label.indexOf(chord) !== -1) {
            result++;
          } else if (matchExact && chordData.label === chord) {
            result++;
          }
        }
        return result;
      },

      _getChordVoicingData: function(instrument, tuning, chord, variation, matchExact) {
        if (variation === undefined) { variation = 0; }
        if (matchExact === undefined) { matchExact = true; }

        var chordDataList = Voicings.voicings[instrument.toLowerCase()][tuning.toLowerCase()];
        var variationsFound = 0;

        for (var i = 0; i < chordDataList.length; i++) {
          var chordData = chordDataList[i];
          if (!matchExact && chordData.label.indexOf(chord) !== -1) {
            if (variationsFound === variation) {
              return chordData;
            } else {
              variationsFound++;
            }
          } else if (matchExact && chordData.label === chord) {
            if (variationsFound === variation) {
              return chordData;
            } else {
              variationsFound++;
            }
          }
        }
        return null;
      },

      _bassNoteForKeyAndOffset: function(key, offset) {
        if(!offset) { return ""; }

        var keyValue = theoryObj.getNoteValue(key.toLowerCase());
        var bassValue = theoryObj.getRelativeNoteValue(keyValue, offset, 1);
        var bassNoteName = theoryObj.getCanonicalNoteName(bassValue);

        return bassNoteName;
      },
    });

    _.extend(exports, {
      Voicings: Voicings
    });

  })(Chords);
  ;/* global _, Chords */

  (function(exports) {
    var GuitarNote = exports.GuitarNote;
    var Theory = exports.Theory;
    var Tuning = exports.Tuning;
    var theoryObj = new Theory();

    var GuitarNoteFactory = function GuitarNoteFactory(options) {
      // This first guard ensures that the callee has invoked our Class' constructor function
      // with the `new` keyword - failure to do this will result in the `this` keyword referring
      // to the callee's scope (typically the window global) which will result in the following fields
      // (name and _age) leaking into the global namespace and not being set on this ob ect.
      if (!(this instanceof GuitarNoteFactory)) {
        throw new TypeError("GuitarNoteFactory constructor cannot be called as a function.");
      }

      this._init(options || {});
    };

    _.extend(GuitarNoteFactory, {
      DEFAULT_OPTIONS: {
        tuning: "EADGBe",
        numFrets: 20,
        minFret: 0,
        maxFret: 20,
      },
    });

    _.extend(GuitarNoteFactory.prototype, {
      /**
       * Whenever you replace an Object's Prototype, you need to repoint
       * the base Constructor back at the original constructor Function,
       * otherwise `instanceof` calls will fail.
       */
      constructor: GuitarNoteFactory,

      _init: function(options) {
        // Create config dict, filling in defaults where not provided
        _.defaults(options, GuitarNoteFactory.DEFAULT_OPTIONS);

        if (!options.numFrets || !_.isNumber(options.numFrets) || options.numFrets < 0) {
          throw TypeError("numFrets must be valid number >= 0");
        }

        this.tuning = new Tuning(options.tuning);
        this.numFrets = options.numFrets;
        this.minFret = options.minFret;
        this.maxFret = options.maxFret;

        if (this.numFrets < this.maxFret) { this.maxFret = this.numFrets; }

        this.music = new Theory();
      },

      notesForNotesValues: function(notesValues) {
        if (!notesValues || !_.isArray(notesValues)) {
          throw TypeError("notesValues must be an array");
        }

        var notes = [];
        for (var i = 0; i < notesValues.length; i++) {
          var noteVal = notesValues[i];

          if (!_.isNumber(noteVal)) {
            throw TypeError("noteValue must be a number: " + noteVal);
          } else if (noteVal < 0 || noteVal >= Theory.NUM_TONES) {
            throw TypeError("noteValue must be 0 <= noteVal < 12: " + noteVal);
          }

          for (var string_num = 0; string_num < this.tuning.getNumStrings(); string_num++) {
            var tuningNote = this.tuning.notes[string_num].toLowerCase();
            var string_base_value = theoryObj.getNoteValue(tuningNote);

            for (var fret_num = this.minFret; fret_num < this.maxFret; fret_num++) {
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

        for (var i = 0; i < noteTokens.length; i++) {
          var noteStr = noteTokens[i].toLowerCase();
          if (noteStr === "") { continue; }
          if (!_.has(Theory.noteValues, noteStr)) {
            throw TypeError("Invalid noteStr in notesStr: " + noteStr + " in " + notesStr);
          }

          var note_value = theoryObj.getNoteValue(noteStr);
          notesValues.push(note_value);
        }
        return this.notesForNotesValues(notesValues);
      },

      notesForScale: function(key, scale) {
        if (_.isUndefined(key) || _.isNull(key) || !_.isString(key) || key === "") {
          throw TypeError("Key is required.");
        }
        if (!key || !_.has(Theory.noteValues, key)) {
          throw TypeError("Invalid key: " + key);
        }
        if (!scale || !_.isString(scale) || !_.has(Theory.scales, scale)) {
          throw TypeError("Invalid scale: " + scale);
        }

        var keyStr = key.toLowerCase();
        var keyVal = theoryObj.getNoteValue(keyStr);
        var scaleIntervals = Theory.scales[scale];

        var noteValues = [];
        var curValue = keyVal;
        noteValues.push(keyVal);
        for (var i = 0; i < scaleIntervals.length; i++) {
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
        if (!key || !_.has(Theory.noteValues, key)) {
          throw TypeError("Invalid key: " + key);
        }
        if (!arpeggio || !_.isString(arpeggio) || !_.has(Theory.arpeggios, arpeggio)) {
          throw TypeError("Invalid scale: " + arpeggio);
        }

        var keyStr = key.toLowerCase();
        var keyVal = theoryObj.getNoteValue(keyStr);
        var arpeggioIntervals = Theory.arpeggios[arpeggio];

        var noteValues = [];
        var curValue = keyVal;
        noteValues.push(keyVal);
        for (var i = 0; i < arpeggioIntervals.length; i++) {
          var noteValue = (curValue + arpeggioIntervals[i]) % 12;
          noteValues.push(noteValue);
          curValue = noteValue;
        }
        return this.notesForNotesValues(noteValues);
      },
    });

    _.extend(exports, {
      GuitarNoteFactory: GuitarNoteFactory
    });

  })(Chords);
  ;/* global _, Chords */

  (function(exports) {
    var Tuning = exports.Tuning;

    var TuningFactory = function TuningFactory() {
      throw Error("Cannot instantiate TuningFactory.");
    };

    _.extend(TuningFactory, {
      fromInstrument: function(instrument, tuning_type) {
        if (!instrument || !_.isString(instrument)) {
          throw TypeError("Must provide an instrument string");
        }
        instrument = instrument.toLowerCase();

        if (!_.has(Tuning.instruments, instrument)) {
          throw TypeError("Invalid instrument");
        }

        if (!tuning_type) {
          tuning_type = "default";
        } else if (!_.isString(tuning_type)) {
          throw TypeError("tuning_type must be a string");
        }

        tuning_type = tuning_type.toLowerCase();
        if (!_.has(Tuning.instruments[instrument], tuning_type)) {
          throw TypeError("Invalid tuning type: " + tuning_type);
        }

        return new Tuning(Tuning.instruments[instrument][tuning_type]);
      },
    });

    _.extend(exports, {
      TuningFactory: TuningFactory
    });

  })(Chords);
  ;/* global _, Chords */

  // ChordFactory
  // ------------

  (function(exports) {
    // Dependencies
    var ChordView = exports.ChordView;
    var ChordModel = exports.ChordModel;
    var GuitarNote = exports.GuitarNote;
    var Tuning = exports.Tuning;
    var ChordParserPEG = exports.ChordParserPEG;

    // Class Definition
    var ChordFactory = function(options) {
      this._init(options || {});
    };

    _.extend(ChordFactory, {

      // Options
      // -------
      DEFAULT_OPTIONS: {
        version: "0.1.0"
      },

    });

    _.extend(ChordFactory.prototype, {

      _init: function(options) {
        // Create config dict, filling in defaults where not provided
        _.defaults(options, ChordFactory.DEFAULT_OPTIONS);

        // TODO: (aallison) uncomment to re-enable parser
        // this.parser = ChordParserPEG;
      },

      // **parseChord** parses a chord string and returns a ChordView
      chordFromDiv: function(element) {
        var elem = $(element);
        if (elem.length === 0) { return; }
        var chordStr = elem.html();
        var chordId = elem.attr("id");
        if (!chordId) {
          chordId = "chord-" + Math.round(Math.random() * 1000000000);
          elem.attr("id", chordId);
        }
        this.chordFromString(elem, chordStr);
      },

      // TODO: (aallison) uncomment to re-enable parser
      // chordFromString: function(element, chordStr) {
      //   // - element : string or DOM element to insert chord into
      //   // - chordStr : string, of the format

      //   //     [<config_str>, ... ]
      //   //     <string_str>
      //   //     ...

      //   // where:

      //   //     config_str: <config_key>: <config_value>
      //   //     config_key: any key in ChordView.options
      //   //     config_value: any valid value for ChordView.options
      //   //     string_str: <string_num>: <fret_marker>[, <fret_marker> ...]
      //   //     chord_num: int
      //   //     fret_marker: {<fret_num> <finger_num>} | <fret_num>
      //   //     fret_num: int
      //   //     finger_num: [1,2,3,4] | "T" | "x"

      //   // e.g.

      //   //      [orientation=left,num_frets=17,scale=0.8,fret_gap=50]
      //   //      0: 10
      //   //      1: 10(color:black;),14
      //   //      2: 9,12
      //   //      3: 12(color:black;)
      //   //      4: 12
      //   //      5: 10,15(color:black;)

      //   if (!element || (_.isString(element) && element === "")) {
      //     throw TypeError("Must provide a valid DOM element or id string: " + element);
      //   } else if (_.isUndefined(chordStr)) {
      //     throw TypeError("chordStr not provided: " + chordStr);
      //   } else if (this._trim(chordStr) === "") {
      //     throw TypeError("empty chordStr provided");
      //   }

      //   // console.log(chordStr);
      //   var parseResult;
      //   try {
      //     parseResult = this.parser.parse(chordStr);
      //   } catch(e) {
      //     console.log(chordStr);
      //     console.log(e);
      //     throw e;
      //   }

      //   // Pre-fab styles get over-ridden by options specified in chord string
      //   var style_val = $(element).attr("data-style");
      //   if (_.has(ChordView.OPTIONS, style_val)) {
      //     _.defaults(parseResult.config, ChordView.OPTIONS[style_val]);
      //     console.log(parseResult.config);
      //   }

      //   var model = this._chordModelFromParseResult(parseResult);
      //   var view = this._chordViewFromParseResultAndModel(element, model, parseResult);
      //   return view;
      // },

      _trim: function(str) {
        if (str.trim) {
          return str.trim();
        } else {
          return String(str).replace(/^\s+|\s+$/g, '');
        }
      },

      _chordModelFromParseResult: function(parseResult) {
        var options = {
          notes: [ ],
        };
        var i;
        var j;

        // handle config string
        if (parseResult.config) {
          _.defaults(options, parseResult.config);
        }

        // create default tuning so we know how many strings we have
        var tuning = new Tuning(options.tuning);
        var numStrings = tuning.getNumStrings();

        // handle string strings
        if (parseResult.strings) {
          for (var stringNum in parseResult.strings) {
            var s = parseResult.strings[stringNum];
            if (!_.isNumber(stringNum) && s.frets && s.frets.length > 0) {
              for (j = 0; j < s.frets.length; j++) {
                var n = s.frets[j];
                var note_options = {};
                if (n.config) { _.defaults(note_options, n.config); }
                note_options.finger = n.finger;
                var note = new GuitarNote(s.string, n.fret, note_options);
                options.notes.push(note);
              }
            }
          }
        }
        return new ChordModel(options);
      },

      _chordViewFromParseResultAndModel: function(element, model, parseResult) {
        var options = {};

        // handle config string
        if (parseResult.config) {
          _.defaults(options, parseResult.config);
        }

        return new ChordView(element, options, model);
      },

      // **_isNumber** detects if string `n` is a number
      _isNumber: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      },

      // **_isFloat** detects if string `n` is a float
      _isFloat: function(n) {
        return this._isNumber(n) && (n.indexOf(".") != -1);
      },
    });

    _.extend(exports, {
      ChordFactory: ChordFactory
    });

  })(Chords);

    // Return our module as the result of the UMD wrapper factory method
    return Chords;
}));
