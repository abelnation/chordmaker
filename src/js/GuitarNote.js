
function GuitarNote(string, fret, options) {
  // This first guard ensures that the callee has invoked our Class' constructor function
  // with the `new` keyword - failure to do this will result in the `this` keyword referring 
  // to the callee's scope (typically the window global) which will result in the following fields
  // (name and _age) leaking into the global namespace and not being set on this object.
  if (!(this instanceof GuitarNote)) {
    throw new TypeError("GuitarNote constructor cannot be called as a function.");
  }
  if(!options) { options = {}; }

  this._init(string, fret, options);
}

// CONSTANTS
GuitarNote.DEFAULT_OPTIONS = {
  muted: false,
  finger: null,
  tonic: false,
};
GuitarNote.MUTE_ANNOTATION = "x";

GuitarNote.prototype = {
  /**
   * Whenever you replace an Object's Prototype, you need to repoint
   * the base Constructor back at the original constructor Function, 
   * otherwise `instanceof` calls will fail.
   */
  constructor: GuitarNote,

  _init: function(string, fret, options) {
    // Create config dict, filling in defaults where not provided
    _.defaults(options, GuitarNote.DEFAULT_OPTIONS);
    if (string===undefined || string===null ||
        !_.isNumber(string) || string < 0) {
      throw TypeError("Please provide a valid string number >= 0: " + string);
    }
    if (!options.muted && (fret===undefined || fret===null ||
        !_.isNumber(fret) || fret < 0)) {
      throw TypeError("Please provide a valid fret number >= 0");
    }
    if (options.finger &&
        (!_.isNumber(options.finger) ||
        options.finger < 1 || options.finger > 5)) {
      throw TypeError("Invalid finger number: " + options.finger);
    }
    if (options.finger && options.muted) {
      throw TypeError("Note cannot have a finger annotation and be muted at same time.");
    }

    this.string = string;
    this.fret = fret;
    this.muted = options.muted;
    this.finger = options.finger;
  },

  isOpen: function() {
    return this.fret === 0;
  },
  getKey: function() {
    if(this.muted) {
      return this.string + " " + GuitarNote.MUTE_ANNOTATION;
    } else {
      return this.string + " " + this.fret;
    }
  },

  toString: function() {
    // TODO: implement
    var result = "String: " + this.string + ", Fret: " + this.fret;
    if (this.muted) { result += ", Finger: " + GuitarNote.MUTE_ANNOTATION; }
    else if (this.finger) { result += ", Finger: " + this.finger; }
    return result;
  },
};