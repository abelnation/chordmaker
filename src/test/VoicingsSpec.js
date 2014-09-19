/* global Voicings, _ */

describe("Voicings", function() {

  it("Returns correct chord label list", function() {
    var list = Voicings.getChordList("test", "EADGBe");
    expect(_.isEqual(
      list,
      [ "M", "M6", "M6/9" ]
    )).toBe(true);
  });

  it("getNumVariations works", function() {
    expect(Voicings.getNumVariations("test", "EADGBe", "M")).toEqual(3);
    expect(Voicings.getNumVariations("test", "EADGBe", "M6")).toEqual(2);
    expect(Voicings.getNumVariations("test", "EADGBe", "M6/9")).toEqual(1);

    expect(Voicings.getNumVariations("test", "EADGBe", "M", false)).toEqual(6);
    expect(Voicings.getNumVariations("test", "EADGBe", "M6", false)).toEqual(3);
  });

  it("_bassNoteForKeyAndOffset works", function() {
    expect(Voicings._bassNoteForKeyAndOffset("c", 7)).toEqual("g");
    expect(Voicings._bassNoteForKeyAndOffset("c")).toEqual("");
    expect(Voicings._bassNoteForKeyAndOffset("c#", 7)).toEqual("g#");
    expect(Voicings._bassNoteForKeyAndOffset("c", 4)).toEqual("e");

    // test wraparound
    expect(Voicings._bassNoteForKeyAndOffset("g", 7)).toEqual("d");
    expect(Voicings._bassNoteForKeyAndOffset("a", 3)).toEqual("c");
  });

  it("tonics are properly detected", function() {
    // TODO: (aallison) implement
    // throw Error("Need to implement test");
  });

});
