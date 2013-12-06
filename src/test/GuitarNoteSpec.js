/* global GuitarNote */

describe("GuitarNote", function() {
  
  it("errors if not provided enough arguments", function() {
    expect(function() { new GuitarNote(); }).toThrow();
    expect(function() { new GuitarNote(1); }).toThrow();
  });

  it("errors if not provided invalid string values", function() {
    expect(function() { new GuitarNote( -1, 3 ); }).toThrow();
    expect(function() { new GuitarNote("asdf", 4); }).toThrow();
    expect(function() { new GuitarNote({ "foo": 3 }, 4); }).toThrow();
    expect(function() { new GuitarNote(null, 4); }).toThrow();
    expect(function() { new GuitarNote(undefined, 4); }).toThrow();
    expect(function() { new GuitarNote(false, 4); }).toThrow();
    expect(function() { new GuitarNote(true, 4); }).toThrow();
    expect(function() { new GuitarNote(true, 4); }).toThrow();
  });
  it("errors if not provided invalid fret values", function() {
    expect(function() { new GuitarNote(2, -1); }).toThrow();
    expect(function() { new GuitarNote(2, "asdf"); }).toThrow();
    expect(function() { new GuitarNote(2, { "foo": 3 }); }).toThrow();
    expect(function() { new GuitarNote(2, null); }).toThrow();
    expect(function() { new GuitarNote(2, undefined); }).toThrow();
    expect(function() { new GuitarNote(2, false); }).toThrow();
    expect(function() { new GuitarNote(2, true); }).toThrow();
    expect(function() { new GuitarNote(2, true); }).toThrow();
  });
  it("errors if not provided invalid options", function() {
    expect(function() {
      new GuitarNote(2, 3, {
        finger: 4,
        muted: true
      });
    }).toThrow();
    expect(function() { new GuitarNote(2, 3, { finger: -2 }); }).toThrow();
    expect(function() { new GuitarNote(2, 3, { finger: "asdf" }); }).toThrow();
  });

  it("toString works properly", function() {
    var gn;

    gn = new GuitarNote(2, 3);
    expect(gn.toString())
      .toEqual("String: 2, Fret: 3");

    gn = new GuitarNote(2, 3, { finger: 3 });
    expect(gn.toString())
      .toEqual("String: 2, Fret: 3, Finger: 3");

    gn = new GuitarNote(2, 3, { muted: true });
    expect(gn.toString())
      .toEqual("String: 2, Fret: 3, Finger: " + GuitarNote.MUTE_ANNOTATION);
  });

  it("note returns proper key", function() {
    var gn;

    gn = new GuitarNote(2, 3);
    expect(gn.getKey()).toEqual("2 3");

    gn = new GuitarNote(9, 0, { finger: 3 });
    expect(gn.getKey()).toEqual("9 0");
    
    gn = new GuitarNote(2, null, { muted: true });
    expect(gn.getKey()).toEqual("2 " + GuitarNote.MUTE_ANNOTATION);

    gn = new GuitarNote(2, 5, { muted: true });
    expect(gn.getKey()).toEqual("2 " + GuitarNote.MUTE_ANNOTATION);
    
  });

  it("equality tests equal and unequal cases", function() {
    expect((new GuitarNote(2, 3)).equals(new GuitarNote(2, 3))).toEqual(true);
    expect((new GuitarNote(0, 5)).equals(new GuitarNote(0, 5))).toEqual(true);
    expect((new GuitarNote(3742, 23)).equals(new GuitarNote(3742, 23))).toEqual(true);
    expect((new GuitarNote(2, 3, { finger: 3 })).equals(
            new GuitarNote(2, 3, { finger: 3 })))
      .toEqual(true);
    expect((new GuitarNote(2, 3, { muted: true })).equals(
            new GuitarNote(2, 3, { muted: true })))
      .toEqual(true);
    expect((new GuitarNote(2, 3, { tonic: true })).equals(
            new GuitarNote(2, 3, { tonic: true })))
      .toEqual(true);
    expect((new GuitarNote(2, 3, { tonic: true, finger: 3 })).equals(
            new GuitarNote(2, 3, { tonic: true, finger: 3 })))
      .toEqual(true);

    // False cases

    // frets diff
    expect((new GuitarNote(2, 3)).equals(
            new GuitarNote(2, 5)))
      .toEqual(false);
    // strings diff
    expect((new GuitarNote(2, 5)).equals(
            new GuitarNote(6, 5)))
      .toEqual(false);
    // both diff
    expect((new GuitarNote(2, 5)).equals(
            new GuitarNote(6, 2)))
      .toEqual(false);
    // one has option
    expect((new GuitarNote(6, 2)).equals(
            new GuitarNote(6, 2, { muted: true })))
      .toEqual(false);

    // options differ
    expect((new GuitarNote(6, 2, { muted: false })).equals(
            new GuitarNote(6, 2, { muted: true })))
      .toEqual(false);

    // options differ
    expect((new GuitarNote(6, 2, { tonic: true, muted: false })).equals(
            new GuitarNote(6, 2, { tonic: true, muted: true })))
      .toEqual(false);
  });

  it("equality is symmetric", function() {
    // identity
    expect((new GuitarNote(2, 3)).equals(new GuitarNote(2, 3))).toEqual(true);
    
    expect((new GuitarNote(2, 3)).equals(new GuitarNote(2, 5))).toEqual(false);
    expect((new GuitarNote(2, 5)).equals(new GuitarNote(2, 3))).toEqual(false);
    expect((new GuitarNote(2, 5, { muted: true })).equals(new GuitarNote(2, 5))).toEqual(false);
    expect((new GuitarNote(2, 5)).equals(new GuitarNote(2, 5, { muted: true }))).toEqual(false);
  });

});
