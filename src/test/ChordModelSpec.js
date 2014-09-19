/* global ChordModel, GuitarNote */

describe("ChordModel", function() {

  it("constructor validates arguments", function() {
    expect(function() { new ChordModel({ tuning: "INVALID" }); }).toThrow();

    expect(function() { new ChordModel({ label: 1234 }); }).toThrow();
    expect(function() { new ChordModel({ label: { foo: "bar" } }); }).toThrow();
    expect(function() { new ChordModel({ label: [ 1234 ] }); }).toThrow();
  });

  it("addNote requires valid note", function() {
    var cm = new ChordModel();
    expect(function() { cm.addNote(null); }).toThrow();
    expect(function() { cm.addNote(undefined); }).toThrow();
    expect(function() { cm.addNote(1234); }).toThrow();
    expect(function() { cm.addNote({ foo: "bar" }); }).toThrow();
    expect(function() { cm.addNote([ 1234 ]); }).toThrow();

    // TODO: (aallison) note strings
    // expect(cm.addNote("INVALID")).toThrow();
  });

  it("getNumNotes works", function() {
    var cm = new ChordModel();
    expect(cm.getNumNotes()).toEqual(0);

    cm.addNote(new GuitarNote(0, 1));
    expect(cm.getNumNotes()).toEqual(1);

    cm.addNote(new GuitarNote(0, 2));
    expect(cm.getNumNotes()).toEqual(2);

    cm.addNote(new GuitarNote(0, 3));
    expect(cm.getNumNotes()).toEqual(3);

    // replace note
    cm.addNote(new GuitarNote(0, 3));
    expect(cm.getNumNotes()).toEqual(3);
  });

  it("addNotes works", function() {
    var cm = new ChordModel();
    var notes = [];
    for (var i = 1; i < 5; i++) {
      notes.push(new GuitarNote(0, i));
    }
    cm.addNotes(notes);
    expect(cm.getNumNotes()).toEqual(4);

    notes = [];
    for (var j = 1; j < 3; j++) {
      notes.push(new GuitarNote(1, j));
    }
    cm.addNotes(notes);
    expect(cm.getNumNotes()).toEqual(6);
  });

  it("removeNote works", function() {
    var cm = new ChordModel();
    var notes = [];
    for (var i = 1; i < 5; i++) {
      notes.push(new GuitarNote(0, i));
    }
    cm.addNotes(notes);

    cm.removeNote(new GuitarNote(0, 1));
    expect(cm.getNumNotes()).toEqual(3);

    cm.removeNote(new GuitarNote(0, 3));
    expect(cm.getNumNotes()).toEqual(2);

    // remove already removed note
    cm.removeNote(new GuitarNote(0, 3));
    expect(cm.getNumNotes()).toEqual(2);
  });

  it("empty", function() {
    var cm1 = new ChordModel();
    var notes = [];
    for (var i = 1; i < 5; i++) {
      notes.push(new GuitarNote(0, i));
    }
    cm1.addNotes(notes);
    expect(cm1.getNumNotes()).toEqual(4);
    cm1.empty();
    expect(cm1.getNumNotes()).toEqual(0);
    cm1.addNote(new GuitarNote(0, i));
    expect(cm1.getNumNotes()).toEqual(1);
    cm1.empty();
    expect(cm1.getNumNotes()).toEqual(0);
    cm1.empty();
    expect(cm1.getNumNotes()).toEqual(0);
  });

  it("equality tests: notes", function() {
    var cm1 = new ChordModel();
    var cm2 = new ChordModel();
    var notes = [];
    var numNotes = 4;
    for (var i = 1; i <= numNotes; i++) {
      notes.push(new GuitarNote(0, i));
    }
    cm1.addNotes(notes);

    _.shuffle(notes);
    cm2.addNotes(notes);

    // identity
    expect(cm1.equals(cm1)).toEqual(true);
    expect(cm2.equals(cm2)).toEqual(true);

    // symmetry
    expect(cm1.equals(cm2)).toEqual(true);
    expect(cm2.equals(cm1)).toEqual(true);

    cm2.empty();
    expect(cm1.equals(cm2)).toEqual(false);
    expect(cm2.equals(cm1)).toEqual(false);

    for (i = 0; i < numNotes; i++) {
      expect(cm1.equals(cm2)).toEqual(false);
      expect(cm2.equals(cm1)).toEqual(false);
      cm2.addNote(notes[i]);
    }
    expect(cm1.equals(cm2)).toEqual(true);
    expect(cm2.equals(cm1)).toEqual(true);
  });

  it("equality tests: options", function() {
    var notes = [];
    var numNotes = 4;
    for (var i = 1; i <= numNotes; i++) {
      notes.push(new GuitarNote(0, i));
    }

    // Test option inequality
    expect((new ChordModel({ "notes": notes })).equals(
            new ChordModel({ "notes": notes, label: "banana" }))).toBe(false);
    expect((new ChordModel({ "notes": notes })).equals(
            new ChordModel({ "notes": notes, tuning: "GBDA" }))).toBe(false);
  });

  it("transpose", function() {
    throw Error("Need to implement test");
  });

});
