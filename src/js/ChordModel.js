/* global _, Tuning, GuitarNote */

function ChordModel(options) {
  // This first guard ensures that the callee has invoked our Class' constructor function
  // with the `new` keyword - failure to do this will result in the `this` keyword referring 
  // to the callee's scope (typically the window global) which will result in the following fields
  // (name and _age) leaking into the global namespace and not being set on this object.
  if (!(this instanceof ChordModel)) {
    throw new TypeError("ChordModel cannot be called as a function.");
  }

  if(!options) { options = {}; }
  this._init(options);
}

ChordModel.DEFAULT_OPTIONS = {
  // DATA DEFAULTS
  numFrets: 5,
  baseFret: 1,
  label: "",
  tuning: "EADGBe"
};

ChordModel.prototype = {
  /**
   * Whenever you replace an Object's Prototype, you need to repoint
   * the base Constructor back at the original constructor Function, 
   * otherwise `instanceof` calls will fail.
   */
  constructor: ChordModel,
  _init: function(options) {
    // Create config dict, filling in defaults where not provided
    
    _.defaults(options, ChordModel.DEFAULT_OPTIONS);

    this.tuningStr = options.tuning;
    this.tuning = new Tuning(this.tuningStr);

    if(_.isUndefined(options.numFrets) || _.isNull(options.numFrets) || !_.isNumber(options.numFrets) || options.numFrets < 0) {
      throw TypeError("numFrets must be a valid integer greater than 0: " + options.numFrets);
    }
    this.numFrets = options.numFrets;

    if(_.isUndefined(options.baseFret) || _.isNull(options.baseFret) ||
        !_.isNumber(options.baseFret) ||
        options.baseFret < 0 || options.baseFret >= this.numFrets) {
      throw TypeError("baseFret must be a valid integer greater than 0: " + options.baseFret);
    }
    this.baseFret = options.baseFret;

    if(!_.isString(options.label)) {
      throw TypeError("label must be a string");
    }
    this.label = options.label;
    
    this.notes = {};
    if (options.notes) {
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
  getBaseFret: function() {
    return this.baseFret;
  },
  getNumFrets: function() {
    return this.numFrets;
  },
  getTuning: function() {
    return this.tuning;
  },
  getLabel: function() {
    return this.label;
  },

  addNotes: function(notes) {
    if(!_.isArray(notes)) {
      throw TypeError("addNotes takes an array of notes: " + notes);
    }
    for(var i=0; i<notes.length; i++) {
      var note = notes[i];
      this.addNote(note);
    }
  },
  addNote: function(note) {
    if(_.isUndefined(note) || _.isNull(note)) {
      throw TypeError("Note is undefined");
    } else if (_.isString(note)) {
      // TODO: implement
      this.addNote(this._noteFromString(note));

    } else if (!(note instanceof GuitarNote)) {
      throw TypeError("addNote requires a valid note string or GuitarNote object: " + note);
    } else if (note.string < 0 || note.string >= this.getNumStrings()) {
      throw TypeError("note string is not valid for this chord");
    } else if (note.fret < this.baseFret || note.fret >= this.baseFret+this.numFrets) {
      throw TypeError("note fret out of the range of this chord");
    }

    // TODO: notify listeners
    var key = this._keyForNote(note);
    this.notes[key] = note;
  },
  removeNote: function(note) {
    var key = this._keyForNote(note);
    // TODO: notify listeners
    delete this.notes[key];
  },

  _keyForNote: function(note) {
    if (!(note instanceof GuitarNote)) {
      throw TypeError("addNote requires a valid note string or GuitarNote object: " + note);
    }
    return note.string + " " + note.fret;
  },
  _noteFromString: function(noteStr) {
    // Examples (fret, finger/mute):
    // {x x}
    // {3 2}
    // {5 T}
    // {0 x}

    // TODO: string would not be included in this, correct?
    // var theNote = {};
    // theNote.string = string_num;

    // if (note.indexOf("{") != -1) {
    //   note = note.replace(/[{|}]/g, "");
    //   var tokens = note.split(" ");
    //   theNote.fret = tokens[0].replace(/^\s+|\s+$/g, '');
    //   if (tokens[1]) { theNote.finger = tokens[1]; }
    // } else {
    //   theNote.fret = note.replace(/^\s+|\s+$/g, '');
    // }

    // if (theNote.fret.match(/^[oO0]$/)) {
    //   theNote.fret = 0;
    //   theNote.open = true;
    // } else if (theNote.fret.match(/[mMxX]/)) {
    //   theNote.muted = true;
    // } else {
    //   theNote.fret = parseInt(theNote.fret, 10);
    //   var fret_amt = (parseInt(theNote.fret, 10)-base_fret);
    //   if (fret_amt > num_frets) { num_frets = theNote.fret+1; }
    // }

    // TODO: stub
    throw Error("Not implemented yet.");
  },

};