/* global Tuning, _ */

describe("Tuning", function() {

  it("isValidTuningString validates proper tuning strings", function() {
    expect(Tuning.isValidTuningString("EADGBe")).toBe(true);
    expect(Tuning.isValidTuningString("ABCDEFG")).toBe(true);
    expect(Tuning.isValidTuningString("A#BbC#DbE#FbG")).toBe(true);
    expect(Tuning.isValidTuningString("a")).toBe(true);
    expect(Tuning.isValidTuningString("abcabcabcabcabcabcabcabc")).toBe(true);
  });

  it("isValidTuningString catches invalid tuning strings", function() {
    expect(Tuning.isValidTuningString()).toBe(false);
    expect(Tuning.isValidTuningString("")).toBe(false);
    expect(Tuning.isValidTuningString(243)).toBe(false);
    expect(Tuning.isValidTuningString({ foo: "bar" })).toBe(false);
    expect(Tuning.isValidTuningString([ 3 ])).toBe(false);
    expect(Tuning.isValidTuningString("")).toBe(false);
    expect(Tuning.isValidTuningString("h")).toBe(false);
    expect(Tuning.isValidTuningString("i")).toBe(false);
    expect(Tuning.isValidTuningString("j")).toBe(false);
    expect(Tuning.isValidTuningString("k")).toBe(false);
    expect(Tuning.isValidTuningString("l")).toBe(false);
    expect(Tuning.isValidTuningString("m")).toBe(false);
    expect(Tuning.isValidTuningString("n")).toBe(false);
    expect(Tuning.isValidTuningString("o")).toBe(false);
    expect(Tuning.isValidTuningString("p")).toBe(false);
    expect(Tuning.isValidTuningString("q")).toBe(false);
    expect(Tuning.isValidTuningString("r")).toBe(false);
    expect(Tuning.isValidTuningString("s")).toBe(false);
    expect(Tuning.isValidTuningString("t")).toBe(false);
    expect(Tuning.isValidTuningString("u")).toBe(false);
    expect(Tuning.isValidTuningString("v")).toBe(false);
    expect(Tuning.isValidTuningString("w")).toBe(false);
    expect(Tuning.isValidTuningString("x")).toBe(false);
    expect(Tuning.isValidTuningString("y")).toBe(false);
    expect(Tuning.isValidTuningString("z")).toBe(false);
    expect(Tuning.isValidTuningString("!")).toBe(false);
    expect(Tuning.isValidTuningString("@")).toBe(false);
    expect(Tuning.isValidTuningString("$")).toBe(false);
    expect(Tuning.isValidTuningString("%")).toBe(false);
    expect(Tuning.isValidTuningString("^")).toBe(false);
    expect(Tuning.isValidTuningString("&")).toBe(false);
    expect(Tuning.isValidTuningString("*")).toBe(false);
    expect(Tuning.isValidTuningString("(")).toBe(false);
    expect(Tuning.isValidTuningString(")")).toBe(false);
    // TODO: (aallison) rest of symbols
  });

  it("parseTuningString expects valid args", function() {
    expect(function() { Tuning.parseTuningString(); }).toThrow();
    expect(function() { Tuning.parseTuningString(""); }).toThrow();
    expect(function() { Tuning.parseTuningString(243); }).toThrow();
    expect(function() { Tuning.parseTuningString({ foo: "bar" }); }).toThrow();
    expect(function() { Tuning.parseTuningString([ 3 ]); }).toThrow();
  });
  it("parseTuningString works for spaced strings", function() {
    expect(Tuning.parseTuningString("E A D G B E")).toEqual([ "E", "A", "D", "G", "B", "E" ]);
    expect(Tuning.parseTuningString("E A# Db G Bbb E##")).toEqual([ "E", "A#", "Db", "G", "Bbb", "E##" ]);
    expect(Tuning.parseTuningString("E A# Db G Bbb E##")).toEqual([ "E", "A#", "Db", "G", "Bbb", "E##" ]);
    expect(Tuning.parseTuningString("e A# db G Bbb E##")).toEqual([ "e", "A#", "db", "G", "Bbb", "E##" ]);
  });
  it("parseTuningString works for non-spaced strings", function() {
    expect(Tuning.parseTuningString("EADGBE")).toEqual([ "E", "A", "D", "G", "B", "E" ]);
    expect(Tuning.parseTuningString("EA#DGBE##")).toEqual([ "E", "A#", "D", "G", "B", "E##" ]);
    expect(Tuning.parseTuningString("EA#DGBE##")).toEqual([ "E", "A#", "D", "G", "B", "E##" ]);
    expect(Tuning.parseTuningString("eA#dGBE##")).toEqual([ "e", "A#", "d", "G", "B", "E##" ]);
  });
  it("parseTuningString catches ambiguous flats strings", function() {
    expect(function() { Tuning.parseTuningString("EAbDGBE"); }).toThrow();
    expect(function() { Tuning.parseTuningString("EA#DGbBE##"); }).toThrow();
    expect(function() { Tuning.parseTuningString("EbA#DGBE##"); }).toThrow();
    expect(function() { Tuning.parseTuningString("eA#dGbbBE##"); }).toThrow();
    expect(function() { Tuning.parseTuningString("eA#dGBEbbb"); }).toThrow();
    expect(function() { Tuning.parseTuningString("eA#dGBEbbB"); }).toThrow();
    expect(function() { Tuning.parseTuningString("eA#dGBEbbBC"); }).toThrow();

    // Unambiguous flat cases
    expect(function() { Tuning.parseTuningString("eA#dGBEb"); }).not.toThrow();
    expect(function() { Tuning.parseTuningString("eA#dGBEbb"); }).not.toThrow();
  });
  it("Tuning num_strings calculated correctly", function() {
    var t = new Tuning("EADGBE");
    expect(t.getNumStrings()).toEqual(6);
    t = new Tuning("ABCD");
    expect(t.getNumStrings()).toEqual(4);
    t = new Tuning("A# Bbb C## D");
    expect(t.getNumStrings()).toEqual(4);
    t = new Tuning("A");
    expect(t.getNumStrings()).toEqual(1);
  });

  it("All instruments have default tuning", function() {
    for (var inst in Tuning.instruments) {
      expect(_.has(Tuning.instruments[inst], "default")).toBe(true);
    }
  });

  it("Equality", function() {
    // Test equality for variety of instruments
    var t1;
    var t2;
    for (var inst in Tuning.instruments) {
      t1 = new Tuning(Tuning.instruments[inst]["default"]);
      t2 = new Tuning(Tuning.instruments[inst]["default"]);
      expect(t1.equals(t2)).toBe(true);
      expect(t2.equals(t1)).toBe(true);
    }

    // Inequality
    expect((new Tuning("ABCDEF")).equals(
            new Tuning("ABC"))).toBe(false);
    expect((new Tuning("ABCDEF")).equals(
            new Tuning("A"))).toBe(false);
    expect((new Tuning("A")).equals(
            new Tuning("ABCDEF"))).toBe(false);
    expect((new Tuning("A")).equals(
            new Tuning("ABCDEF"))).toBe(false);
  });

});
