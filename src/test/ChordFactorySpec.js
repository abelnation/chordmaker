/* global ChordFactory */

describe("ChordFactory", function() {

  var cf;

  beforeEach(function() {
    jasmine.getFixtures().fixturesPath = 'build/dev/test/';
    jasmine.getFixtures().load("ChordFactoryFixture.html");

    cf = new ChordFactory();
  });

  it("Running on valid examples without inline configs does not throw exceptions", function() {

    // If exception is thrown, test fails (even without expect calls)
    cf.chordFromString("#chord-1-1", $("#chord-1-1").html());
    cf.chordFromString("#chord-1-2", $("#chord-1-2").html());
    cf.chordFromString("#chord-1-3", $("#chord-1-3").html());
    cf.chordFromString("#chord-1-4", $("#chord-1-4").html());
    cf.chordFromString("#chord-2-1", $("#chord-2-1").html());
    cf.chordFromString("#chord-2-2", $("#chord-2-2").html());
    cf.chordFromString("#chord-2-3", $("#chord-2-3").html());
    cf.chordFromString("#chord-2-4", $("#chord-2-4").html());
    cf.chordFromString("#chord-2-5", $("#chord-2-5").html());
    cf.chordFromString("#chord-2-6", $("#chord-2-6").html());
    cf.chordFromString("#chord-ex3-1", $("#chord-ex3-1").html());

  });

  it("Running on valid examples with inline configs does not throw exceptions", function() {
    cf.chordFromString("#chord-3-1", $("#chord-3-1").html());
    cf.chordFromString("#chord-3-2", $("#chord-3-2").html());
    cf.chordFromString("#chord-3-3", $("#chord-3-3").html());
    cf.chordFromString("#chord-3-4", $("#chord-3-4").html());

    cf.chordFromString("#chord-4-1", $("#chord-4-1").html());
    cf.chordFromString("#chord-4-2", $("#chord-4-2").html());
    cf.chordFromString("#chord-4-3", $("#chord-4-3").html());
    cf.chordFromString("#chord-4-4", $("#chord-4-4").html());
    cf.chordFromString("#chord-4-5", $("#chord-4-5").html());
    cf.chordFromString("#chord-4-6", $("#chord-4-6").html());
  });

  it("Actually inserts notes into the model", function() {
    var c = cf.chordFromString("#chord-3-1", $("#chord-3-1").html());
    expect(c.getModel().getNumNotes()).toEqual(6);
    c = cf.chordFromString("#chord-3-2", $("#chord-3-2").html());
    expect(c.getModel().getNumNotes()).toEqual(6);
    c = cf.chordFromString("#chord-3-3", $("#chord-3-3").html());
    expect(c.getModel().getNumNotes()).toEqual(6);
    c = cf.chordFromString("#chord-3-4", $("#chord-3-4").html());
    expect(c.getModel().getNumNotes()).toEqual(6);

    c = cf.chordFromString("#chord-4-1", $("#chord-4-1").html());
    expect(c.getModel().getNumNotes()).toEqual(21);
    c = cf.chordFromString("#chord-4-2", $("#chord-4-2").html());
    expect(c.getModel().getNumNotes()).toEqual(7);
  });

  it("Throws for empty dom elements", function() {
    expect(function() { cf.chordFromString("#chord-3-1", ""); }).toThrow();
    expect(function() { cf.chordFromString("#chord-3-1", "     "); }).toThrow();
    expect(function() { cf.chordFromString("#chord-3-1", "  \t  \n "); }).toThrow();
  });

});
