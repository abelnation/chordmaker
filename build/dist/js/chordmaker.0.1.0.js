// ChordFactory
// ------------

/* global ChordParserPEG, ChordModel, GuitarNote, Tuning, ChordView */

// **ChordFactory** Provides methods for easily creating Chords
function ChordFactory(options) {
  // - `options` : config object

  // This first guard ensures that the callee has invoked our Class' constructor function
  // with the `new` keyword - failure to do this will result in the `this` keyword referring 
  // to the callee's scope (typically the window global) which will result in the following fields
  // (name and _age) leaking into the global namespace and not being set on this object.
  if (!(this instanceof ChordFactory)) {
    throw new TypeError("ChordFactory cannot be called as a function.");
  }

  if (!options) { options = {}; }
  this._init(options);
}

// Options
// -------

ChordFactory.DEFAULT_OPTIONS = {
  version: "0.1.0"
};

// ChordFactory Class
// -----------------

ChordFactory.prototype = {
  // Whenever you replace an Object's Prototype, you need to repoint
  // the base Constructor back at the original constructor Function, 
  // otherwise `instanceof` calls will fail.
  constructor: ChordFactory,

  _init: function(options) {
    // Create config dict, filling in defaults where not provided
    _.defaults(options, ChordFactory.DEFAULT_OPTIONS);

    this.parser = ChordParserPEG;
  },

  // **parseChord** parses a chord string and returns a ChordView
  chordFromString: function(element, chordStr) {
    // - element : string or DOM element to insert chord into
    // - chordStr : string, of the format

    //     [<config_str>, ... ]
    //     <string_str>
    //     ...

    // where:

    //     config_str: <config_key>: <config_value>
    //     config_key: any key in ChordView.options
    //     config_value: any valid value for ChordView.options
    //     string_str: <string_num>: <fret_marker>[, <fret_marker> ...]
    //     chord_num: int
    //     fret_marker: {<fret_num> <finger_num>} | <fret_num>
    //     fret_num: int
    //     finger_num: [1,2,3,4] | "T" | "x"

    // e.g.

    //      [orientation=left,num_frets=17,scale=0.8,fret_gap=50]
    //      0: 10
    //      1: 10(color:black;),14
    //      2: 9,12
    //      3: 12(color:black;)
    //      4: 12
    //      5: 10,15(color:black;)

    if (!element) {
      throw TypeError("Must provide a valid DOM element or id string: " + element);
    } else if (_.isUndefined(chordStr)) {
      throw TypeError("chordStr not provided: " + chordStr);
    } else if (this._trim(chordStr) === "") {
      throw TypeError("empty chordStr provided");
    }

    // console.log(chordStr);    
    var parseResult;
    try {
      parseResult = this.parser.parse(chordStr);
    } catch(e) {
      0;
      0;
      throw e;
    }

    var model = this._chordModelFromParseResult(parseResult);
    0;
    var view = this._chordViewFromParseResultAndModel(element, model, parseResult);
    return view;
  },

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
    var kv;
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
    var kv;
    var i;
    var j;

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
};
;// ChordModel
// ----------

/* global _, Tuning, GuitarNote */

// Data model for a Guitar Chord.
function ChordModel(options) {
  // - `options` : config object

  // This first guard ensures that the callee has invoked our Class' constructor function
  // with the `new` keyword - failure to do this will result in the `this` keyword referring 
  // to the callee's scope (typically the window global) which will result in the following fields
  // (name and _age) leaking into the global namespace and not being set on this object.
  if (!(this instanceof ChordModel)) {
    throw new TypeError("ChordModel cannot be called as a function.");
  }

  if (!options) { options = {}; }
  this._init(options);
}

// Options
// -------

// Default options are for 6-stringed guitar in standard tuning
ChordModel.DEFAULT_OPTIONS = {
  // DATA DEFAULTS
  // numFrets: 5,

  // // TODO: doesn't make sense that a chord with a nut is based at fret 1, not 0
  // baseFret: 1,

  // Name/label for the chord
  label: "",

  // Tuning, expressed a a tuning string (see Tuning.js)
  tuning: "EADGBe"
};

// ChordModel Class
// ----------------

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

    // TODO: notify listeners
    this.notes[note.getKey()] = note;
    if (_.isNumber(note.fret) && this.min_fret == -1 || note.fret < this.min_fret) { this.min_fret = note.fret; }
    if (_.isNumber(note.fret) && this.max_fret == -1 || note.fret > this.max_fret) { this.max_fret = note.fret; }
  },
  removeNote: function(note) {
    var key = this._keyForNote(note);
    
    // TODO: notify listeners
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
    // TODO: does this cause issues for ChordView?
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
    // TODO: implement
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

};
;// ChordParser
// -----------

/* global _, GuitarNote, ChordModel, ChordView */

// **ChordParser** Parses chord strings into ChordView/ChordModel objects
function ChordParser(options) {
  // - `options` : config object

  // This first guard ensures that the callee has invoked our Class' constructor function
  // with the `new` keyword - failure to do this will result in the `this` keyword referring 
  // to the callee's scope (typically the window global) which will result in the following fields
  // (name and _age) leaking into the global namespace and not being set on this object.
  if (!(this instanceof ChordParser)) {
    throw new TypeError("ChordParser cannot be called as a function.");
  }

  if (!options) { options = {}; }
  this._init(options);
}

// Options
// -------

ChordParser.DEFAULT_OPTIONS = {
  version: "0.1.0"
};

// ChordParser Class
// -----------------

ChordParser.prototype = {
  // Whenever you replace an Object's Prototype, you need to repoint
  // the base Constructor back at the original constructor Function, 
  // otherwise `instanceof` calls will fail.
  constructor: ChordParser,

  _init: function(options) {
    // Create config dict, filling in defaults where not provided
    _.defaults(options, ChordParser.DEFAULT_OPTIONS);
  },

  // **parseChord** parses a chord string
  parseChord: function(element, chordStr) {
    // - element : string or DOM element to insert chord into
    // - chordStr : string, of the format

    //     [<config_str>, ... ]
    //     <string_str>
    //     ...

    // where:

    //     config_str: <config_key>: <config_value>
    //     config_key: any key in ChordView.options
    //     config_value: any valid value for ChordView.options
    //     string_str: <string_num>: <fret_marker>[, <fret_marker> ...]
    //     chord_num: int
    //     fret_marker: {<fret_num> <finger_num>} | <fret_num>
    //     fret_num: int
    //     finger_num: [1,2,3,4] | "T" | "x"

    // e.g.

    //      [orientation=left,num_frets=17,scale=0.8,fret_gap=50]
    //      0: 10
    //      1: 10(color:black;),14
    //      2: 9,12
    //      3: 12(color:black;)
    //      4: 12
    //      5: 10,15(color:black;)

    // strip whitespace and return if result is empty
    chordStr = chordStr.replace(/^\s+|\s+$/g, '');
    if (chordStr === "") { return; }

    var chordConfig = {};
    var chordStrings = [];
    
    // TODO: handle default color for parser
    var color = "white";

    var lines = chordStr.split("\n");
    _.each(lines, function(line) {
      // ignore empty lines
      if (line === "") { return; }

      // Deal with chord config string.
      if (line.indexOf("[") != -1) {
        chordConfig = this._parseConfigString(line);
        return;
      }

      var strObj = this._parseStringString(line);
      chordStrings.push(strObj);

    }, this);

    // TODO: create ChordModel
    var model = new ChordModel();
    // TODO: add notes to model

    var result = new ChordView(element, chordConfig, model);
    return result;
  },

  // **_parseConfigString** parses config string and returns a config object
  _parseConfigString: function(configStr) {
    var config = {};

    // Get rid of surrounding brackets and tokenize
    configStr = configStr.replace(/^\[|\]$/g, '');
    var params = configStr.split(",");

    _.each(params, function(param) {
      // strip whitespace and split into key/value
      param = param.replace(/^\s+|\s+$/g, '');
      var tokens = param.split("=");
      var key = tokens[0];
      var val = tokens[1];

      if (this._isNumber(val) && this._isFloat(val)) {
        config[key] = parseFloat(val);
      } else if (this._isNumber(val)) {
        config[key] = parseInt(val, 10);
      } else {
        config[key] = val;
      }
    });

    return config;
  },

  // **_parseStringString** parses a string line into string num and sequence of notes
  _parseStringString: function(stringStr) {
    var stringObj = {
      notes: []
    };

    // Extract string number (1-2 digits followed by colon)
    var string_regex = /\s*(\d{1,2}):/;
    var string_num = parseInt(stringStr.match(string_regex)[1].replace(/^\s+|\s+$/g, ''), 10);
    stringObj['stringNum'] = string_num;

    // Remove string num part for subsequent processing
    var notes_part = stringStr.replace(string_regex, "");
    
    var notes = notes_part.split(',');
    _.each(notes, function(note) {
      var noteObj = this._parseNoteString(note);
      stringObj['notes'].push(_.clone(noteObj));
    });
  },

  // **_parseNoteString** parses a note string into a fret, finger (if present), and color
  _parseNoteString: function(noteStr) {
    var noteObj = {};
    var color;

    // Deal with config string
    var config_regex = /\(.*\)/g;
    var config_str_match = noteStr.match(config_regex);
    if (config_str_match) {
      var config_str = config_str_match[0];

      // remove config str for subsequent processing
      noteStr = noteStr.replace(config_str, "");

      // clean config str and tokenize
      config_str = config_str.replace(/^\(|\)$/g, '');
      var params = config_str.split(";");
      _.each(params, function(param) {
        if (param === "") { return; }

        // parse config param string
        var tokens = param.split(":");
        var key = tokens[0].replace(/^\s+|\s+$/g, '');
        var val = tokens[1].replace(/^\s+|\s+$/g, '');

        // TODO: you can only config color right now
        if (key == "color") {
          color = val;
        }
      });
    }

    // Deal with curly-bracketed note syntax (e.g. '{5 4}')
    if (noteStr.indexOf("{") != -1) {
      noteStr = noteStr.replace(/[{|}]/g, "");
      var tokens = noteStr.split(" ");
      noteObj.fret = tokens[0].replace(/^\s+|\s+$/g, '');
      if (tokens[1]) { noteObj.finger = tokens[1]; }

    // Deal with non-curly-bracketed note syntax (e.g. '6')
    } else {
      noteObj.fret = noteStr.replace(/^\s+|\s+$/g, '');
    }

    // Check if fret is 'open'
    if (noteObj.fret.match(/^[oO0]$/)) {
      noteObj.fret = 0;
      noteObj.open = true;

    // Check if fret is 'muted'
    } else if (noteObj.fret.match(/[mMxX]/)) {
      noteObj.muted = true;
    
    // Otherwise, is a fret number
    } else {
      noteObj.fret = parseInt(noteObj.fret, 10);
    }

    // Set color
    noteObj.color = color;

    return noteObj;
  },

  // **_isNumber** detects if string `n` is a number
  _isNumber: function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  },

  // **_isFloat** detects if string `n` is a float
  _isFloat: function(n) {
    return this._isNumber(n) && (n.indexOf(".") != -1);
  },
};
;/* global Vex, Raphael, ChordModel, GuitarNote */

function ChordView(container, options, model) {
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
}

// CONSTANTS
// ---------

// Diagram orientation constants
ChordView.NUT_TOP = -1;
ChordView.NUT_LEFT = -2;

// Finger position constants
ChordView.FINGER_TOP = -1;
ChordView.FINGER_LEFT = -2;
ChordView.FINGER_ONNOTE = -3;

ChordView.NOTE_COLORS = {
  'black': '#000',
  'white': '#fff',
  'blue' : '#22f',
  'red'  : '#f22',
  'green': '#0f0'
};
ChordView.NOTE_GRADIENTS = {
  'black': '90-#000:5-#555:95',
  'white': '90-#eee:5-#fff:95',
  'blue' : '90-#22f:5-#55f:95',
  'red'  : '90-#f22:5-#f55:95',
  'green': '90-#0f0:5-#0f0:95'
};

// Positions on neck of neck marker dots  
// TODO: only applicable for guitar
ChordView.NECK_MARKERS = [
  [ 5, 1 ],
  [ 7, 2 ],
  [ 9, 1 ],
  [ 12, 2 ],
  [ 15, 1 ],
  [ 17, 1 ]
];

// Render Options
// --------------

// Render attributes are configurable via the ChordView's options object.  
// Render options tend to contain measurement, color, and boolean values.

// Default options for a standard chord diagram.  These can be over-ridden
// by passing in a config object to the ChordView constructor.
ChordView.UNSCALABLE = [
  'base_fret',
  'num_frets',
  'min_frets',
  'fret_pad',
  'scale',
  'orientation',
  'finger_position',
];
ChordView.DEFAULT_OPTIONS = {
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
  // TODO: open annotations not really related to finger annotations
  open_note_radius: 6,

  // Note markers
  note_radius: 10,
  note_stroke_width: 1.5,
  note_gradient: true,
  note_color: 'white',
  tonic_color: 'black',

  neck_marker_radius: 8,
  neck_marker_color: "#999",

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
};

// Pre-set for compact tiny format
ChordView.OPTIONS_COMPACT = {
  scale: 0.25,
  show_tuning: false,
  show_fingers: false,
  note_stroke_width: 1.0,
  note_color: 'black',
  note_gradient: false,
  base_fret_font_size: 36,
  base_fret_offset: 20,
  grid_padding_right: 40,
  num_frets: 5
};

// Pre-set suitable for longer neck diagram
ChordView.OPTIONS_NECK = {
  scale: 1.0,
  orientation: ChordView.NUT_LEFT,
  show_tuning: true,
  fret_gap: 50,
  num_frets: 15,
};

// ChordView Class
// ---------------

ChordView.prototype = {
  /**
   * Whenever you replace an Object's Prototype, you need to repoint
   * the base Constructor back at the original constructor Function, 
   * otherwise `instanceof` calls will fail.
   */
  constructor: ChordView,

  _init: function(container, options, model) {
    if (!_.isString(container) && !_.isElement(container)) {
      throw TypeError("container must be a DOM elem or DOM ID string.");
    }

    // Create fresh copy of options object in case they have passed in one of 
    // the static pre-set options objects
    this.options = {};
    _.defaults(this.options, options);
    _.defaults(this.options, ChordView.DEFAULT_OPTIONS);
    
    this.model = model;

    this.options.grid_x = this.options.grid_padding_left;
    this.options.grid_y = this.options.anno_font_size + 4;
    if (this.options.orientation === ChordView.NUT_TOP && this.model.getLabel() !== "") {
      this.options.grid_y += this.options.label_height;
    }

    // Scaling is done by scaling all the constant factors in the render code
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
    // TODO: decomp out this calculation
    this.width = this.options.grid_x + this.model.getNumStrings() * this.options.string_gap + this.options.base_fret_label_width + this.options.grid_padding_right;
    this.height = this.options.grid_y + this.options.num_frets * this.options.fret_gap + this.options.tuning_label_font_size + this.options.grid_padding_bottom;

    if (_.isString(container)) {
      container = document.getElementById(container.replace("#",""));
    }
    if (window.jQuery) {
      $(container).html("");
    } else if (_.isElement(container)) {
      container.innerHtml = "";
    } else {
      0;
    }
    this.r = null;
    this.r = Raphael(container, this.width, this.height);
    
    this._render();
    this._setOrientation(this.options.orientation);
  },

  getCode: function() {
    // TODO: implement
    throw Error("Not implemented yet");
  },
  getModel: function() {
    return this.model;
  },

  _scaleSize: function() {
    _.each(ChordView.DEFAULT_OPTIONS, function(num, key) {
      // TODO: improve the fact that we're using negative numbers to distinguish values from consts
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

    if (this.options.orientation === ChordView.NUT_TOP) {
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

    // TODO: Deal correctly with chord label

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

      // TODO: explain this transformation
      // don't include right padding for sideways layouts
      // TODO: position base fret label differently depending on orientation
      this.transform_str = "r-90,0,0" + "t-"+(this.width - (this.options.base_fret_label_width + this.options.grid_padding_right)) + ",0";

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
         marker[0] < this.options.base_fret+this.options.num_frets) {
        this._drawNeckMarker(marker);
      }
    }
  },

  _drawNeckMarker: function(neck_marker) {
    if (_.isUndefined(neck_marker)) { return; }

    var y = this.options.grid_y + ((neck_marker[0] - (this.options.base_fret - 1)) * this.options.fret_gap) - (this.options.fret_gap / 2);
    var marker_style = {
      fill: "90-#bbb:5-#ccc:95",
      stroke: "none"
    };

    if (neck_marker[1] == 1) {
      var x = this.options.grid_x + this.neck.width / 2;

      var glyph = this.r.circle(x,y,this.options.neck_marker_radius);
      glyph.attr(marker_style);
      this.neck.glyphs['neck-markers'].push(glyph);

    } else if (neck_marker[1] == 2) {
      var x1 = this.options.grid_x + (1.2 * this.options.string_gap);
      var x2 = this.options.grid_x + (3.8 * this.options.string_gap);

      var glyph1 = this.r.circle(x1,y,this.options.neck_marker_radius);
      glyph1.attr(marker_style);
      this.neck.glyphs['neck-markers'].push(glyph1);

      var glyph2 = this.r.circle(x2,y,this.options.neck_marker_radius);
      glyph2.attr(marker_style);
      this.neck.glyphs['neck-markers'].push(glyph2);
    }
  },

  _drawNut: function() {
    var glyph = this.r.rect(
      this.options.grid_x,this.options.grid_y,
      (this.model.getNumStrings() - 1) * this.options.string_gap,
      this.options.nut_height).attr({ fill: "black" }
    );

    this.neck.glyphs['nut'] = glyph;
    //this.neck.push(glyph);
  },

  _drawTuningLabel: function() {
    this.neck.glyphs['tuning-labels'] = [];
    for (var i = 0; i < this.model.getNumStrings(); i++) {
      var note = this.model.getTuning().notes[i];

      var x = this.options.grid_x + (i * this.options.string_gap);
      var y = this.options.grid_y + this.neck.height + this.options.tuning_label_offset;
      var annotation_style = {
        fill: "black"
      };

      var glyph = this.r.text(x, y, "" + note).attr({
        'font-size': this.options.tuning_label_font_size
      });
      this.neck.glyphs['tuning-labels'].push(glyph);
    }
  },

  _drawBaseFret: function(base_fret) {
    var x = this.options.grid_x + this.neck.width + this.options.base_fret_offset;
    var y = this.options.grid_y + this.options.fret_gap / 2;

    this.r.text(x,y, "" + base_fret + "fr.").attr({
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

    var glyph = this.r.circle(x,y,this.options.note_radius);
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
    var annotation_style;

    if (this.options.finger_position === ChordView.FINGER_TOP) {
      x = this.options.grid_x + (note.string * this.options.string_gap);
      y = this.options.grid_y - this.options.finger_anno_y;
      annotation_style = {
        fill: "black"
      };
    } else if (this.options.finger_position === ChordView.FINGER_LEFT) {
      x = this.options.grid_x + (note.string * this.options.string_gap) - (this.options.note_radius * 2) + 0.5;
      y = this.options.grid_y + ((note.fret - this.options.base_fret+1) * this.options.fret_gap) - (this.options.fret_gap / 2) + 0.5;
      annotation_style = {
        fill: "black"
      };
    } else if (this.options.finger_position === ChordView.FINGER_ONNOTE) {
      x = this.options.grid_x + (note.string * this.options.string_gap) + 0.5;
      y = this.options.grid_y + ((note.fret - this.options.base_fret+1) * this.options.fret_gap) - (this.options.fret_gap / 2) + 0.5;
      annotation_style = {
        fill: "black"
      };
    } else {
      throw TypeError("Invalid finger_position: " + this.options.finger_position);
    }
    

    var glyph = this.r.text(x, y, ""+note.finger).attr({ 'font-size': this.options.anno_font_size });
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
    this.r.text(x,y,fancy_label).attr({ "text-anchor": "middle", "font-size": this.options.label_font_size });
  },

  _colorValueForName: function(colorName) {
    if (this.options.note_gradient) {
      return ChordView.NOTE_GRADIENTS[colorName];
    } else {
      return ChordView.NOTE_COLORS[colorName];
    }
  }
};
;
function GuitarNote(string, fret, options) {
  // This first guard ensures that the callee has invoked our Class' constructor function
  // with the `new` keyword - failure to do this will result in the `this` keyword referring
  // to the callee's scope (typically the window global) which will result in the following fields
  // (name and _age) leaking into the global namespace and not being set on this object.
  if (!(this instanceof GuitarNote)) {
    throw new TypeError("GuitarNote constructor cannot be called as a function.");
  }
  if (!options) { options = {}; }

  this._init(string, fret, options);
}

// CONSTANTS
GuitarNote.DEFAULT_OPTIONS = {
  muted: false,
  finger: null,
};
GuitarNote.DEF_MUTE_ANNOTATION = "x";
GuitarNote.MUTE_ANNOTATION = "xXmM";
GuitarNote.THUMB_ANNOTATION = "tT";

GuitarNote.prototype = {
  /**
   * Whenever you replace an Object's Prototype, you need to repoint
   * the base Constructor back at the original constructor Function,
   * otherwise `instanceof` calls will fail.
   */
  constructor: GuitarNote,

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
    // TODO: implement
    var result = "String: " + this.string + ", Fret: " + this.fret;
    if (this.isMuted()) {
      result += ", Finger: " + GuitarNote.DEF_MUTE_ANNOTATION;
    } else if (this.finger) {
      result += ", Finger: " + this.finger;
    }
    return result;
  },
};
;/* global GuitarNote, Tuning, Vex */

function GuitarNoteFactory(options) {
  // This first guard ensures that the callee has invoked our Class' constructor function
  // with the `new` keyword - failure to do this will result in the `this` keyword referring 
  // to the callee's scope (typically the window global) which will result in the following fields
  // (name and _age) leaking into the global namespace and not being set on this ob ect.
  if (!(this instanceof GuitarNoteFactory)) {
    throw new TypeError("GuitarNoteFactory constructor cannot be called as a function.");
  }
  if (!options) { options = {}; }

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
    
    if (!options.numFrets || !_.isNumber(options.numFrets) || options.numFrets < 0) {
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
    if (!notesValues || !_.isArray(notesValues)) {
      throw TypeError("notesValues must be an array");
    }

    var notes = [];
    for (var i = 0; i < notesValues.length; i++) {
      var noteVal = notesValues[i];

      if (!_.isNumber(noteVal)) {
        throw TypeError("noteValue must be a number: " + noteVal);
      } else if (noteVal < 0 || noteVal >= Vex.Flow.Music.NUM_TONES) {
        throw TypeError("noteValue must be 0 <= noteVal < 12: " + noteVal);
      }

      for (var string_num = 0; string_num < this.tuning.getNumStrings(); string_num++) {
        var tuningNote = this.tuning.notes[string_num].toLowerCase();
        var string_base_value = this.music.getNoteValue(tuningNote);

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
      if (!_.has(Vex.Flow.Music.noteValues, noteStr)) {
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
    if (!key || !_.has(Vex.Flow.Music.noteValues, key)) {
      throw TypeError("Invalid key: " + key);
    }
    if (!scale || !_.isString(scale) || !_.has(Vex.Flow.Music.scales, scale)) {
      throw TypeError("Invalid scale: " + scale);
    }

    var keyStr = key.toLowerCase();
    var keyVal = this.music.getNoteValue(keyStr);
    var scaleIntervals = Vex.Flow.Music.scales[scale];

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
    if (!key || !_.has(Vex.Flow.Music.noteValues, key)) {
      throw TypeError("Invalid key: " + key);
    }
    if (!arpeggio || !_.isString(arpeggio) || !_.has(Vex.Flow.Music.arpeggios, arpeggio)) {
      throw TypeError("Invalid scale: " + arpeggio);
    }

    var keyStr = key.toLowerCase();
    var keyVal = this.music.getNoteValue(keyStr);
    var arpeggioIntervals = Vex.Flow.Music.arpeggios[arpeggio];

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
};
;// Tuning
// ------

/* global Vex */

function Tuning(tuningStr) {
  // This first guard ensures that the callee has invoked our Class' constructor function
  // with the `new` keyword - failure to do this will result in the `this` keyword referring 
  // to the callee's scope (typically the window global) which will result in the following fields
  // (name and _age) leaking into the global namespace and not being set on this object.
  if (!(this instanceof Tuning)) {
    throw new TypeError("tuningStr cannot be called as a function.");
  }

  this._init(tuningStr);
}

Tuning.prototype = {
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
    var music = new Vex.Flow.Music();
    return music.getNoteValue(this.noteNameForString(stringNum));
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

};

Tuning.isValidTuningString = function(tuningStr) {
  if (!tuningStr || !_.isString(tuningStr) || tuningStr.length === 0) { return false; }
  return tuningStr.match(/^([abcdefg#]\s?)+$/gi) !== null;
};

Tuning.parseTuningString = function(tuningStr) {
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
};

Tuning.instruments = {
  "guitar": {
    "default": "EADGBe",
    "standard": "EADGBe",
    "drop-d": "DADGBe",
    "open-g": "DGDGBD",
    "open-g-dobro": "GBDGBD",
    "open-d": "DADF#AD",
    // TODO: add more?
  },
  "banjo": {
    "default": "gDGBD",
    "open-g": "gDGBD",
    "g-modal": "gDGCD",
    "open-g-minor": "gDGA#D",
    "standard-c": "gCGBD",
    "open-d": "f#DF#AD"
    // TODO: add more?
  },
  "mandolin": {
    "default": "GDAE",
    // TODO: fill in
  },
  "bass": {
    "default": "EADG",
    // TODO: fill in
  },
};
Tuning.defaultTuning = Tuning.instruments["guitar"]["default"];
;/* global Tuning */

function TuningFactory() {
  throw Error("Cannot instantiate TuningFactory.");
}

TuningFactory.fromInstrument = function(instrument, tuning_type) {
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
};
;// Voicings
// --------

/* global Vex, GuitarNote, Tuning, ChordModel */

// Library of both open and closed chord voicings for various 
// instruments. 

function Voicings() {
  throw new Error("Voicings is a singleton. Do not call the constructor");
}

// Chord Data
// ----------
// Chord data is defined here.  
Voicings.voicings = {
  // - `key` : root of the chord
  // - `label` : type of chord (e.g. "M", "M7")
  // - `notes` : list of fret numbers from lowest (bass) string to highest
  // - `fingers` : list of fingerings for corresponding frets in notes `array`
  // - `bass` : if an inversion, notes which note relative to to the tonic is in the bass
  "guitar": {
    "eadgbe" : [
      // Major Chords
      { "key":"c", "label": "M",      "notes": [3,3,5,5,5,"x"],       "fingers": [1,1,3,3,3,"x"],     "bass": 7  },
      { "key":"c", "label": "M",      "notes": [8,10,10,9,8,8],       "fingers": ["T",3,4,2,1,1],                },
      { "key":"c", "label": "M",      "notes": [12,"x",10,12,13,"x"], "fingers": [2,"x",1,3,4,"x"],   "bass": 4  },
      { "key":"c", "label": "M",      "notes": [12,"x",14,12,13,"x"], "fingers": ["T","x",3,1,2,"x"], "bass": 4  },
      { "key":"c", "label": "M6",     "notes": [3,3,5,5,5,5],         "fingers": [1,1,3,3,3,3],       "bass": 7  },
      { "key":"c", "label": "M6",     "notes": [8,7,5,5,5,5],         "fingers": [4,3,1,1,1,1],                  },
      { "key":"c", "label": "M6",     "notes": [8,"x",10,9,10,8],     "fingers": ["T","x",3,2,4,1],              },
      { "key":"c", "label": "M6/9",   "notes": [3,3,2,2,3,3],         "fingers": [2,2,1,1,3,4],       "bass": 7  },
      { "key":"c", "label": "M6/9",   "notes": [8,7,7,7,8,8],         "fingers": [2,1,1,1,3,4],                  },
      { "key":"c", "label": "M6/9",   "notes": [8,10,10,9,10,10],     "fingers": ["T",2,2,1,3,3],                },
        
      // 7 Chords
      { "key":"c", "label": "7",      "notes": [3,3,5,3,5,3],         "fingers": [1,1,3,1,4,1],                  },
      { "key":"c", "label": "7",      "notes": [8,"x",8,9,8,"x"],     "fingers": ["T","x",1,3,2,"x"],            },
      { "key":"c", "label": "7",      "notes": [8,10,8,9,8,8],        "fingers": [1,3,1,2,1,1],                  },
      { "key":"c", "label": "7",      "notes": [3,3,2,3,1,"x"],       "fingers": [3,3,2,4,1,"x"],     "bass": 7  },
      { "key":"c", "label": "7",      "notes": [8,10,10,9,11],        "fingers": ["T",2,2,1,4,"x"],              },
      { "key":"c", "label": "7",      "notes": [6,"x",5,5,5,"x"],     "fingers": [2,"x",1,1,1,"x"],   "bass": 10 },
      { "key":"c", "label": "7",      "notes": [3,3,5,3,5,6],         "fingers": [1,1,2,1,3,4,"x"],   "bass": 7  },
      { "key":"c", "label": "7",      "notes": [8,"x",8,9,8,8],       "fingers": ["T","x",1,4,2,3],              },
      { "key":"c", "label": "7(b9)",  "notes": [3,3,2,3,2,"x"],       "fingers": [2,2,1,3,1,"x"],     "bass": 7  },
      { "key":"c", "label": "7(b9)",  "notes": [12,"x",14,12,14,"x"], "fingers": ["T","x",2,1,3,"x"], "bass": 4  },
  
      // Minor
      { "key":"c", "label": "m",      "notes": [3,3,5,5,4,3],         "fingers": [1,1,3,4,2,1],       "bass": 7  },
      { "key":"c", "label": "m",      "notes": [8,10,10,8,8,8],       "fingers": ["T",3,4,1,1,1],                },
      { "key":"c", "label": "m",      "notes": [11,"x",10,12,13],     "fingers": [2,"x",1,3,4,"x"],   "bass": 3  },
      { "key":"c", "label": "m",      "notes": [11,"x",13,12,13,"x"], "fingers": ["T","x",2,1,3,"x"], "bass": 3  },
      { "key":"c", "label": "m6",     "notes": [8,"x",7,8,8,8],       "fingers": [2,"x",1,3,3,3],                },
      { "key":"c", "label": "m6",     "notes": ["x",12,13,12,13,"x"], "fingers": ["x",1,3,2,4,"x"],   "bass": 9  },
      { "key":"c", "label": "m6",     "notes": [3,3,5,5,4,5],         "fingers": [1,1,3,1,2,1],       "bass": 7  },
      { "key":"c", "label": "m6",     "notes": [8,10,10,8,10,"x"],    "fingers": ["T",2,2,1,3,"x"],              },
      { "key":"c", "label": "m6",     "notes": [8,"x",10,8,10,"x"],   "fingers": ["T","x",3,1,4,"x"],            },
      { "key":"c", "label": "m6/9",   "notes": [8,10,10,8,10,10],     "fingers": ["T",2,2,1,3,3],                },

      // Diminished
      { "key":"c", "label": "*7",     "notes": ["x",3,4,2,4,"x"],     "fingers": ["x",2,3,1,4,"x"],              },
      { "key":"c", "label": "*7",     "notes": [8,"x",7,8,7,"x"],     "fingers": [2,"x",1,3,1,"x"],              },

      // Minor 7
      { "key":"c", "label": "m7",     "notes": [8,"x",8,8,8,8],       "fingers": [2,"x",3,3,3,3],                },
      { "key":"c", "label": "m7",     "notes": [3,3,5,3,4,3],         "fingers": [1,1,3,1,2,1],       "bass": 7  },
      { "key":"c", "label": "m7",     "notes": [3,"x",1,3,4,"x"],     "fingers": [3,"x",1,3,4,"x"],   "bass": 7  },
      { "key":"c", "label": "m7",     "notes": [8,10,8,8,8,8],        "fingers": ["T",3,1,1,1,1],                },
      { "key":"c", "label": "m7(b5)", "notes": ["x",3,4,3,4,"x"],     "fingers": ["x",1,3,2,4,"x"],              },
      { "key":"c", "label": "m7(b5)", "notes": [8,"x",8,8,7,"x"],     "fingers": [2,"x",3,4,1,"x"],              },
      { "key":"c", "label": "m7(b5)", "notes": [11,"x",10,11,11,11],  "fingers": [2,"x",1,3,3,3],     "bass": 3  },
      { "key":"c", "label": "m7(b5)", "notes": [11,13,13,11,13,"x"],  "fingers": ["T",2,2,1,3,"x"],   "bass": 3  },
      { "key":"c", "label": "m7(b5)", "notes": [8,"x",8,8,7,8],       "fingers": ["T","x",2,2,1,3],              },
    ]
  },
  "banjo": {},
  "mandolin": {},
  "test": {
    "eadgbe" : [
      // 5th in the bass
      { "key":"c", "label": "M",    "notes": [3,3,5,5,5,"x"],       "fingers": [1,1,3,3,3,"x"],     "bass": 7 },
      { "key":"c", "label": "M",    "notes": [8,10,10,9,8,8],       "fingers": ["T",3,4,2,1,1],               },
      { "key":"c", "label": "M",    "notes": [12,"x",10,12,13,"x"], "fingers": [2,"x",1,3,4,"x"],   "bass": 4 },
      { "key":"c", "label": "M6",   "notes": [3,3,5,5,5,5],         "fingers": [1,1,3,3,3,3],       "bass": 7 },
      { "key":"c", "label": "M6",   "notes": [8,8,10,10,9,10],      "fingers": ["T","x",3,1,2,"x"],           },
      { "key":"c", "label": "M6/9", "notes": [8,10,10,9,10,10],     "fingers": ["T",2,2,1,3,3],               },
    ]
  }
};

// **getChordList** Returns list of chord types for an instrument and tuning
Voicings.getChordList = function(instrument, tuning) {
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
};

// **chordModelFromVoicing** Returns a ChordModel for a given voicing
// `key` transposes chord to proper key, `variation` index
Voicings.chordModelFromVoicing = function(instrument, tuning, chord, key, variation, matchExact) {
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
  var music = new Vex.Flow.Music();

  // Get voicing data
  var chordData = Voicings._getChordVoicingData(instrument, tuning, chord, variation, matchExact);
  if (!chordData) { return null; }

  // Get key note values
  if (!key) { key = chordData.key; }
  key = key.toLowerCase();
  var key_value = music.getNoteValue(key);
  var chord_key_value = music.getNoteValue(chordData.key);

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
      var noteVal = music.getRelativeNoteValue(tuningObj.noteValForString(stringNum), fretNum, 1);
      if (noteVal === chord_key_value) {
        noteOptions.color = "black";
      }
    }

    var note = new GuitarNote(stringNum, fretNum, noteOptions);
    notes.push(note);
  }
  var model = new ChordModel({ notes: notes, tuning: tuning, key: key, label: chordLabel });
  
  // Transpose chord
  var dist_down = music.getIntervalBetween(chord_key_value, key_value, -1);
  var dist_up = music.getIntervalBetween(chord_key_value, key_value, 1);
  var min_fret = model.getMinFret();
  if(min_fret - dist_down >= 0) {
    model.transposeByInterval(dist_down, -1);
  } else {
    model.transposeByInterval(dist_up, 1);
  }

  return model;
};

// **getNumVariations** returns number of variations for a chord type.
Voicings.getNumVariations = function(instrument, tuning, chord, matchExact) {
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
};

Voicings._getChordVoicingData = function(instrument, tuning, chord, variation, matchExact) {
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
};

Voicings._bassNoteForKeyAndOffset = function(key, offset) {
  if(!offset) { return ""; }

  var music = new Vex.Flow.Music();
  var keyValue = music.getNoteValue(key.toLowerCase());
  var bassValue = music.getRelativeNoteValue(keyValue, offset, 1);
  var bassNoteName = music.getCanonicalNoteName(bassValue);

  return bassNoteName;
};;// music
// -----

// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements some standard music theory routines.

function Vex() {}
Vex.Flow = {};
Vex.Flow.Music = function() {};

// Music Theory Data
// -----------------

Vex.Flow.Music.NUM_TONES = 12;
Vex.Flow.Music.roots = [ "c", "d", "e", "f", "g", "a", "b" ];
Vex.Flow.Music.root_values = [ 0, 2, 4, 5, 7, 9, 11 ];

// Valid note symbols
Vex.Flow.Music.root_indices = {
  "c": 0,
  "d": 1,
  "e": 2,
  "f": 3,
  "g": 4,
  "a": 5,
  "b": 6
};

// Valid accidental symbols
Vex.Flow.Music.accidentals = [ "bb", "b", "n", "#", "##" ];

// A mapping of integers to note names
Vex.Flow.Music.canonical_notes = [
  "c", "c#", "d", "d#",
  "e", "f", "f#", "g",
  "g#", "a", "a#", "b"
];

// Valid note names mapped to root and note values
Vex.Flow.Music.noteValues = {
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
};

Vex.Flow.Music.diatonic_intervals = [
  "unison", "m2", "M2", "m3", "M3",
  "p4", "dim5", "p5", "m6", "M6",
  "b7", "M7", "octave"
];

Vex.Flow.Music.diatonic_accidentals = {
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
};

Vex.Flow.Music.intervals = {
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
};

// Scales specified as sequence of intervals
Vex.Flow.Music.scales = {
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
};

// Arpeggios specified as sequence of intervals
Vex.Flow.Music.arpeggios = {
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
};

// Convenience Methods
// -------------------

// **isValidNoteValue** Validates integer note value  
Vex.Flow.Music.prototype.isValidNoteValue = function(note) {
  // - `note` : integer

  if (note == null || note < 0 || note >= Vex.Flow.Music.NUM_TONES) {
    return false;
  }
  return true;
};

// **isValidIntervalValue** Validates interval value  
Vex.Flow.Music.prototype.isValidIntervalValue = function(interval) {
  // - `interval` : integer

  // TODO: Support Intervals greater than an octave
  return this.isValidNoteValue(interval);
};

// **getNoteParts** Splits note string into root and accidental  
Vex.Flow.Music.prototype.getNoteParts = function(noteString) {
  // - `noteString` : string  

  //     music.getNoteParts("c#") -> { root: "c", accidental: "#" }

  if (!noteString || noteString.length < 1) {
    throw new Vex.RERR("BadArguments", "Invalid note name: " + noteString);
  }
  if (noteString.length > 3) {
    throw new Vex.RERR("BadArguments", "Invalid note name: " + noteString);
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
    throw new Vex.RERR("BadArguments", "Invalid note name: " + noteString);
  }
};

// **getKeyParts** Splits key string into root, accidental, and scale type
Vex.Flow.Music.prototype.getKeyParts = function(keyString) {
  //  - `keyString` : string

  //     music.getKeyParts("c#m") -> { root: "c", accidental: "#", type: "m" }

  if (!keyString || keyString.length < 1) {
    throw new Vex.RERR("BadArguments", "Invalid key: " + keyString);
  }
    
  var key = keyString.toLowerCase();

  // Support Major, Minor, Melodic Minor, and Harmonic Minor key types.  
  // TODO: Integrate with scale dicts
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
    throw new Vex.RERR("BadArguments", "Invalid key: " + keyString);
  }
};

// **getNoteValue** Returns integer note value for a note string (including accidentals)
Vex.Flow.Music.prototype.getNoteValue = function(noteString) {
  // - `noteString` : string

  //     music.getNoteValue("c#") -> 1

  var value = Vex.Flow.Music.noteValues[noteString.toLowerCase()];
  if (value == null) {
    throw new Vex.RERR("BadArguments", "Invalid note name: " + noteString);
  }
    
  return value.int_val;
};

// **getIntervalValue** Returns integer value representing distance of an interval
Vex.Flow.Music.prototype.getIntervalValue = function(intervalString) {
  // - `intervalString` : string

  //     music.getIntervalValue("m3") -> 3

  var value = Vex.Flow.Music.intervals[intervalString];
  if (value == null) {
    throw new Vex.RERR("BadArguments",
                       "Invalid interval name: " + intervalString);
  }

  return value;
};

// **getCanonicalNoteName** Returns a note name for a given note value
Vex.Flow.Music.prototype.getCanonicalNoteName = function(noteValue) {
  // - `noteValue` : integer
 
  //     music.getCanonicalNoteName(6) -> "f#"

  if (!this.isValidNoteValue(noteValue)) {
    throw new Vex.RERR("BadArguments",
                       "Invalid note value: " + noteValue);
  }

  return Vex.Flow.Music.canonical_notes[noteValue];
};

// **getCanonicalIntervalName** Returns an interval name for a given interval value
Vex.Flow.Music.prototype.getCanonicalIntervalName = function(intervalValue) {
  // - `intervalValue` : integer

  //     music.getCanonicalIntervalName(6) -> "dim5"

  if (!this.isValidIntervalValue(intervalValue)) {
    throw new Vex.RERR("BadArguments",
                       "Invalid interval value: " + intervalValue);
  }

  return Vex.Flow.Music.diatonic_intervals[intervalValue];
};

// **getRelativeNoteValue** Calculates noteValue of an intervale based a a note
Vex.Flow.Music.prototype.getRelativeNoteValue = function(noteValue, intervalValue, direction) {
  // - `noteValue` : integer
  // - `intervalValue` : integer
  // - `direction` : `1` or `-1`

  //     music.getRelativeNoteValue(0, 3, 1) -> 3
  //     music.getRelativeNoteValue(2, 3, -1) -> 11

  if (direction == null) { direction = 1; }
  if (direction != 1 && direction != -1) {
    throw new Vex.RERR("BadArguments", "Invalid direction: " + direction);
  }

  var sum = (noteValue + (direction * intervalValue)) %
    Vex.Flow.Music.NUM_TONES;
  if (sum < 0) { sum += Vex.Flow.Music.NUM_TONES; }

  return sum;
};

// **getScaleTones** Returns scale tones, given intervals. Each successive interval is
// relative to the previous one, e.g., Major Scale:  
//
// TTSTTTS = `[2,2,1,2,2,2,1]`
//
// When used with key = 0, returns C scale (which is isomorphic to
// interval list).  
Vex.Flow.Music.prototype.getScaleTones = function(keyValue, intervals) {
  // - `key` : integer
  // - `intervals` : array (e.g. `[ 2, 2, 1, 2, 2, 2, 1 ]`)

  //     music.getScaleTones(2, [2,2,1]) -> [2,4,6,7]

  var tones = [];
  tones.push(keyValue);

  var nextNote = keyValue;
  for (var i = 0; i < intervals.length; ++i) {
    nextNote = this.getRelativeNoteValue(nextNote,
                                         intervals[i]);
    if (nextNote != keyValue) { tones.push(nextNote); }
  }

  return tones;
};

// **getIntervalBetween** Distance between two notes
Vex.Flow.Music.prototype.getIntervalBetween = function(note1, note2, direction) {
  // - `note1` : integer
  // - `note2` : integer
  // - `direction` : -1 or 1

  //     music.getIntervalBetween(2, 4, -1) -> 10

  if (direction == null) { direction = 1; }
  if (direction != 1 && direction != -1) {
    throw new Vex.RERR("BadArguments", "Invalid direction: " + direction);
  }
  if (!this.isValidNoteValue(note1) || !this.isValidNoteValue(note2)) {
    throw new Vex.RERR("BadArguments",
                       "Invalid notes: " + note1 + ", " + note2);
  }

  var difference;
  if (direction == 1) {
    difference = note2 - note1;
  } else {
    difference = note1 - note2;
  }

  if (difference < 0) { difference += Vex.Flow.Music.NUM_TONES; }
  return difference;
};
;// Underscore.js 1.3.3
// (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
(function(){function r(a,c,d){if(a===c)return 0!==a||1/a==1/c;if(null==a||null==c)return a===c;a._chain&&(a=a._wrapped);c._chain&&(c=c._wrapped);if(a.isEqual&&b.isFunction(a.isEqual))return a.isEqual(c);if(c.isEqual&&b.isFunction(c.isEqual))return c.isEqual(a);var e=l.call(a);if(e!=l.call(c))return!1;switch(e){case "[object String]":return a==""+c;case "[object Number]":return a!=+a?c!=+c:0==a?1/a==1/c:a==+c;case "[object Date]":case "[object Boolean]":return+a==+c;case "[object RegExp]":return a.source==
c.source&&a.global==c.global&&a.multiline==c.multiline&&a.ignoreCase==c.ignoreCase}if("object"!=typeof a||"object"!=typeof c)return!1;for(var f=d.length;f--;)if(d[f]==a)return!0;d.push(a);var f=0,g=!0;if("[object Array]"==e){if(f=a.length,g=f==c.length)for(;f--&&(g=f in a==f in c&&r(a[f],c[f],d)););}else{if("constructor"in a!="constructor"in c||a.constructor!=c.constructor)return!1;for(var h in a)if(b.has(a,h)&&(f++,!(g=b.has(c,h)&&r(a[h],c[h],d))))break;if(g){for(h in c)if(b.has(c,h)&&!f--)break;
g=!f}}d.pop();return g}var s=this,I=s._,o={},k=Array.prototype,p=Object.prototype,i=k.slice,J=k.unshift,l=p.toString,K=p.hasOwnProperty,y=k.forEach,z=k.map,A=k.reduce,B=k.reduceRight,C=k.filter,D=k.every,E=k.some,q=k.indexOf,F=k.lastIndexOf,p=Array.isArray,L=Object.keys,t=Function.prototype.bind,b=function(a){return new m(a)};"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(exports=module.exports=b),exports._=b):s._=b;b.VERSION="1.3.3";var j=b.each=b.forEach=function(a,
c,d){if(a!=null)if(y&&a.forEach===y)a.forEach(c,d);else if(a.length===+a.length)for(var e=0,f=a.length;e<f;e++){if(e in a&&c.call(d,a[e],e,a)===o)break}else for(e in a)if(b.has(a,e)&&c.call(d,a[e],e,a)===o)break};b.map=b.collect=function(a,c,b){var e=[];if(a==null)return e;if(z&&a.map===z)return a.map(c,b);j(a,function(a,g,h){e[e.length]=c.call(b,a,g,h)});if(a.length===+a.length)e.length=a.length;return e};b.reduce=b.foldl=b.inject=function(a,c,d,e){var f=arguments.length>2;a==null&&(a=[]);if(A&&
a.reduce===A){e&&(c=b.bind(c,e));return f?a.reduce(c,d):a.reduce(c)}j(a,function(a,b,i){if(f)d=c.call(e,d,a,b,i);else{d=a;f=true}});if(!f)throw new TypeError("Reduce of empty array with no initial value");return d};b.reduceRight=b.foldr=function(a,c,d,e){var f=arguments.length>2;a==null&&(a=[]);if(B&&a.reduceRight===B){e&&(c=b.bind(c,e));return f?a.reduceRight(c,d):a.reduceRight(c)}var g=b.toArray(a).reverse();e&&!f&&(c=b.bind(c,e));return f?b.reduce(g,c,d,e):b.reduce(g,c)};b.find=b.detect=function(a,
c,b){var e;G(a,function(a,g,h){if(c.call(b,a,g,h)){e=a;return true}});return e};b.filter=b.select=function(a,c,b){var e=[];if(a==null)return e;if(C&&a.filter===C)return a.filter(c,b);j(a,function(a,g,h){c.call(b,a,g,h)&&(e[e.length]=a)});return e};b.reject=function(a,c,b){var e=[];if(a==null)return e;j(a,function(a,g,h){c.call(b,a,g,h)||(e[e.length]=a)});return e};b.every=b.all=function(a,c,b){var e=true;if(a==null)return e;if(D&&a.every===D)return a.every(c,b);j(a,function(a,g,h){if(!(e=e&&c.call(b,
a,g,h)))return o});return!!e};var G=b.some=b.any=function(a,c,d){c||(c=b.identity);var e=false;if(a==null)return e;if(E&&a.some===E)return a.some(c,d);j(a,function(a,b,h){if(e||(e=c.call(d,a,b,h)))return o});return!!e};b.include=b.contains=function(a,c){var b=false;if(a==null)return b;if(q&&a.indexOf===q)return a.indexOf(c)!=-1;return b=G(a,function(a){return a===c})};b.invoke=function(a,c){var d=i.call(arguments,2);return b.map(a,function(a){return(b.isFunction(c)?c||a:a[c]).apply(a,d)})};b.pluck=
function(a,c){return b.map(a,function(a){return a[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0])return Math.max.apply(Math,a);if(!c&&b.isEmpty(a))return-Infinity;var e={computed:-Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0])return Math.min.apply(Math,a);if(!c&&b.isEmpty(a))return Infinity;var e={computed:Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b<e.computed&&
(e={value:a,computed:b})});return e.value};b.shuffle=function(a){var b=[],d;j(a,function(a,f){d=Math.floor(Math.random()*(f+1));b[f]=b[d];b[d]=a});return b};b.sortBy=function(a,c,d){var e=b.isFunction(c)?c:function(a){return a[c]};return b.pluck(b.map(a,function(a,b,c){return{value:a,criteria:e.call(d,a,b,c)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c===void 0?1:d===void 0?-1:c<d?-1:c>d?1:0}),"value")};b.groupBy=function(a,c){var d={},e=b.isFunction(c)?c:function(a){return a[c]};
j(a,function(a,b){var c=e(a,b);(d[c]||(d[c]=[])).push(a)});return d};b.sortedIndex=function(a,c,d){d||(d=b.identity);for(var e=0,f=a.length;e<f;){var g=e+f>>1;d(a[g])<d(c)?e=g+1:f=g}return e};b.toArray=function(a){return!a?[]:b.isArray(a)||b.isArguments(a)?i.call(a):a.toArray&&b.isFunction(a.toArray)?a.toArray():b.values(a)};b.size=function(a){return b.isArray(a)?a.length:b.keys(a).length};b.first=b.head=b.take=function(a,b,d){return b!=null&&!d?i.call(a,0,b):a[0]};b.initial=function(a,b,d){return i.call(a,
0,a.length-(b==null||d?1:b))};b.last=function(a,b,d){return b!=null&&!d?i.call(a,Math.max(a.length-b,0)):a[a.length-1]};b.rest=b.tail=function(a,b,d){return i.call(a,b==null||d?1:b)};b.compact=function(a){return b.filter(a,function(a){return!!a})};b.flatten=function(a,c){return b.reduce(a,function(a,e){if(b.isArray(e))return a.concat(c?e:b.flatten(e));a[a.length]=e;return a},[])};b.without=function(a){return b.difference(a,i.call(arguments,1))};b.uniq=b.unique=function(a,c,d){var d=d?b.map(a,d):a,
e=[];a.length<3&&(c=true);b.reduce(d,function(d,g,h){if(c?b.last(d)!==g||!d.length:!b.include(d,g)){d.push(g);e.push(a[h])}return d},[]);return e};b.union=function(){return b.uniq(b.flatten(arguments,true))};b.intersection=b.intersect=function(a){var c=i.call(arguments,1);return b.filter(b.uniq(a),function(a){return b.every(c,function(c){return b.indexOf(c,a)>=0})})};b.difference=function(a){var c=b.flatten(i.call(arguments,1),true);return b.filter(a,function(a){return!b.include(c,a)})};b.zip=function(){for(var a=
i.call(arguments),c=b.max(b.pluck(a,"length")),d=Array(c),e=0;e<c;e++)d[e]=b.pluck(a,""+e);return d};b.indexOf=function(a,c,d){if(a==null)return-1;var e;if(d){d=b.sortedIndex(a,c);return a[d]===c?d:-1}if(q&&a.indexOf===q)return a.indexOf(c);d=0;for(e=a.length;d<e;d++)if(d in a&&a[d]===c)return d;return-1};b.lastIndexOf=function(a,b){if(a==null)return-1;if(F&&a.lastIndexOf===F)return a.lastIndexOf(b);for(var d=a.length;d--;)if(d in a&&a[d]===b)return d;return-1};b.range=function(a,b,d){if(arguments.length<=
1){b=a||0;a=0}for(var d=arguments[2]||1,e=Math.max(Math.ceil((b-a)/d),0),f=0,g=Array(e);f<e;){g[f++]=a;a=a+d}return g};var H=function(){};b.bind=function(a,c){var d,e;if(a.bind===t&&t)return t.apply(a,i.call(arguments,1));if(!b.isFunction(a))throw new TypeError;e=i.call(arguments,2);return d=function(){if(!(this instanceof d))return a.apply(c,e.concat(i.call(arguments)));H.prototype=a.prototype;var b=new H,g=a.apply(b,e.concat(i.call(arguments)));return Object(g)===g?g:b}};b.bindAll=function(a){var c=
i.call(arguments,1);c.length==0&&(c=b.functions(a));j(c,function(c){a[c]=b.bind(a[c],a)});return a};b.memoize=function(a,c){var d={};c||(c=b.identity);return function(){var e=c.apply(this,arguments);return b.has(d,e)?d[e]:d[e]=a.apply(this,arguments)}};b.delay=function(a,b){var d=i.call(arguments,2);return setTimeout(function(){return a.apply(null,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(i.call(arguments,1)))};b.throttle=function(a,c){var d,e,f,g,h,i,j=b.debounce(function(){h=
g=false},c);return function(){d=this;e=arguments;f||(f=setTimeout(function(){f=null;h&&a.apply(d,e);j()},c));g?h=true:i=a.apply(d,e);j();g=true;return i}};b.debounce=function(a,b,d){var e;return function(){var f=this,g=arguments;d&&!e&&a.apply(f,g);clearTimeout(e);e=setTimeout(function(){e=null;d||a.apply(f,g)},b)}};b.once=function(a){var b=false,d;return function(){if(b)return d;b=true;return d=a.apply(this,arguments)}};b.wrap=function(a,b){return function(){var d=[a].concat(i.call(arguments,0));
return b.apply(this,d)}};b.compose=function(){var a=arguments;return function(){for(var b=arguments,d=a.length-1;d>=0;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=function(a,b){return a<=0?b():function(){if(--a<1)return b.apply(this,arguments)}};b.keys=L||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var c=[],d;for(d in a)b.has(a,d)&&(c[c.length]=d);return c};b.values=function(a){return b.map(a,b.identity)};b.functions=b.methods=function(a){var c=[],d;for(d in a)b.isFunction(a[d])&&
c.push(d);return c.sort()};b.extend=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]=b[d]});return a};b.pick=function(a){var c={};j(b.flatten(i.call(arguments,1)),function(b){b in a&&(c[b]=a[b])});return c};b.defaults=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]==null&&(a[d]=b[d])});return a};b.clone=function(a){return!b.isObject(a)?a:b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};b.isEqual=function(a,b){return r(a,b,[])};b.isEmpty=
function(a){if(a==null)return true;if(b.isArray(a)||b.isString(a))return a.length===0;for(var c in a)if(b.has(a,c))return false;return true};b.isElement=function(a){return!!(a&&a.nodeType==1)};b.isArray=p||function(a){return l.call(a)=="[object Array]"};b.isObject=function(a){return a===Object(a)};b.isArguments=function(a){return l.call(a)=="[object Arguments]"};b.isArguments(arguments)||(b.isArguments=function(a){return!(!a||!b.has(a,"callee"))});b.isFunction=function(a){return l.call(a)=="[object Function]"};
b.isString=function(a){return l.call(a)=="[object String]"};b.isNumber=function(a){return l.call(a)=="[object Number]"};b.isFinite=function(a){return b.isNumber(a)&&isFinite(a)};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return a===true||a===false||l.call(a)=="[object Boolean]"};b.isDate=function(a){return l.call(a)=="[object Date]"};b.isRegExp=function(a){return l.call(a)=="[object RegExp]"};b.isNull=function(a){return a===null};b.isUndefined=function(a){return a===void 0};b.has=function(a,
b){return K.call(a,b)};b.noConflict=function(){s._=I;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var e=0;e<a;e++)b.call(d,e)};b.escape=function(a){return(""+a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")};b.result=function(a,c){if(a==null)return null;var d=a[c];return b.isFunction(d)?d.call(a):d};b.mixin=function(a){j(b.functions(a),function(c){M(c,b[c]=a[c])})};var N=0;b.uniqueId=
function(a){var b=N++;return a?a+b:b};b.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var u=/.^/,n={"\\":"\\","'":"'",r:"\r",n:"\n",t:"\t",u2028:"\u2028",u2029:"\u2029"},v;for(v in n)n[n[v]]=v;var O=/\\|'|\r|\n|\t|\u2028|\u2029/g,P=/\\(\\|'|r|n|t|u2028|u2029)/g,w=function(a){return a.replace(P,function(a,b){return n[b]})};b.template=function(a,c,d){d=b.defaults(d||{},b.templateSettings);a="__p+='"+a.replace(O,function(a){return"\\"+n[a]}).replace(d.escape||
u,function(a,b){return"'+\n_.escape("+w(b)+")+\n'"}).replace(d.interpolate||u,function(a,b){return"'+\n("+w(b)+")+\n'"}).replace(d.evaluate||u,function(a,b){return"';\n"+w(b)+"\n;__p+='"})+"';\n";d.variable||(a="with(obj||{}){\n"+a+"}\n");var a="var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n"+a+"return __p;\n",e=new Function(d.variable||"obj","_",a);if(c)return e(c,b);c=function(a){return e.call(this,a,b)};c.source="function("+(d.variable||"obj")+"){\n"+a+"}";return c};
b.chain=function(a){return b(a).chain()};var m=function(a){this._wrapped=a};b.prototype=m.prototype;var x=function(a,c){return c?b(a).chain():a},M=function(a,c){m.prototype[a]=function(){var a=i.call(arguments);J.call(a,this._wrapped);return x(c.apply(b,a),this._chain)}};b.mixin(b);j("pop,push,reverse,shift,sort,splice,unshift".split(","),function(a){var b=k[a];m.prototype[a]=function(){var d=this._wrapped;b.apply(d,arguments);var e=d.length;(a=="shift"||a=="splice")&&e===0&&delete d[0];return x(d,
this._chain)}});j(["concat","join","slice"],function(a){var b=k[a];m.prototype[a]=function(){return x(b.apply(this._wrapped,arguments),this._chain)}});m.prototype.chain=function(){this._chain=true;return this};m.prototype.value=function(){return this._wrapped}}).call(this);
;ChordParserPEG = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "start": parse_start,
        "config": parse_config,
        "config_pairs": parse_config_pairs,
        "config_pair": parse_config_pair,
        "strings": parse_strings,
        "string_def": parse_string_def,
        "fret_markers": parse_fret_markers,
        "fret_marker": parse_fret_marker,
        "fret_config": parse_fret_config,
        "fret_config_pairs": parse_fret_config_pairs,
        "fret_config_pair": parse_fret_config_pair,
        "value": parse_value,
        "h": parse_h,
        "unicode": parse_unicode,
        "escape": parse_escape,
        "string1": parse_string1,
        "string2": parse_string2,
        "string": parse_string,
        "identifier": parse_identifier,
        "nmstart": parse_nmstart,
        "nmchar": parse_nmchar,
        "chars": parse_chars,
        "char": parse_char,
        "integer": parse_integer,
        "number": parse_number,
        "int": parse_int,
        "frac": parse_frac,
        "exp": parse_exp,
        "digits": parse_digits,
        "e": parse_e,
        "digit": parse_digit,
        "digit19": parse_digit19,
        "hexDigit": parse_hexDigit,
        "_": parse__,
        "__": parse___,
        "whitespace": parse_whitespace,
        "sp": parse_sp,
        "nl": parse_nl
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "start";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_start() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse___();
        if (result0 !== null) {
          result1 = parse_config();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse___();
            if (result2 !== null) {
              result3 = parse_strings();
              if (result3 !== null) {
                result4 = parse___();
                if (result4 !== null) {
                  result5 = parse__();
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, config, strings) {
              return {
                config: (config?config:{}),
                strings: strings
              };
            })(pos0, result0[1], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_config() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse__();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 91) {
            result1 = "[";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"[\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_config_pairs();
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 93) {
                result3 = "]";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\"]\"");
                }
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, pairs) { return pairs; })(pos0, result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_config_pairs() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_config_pair();
        if (result0 !== null) {
          result1 = [];
          pos2 = pos;
          result2 = parse__();
          if (result2 !== null) {
            if (input.charCodeAt(pos) === 44) {
              result3 = ",";
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("\",\"");
              }
            }
            if (result3 !== null) {
              result4 = parse_config_pair();
              if (result4 !== null) {
                result2 = [result2, result3, result4];
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
          } else {
            result2 = null;
            pos = pos2;
          }
          while (result2 !== null) {
            result1.push(result2);
            pos2 = pos;
            result2 = parse__();
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 44) {
                result3 = ",";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\",\"");
                }
              }
              if (result3 !== null) {
                result4 = parse_config_pair();
                if (result4 !== null) {
                  result2 = [result2, result3, result4];
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, head, tail) {
              var result = {};
              result[head.key] = head.value;
              for (var i = 0; i < tail.length; i++) {
                var pair = tail[i][2];
                result[pair.key] = pair.value;
              }
              return result;
            })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_config_pair() {
        var result0, result1, result2, result3, result4, result5, result6;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse__();
        if (result0 !== null) {
          result1 = parse_identifier();
          if (result1 !== null) {
            result2 = parse__();
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 61) {
                result3 = "=";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\"=\"");
                }
              }
              if (result3 !== null) {
                result4 = parse__();
                if (result4 !== null) {
                  result5 = parse_value();
                  if (result5 !== null) {
                    result6 = parse__();
                    if (result6 !== null) {
                      result0 = [result0, result1, result2, result3, result4, result5, result6];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, key, val) {
              return { 
                key: key,
                value: val
              };
            })(pos0, result0[1], result0[5]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_strings() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse___();
        if (result0 !== null) {
          result1 = parse_string_def();
          if (result1 !== null) {
            result2 = [];
            pos2 = pos;
            pos3 = pos;
            result4 = parse__();
            if (result4 !== null) {
              result5 = parse_nl();
              if (result5 !== null) {
                result4 = [result4, result5];
              } else {
                result4 = null;
                pos = pos3;
              }
            } else {
              result4 = null;
              pos = pos3;
            }
            if (result4 !== null) {
              result3 = [];
              while (result4 !== null) {
                result3.push(result4);
                pos3 = pos;
                result4 = parse__();
                if (result4 !== null) {
                  result5 = parse_nl();
                  if (result5 !== null) {
                    result4 = [result4, result5];
                  } else {
                    result4 = null;
                    pos = pos3;
                  }
                } else {
                  result4 = null;
                  pos = pos3;
                }
              }
            } else {
              result3 = null;
            }
            if (result3 !== null) {
              result4 = parse_string_def();
              if (result4 !== null) {
                result3 = [result3, result4];
              } else {
                result3 = null;
                pos = pos2;
              }
            } else {
              result3 = null;
              pos = pos2;
            }
            while (result3 !== null) {
              result2.push(result3);
              pos2 = pos;
              pos3 = pos;
              result4 = parse__();
              if (result4 !== null) {
                result5 = parse_nl();
                if (result5 !== null) {
                  result4 = [result4, result5];
                } else {
                  result4 = null;
                  pos = pos3;
                }
              } else {
                result4 = null;
                pos = pos3;
              }
              if (result4 !== null) {
                result3 = [];
                while (result4 !== null) {
                  result3.push(result4);
                  pos3 = pos;
                  result4 = parse__();
                  if (result4 !== null) {
                    result5 = parse_nl();
                    if (result5 !== null) {
                      result4 = [result4, result5];
                    } else {
                      result4 = null;
                      pos = pos3;
                    }
                  } else {
                    result4 = null;
                    pos = pos3;
                  }
                }
              } else {
                result3 = null;
              }
              if (result3 !== null) {
                result4 = parse_string_def();
                if (result4 !== null) {
                  result3 = [result3, result4];
                } else {
                  result3 = null;
                  pos = pos2;
                }
              } else {
                result3 = null;
                pos = pos2;
              }
            }
            if (result2 !== null) {
              result3 = parse___();
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, head, tail) {
              var result = {};
              result[head.string] = {
                string: head.string,
                frets: head.frets
              };
              for (var i = 0; i < tail.length; i++) {
                var str = tail[i][1];
                if(!result[str.string]) {
                  result[str.string] = {
                    string: str.string,
                    frets: str.frets
                  };
                } else {
                  for (var j = 0; j < str.frets.length; j++) {
                    result[str.string].frets.push(str.frets[j]);
                  }
                }
              }
              return result;
            })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_string_def() {
        var result0, result1, result2, result3, result4, result5, result6;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse__();
        if (result0 !== null) {
          result1 = parse_integer();
          if (result1 !== null) {
            result2 = parse__();
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 58) {
                result3 = ":";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\":\"");
                }
              }
              if (result3 !== null) {
                result4 = parse__();
                if (result4 !== null) {
                  result5 = parse_fret_markers();
                  if (result5 !== null) {
                    result6 = parse__();
                    if (result6 !== null) {
                      result0 = [result0, result1, result2, result3, result4, result5, result6];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, string, frets) {
              return {
                string: string,
                frets: frets
              }
            })(pos0, result0[1], result0[5]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_fret_markers() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_fret_marker();
        if (result0 !== null) {
          result1 = [];
          pos2 = pos;
          result2 = parse__();
          if (result2 !== null) {
            if (input.charCodeAt(pos) === 44) {
              result3 = ",";
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("\",\"");
              }
            }
            if (result3 !== null) {
              result4 = parse__();
              if (result4 !== null) {
                result5 = parse_fret_marker();
                if (result5 !== null) {
                  result2 = [result2, result3, result4, result5];
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
          } else {
            result2 = null;
            pos = pos2;
          }
          while (result2 !== null) {
            result1.push(result2);
            pos2 = pos;
            result2 = parse__();
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 44) {
                result3 = ",";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\",\"");
                }
              }
              if (result3 !== null) {
                result4 = parse__();
                if (result4 !== null) {
                  result5 = parse_fret_marker();
                  if (result5 !== null) {
                    result2 = [result2, result3, result4, result5];
                  } else {
                    result2 = null;
                    pos = pos2;
                  }
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, head, tail) {
              var result = [head];
              for (var i = 0; i < tail.length; i++) {
                result.push(tail[i][3]);
              }
              return result;
            })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_fret_marker() {
        var result0, result1, result2, result3, result4, result5, result6, result7, result8;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_integer();
        if (result0 === null) {
          if (/^[TtXxMm]/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[TtXxMm]");
            }
          }
        }
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            result2 = parse_fret_config();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, fret, config) { 
              if (config !== "") { return { fret: fret, config: (config==""?{}:config) }; }
              else { return { fret: fret }; }
            })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          if (input.charCodeAt(pos) === 123) {
            result0 = "{";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"{\"");
            }
          }
          if (result0 !== null) {
            result1 = parse__();
            if (result1 !== null) {
              result2 = parse_integer();
              if (result2 === null) {
                if (/^[XxMm]/.test(input.charAt(pos))) {
                  result2 = input.charAt(pos);
                  pos++;
                } else {
                  result2 = null;
                  if (reportFailures === 0) {
                    matchFailed("[XxMm]");
                  }
                }
              }
              if (result2 !== null) {
                result3 = parse__();
                if (result3 !== null) {
                  result4 = parse_integer();
                  if (result4 === null) {
                    if (/^[TtXxMm]/.test(input.charAt(pos))) {
                      result4 = input.charAt(pos);
                      pos++;
                    } else {
                      result4 = null;
                      if (reportFailures === 0) {
                        matchFailed("[TtXxMm]");
                      }
                    }
                  }
                  if (result4 !== null) {
                    result5 = parse__();
                    if (result5 !== null) {
                      if (input.charCodeAt(pos) === 125) {
                        result6 = "}";
                        pos++;
                      } else {
                        result6 = null;
                        if (reportFailures === 0) {
                          matchFailed("\"}\"");
                        }
                      }
                      if (result6 !== null) {
                        result7 = parse__();
                        if (result7 !== null) {
                          result8 = parse_fret_config();
                          result8 = result8 !== null ? result8 : "";
                          if (result8 !== null) {
                            result0 = [result0, result1, result2, result3, result4, result5, result6, result7, result8];
                          } else {
                            result0 = null;
                            pos = pos1;
                          }
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, fret, finger, config) {
                if (config !== "") { return { fret: fret, finger: ""+finger, config: (config==""?{}:config) }; }
                else { return { fret: fret, finger: ""+finger }; }
              })(pos0, result0[2], result0[4], result0[8]);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_fret_config() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 40) {
          result0 = "(";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"(\"");
          }
        }
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 41) {
              result2 = ")";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\")\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return {}; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          if (input.charCodeAt(pos) === 40) {
            result0 = "(";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"(\"");
            }
          }
          if (result0 !== null) {
            result1 = parse__();
            if (result1 !== null) {
              result2 = parse_fret_config_pairs();
              if (result2 !== null) {
                result3 = parse__();
                if (result3 !== null) {
                  if (input.charCodeAt(pos) === 41) {
                    result4 = ")";
                    pos++;
                  } else {
                    result4 = null;
                    if (reportFailures === 0) {
                      matchFailed("\")\"");
                    }
                  }
                  if (result4 !== null) {
                    result0 = [result0, result1, result2, result3, result4];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, pairs) { return pairs; })(pos0, result0[2]);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_fret_config_pairs() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_fret_config_pair();
        if (result0 !== null) {
          result1 = [];
          pos2 = pos;
          result2 = parse__();
          if (result2 !== null) {
            if (input.charCodeAt(pos) === 59) {
              result3 = ";";
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("\";\"");
              }
            }
            if (result3 !== null) {
              result4 = parse__();
              if (result4 !== null) {
                result5 = parse_fret_config_pair();
                if (result5 !== null) {
                  result2 = [result2, result3, result4, result5];
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
          } else {
            result2 = null;
            pos = pos2;
          }
          while (result2 !== null) {
            result1.push(result2);
            pos2 = pos;
            result2 = parse__();
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 59) {
                result3 = ";";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\";\"");
                }
              }
              if (result3 !== null) {
                result4 = parse__();
                if (result4 !== null) {
                  result5 = parse_fret_config_pair();
                  if (result5 !== null) {
                    result2 = [result2, result3, result4, result5];
                  } else {
                    result2 = null;
                    pos = pos2;
                  }
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 59) {
              result2 = ";";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\";\"");
              }
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, head, tail) {
              var result = {};
              result[head.key] = head.value;
              for (var i = 0; i < tail.length; i++) {
                var pair = tail[i][3];
                result[pair.key] = pair.value;
              }
              return result;
            })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_fret_config_pair() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_identifier();
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 58) {
              result2 = ":";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\":\"");
              }
            }
            if (result2 !== null) {
              result3 = parse__();
              if (result3 !== null) {
                result4 = parse_value();
                if (result4 === null) {
                  result4 = parse_identifier();
                }
                if (result4 !== null) {
                  result5 = parse__();
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, key, value) { 
              return { key: key, value: value };
            })(pos0, result0[0], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_value() {
        var result0, result1;
        var pos0, pos1;
        
        result0 = parse_string();
        if (result0 === null) {
          result0 = parse_number();
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            if (input.substr(pos, 4) === "true") {
              result0 = "true";
              pos += 4;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"true\"");
              }
            }
            if (result0 !== null) {
              result1 = parse__();
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset) { return true;  })(pos0);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              pos1 = pos;
              if (input.substr(pos, 5) === "false") {
                result0 = "false";
                pos += 5;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"false\"");
                }
              }
              if (result0 !== null) {
                result1 = parse__();
                if (result1 !== null) {
                  result0 = [result0, result1];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
              if (result0 !== null) {
                result0 = (function(offset) { return false; })(pos0);
              }
              if (result0 === null) {
                pos = pos0;
              }
            }
          }
        }
        return result0;
      }
      
      function parse_h() {
        var result0;
        
        if (/^[0-9a-fA-F]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9a-fA-F]");
          }
        }
        return result0;
      }
      
      function parse_unicode() {
        var result0, result1, result2, result3, result4, result5, result6;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 92) {
          result0 = "\\";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\\"");
          }
        }
        if (result0 !== null) {
          pos2 = pos;
          result1 = parse_h();
          if (result1 !== null) {
            result2 = parse_h();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result3 = parse_h();
              result3 = result3 !== null ? result3 : "";
              if (result3 !== null) {
                result4 = parse_h();
                result4 = result4 !== null ? result4 : "";
                if (result4 !== null) {
                  result5 = parse_h();
                  result5 = result5 !== null ? result5 : "";
                  if (result5 !== null) {
                    result6 = parse_h();
                    result6 = result6 !== null ? result6 : "";
                    if (result6 !== null) {
                      result1 = [result1, result2, result3, result4, result5, result6];
                    } else {
                      result1 = null;
                      pos = pos2;
                    }
                  } else {
                    result1 = null;
                    pos = pos2;
                  }
                } else {
                  result1 = null;
                  pos = pos2;
                }
              } else {
                result1 = null;
                pos = pos2;
              }
            } else {
              result1 = null;
              pos = pos2;
            }
          } else {
            result1 = null;
            pos = pos2;
          }
          if (result1 !== null) {
            if (input.substr(pos, 2) === "\r\n") {
              result2 = "\r\n";
              pos += 2;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\r\\n\"");
              }
            }
            if (result2 === null) {
              if (/^[ \t\r\n\f]/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[ \\t\\r\\n\\f]");
                }
              }
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, digits) {
              return String.fromCharCode(parseInt(digits.join(""), 16));
            })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_escape() {
        var result0, result1;
        var pos0, pos1;
        
        result0 = parse_unicode();
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          if (input.charCodeAt(pos) === 92) {
            result0 = "\\";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\\\\"");
            }
          }
          if (result0 !== null) {
            if (/^[^\r\n\f0-9a-fA-F]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[^\\r\\n\\f0-9a-fA-F]");
              }
            }
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, char_) { return char_; })(pos0, result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_string1() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 34) {
          result0 = "\"";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\"\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          if (/^[^\n\r\f\\"]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[^\\n\\r\\f\\\\\"]");
            }
          }
          if (result2 === null) {
            pos2 = pos;
            pos3 = pos;
            if (input.charCodeAt(pos) === 92) {
              result2 = "\\";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\\\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_nl();
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos3;
              }
            } else {
              result2 = null;
              pos = pos3;
            }
            if (result2 !== null) {
              result2 = (function(offset, nl) { return nl })(pos2, result2[1]);
            }
            if (result2 === null) {
              pos = pos2;
            }
            if (result2 === null) {
              result2 = parse_escape();
            }
          }
          while (result2 !== null) {
            result1.push(result2);
            if (/^[^\n\r\f\\"]/.test(input.charAt(pos))) {
              result2 = input.charAt(pos);
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[^\\n\\r\\f\\\\\"]");
              }
            }
            if (result2 === null) {
              pos2 = pos;
              pos3 = pos;
              if (input.charCodeAt(pos) === 92) {
                result2 = "\\";
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("\"\\\\\"");
                }
              }
              if (result2 !== null) {
                result3 = parse_nl();
                if (result3 !== null) {
                  result2 = [result2, result3];
                } else {
                  result2 = null;
                  pos = pos3;
                }
              } else {
                result2 = null;
                pos = pos3;
              }
              if (result2 !== null) {
                result2 = (function(offset, nl) { return nl })(pos2, result2[1]);
              }
              if (result2 === null) {
                pos = pos2;
              }
              if (result2 === null) {
                result2 = parse_escape();
              }
            }
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 34) {
              result2 = "\"";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\"\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) {
              return chars.join("");
            })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_string2() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 39) {
          result0 = "'";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"'\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          if (/^[^\n\r\f\\']/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[^\\n\\r\\f\\\\']");
            }
          }
          if (result2 === null) {
            pos2 = pos;
            pos3 = pos;
            if (input.charCodeAt(pos) === 92) {
              result2 = "\\";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\\\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_nl();
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos3;
              }
            } else {
              result2 = null;
              pos = pos3;
            }
            if (result2 !== null) {
              result2 = (function(offset, nl) { return nl })(pos2, result2[1]);
            }
            if (result2 === null) {
              pos = pos2;
            }
            if (result2 === null) {
              result2 = parse_escape();
            }
          }
          while (result2 !== null) {
            result1.push(result2);
            if (/^[^\n\r\f\\']/.test(input.charAt(pos))) {
              result2 = input.charAt(pos);
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[^\\n\\r\\f\\\\']");
              }
            }
            if (result2 === null) {
              pos2 = pos;
              pos3 = pos;
              if (input.charCodeAt(pos) === 92) {
                result2 = "\\";
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("\"\\\\\"");
                }
              }
              if (result2 !== null) {
                result3 = parse_nl();
                if (result3 !== null) {
                  result2 = [result2, result3];
                } else {
                  result2 = null;
                  pos = pos3;
                }
              } else {
                result2 = null;
                pos = pos3;
              }
              if (result2 !== null) {
                result2 = (function(offset, nl) { return nl })(pos2, result2[1]);
              }
              if (result2 === null) {
                pos = pos2;
              }
              if (result2 === null) {
                result2 = parse_escape();
              }
            }
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 39) {
              result2 = "'";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"'\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) {
              return chars.join("");
            })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_string() {
        var result0;
        
        reportFailures++;
        result0 = parse_string1();
        if (result0 === null) {
          result0 = parse_string2();
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("string");
        }
        return result0;
      }
      
      function parse_identifier() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 45) {
          result0 = "-";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"-\"");
          }
        }
        result0 = result0 !== null ? result0 : "";
        if (result0 !== null) {
          result1 = parse_nmstart();
          if (result1 !== null) {
            result2 = [];
            result3 = parse_nmchar();
            while (result3 !== null) {
              result2.push(result3);
              result3 = parse_nmchar();
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, dash, nmstart, nmchars) {
              return (dash !== null ? dash : "") + nmstart + nmchars.join("");
            })(pos0, result0[0], result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_nmstart() {
        var result0;
        
        if (/^[_a-zA-Z]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[_a-zA-Z]");
          }
        }
        return result0;
      }
      
      function parse_nmchar() {
        var result0;
        
        if (/^[_a-zA-Z0-9\-]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[_a-zA-Z0-9\\-]");
          }
        }
        return result0;
      }
      
      function parse_chars() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result1 = parse_char();
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_char();
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) { return chars.join(""); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_char() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2;
        
        if (/^[^"\\\0-\x1F]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[^\"\\\\\\0-\\x1F]");
          }
        }
        if (result0 === null) {
          pos0 = pos;
          if (input.substr(pos, 2) === "\\\"") {
            result0 = "\\\"";
            pos += 2;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\\\\\\"\"");
            }
          }
          if (result0 !== null) {
            result0 = (function(offset) { return '"';  })(pos0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            if (input.substr(pos, 2) === "\\\\") {
              result0 = "\\\\";
              pos += 2;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\\\\\\\"");
              }
            }
            if (result0 !== null) {
              result0 = (function(offset) { return "\\"; })(pos0);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              if (input.substr(pos, 2) === "\\/") {
                result0 = "\\/";
                pos += 2;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"\\\\/\"");
                }
              }
              if (result0 !== null) {
                result0 = (function(offset) { return "/";  })(pos0);
              }
              if (result0 === null) {
                pos = pos0;
              }
              if (result0 === null) {
                pos0 = pos;
                if (input.substr(pos, 2) === "\\b") {
                  result0 = "\\b";
                  pos += 2;
                } else {
                  result0 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"\\\\b\"");
                  }
                }
                if (result0 !== null) {
                  result0 = (function(offset) { return "\b"; })(pos0);
                }
                if (result0 === null) {
                  pos = pos0;
                }
                if (result0 === null) {
                  pos0 = pos;
                  if (input.substr(pos, 2) === "\\f") {
                    result0 = "\\f";
                    pos += 2;
                  } else {
                    result0 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"\\\\f\"");
                    }
                  }
                  if (result0 !== null) {
                    result0 = (function(offset) { return "\f"; })(pos0);
                  }
                  if (result0 === null) {
                    pos = pos0;
                  }
                  if (result0 === null) {
                    pos0 = pos;
                    if (input.substr(pos, 2) === "\\n") {
                      result0 = "\\n";
                      pos += 2;
                    } else {
                      result0 = null;
                      if (reportFailures === 0) {
                        matchFailed("\"\\\\n\"");
                      }
                    }
                    if (result0 !== null) {
                      result0 = (function(offset) { return "\n"; })(pos0);
                    }
                    if (result0 === null) {
                      pos = pos0;
                    }
                    if (result0 === null) {
                      pos0 = pos;
                      if (input.substr(pos, 2) === "\\r") {
                        result0 = "\\r";
                        pos += 2;
                      } else {
                        result0 = null;
                        if (reportFailures === 0) {
                          matchFailed("\"\\\\r\"");
                        }
                      }
                      if (result0 !== null) {
                        result0 = (function(offset) { return "\r"; })(pos0);
                      }
                      if (result0 === null) {
                        pos = pos0;
                      }
                      if (result0 === null) {
                        pos0 = pos;
                        if (input.substr(pos, 2) === "\\t") {
                          result0 = "\\t";
                          pos += 2;
                        } else {
                          result0 = null;
                          if (reportFailures === 0) {
                            matchFailed("\"\\\\t\"");
                          }
                        }
                        if (result0 !== null) {
                          result0 = (function(offset) { return "\t"; })(pos0);
                        }
                        if (result0 === null) {
                          pos = pos0;
                        }
                        if (result0 === null) {
                          pos0 = pos;
                          pos1 = pos;
                          if (input.substr(pos, 2) === "\\u") {
                            result0 = "\\u";
                            pos += 2;
                          } else {
                            result0 = null;
                            if (reportFailures === 0) {
                              matchFailed("\"\\\\u\"");
                            }
                          }
                          if (result0 !== null) {
                            pos2 = pos;
                            result1 = parse_hexDigit();
                            if (result1 !== null) {
                              result2 = parse_hexDigit();
                              if (result2 !== null) {
                                result3 = parse_hexDigit();
                                if (result3 !== null) {
                                  result4 = parse_hexDigit();
                                  if (result4 !== null) {
                                    result1 = [result1, result2, result3, result4];
                                  } else {
                                    result1 = null;
                                    pos = pos2;
                                  }
                                } else {
                                  result1 = null;
                                  pos = pos2;
                                }
                              } else {
                                result1 = null;
                                pos = pos2;
                              }
                            } else {
                              result1 = null;
                              pos = pos2;
                            }
                            if (result1 !== null) {
                              result0 = [result0, result1];
                            } else {
                              result0 = null;
                              pos = pos1;
                            }
                          } else {
                            result0 = null;
                            pos = pos1;
                          }
                          if (result0 !== null) {
                            result0 = (function(offset, digits) {
                                return String.fromCharCode(parseInt("0x" + digits.join("")));
                              })(pos0, result0[1]);
                          }
                          if (result0 === null) {
                            pos = pos0;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_integer() {
        var result0, result1;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        result0 = parse_int();
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, parts) { return parseFloat(parts); })(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("integer");
        }
        return result0;
      }
      
      function parse_number() {
        var result0, result1, result2;
        var pos0, pos1, pos2;
        
        reportFailures++;
        pos0 = pos;
        pos1 = pos;
        pos2 = pos;
        result0 = parse_int();
        if (result0 !== null) {
          result1 = parse_frac();
          if (result1 !== null) {
            result2 = parse_exp();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos2;
            }
          } else {
            result0 = null;
            pos = pos2;
          }
        } else {
          result0 = null;
          pos = pos2;
        }
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, parts) { return parseFloat(parts.join("")); })(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          pos2 = pos;
          result0 = parse_int();
          if (result0 !== null) {
            result1 = parse_frac();
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos2;
            }
          } else {
            result0 = null;
            pos = pos2;
          }
          if (result0 !== null) {
            result1 = parse__();
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, parts) { return parseFloat(parts.join("")); })(pos0, result0[0]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            pos2 = pos;
            result0 = parse_int();
            if (result0 !== null) {
              result1 = parse_exp();
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos2;
              }
            } else {
              result0 = null;
              pos = pos2;
            }
            if (result0 !== null) {
              result1 = parse__();
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset, parts) { return parseFloat(parts.join("")); })(pos0, result0[0]);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              pos1 = pos;
              result0 = parse_int();
              if (result0 !== null) {
                result1 = parse__();
                if (result1 !== null) {
                  result0 = [result0, result1];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
              if (result0 !== null) {
                result0 = (function(offset, parts) { return parseFloat(parts); })(pos0, result0[0]);
              }
              if (result0 === null) {
                pos = pos0;
              }
            }
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("number");
        }
        return result0;
      }
      
      function parse_int() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_digit19();
        if (result0 !== null) {
          result1 = parse_digits();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, left, rest) { return left + rest; })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_digit();
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            if (input.charCodeAt(pos) === 45) {
              result0 = "-";
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"-\"");
              }
            }
            if (result0 !== null) {
              result1 = parse_digit19();
              if (result1 !== null) {
                result2 = parse_digits();
                if (result2 !== null) {
                  result0 = [result0, result1, result2];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset, left, rest) { return "-" + left + rest; })(pos0, result0[1], result0[2]);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              pos1 = pos;
              if (input.charCodeAt(pos) === 45) {
                result0 = "-";
                pos++;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"-\"");
                }
              }
              if (result0 !== null) {
                result1 = parse_digit();
                if (result1 !== null) {
                  result0 = [result0, result1];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
              if (result0 !== null) {
                result0 = (function(offset, digit) { return "-" + digit; })(pos0, result0[1]);
              }
              if (result0 === null) {
                pos = pos0;
              }
            }
          }
        }
        return result0;
      }
      
      function parse_frac() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 46) {
          result0 = ".";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\".\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_digits();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, digits) { return "." + digits; })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_exp() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_e();
        if (result0 !== null) {
          result1 = parse_digits();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, digits) { return "e" + digits; })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_digits() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result1 = parse_digit();
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_digit();
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, digits) { return digits.join(""); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_e() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (/^[eE]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[eE]");
          }
        }
        if (result0 !== null) {
          if (/^[+\-]/.test(input.charAt(pos))) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[+\\-]");
            }
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, e, sign) { return e + sign; })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_digit() {
        var result0;
        
        if (/^[0-9]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9]");
          }
        }
        return result0;
      }
      
      function parse_digit19() {
        var result0;
        
        if (/^[1-9]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[1-9]");
          }
        }
        return result0;
      }
      
      function parse_hexDigit() {
        var result0;
        
        if (/^[0-9a-fA-F]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9a-fA-F]");
          }
        }
        return result0;
      }
      
      function parse__() {
        var result0, result1;
        
        reportFailures++;
        result0 = [];
        result1 = parse_sp();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_sp();
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("linespace");
        }
        return result0;
      }
      
      function parse___() {
        var result0, result1, result2;
        var pos0;
        
        reportFailures++;
        result0 = [];
        pos0 = pos;
        result1 = parse__();
        if (result1 !== null) {
          result2 = parse_nl();
          if (result2 !== null) {
            result1 = [result1, result2];
          } else {
            result1 = null;
            pos = pos0;
          }
        } else {
          result1 = null;
          pos = pos0;
        }
        while (result1 !== null) {
          result0.push(result1);
          pos0 = pos;
          result1 = parse__();
          if (result1 !== null) {
            result2 = parse_nl();
            if (result2 !== null) {
              result1 = [result1, result2];
            } else {
              result1 = null;
              pos = pos0;
            }
          } else {
            result1 = null;
            pos = pos0;
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("whitespace");
        }
        return result0;
      }
      
      function parse_whitespace() {
        var result0;
        
        if (/^[ \t\n\r\f]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[ \\t\\n\\r\\f]");
          }
        }
        return result0;
      }
      
      function parse_sp() {
        var result0;
        
        if (/^[ \t]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[ \\t]");
          }
        }
        return result0;
      }
      
      function parse_nl() {
        var result0;
        
        if (/^[\n\r\f]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[\\n\\r\\f]");
          }
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();