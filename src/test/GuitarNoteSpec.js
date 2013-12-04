/* global GuitarNote */

describe("GuitarNote", function() {
  
  it("errors if not provided enough arguments", function() {
    expect(function() { new GuitarNote(); }).toThrow();
    expect(function() { new GuitarNote(1); }).toThrow();
  });

  it("errors if not provided invalid string values", function() {
    expect(function() { new GuitarNote(-1, 3); }).toThrow();
    expect(function() { new GuitarNote("asdf", 4); }).toThrow();
    expect(function() { new GuitarNote({"foo": 3}, 4); }).toThrow();
    expect(function() { new GuitarNote(null, 4); }).toThrow();
    expect(function() { new GuitarNote(undefined, 4); }).toThrow();
    expect(function() { new GuitarNote(false, 4); }).toThrow();
    expect(function() { new GuitarNote(true, 4); }).toThrow();
    expect(function() { new GuitarNote(true, 4); }).toThrow();
  });
  it("errors if not provided invalid fret values", function() {
    expect(function() { new GuitarNote(2, -1); }).toThrow();
    expect(function() { new GuitarNote(2, "asdf"); }).toThrow();
    expect(function() { new GuitarNote(2, {"foo": 3}); }).toThrow();
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

    gn = new GuitarNote(2, 3, {finger: 3});
    expect(gn.toString())
      .toEqual("String: 2, Fret: 3, Finger: 3");

    gn = new GuitarNote(2, 3, {muted: true});
    expect(gn.toString())
      .toEqual("String: 2, Fret: 3, Finger: " + GuitarNote.MUTE_ANNOTATION);
  });

});