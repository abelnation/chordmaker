$(function() {

  var instrument = "guitar";
  var tuning = "EADGBe";

  var chordList = Chrods.Voicings.getChordList(instrument, tuning);
  var music = new Chords.Theory();

  var matchExact = false;
  var scalesMatchExact = false;
  var arpeggiosMatchExact = false;

  var factory = new Chords.GuitarNoteFactory({ numFrets: 15 });

  var chord_cache = {};

  function generateArpeggioListing(chordKey, type) {
    var i;
    var j;
    var numRendered = 0;
    var container = $("#arpeggio-container");

    container.empty();
    for (var chordType in Chords.Theory.arpeggios) {
      // var chordType = chordList[i];

      if (arpeggiosMatchExact && type && chordType !== type) {
        continue;
      } else if (!arpeggiosMatchExact && type && chordType.indexOf(type) === -1) {
        continue;
      }

      var chordId;
      var section_container = $('<section class="chord-section"><h3>' + chordKey.toUpperCase() + chordType + '</h3></section>');
      container.append(section_container);

      chordId = "catalogue-arpeggio-" + numRendered;
      section_container.append('<div id="' + chordId + '" class="chord"></div>');

      var options = { scale: 0.85 };
      _.defaults(options, Chords.ChordView.OPTIONS_NECK);
      new Chords.ChordView(chordId, options, new ChordModel({
          notes: factory.notesForArpeggio(chordKey, chordType) }
        )
      );
      numRendered++;
      container.append(section_container);
    }
  }

  function generateScaleListing(chordKey, scale) {
    var i;
    var j;
    var numRendered = 0;
    var container = $("#scale-container");

    container.empty();
    for (var scaleName in Aex.Flow.Music.scales) {
      if (scalesMatchExact && scale && scaleName !== scale) {
        continue;
      } else if (!scalesMatchExact && scale && scaleName.indexOf(scale) === -1) {
        continue;
      }

      var chordId;
      var section_container = $('<section class="scale-section"><h3>' + chordKey.toUpperCase() + " " + toTitleCase(scaleName) + '</h3></section>');
      container.append(section_container);

      chordId = "catalogue-scale-" + numRendered;
      section_container.append('<div id="' + chordId + '" class="chord"></div>');

      var options = { scale: 0.85 };
      _.defaults(options, Chords.ChordView.OPTIONS_NECK);
      new Chords.ChordView(chordId, options,
        new Chords.ChordModel({
          notes: factory.notesForScale(chordKey, scaleName)
        })
      );

      numRendered++;
      container.append(section_container);
    }
  }

  function generateChordListing(chordKey, type) {
    var i;
    var j;
    var numRendered = 0;
    var container = $("#chord-container");

    // container.empty();
    container.children().detach().remove();

    for (i = 0; i < chordList.length; i++) {
      var chordType = chordList[i];

      if (matchExact && type && chordType !== type) {
        continue;
      } else if (!matchExact && type && chordType.indexOf(type) === -1) {
        continue;
      }

      var numChords = Voicings.getNumVariations(instrument, tuning, chordType);
      var chordId;
      var section_container = $('<section class="chord-section"><h3>' + chordKey.toUpperCase() + chordType + '</h3></section>');
      container.append(section_container);

      for (j = 0; j< numChords; j++) {
        var chord_cache_key = (chordKey + "-" + chordType + "-" + j).replace("\/","_").replace("(","").replace(")","").replace("#","s");

        if (chord_cache_key in chord_cache) {
          section_container.append(chord_cache[chord_cache_key]);
        } else {
          // add to cache
          var elem = $('<div id="' + chord_cache_key + '" class="chord"></div>');
          chord_cache[chord_cache_key] = elem;
          section_container.append(elem);

          new Chords.ChordView(
            chord_cache_key,
            Chords.ChordView.DEFAULT_OPTIONS,
            Chords.Voicings.chordModelFromVoicing(instrument, tuning, chordType, chordKey, j));
        }

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
      _.has(Chords.Theory.noteValues, key)
      // && _.indexOf(chordList, type) !== -1)
      )) {
      generateChordListing(key, type);
    }
  }

  function updateScales() {

    var key = $("#scale-inputChordKey").val().toLowerCase();
    var scale = $("#scale-inputChordType").val().toLowerCase();

    if (!key) { return; }

    console.log("update: " + key + scale);

    if (scale === "" || (
      _.has(Chords.Theory.noteValues, key)
      // && _.indexOf(Chords.Theory.scales, scale) !== -1)
      )) {
      generateScaleListing(key, scale);
    }
  }

  function updateArpeggios() {

    var key = $("#arpeggio-inputChordKey").val().toLowerCase();
    var type = $("#arpeggio-inputChordType").val().toLowerCase();

    console.log("update: " + key + type);

    if (!key) { return; }
    if (type === "" || (
      _.has(Chords.Theory.noteValues, key)
      // && _.indexOf(chordList, type) !== -1)
      )) {
      generateArpeggioListing(key, type);
    }
  }

  function toTitleCase(str)
  {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  generateChordListing("c");
  $("#inputChordKey").on("input", updateChords);
  $("#inputChordType").on("input", updateChords);
  $("#inputChordMatchExactly").on("change", function() {
    matchExact = $("#inputChordMatchExactly").attr("checked")?true:false;
    updateChords();
  });

  $("#scale-inputChordKey").on("input", updateScales);
  $("#scale-inputChordType").on("input", updateScales);
  $("#scale-inputChordMatchExactly").on("change", function() {
    scalesMatchExact = $("#scale-inputChordMatchExactly").attr("checked")?true:false;
    updateScales();
  });

  $("#arpeggio-inputChordKey").on("input", updateArpeggios);
  $("#arpeggio-inputChordType").on("input", updateArpeggios);
  $("#arpeggio-inputChordMatchExactly").on("change", function() {
    arpeggiosMatchExact = $("#arpeggio-inputChordMatchExactly").attr("checked")?true:false;
    updateArpeggios();
  });

  $(".tab-link").click(function(e) {
    e.preventDefault();
    $(this).tab('show');
  });

  generateChordListing("c", "");
  generateScaleListing("c", "major");
  generateArpeggioListing("c", "maj");

});
