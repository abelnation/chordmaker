/* global ChordModel, GuitarNote */

describe("ChordModel", function() {
  
  it("constructor validates arguments", function() {
    expect(function() { new ChordModel({ tuning: "INVALID" }); }).toThrow();

    expect(function() { new ChordModel({ numFrets: "INVALID" }); }).toThrow();
    expect(function() { new ChordModel({ numFrets: { foo: "bar" } }); }).toThrow();
    expect(function() { new ChordModel({ numFrets: [ 1234 ] }); }).toThrow();
    expect(function() { new ChordModel({ numFrets: -234 }); }).toThrow();

    expect(function() { new ChordModel({ numFrets: 5, baseFret: 8 }); }).toThrow();
    expect(function() { new ChordModel({ numFrets: 5, baseFret: -23 }); }).toThrow();

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

    // TODO: note strings
    // expect(cm.addNote("INVALID")).toThrow();
  });

  it("getNumNotes works", function() {
    var cm = new ChordModel();
    expect(cm.getNumNotes()).toEqual(0);

    cm.addNote(new GuitarNote(0,1));
    expect(cm.getNumNotes()).toEqual(1);

    cm.addNote(new GuitarNote(0,2));
    expect(cm.getNumNotes()).toEqual(2);

    cm.addNote(new GuitarNote(0,3));
    expect(cm.getNumNotes()).toEqual(3);

    // replace note
    cm.addNote(new GuitarNote(0,3));
    expect(cm.getNumNotes()).toEqual(3);
  });

  it("addNotes works", function() {
    var cm = new ChordModel();
    var notes = [];
    for (var i = 1; i < 5; i++) {
      notes.push(new GuitarNote(0,i));
    }
    cm.addNotes(notes);
    expect(cm.getNumNotes()).toEqual(4);

    notes = [];
    for (var j = 1; j < 3; j++) {
      notes.push(new GuitarNote(1,j));
    }
    cm.addNotes(notes);
    expect(cm.getNumNotes()).toEqual(6);
  });

  it("removeNote works", function() {
    var cm = new ChordModel();
    var notes = [];
    for (var i = 1; i < 5; i++) {
      notes.push(new GuitarNote(0,i));
    }
    cm.addNotes(notes);

    cm.removeNote(new GuitarNote(0,1));
    expect(cm.getNumNotes()).toEqual(3);

    cm.removeNote(new GuitarNote(0,3));
    expect(cm.getNumNotes()).toEqual(2);
    
    // remove already removed note
    cm.removeNote(new GuitarNote(0,3));
    expect(cm.getNumNotes()).toEqual(2);
  });

});
