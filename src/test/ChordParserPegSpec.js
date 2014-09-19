/* global ChordParserPEG, ChordModel, GuitarNote, Tuning, ChordFactory */

describe("ChordParserPeg", function() {

  var parser;
  var cf;
  beforeEach(function() {
    parser = ChordParserPEG;
    cf = new ChordFactory();
  });

  function parsedChordsAreEqual(parseResult1, parseResult2) {
    // var cm1 = chordModelFromParseResult(parseResult1);
    // var cm2 = chordModelFromParseResult(parseResult2);
    // var cm1 = cf.chordFromString(parseResult1);
    // var cm2 = cf.chordFromString(parseResult2);

    return _.isEqual(parseResult1, parseResult2);
  }

  it("parses config string", function() {
    var c = "[foo='bar',baz='banksy',a=34,b=2.34]\n" +
            "0:3\n";
    var expected = {
      config: {
        foo: 'bar',
        baz: 'banksy',
        a: 34,
        b: 2.34
      },
      strings : { 0: { string: 0, frets: [ { fret: 3 } ] } }
    };

    var result = parser.parse(c);
    expect(_.isEqual(expected, result)).toBe(true);
  });

  it("parses simple bracket version", function() {
    var c = "0:{3 1}\n" +
            "4:{5 2}\n";
    var expected = {
      config: { },
      strings : {
        0: { string : 0, frets : [ { fret : 3, finger: '1' } ] },
        4: { string : 4, frets : [ { fret : 5, finger: '2' } ] }
      }
    };

    var result = parser.parse(c);
    expect(_.isEqual(expected, result)).toBe(true);
  });

  it("parses bracket version with multiple notes", function() {
    var c = "0:{3 1},{6 2},{8 x}\n" +
            "4:{5 T},{8 x}\n";
    var expected = {
      config: { },
      strings : {
        0: { string : 0, frets : [
          { fret : 3, finger: '1' },
          { fret : 6, finger: '2' },
          { fret : 8, finger: 'x' },
        ] },
        4: { string : 4, frets : [
          { fret : 5, finger: 'T' },
          { fret : 8, finger: 'x' },
        ] }
      }
    };
    var result = parser.parse(c);
    expect(parsedChordsAreEqual(result, expected)).toBe(true);
  });

  it("parses simple non-bracket version", function() {
    var c = "0:3\n" +
            "4:14\n";
    var expected = {
      config: { },
      strings : {
        0: { string : 0, frets : [ { fret : 3 } ] },
        4: { string : 4, frets : [ { fret : 14 } ] },
      }
    };

    var result = parser.parse(c);
    expect(parsedChordsAreEqual(result, expected)).toBe(true);
  });

  it("parses simple non-bracket version with multiple frets", function() {
    var c = "0:3,5,7,9\n" +
            "4:2,4,6,8\n";
    var expected = {
      config: { },
      strings : {
        0: { string : 0, frets : [
          { fret : 3 },
          { fret : 5 },
          { fret : 7 },
          { fret : 9 },
        ] },
        4: { string : 4, frets : [
          { fret : 2 },
          { fret : 4 },
          { fret : 6 },
          { fret : 8 },
        ] },
      }
    };

    var result = parser.parse(c);
    expect(parsedChordsAreEqual(result, expected)).toBe(true);
  });
});
