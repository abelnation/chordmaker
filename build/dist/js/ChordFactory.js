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
