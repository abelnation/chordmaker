/* global ChordParserPEG */

describe("ChordParserPeg", function() {

  var parser;
  beforeEach(function() {
    parser = ChordParserPEG;
  });

  // Creates a dict in the chord obj indexed by string
  // for easier comparison
  function createCompareDict(chord) {
    var i;
    var j;
    var stringNum;
    var stringObj;
   
    chord.strings_dict = {};

    if (chord.strings === undefined) { return; }
    for (i = 0; i < chord.strings.length; i++) {
      stringObj = chord.strings[i];
      stringNum = chord.strings[i].string;
     
      chord.strings_dict[stringNum] = {};

      if (stringObj.frets === undefined) { continue; }
      for (j = 0; j < stringObj.frets.length; j++) {
        var fretNum = stringObj.frets[j].fret;
        chord.strings_dict[stringNum][fretNum] = stringObj.frets[j];
      }
    }
  }

  function dictedChordsAreEqual(chord1, chord2) {
    var stringObj1;
    var stringObj2;
    var string_key;
    var fret_key;

    console.log(" ");

    // Compare configs
    console.log("1");
    if (!chord1.config) {
      if (chord2.config) { return false; }
    } else {
      if (!chord2.config) { return false; }
    }
    console.log("2");
    if (chord1.config) {
      if (chord1.config.length !== chord2.config.length) { return false; }
      for (var config_key in chord1.config) {

        if (chord1.config[config_key].key !== chord2.config[config_key].key ||
            chord1.config[config_key].value !== chord2.config[config_key].value) {
          console.log(jasmine.pp(chord1.config[config_key]) + " " + jasmine.pp(chord2.config[config_key]));
          return false;
        }
      }
    }
   
    console.log("3");
    if (chord1.strings === undefined && chord2.strings !== undefined) {
      return false;
    } else if (chord1.strings !== undefined && chord2.strings === undefined) {
      return false;
    } else if (chord1.strings.length !== chord2.strings.length) {
      return false;
    }
   
    console.log("4");
    for (string_key in chord1.strings_dict) {
      stringObj1 = chord1.strings_dict[string_key];
      if (chord2.strings_dict[string_key] === undefined) { return false; }
      stringObj2 = chord2.strings_dict[string_key];

      console.log(jasmine.pp(stringObj1));
      console.log(jasmine.pp(stringObj2));

      if (!stringObj2) {
        return false;
      }

      console.log(".");

      for (fret_key in stringObj1) {
        var fret1 = stringObj1[fret_key];
        var fret2 = stringObj2[fret_key];

        if ( !fret2 ) { return false; }
        console.log(jasmine.pp(fret1));
        console.log(jasmine.pp(fret2));
        if ( fret1.fret && fret1.fret !== fret2.fret ) { return false; }
        if ( fret1.finger && fret1.finger !== fret2.finger ) { return false; }
      }
    }

    return true;
  }

  // TODO: put this in a helper
  function chordsAreEqual(chord1, chord2) {
    // Ensures both chords have a dict of strings/frets before
    // actually comparing.
    if (!chord1.strings_dict) {
      createCompareDict(chord1);
      return chordsAreEqual(chord1, chord2);
    } else if (!chord2.strings_dict) {
      createCompareDict(chord2);
      return chordsAreEqual(chord1, chord2);
    }

    return (dictedChordsAreEqual(chord1, chord2) && dictedChordsAreEqual(chord2, chord1));
  }

  it("chordCompare function works", function() {
    var c1 = { config : [ { key : 'base_fret', value : 3 } ], strings : [ { string : 0, frets : [ { fret : 3 } ] } ] };
    var c2 = { config : [ { key : 'base_fret', value : 3 } ], strings : [ { string : 0, frets : [ { fret : 3 } ] } ] };
    expect(chordsAreEqual(c1,c2)).toBe(true);

    c2 = {};
    expect(chordsAreEqual(c1,c2)).toBe(false);

    // string nums diff
    c1 = { config : [ { key : 'base_fret', value : 3 } ], strings : [ { string : 0, frets : [ { fret : 3 } ] } ] };
    c2 = { config : [ { key : 'base_fret', value : 3 } ], strings : [ { string : 1, frets : [ { fret : 3 } ] } ] };
    expect(chordsAreEqual(c1,c2)).toBe(false);

    // fret nums diff
    c1 = { config : [ { key : 'base_fret', value : 3 } ], strings : [ { string : 1, frets : [ { fret : 5 } ] } ] };
    c2 = { config : [ { key : 'base_fret', value : 3 } ], strings : [ { string : 1, frets : [ { fret : 3 } ] } ] };
    expect(chordsAreEqual(c1,c2)).toBe(false);

    // one has finger, other doesn't
    c1 = { config : [ { key : 'base_fret', value : 3 } ], strings : [ { string : 1, frets : [ { fret : 5, finger : '3' } ] } ] };
    c2 = { config : [ { key : 'base_fret', value : 3 } ], strings : [ { string : 1, frets : [ { fret : 3 } ] } ] };
    expect(chordsAreEqual(c1,c2)).toBe(false);

    // diff number of frets
    c1 = { config : [ { key : 'base_fret', value : 3 } ], strings : [ { string : 1, frets : [ { fret : 5 }, { fret : 3 }, ] } ] };
    c2 = { config : [ { key : 'base_fret', value : 3 } ], strings : [ { string : 1, frets : [ { fret : 3 } ] } ] };
    expect(chordsAreEqual(c1,c2)).toBe(false);

    // diff config
    c1 = { config : [ { key : 'base_fret!@#$', value : 3 } ], strings : [ { string : 1, frets : [ { fret : 5 } ] } ] };
    c2 = { config : [ { key : 'base_fret', value : 3 } ], strings : [ { string : 1, frets : [ { fret : 3 } ] } ] };
    expect(chordsAreEqual(c1,c2)).toBe(false);

    // diff config
    c1 = { config : [ { key : 'base_fret', value : 3 } ], strings : [ { string : 1, frets : [ { fret : 5 } ] } ] };
    c2 = { config : [ { key : 'base_fret', value : 5 } ], strings : [ { string : 1, frets : [ { fret : 3 } ] } ] };
    expect(chordsAreEqual(c1,c2)).toBe(false);

    // diff config
    c1 = { config : [ { key : 'base_fret', value : 3 } ], strings : [ { string : 1, frets : [ { fret : 5 } ] } ] };
    c2 = { config : [ { key : 'base_fret', value : 5, foo: "bar" } ], strings : [ { string : 1, frets : [ { fret : 3 } ] } ] };
    expect(chordsAreEqual(c1,c2)).toBe(false);
  });

  it("parses config string", function() {
    var c = "[foo=bar,baz=banksy,a=34,b=2.34]\n" +
            "0:3\n";
    var expected = {
      config : [
        { 'key': 'foo', 'value': 'bar' },
        { 'key': 'baz', 'value': 'banksy' },
        { 'key': 'a', 'value': 34 },
        { 'key': 'b', 'value': 2.34 }
      ],
      strings : [ { string: 0, frets: [ { fret: 3 } ] } ]
    };

    var result = parser.parse(c);
    expect(chordsAreEqual(result,expected)).toBe(true);
  });

  it("parses simple bracket version", function() {
    var c = "0:{3 1}\n" +
            "11:{5 2}\n";
    var expected = {
      strings : [
        { string : 0, frets : [ { fret : 3, finger: '1' } ] },
        { string : 11, frets : [ { fret : 5, finger: '2' } ] }
      ]
    };

    var result = parser.parse(c);
    expect(chordsAreEqual(result,expected)).toBe(true);
  });

  it("parses bracket version with multiple notes", function() {
    var c = "0:{3 1},{6 2},{8 x}\n" +
            "11:{5 T},{8 x}\n";
    var expected = {
      strings : [
        { string : 0, frets : [
          { fret : 3, finger: '1' },
          { fret : 6, finger: '2' },
          { fret : 8, finger: 'x' },
        ] },
        { string : 11, frets : [
          { fret : 5, finger: 'T' },
          { fret : 8, finger: 'x' },
        ] }
      ]
    };
    var result = parser.parse(c);
    expect(chordsAreEqual(result,expected)).toBe(true);
  });

  it("parses simple non-bracket version", function() {
    var c = "0:3\n" +
            "11:14\n";
    var expected = {
      strings : [
        { string : 0, frets : [ { fret : 3 } ] },
        { string : 11, frets : [ { fret : 14 } ] },
      ]
    };

    var result = parser.parse(c);
    expect(chordsAreEqual(result,expected)).toBe(true);
  });

  it("parses simple non-bracket version with multiple frets", function() {
    var c = "0:3,5,7,9\n" +
            "11:2,4,6,8\n";
    var expected = {
      strings : [
        { string : 0, frets : [
          { fret : 3 },
          { fret : 5 },
          { fret : 7 },
          { fret : 9 },
        ] },
        { string : 11, frets : [
          { fret : 2 },
          { fret : 4 },
          { fret : 6 },
          { fret : 8 },
        ] },
      ]
    };

    var result = parser.parse(c);
    expect(chordsAreEqual(result,expected)).toBe(true);
  });
});
