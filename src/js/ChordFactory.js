/* global _, Chords */

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

      this.parser = ChordParserPEG;
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

      if (!element || (_.isString(element) && element === "")) {
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
        console.log(chordStr);
        console.log(e);
        throw e;
      }

      // Pre-fab styles get over-ridden by options specified in chord string
      var style_val = $(element).attr("data-style");
      if (_.has(ChordView.OPTIONS, style_val)) {
        _.defaults(parseResult.config, ChordView.OPTIONS[style_val]);
        console.log(parseResult.config);
      }

      var model = this._chordModelFromParseResult(parseResult);
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
