/* global ChordView, ChordModel, GuitarNote */

describe("ChordView", function() {

  beforeEach(function() {
    jasmine.getFixtures().fixturesPath = 'build/dev/test/';
    jasmine.getFixtures().load("ChordViewFixture.html");
  });

  it("constructor requires valid dom elem", function() {
    expect(function() { new ChordView("invalid"); }).toThrow();
    expect(function() { new ChordView("#invalid"); }).toThrow();
    expect(function() { new ChordView(1234); }).toThrow();
    expect(function() { new ChordView(null); }).toThrow();
    expect(function() { new ChordView(undefined); }).toThrow();
    expect(function() { new ChordView(NaN); }).toThrow();
    expect(function() { new ChordView({ foo: "bar" }); }).toThrow();
    expect(function() { new ChordView([ "chord-ex1" ]); }).toThrow();
  });

  it("constructor with valid element inserts SVG", function() {
    new ChordView("chord-ex1");
    new ChordView("#chord-ex2");
    new ChordView("chord-ex3");

    expect($("#chord-ex1")).not.toBeEmpty();
    expect($("#chord-ex2")).not.toBeEmpty();
    expect($("#chord-ex3")).not.toBeEmpty();

    expect($("#chord-ex1")).toContainElement("svg");
    expect($("#chord-ex2")).toContainElement("svg");
    expect($("#chord-ex3")).toContainElement("svg");
  });

  // TODO: (aallison) Lots of testing

});
