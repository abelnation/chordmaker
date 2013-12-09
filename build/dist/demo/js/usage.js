function time_fn(fn, done_fn) {
  var start = new Date().getTime();
  fn();
  var end = new Date().getTime();
  var time = end-start;
  done_fn(time);
}

function showShareModelExamples() {
  var fmaj_notes = [
    new GuitarNote(0,1, { finger: 1 }),
    new GuitarNote(1,3, { finger: 4 }),
    new GuitarNote(2,3, { finger: 3 }),
    new GuitarNote(3,2, { finger: 2 }),
    new GuitarNote(4,1, { finger: 1 }),
    new GuitarNote(5,1, { finger: 1 }),
  ];
  var model = new ChordModel({ label: "FMaj" });
  model.addNotes(fmaj_notes);

  new ChordView("chord-ex1-1", ChordView.DEFAULT_OPTIONS, model);
  new ChordView("chord-ex1-2",
    { finger_position: ChordView.FINGER_ONNOTE }, model);
  new ChordView("chord-ex1-3", ChordView.OPTIONS_COMPACT, model);
  new ChordView("chord-ex1-4", ChordView.OPTIONS_COMPACT, model);

  var cmaj_notes = [
    new GuitarNote(0,3, { finger: 1 }),
    new GuitarNote(1,3, { finger: 1 }),
    new GuitarNote(2,5, { finger: 3 }),
    new GuitarNote(3,5, { finger: 3 }),
    new GuitarNote(4,5, { finger: 3 }),
    new GuitarNote(5,3, { finger: 1 }),
  ];
  var amaj_notes = [
    new GuitarNote(0,0, { finger: 1 }),
    new GuitarNote(1,0, { finger: 1 }),
    new GuitarNote(2,2, { finger: 3 }),
    new GuitarNote(3,2, { finger: 3 }),
    new GuitarNote(4,2, { finger: 3 }),
    new GuitarNote(5,0, { finger: 1 }),
  ];
  model_2 = new ChordModel({ label: "C", notes: cmaj_notes });
  model_3 = new ChordModel({ label: "A", notes: amaj_notes });
  new ChordView("chord-ex1-5", { base_fret: 3, num_frets: 6 }, model_2);
  new ChordView("chord-ex1-6", ChordView.OPTIONS_COMPACT, model_2);
  new ChordView("chord-ex1-7", ChordView.OPTIONS_COMPACT, model_3);
}

function showNoteFactoryExamples() {
  var factory = new GuitarNoteFactory({ numFrets: 15 });
  new ChordView("chord-ex2-1", {
      //show_fingers: false,
      orientation: ChordView.NUT_LEFT,
      num_frets: 12
    }, 
    new ChordModel({ 
      notes: factory.notesForScale("g", "major") }
    )
  );
  new ChordView("chord-ex2-2", { 
      orientation: ChordView.NUT_LEFT,
      num_frets: 8 
    }, 
    new ChordModel({
      label: "Maj6",
      notes: factory.notesForArpeggio("g", "maj6") }
    )
  );
  new ChordView("chord-ex2-3", { 
      scale: 1.0, 
      orientation: ChordView.NUT_LEFT, 
      num_frets: 8
    }, 
    new ChordModel({
      label: "WholeTone",
      notes: factory.notesForScale("g", "wholetone") }
    )
  );
}

function showChordParserExamples() {
  var cf = new ChordFactory();
  $(".parse").each(function(i) {
    var chordStr = $(this).html();
    var chordId = $(this).attr("id");
    cf.chordFromString(chordId, chordStr);
  });
}

function showChordVoicingExamples() {
  var chordKey = "e";
  var chordType = "";
  var instrument = "guitar";
  var tuning = "EADGBe";
  var container = $("#C-chords");
  for(var i = 0; i < Voicings.getNumVariations(instrument, tuning, chordType, false); i++) {
    var chordId = 'C-chord-' + i;
    container.append('<div id="' + chordId + '" class="chord"></div>');
    new ChordView(
      chordId, 
      ChordView.DEFAULT_OPTIONS, 
      Voicings.chordModelFromVoicing(instrument, tuning, chordType, chordKey, i, false));
  }

  container = $("#C7-chords");
  chordType = "7";
  for(var i = 0; i < Voicings.getNumVariations(instrument, tuning, chordType, false); i++) {
    var chordId = 'C7-chord-' + i;
    container.append('<div id="' + chordId + '" class="chord"></div>');
    new ChordView(
      chordId, 
      ChordView.DEFAULT_OPTIONS, 
      Voicings.chordModelFromVoicing(instrument, tuning, chordType, chordKey, i, false));
  }

  container = $("#CM-chords");
  chordType = "M";
  for(var i = 0; i < Voicings.getNumVariations(instrument, tuning, chordType); i++) {
    var chordId = 'CM-chord-' + i;
    container.append('<div id="' + chordId + '" class="chord"></div>');
    new ChordView(
      chordId, 
      ChordView.DEFAULT_OPTIONS, 
      Voicings.chordModelFromVoicing(instrument, tuning, chordType, chordKey, i));
  }
}

$(function() {
  time_fn(showShareModelExamples, function(time) {
    $("#share-models").append("<p><small>"+time+"ms</small></p>"); 
    console.log(time);
  });
  time_fn(showNoteFactoryExamples, function(time) {
    $("#note-factory").append("<p><small>"+time+"ms</small></p>"); 
  });
  time_fn(showChordParserExamples, function(time) {
    $("#chords-from-html").append("<p><small>"+time+"ms</small></p>"); 
  });
  time_fn(showChordVoicingExamples, function(time) {
    $("#voicings").append("<p><small>"+time+"ms</small></p>"); 
  });
});