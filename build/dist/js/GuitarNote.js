
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
