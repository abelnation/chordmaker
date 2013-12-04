/* global GuitarNoteFactory */

describe("GuitarNoteFactory", function() {
  
  it("errors if provided invalid tuning", function() {
    expect(function() { new GuitarNoteFactory({ tuning: "EABbCDE" }); }).toThrow();
    expect(function() { new GuitarNoteFactory({ tuning: "" }); }).toThrow();
    expect(function() { new GuitarNoteFactory({ tuning: "WERT" }); }).toThrow();
    expect(function() { new GuitarNoteFactory({ tuning: 234 }); }).toThrow();
  });

  it("errors if provided invalid numFrets", function() {
    expect(function() { new GuitarNoteFactory({ numFrets: "asdf" }); }).toThrow();
    expect(function() { new GuitarNoteFactory({ numFrets: -10 }); }).toThrow();
    expect(function() { new GuitarNoteFactory({ numFrets: [ 23, 43 ] }); }).toThrow();
    expect(function() { new GuitarNoteFactory({ numFrets: {"foo": 23} }); }).toThrow();
  });

  it("notesForNotesValues errors if provided invalid note values", function() {
    var nf = new GuitarNoteFactory();
    expect(function() { nf.notesForNotesValues(); }).toThrow();
    expect(function() { nf.notesForNotesValues(234); }).toThrow();
    expect(function() { nf.notesForNotesValues("234"); }).toThrow();
    expect(function() { nf.notesForNotesValues({foo: "bar"}); }).toThrow();
    expect(function() { nf.notesForNotesValues(null); }).toThrow();

    expect(function() { nf.notesForNotesValues([-1]); }).toThrow();
    expect(function() { nf.notesForNotesValues([12]); }).toThrow();
    expect(function() { nf.notesForNotesValues([13]); }).toThrow();
    expect(function() { nf.notesForNotesValues(["asdf"]); }).toThrow();
    expect(function() { nf.notesForNotesValues([{foo: "bar"}]); }).toThrow();
  });

  it("notesForNotesValues returns correct notes", function() {
    var nf = new GuitarNoteFactory({tuning: "E", numFrets: 12});

    //open e string (int_val: 4)
    var note = nf.notesForNotesValues([4])[0];
    expect(note.string).toEqual(0);
    expect(note.fret).toEqual(0);

    note = nf.notesForNotesValues([6])[0];
    expect(note.string).toEqual(0);
    expect(note.fret).toEqual(2);

    
    nf = new GuitarNoteFactory({tuning: "E D C", numFrets: 12});
    var notes = nf.notesForNotesValues([4]); // e (int_val: 4)
    expect(notes.length).toEqual(3);
    expect(notes[0].string).toEqual(0);
    expect(notes[0].fret).toEqual(0);
    expect(notes[1].string).toEqual(1);
    expect(notes[1].fret).toEqual(2);
    expect(notes[2].string).toEqual(2);
    expect(notes[2].fret).toEqual(4);
  });
  it("notesForNotesValues range limiting works", function() {
    var nf = new GuitarNoteFactory({tuning: "E", numFrets: 20, minFret: 5, maxFret: 9 });

    //open e string (int_val: 4)
    var notes = nf.notesForNotesValues([4]);
    expect(notes.length).toEqual(0);
    
    // bottom of range (inclusive)
    notes = nf.notesForNotesValues([9]);
    expect(notes[0].fret).toEqual(5);

    // top of range
    notes = nf.notesForNotesValues([0]);
    expect(notes[0].fret).toEqual(8);

    // just out of range
    notes = nf.notesForNotesValues([1]);
    expect(notes.length).toEqual(0);
  });

  it("notesForNotesValues returns proper number of notes", function() {
    var nf = new GuitarNoteFactory({tuning: "E", numFrets: 12});
    expect(nf.notesForNotesValues([4]).length).toEqual(1);
    expect(nf.notesForNotesValues([0]).length).toEqual(1);
    expect(nf.notesForNotesValues([11]).length).toEqual(1);
    expect(nf.notesForNotesValues([]).length).toEqual(0);
    expect(nf.notesForNotesValues([4, 7]).length).toEqual(2);
    expect(nf.notesForNotesValues([4, 7, 11, 0, 3, 7, 3]).length).toEqual(7);
    expect(nf.notesForNotesValues([4, 4, 4]).length).toEqual(3);

    nf = new GuitarNoteFactory({tuning: "EADGBE", numFrets: 12});
    expect(nf.notesForNotesValues([]).length).toEqual(0);
    expect(nf.notesForNotesValues([4]).length).toEqual(6);
    expect(nf.notesForNotesValues([0]).length).toEqual(6);
    expect(nf.notesForNotesValues([11]).length).toEqual(6);
    expect(nf.notesForNotesValues([1,2,3]).length).toEqual(6*3);
  });

  it("notesForNotesStr throws for invalid note strings", function() {
    var nf = new GuitarNoteFactory();
    expect(function() { nf.notesForNotesStr("h"); }).toThrow();
    expect(function() { nf.notesForNotesStr("i"); }).toThrow();
    expect(function() { nf.notesForNotesStr("j"); }).toThrow();
    expect(function() { nf.notesForNotesStr("k"); }).toThrow();
    expect(function() { nf.notesForNotesStr("l"); }).toThrow();
    expect(function() { nf.notesForNotesStr("m"); }).toThrow();
    expect(function() { nf.notesForNotesStr("n"); }).toThrow();
    expect(function() { nf.notesForNotesStr("o"); }).toThrow();
    expect(function() { nf.notesForNotesStr("p"); }).toThrow();
    expect(function() { nf.notesForNotesStr("q"); }).toThrow();
    expect(function() { nf.notesForNotesStr("r"); }).toThrow();
    expect(function() { nf.notesForNotesStr("s"); }).toThrow();
    expect(function() { nf.notesForNotesStr("t"); }).toThrow();
    expect(function() { nf.notesForNotesStr("u"); }).toThrow();
    expect(function() { nf.notesForNotesStr("v"); }).toThrow();
    expect(function() { nf.notesForNotesStr("w"); }).toThrow();
    expect(function() { nf.notesForNotesStr("x"); }).toThrow();
    expect(function() { nf.notesForNotesStr("y"); }).toThrow();
    expect(function() { nf.notesForNotesStr("z"); }).toThrow();
    expect(function() { nf.notesForNotesStr("1"); }).toThrow();
    expect(function() { nf.notesForNotesStr("2"); }).toThrow();
    expect(function() { nf.notesForNotesStr("3"); }).toThrow();
    expect(function() { nf.notesForNotesStr("4"); }).toThrow();
    expect(function() { nf.notesForNotesStr("5"); }).toThrow();
    expect(function() { nf.notesForNotesStr("6"); }).toThrow();
    expect(function() { nf.notesForNotesStr("7"); }).toThrow();
    expect(function() { nf.notesForNotesStr("8"); }).toThrow();
    expect(function() { nf.notesForNotesStr("9"); }).toThrow();
    expect(function() { nf.notesForNotesStr("0"); }).toThrow();
    expect(function() { nf.notesForNotesStr("!"); }).toThrow();
    expect(function() { nf.notesForNotesStr("@"); }).toThrow();
    expect(function() { nf.notesForNotesStr("#"); }).toThrow();
    expect(function() { nf.notesForNotesStr("$"); }).toThrow();
    expect(function() { nf.notesForNotesStr("%"); }).toThrow();
    expect(function() { nf.notesForNotesStr("^"); }).toThrow();
    expect(function() { nf.notesForNotesStr("&"); }).toThrow();
    expect(function() { nf.notesForNotesStr("*"); }).toThrow();
    expect(function() { nf.notesForNotesStr("("); }).toThrow();
    expect(function() { nf.notesForNotesStr(")"); }).toThrow();
    expect(function() { nf.notesForNotesStr("-"); }).toThrow();
    expect(function() { nf.notesForNotesStr("="); }).toThrow();
    expect(function() { nf.notesForNotesStr("_"); }).toThrow();
    expect(function() { nf.notesForNotesStr("+"); }).toThrow();
    expect(function() { nf.notesForNotesStr("~"); }).toThrow();
    expect(function() { nf.notesForNotesStr("`"); }).toThrow();
    expect(function() { nf.notesForNotesStr("/"); }).toThrow();
    expect(function() { nf.notesForNotesStr("?"); }).toThrow();
    expect(function() { nf.notesForNotesStr("'"); }).toThrow();
    expect(function() { nf.notesForNotesStr(";"); }).toThrow();
    expect(function() { nf.notesForNotesStr(":"); }).toThrow();
    expect(function() { nf.notesForNotesStr("["); }).toThrow();
    expect(function() { nf.notesForNotesStr("]"); }).toThrow();
    expect(function() { nf.notesForNotesStr("{"); }).toThrow();
    expect(function() { nf.notesForNotesStr("}"); }).toThrow();
    expect(function() { nf.notesForNotesStr("\\"); }).toThrow();
    expect(function() { nf.notesForNotesStr("|"); }).toThrow();
    expect(function() { nf.notesForNotesStr("<"); }).toThrow();
    expect(function() { nf.notesForNotesStr(">"); }).toThrow();
    expect(function() { nf.notesForNotesStr(","); }).toThrow();
    expect(function() { nf.notesForNotesStr("."); }).toThrow();
    expect(function() { nf.notesForNotesStr(";"); }).toThrow();
  });

  it("notesForNotesStr returns proper number of notes", function() {
    var nf = new GuitarNoteFactory({tuning: "E", numFrets: 12});
    expect(nf.notesForNotesStr("").length).toEqual(0);

    expect(nf.notesForNotesStr("A").length).toEqual(1);
    expect(nf.notesForNotesStr("A#").length).toEqual(1);
    expect(nf.notesForNotesStr("Ab").length).toEqual(1);
    expect(nf.notesForNotesStr("A##").length).toEqual(1);
    expect(nf.notesForNotesStr("Abb").length).toEqual(1);

    expect(nf.notesForNotesStr("A C#").length).toEqual(2);
    expect(nf.notesForNotesStr("A# bb").length).toEqual(2);
    expect(nf.notesForNotesStr("Ab g##").length).toEqual(2);
    expect(nf.notesForNotesStr("A## d").length).toEqual(2);
    expect(nf.notesForNotesStr("Abb e").length).toEqual(2);

    nf = new GuitarNoteFactory({tuning: "EADGBE", numFrets: 12});
    expect(nf.notesForNotesStr("A#").length).toEqual(6);
    expect(nf.notesForNotesStr("Ab").length).toEqual(6);
    expect(nf.notesForNotesStr("A#").length).toEqual(6);
    expect(nf.notesForNotesStr("Abb C d#").length).toEqual(6*3);
  });

  it("notesForScale validates input", function() {
    var nf = new GuitarNoteFactory({tuning: "E", numFrets: 12});
    
    expect(function() { nf.notesForScale(); }).toThrow();
    expect(function() { nf.notesForScale("C"); }).toThrow();

    expect(function() { nf.notesForScale("INVALID", "major"); }).toThrow();
    expect(function() { nf.notesForScale("C", "INVALID"); }).toThrow();

    expect(function() { nf.notesForScale(234, "major"); }).toThrow();
    expect(function() { nf.notesForScale([], "major"); }).toThrow();
    expect(function() { nf.notesForScale({ foo: "bar" }, "major"); }).toThrow();
    expect(function() { nf.notesForScale(false, "major"); }).toThrow();

    expect(function() { nf.notesForScale("C", 234); }).toThrow();
    expect(function() { nf.notesForScale("C", []); }).toThrow();
    expect(function() { nf.notesForScale("C", { foo: "bar" }); }).toThrow();
    expect(function() { nf.notesForScale("C", false); }).toThrow();
  });

  it("notesForNotesStr returns proper number of notes", function() {
    var nf = new GuitarNoteFactory({tuning: "E", numFrets: 12});
    expect(nf.notesForNotesStr("").length).toEqual(0);

    expect(nf.notesForNotesStr("A").length).toEqual(1);
    expect(nf.notesForNotesStr("A#").length).toEqual(1);
    expect(nf.notesForNotesStr("Ab").length).toEqual(1);
    expect(nf.notesForNotesStr("A##").length).toEqual(1);
    expect(nf.notesForNotesStr("Abb").length).toEqual(1);

    expect(nf.notesForNotesStr("A C#").length).toEqual(2);
    expect(nf.notesForNotesStr("A# bb").length).toEqual(2);
    expect(nf.notesForNotesStr("Ab g##").length).toEqual(2);
    expect(nf.notesForNotesStr("A## d").length).toEqual(2);
    expect(nf.notesForNotesStr("Abb e").length).toEqual(2);

    nf = new GuitarNoteFactory({tuning: "EADGBE", numFrets: 12});
    expect(nf.notesForNotesStr("A#").length).toEqual(6);
    expect(nf.notesForNotesStr("Ab").length).toEqual(6);
    expect(nf.notesForNotesStr("A#").length).toEqual(6);
    expect(nf.notesForNotesStr("Abb C d#").length).toEqual(6*3);
  });
});