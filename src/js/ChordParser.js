// ChordParser
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

    // TODO: (aallison) handle default color for parser
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

    // TODO: (aallison) create ChordModel
    var model = new ChordModel();
    // TODO: (aallison) add notes to model

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

        // TODO: (aallison) you can only config color right now
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
