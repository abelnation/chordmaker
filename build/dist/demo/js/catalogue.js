$(function() {

  var instrument = "guitar";
  var tuning = "EADGBe";
  var container = $("#chord-catalogue");
  var chordList = Voicings.getChordList(instrument, tuning);
  var music = new Vex.Flow.Music();
  var matchExact = false;

  function generateChordListing(chordKey, type) {
    var i;
    var j;
    var numRendered = 0;

    container.empty();
    for (i = 0; i < chordList.length; i++) {
      var chordType = chordList[i];
      
      if (matchExact && type && chordType !== type) {
        continue;
      } else if (!matchExact && type && chordType.indexOf(type) === -1) {
        continue;
      }

      var numChords = Voicings.getNumVariations(instrument, tuning, chordType);
      var chordId;
      var section_container = $('<section class="chord-section"><h2>' + chordKey.toUpperCase() + chordType + '</h2></section>');
      container.append(section_container);

      for (j = 0; j< numChords; j++) {
        chordId = "catalogue-chord-" + numRendered;
        section_container.append('<div id="' + chordId + '" class="chord"></div>');

        new ChordView(
          chordId, 
          ChordView.DEFAULT_OPTIONS, 
          Voicings.chordModelFromVoicing(instrument, tuning, chordType, chordKey, j));  

        numRendered++;
      }
      container.append(section_container);
    }
  }

  function updateChords() {
    var key = $("#inputChordKey").val().toLowerCase();
    var type = $("#inputChordType").val();

    console.log("update: " + key + type);

    if (!key) { return; }
    if (type === "" || (
      _.has(Vex.Flow.Music.noteValues, key) &&
      _.indexOf(chordList, type) !== -1)) {
      generateChordListing(key, type);
    }
  }

  generateChordListing("c");
  $("#inputChordKey").on("input", updateChords);
  $("#inputChordType").on("input", updateChords);
  $("#inputChordMatchExactly").on("change", function() {
    matchExact = $("#inputChordMatchExactly").attr("checked")?true:false;
    updateChords();
  })
});