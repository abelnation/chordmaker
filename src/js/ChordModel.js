/* global _, Chords */

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
