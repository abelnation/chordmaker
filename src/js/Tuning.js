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
    if (!Tuning.isValidTuningString(tuningStr)) {
      throw TypeError("Invalid tuningStr: " + tuningStr);
    }

    this.tuningStr = tuningStr;
    this.notes = Tuning.parseTuningString(tuningStr);
  },

  getNumStrings: function() {
    return this.notes.length;
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
