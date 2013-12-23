// Voicings
// --------

/* global Aex, GuitarNote, Tuning, ChordModel */

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
      { "key":"c", "label": "M",      "notes": [3,3,5,5,5,"x"],       "fingers": [1,1,3,3,3,"x"],     "bass": 7,  "tags": "gypsy", },
      { "key":"c", "label": "M",      "notes": [8,10,10,9,8,8],       "fingers": ["T",3,4,2,1,1],                 "tags": "gypsy", },
      { "key":"c", "label": "M",      "notes": [12,"x",10,12,13,"x"], "fingers": [2,"x",1,3,4,"x"],   "bass": 4,  "tags": "gypsy", },
      { "key":"c", "label": "M",      "notes": [12,"x",14,12,13,"x"], "fingers": ["T","x",3,1,2,"x"], "bass": 4,  "tags": "gypsy", },
      { "key":"c", "label": "M6",     "notes": [3,3,5,5,5,5],         "fingers": [1,1,3,3,3,3],       "bass": 7,  "tags": "gypsy", },
      { "key":"c", "label": "M6",     "notes": [8,7,5,5,5,5],         "fingers": [4,3,1,1,1,1],                   "tags": "gypsy", },
      { "key":"c", "label": "M6",     "notes": [8,"x",10,9,10,8],     "fingers": ["T","x",3,2,4,1],               "tags": "gypsy", },
      { "key":"c", "label": "M6/9",   "notes": [3,3,2,2,3,3],         "fingers": [2,2,1,1,3,4],       "bass": 7,  "tags": "gypsy", },
      { "key":"c", "label": "M6/9",   "notes": [8,7,7,7,8,8],         "fingers": [2,1,1,1,3,4],                   "tags": "gypsy", },
      { "key":"c", "label": "M6/9",   "notes": [8,10,10,9,10,10],     "fingers": ["T",2,2,1,3,3],                 "tags": "gypsy", },

      // 7 "Chords
      { "key":"c", "label": "7",      "notes": [3,3,5,3,5,3],         "fingers": [1,1,3,1,4,1],                   "tags": "gypsy", },
      { "key":"c", "label": "7",      "notes": [8,"x",8,9,8,"x"],     "fingers": ["T","x",1,3,2,"x"],             "tags": "gypsy", },
      { "key":"c", "label": "7",      "notes": [8,10,8,9,8,8],        "fingers": [1,3,1,2,1,1],                   "tags": "gypsy", },
      { "key":"c", "label": "7",      "notes": [3,3,2,3,1,"x"],       "fingers": [3,3,2,4,1,"x"],     "bass": 7,  "tags": "gypsy", },
      { "key":"c", "label": "7",      "notes": [8,10,10,9,11],        "fingers": ["T",2,2,1,4,"x"],               "tags": "gypsy", },
      { "key":"c", "label": "7",      "notes": [6,"x",5,5,5,"x"],     "fingers": [2,"x",1,1,1,"x"],   "bass": 10, "tags": "gypsy", },
      { "key":"c", "label": "7",      "notes": [3,3,5,3,5,6],         "fingers": [1,1,2,1,3,4,"x"],   "bass": 7,  "tags": "gypsy", },
      { "key":"c", "label": "7",      "notes": [8,"x",8,9,8,8],       "fingers": ["T","x",1,4,2,3],               "tags": "gypsy", },
      { "key":"c", "label": "7(b9)",  "notes": [3,3,2,3,2,"x"],       "fingers": [2,2,1,3,1,"x"],     "bass": 7,  "tags": "gypsy", },
      { "key":"c", "label": "7(b9)",  "notes": [12,"x",14,12,14,"x"], "fingers": ["T","x",2,1,3,"x"], "bass": 4,  "tags": "gypsy", },

      // "Minor
      { "key":"c", "label": "m",      "notes": [3,3,5,5,4,3],         "fingers": [1,1,3,4,2,1],       "bass": 7,  "tags": "gypsy", },
      { "key":"c", "label": "m",      "notes": [8,10,10,8,8,8],       "fingers": ["T",3,4,1,1,1],                 "tags": "gypsy", },
      { "key":"c", "label": "m",      "notes": [11,"x",10,12,13],     "fingers": [2,"x",1,3,4,"x"],   "bass": 3,  "tags": "gypsy", },
      { "key":"c", "label": "m",      "notes": [11,"x",13,12,13,"x"], "fingers": ["T","x",2,1,3,"x"], "bass": 3,  "tags": "gypsy", },
      { "key":"c", "label": "m6",     "notes": [8,"x",7,8,8,8],       "fingers": [2,"x",1,3,3,3],                 "tags": "gypsy", },
      { "key":"c", "label": "m6",     "notes": ["x",12,13,12,13,"x"], "fingers": ["x",1,3,2,4,"x"],   "bass": 9,  "tags": "gypsy", },
      { "key":"c", "label": "m6",     "notes": [3,3,5,5,4,5],         "fingers": [1,1,3,1,2,1],       "bass": 7,  "tags": "gypsy", },
      { "key":"c", "label": "m6",     "notes": [8,10,10,8,10,"x"],    "fingers": ["T",2,2,1,3,"x"],               "tags": "gypsy", },
      { "key":"c", "label": "m6",     "notes": [8,"x",10,8,10,"x"],   "fingers": ["T","x",3,1,4,"x"],             "tags": "gypsy", },
      { "key":"c", "label": "m6/9",   "notes": [8,10,10,8,10,10],     "fingers": ["T",2,2,1,3,3],                 "tags": "gypsy", },

      // "Diminished
      { "key":"c", "label": "*7",     "notes": ["x",3,4,2,4,"x"],     "fingers": ["x",2,3,1,4,"x"],               "tags": "gypsy", },
      { "key":"c", "label": "*7",     "notes": [8,"x",7,8,7,"x"],     "fingers": [2,"x",1,3,1,"x"],               "tags": "gypsy", },

      // Minor "7
      { "key":"c", "label": "m7",     "notes": [8,"x",8,8,8,8],       "fingers": [2,"x",3,3,3,3],                 "tags": "gypsy", },
      { "key":"c", "label": "m7",     "notes": [3,3,5,3,4,3],         "fingers": [1,1,3,1,2,1],       "bass": 7,  "tags": "gypsy", },
      { "key":"c", "label": "m7",     "notes": [3,"x",1,3,4,"x"],     "fingers": [3,"x",1,3,4,"x"],   "bass": 7,  "tags": "gypsy", },
      { "key":"c", "label": "m7",     "notes": [8,10,8,8,8,8],        "fingers": ["T",3,1,1,1,1],                 "tags": "gypsy", },
      { "key":"c", "label": "m7(b5)", "notes": ["x",3,4,3,4,"x"],     "fingers": ["x",1,3,2,4,"x"],               "tags": "gypsy", },
      { "key":"c", "label": "m7(b5)", "notes": [8,"x",8,8,7,"x"],     "fingers": [2,"x",3,4,1,"x"],               "tags": "gypsy", },
      { "key":"c", "label": "m7(b5)", "notes": [11,"x",10,11,11,11],  "fingers": [2,"x",1,3,3,3],     "bass": 3,  "tags": "gypsy", },
      { "key":"c", "label": "m7(b5)", "notes": [11,13,13,11,13,"x"],  "fingers": ["T",2,2,1,3,"x"],   "bass": 3,  "tags": "gypsy", },
      { "key":"c", "label": "m7(b5)", "notes": [8,"x",8,8,7,8],       "fingers": ["T","x",2,2,1,3],               "tags": "gypsy", },
    ]
  },
  "banjo": {},
  "mandolin": {},
  "test": {
    "eadgbe" : [
      // 5th in the bass
      { "key":"c", "label": "M",    "notes": [3,3,5,5,5,"x"],       "fingers": [1,1,3,3,3,"x"],     "bass": 7 },
      { "key":"c", "label": "M",    "notes": [8,10,10,9,8,8],       "fingers": ["T",3,4,2,1,1],               },
      { "key":"c", "label": "M",    "notes": [12,"x",10,12,13,"x"], "fingers": [2,"x",1,3,4,"x"],   "bass": 4,},
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
  var music = new Aex.Flow.Music();

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

  var music = new Aex.Flow.Music();
  var keyValue = music.getNoteValue(key.toLowerCase());
  var bassValue = music.getRelativeNoteValue(keyValue, offset, 1);
  var bassNoteName = music.getCanonicalNoteName(bassValue);

  return bassNoteName;
};