// music
// -----

// AexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements some standard music theory routines.

function Aex() {}
Aex.Flow = {};
Aex.Flow.Music = function() {};

// Music Theory Data
// -----------------

Aex.Flow.Music.NUM_TONES = 12;
Aex.Flow.Music.roots = [ "c", "d", "e", "f", "g", "a", "b" ];
Aex.Flow.Music.root_values = [ 0, 2, 4, 5, 7, 9, 11 ];

// Valid note symbols
Aex.Flow.Music.root_indices = {
  "c": 0,
  "d": 1,
  "e": 2,
  "f": 3,
  "g": 4,
  "a": 5,
  "b": 6
};

// Valid accidental symbols
Aex.Flow.Music.accidentals = [ "bb", "b", "n", "#", "##" ];

// A mapping of integers to note names
Aex.Flow.Music.canonical_notes = [
  "c", "c#", "d", "d#",
  "e", "f", "f#", "g",
  "g#", "a", "a#", "b"
];

// Valid note names mapped to root and note values
Aex.Flow.Music.noteValues = {
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

Aex.Flow.Music.diatonic_intervals = [
  "unison", "m2", "M2", "m3", "M3",
  "p4", "dim5", "p5", "m6", "M6",
  "b7", "M7", "octave"
];

Aex.Flow.Music.diatonic_accidentals = {
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

Aex.Flow.Music.intervals = {
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
Aex.Flow.Music.scales = {
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
Aex.Flow.Music.arpeggios = {
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
Aex.Flow.Music.prototype.isValidNoteValue = function(note) {
  // - `note` : integer

  if (note == null || note < 0 || note >= Aex.Flow.Music.NUM_TONES) {
    return false;
  }
  return true;
};

// **isValidIntervalValue** Validates interval value
Aex.Flow.Music.prototype.isValidIntervalValue = function(interval) {
  // - `interval` : integer

  // TODO: Support Intervals greater than an octave
  return this.isValidNoteValue(interval);
};

// **getNoteParts** Splits note string into root and accidental
Aex.Flow.Music.prototype.getNoteParts = function(noteString) {
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
};

// **getKeyParts** Splits key string into root, accidental, and scale type
Aex.Flow.Music.prototype.getKeyParts = function(keyString) {
  //  - `keyString` : string

  //     music.getKeyParts("c#m") -> { root: "c", accidental: "#", type: "m" }

  if (!keyString || keyString.length < 1) {
    throw new Aex.RERR("BadArguments", "Invalid key: " + keyString);
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
    throw new Aex.RERR("BadArguments", "Invalid key: " + keyString);
  }
};

// **getNoteValue** Returns integer note value for a note string (including accidentals)
Aex.Flow.Music.prototype.getNoteValue = function(noteString) {
  // - `noteString` : string

  //     music.getNoteValue("c#") -> 1

  var value = Aex.Flow.Music.noteValues[noteString.toLowerCase()];
  if (value == null) {
    throw new Aex.RERR("BadArguments", "Invalid note name: " + noteString);
  }

  return value.int_val;
};

// **getIntervalValue** Returns integer value representing distance of an interval
Aex.Flow.Music.prototype.getIntervalValue = function(intervalString) {
  // - `intervalString` : string

  //     music.getIntervalValue("m3") -> 3

  var value = Aex.Flow.Music.intervals[intervalString];
  if (value == null) {
    throw new Aex.RERR("BadArguments",
                       "Invalid interval name: " + intervalString);
  }

  return value;
};

// **getCanonicalNoteName** Returns a note name for a given note value
Aex.Flow.Music.prototype.getCanonicalNoteName = function(noteValue) {
  // - `noteValue` : integer

  //     music.getCanonicalNoteName(6) -> "f#"

  if (!this.isValidNoteValue(noteValue)) {
    throw new Aex.RERR("BadArguments",
                       "Invalid note value: " + noteValue);
  }

  return Aex.Flow.Music.canonical_notes[noteValue];
};

// **getCanonicalIntervalName** Returns an interval name for a given interval value
Aex.Flow.Music.prototype.getCanonicalIntervalName = function(intervalValue) {
  // - `intervalValue` : integer

  //     music.getCanonicalIntervalName(6) -> "dim5"

  if (!this.isValidIntervalValue(intervalValue)) {
    throw new Aex.RERR("BadArguments",
                       "Invalid interval value: " + intervalValue);
  }

  return Aex.Flow.Music.diatonic_intervals[intervalValue];
};

// **getRelativeNoteValue** Calculates noteValue of an intervale based a a note
Aex.Flow.Music.prototype.getRelativeNoteValue = function(noteValue, intervalValue, direction) {
  // - `noteValue` : integer
  // - `intervalValue` : integer
  // - `direction` : `1` or `-1`

  //     music.getRelativeNoteValue(0, 3, 1) -> 3
  //     music.getRelativeNoteValue(2, 3, -1) -> 11

  if (direction == null) { direction = 1; }
  if (direction != 1 && direction != -1) {
    throw new Aex.RERR("BadArguments", "Invalid direction: " + direction);
  }

  var sum = (noteValue + (direction * intervalValue)) %
    Aex.Flow.Music.NUM_TONES;
  if (sum < 0) { sum += Aex.Flow.Music.NUM_TONES; }

  return sum;
};

// **getScaleTones** Returns scale tones, given intervals. Each successive interval is
// relative to the previous one, e.g., Major Scale:
//
// TTSTTTS = `[2,2,1,2,2,2,1]`
//
// When used with key = 0, returns C scale (which is isomorphic to
// interval list).
Aex.Flow.Music.prototype.getScaleTones = function(keyValue, intervals) {
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
Aex.Flow.Music.prototype.getIntervalBetween = function(note1, note2, direction) {
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

  if (difference < 0) { difference += Aex.Flow.Music.NUM_TONES; }
  return difference;
};
