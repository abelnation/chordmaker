$(function() {

  var instrument = "guitar";
  var tuning = "EADGBe";
  
  var chordList = Voicings.getChordList(instrument, tuning);
  var selectedChords = {
    "maj": true,
    "maj7": true,
    "6": true,
    "maj9": true,
    // "6/9": true,
    "7": true,
    // "7(b9)": true,
    "m": true,
    // "m6": true,
    // "m6/9": true,
    // "*7": true,
    // "m7": true,
    // "m7(b5)": true,
  };
  var music = new Aex.Flow.Music();
  
  var matchExact = false;

  var chordViewOptions = {};
  _.defaults(chordViewOptions, ChordView.DEFAULT_OPTIONS);
  chordViewOptions.show_label = false;
  chordViewOptions.scale = 1.0;
  chordViewOptions.show_fingers = false;

  var answerViewOptions = {};
  _.defaults(answerViewOptions, ChordView.DEFAULT_OPTIONS);
  answerViewOptions.show_label = false;
  answerViewOptions.scale = 0.5;
  answerViewOptions.show_fingers = false;

  var curAnswer = {
    key: "C",
    type: "M"
  };

  var factory = new GuitarNoteFactory({ numFrets: 15 });

  function createChordSelector() {
    var selectorForm = $("#quiz-chord-selector");
    for (var i = 0; i < chordList.length; i++) {
      var isChecked = (chordList[i] in selectedChords);

      $("#quiz-chord-selector").append('\
        <div class="checkbox" style=""> \
          <label> \
            <input id="chord-select-' + i + '" \
              type="checkbox" \
              data-chord-type="' + chordList[i] + '"' + 
              (isChecked ? ' checked' : '') + '>' + 
            chordList[i] + '\
          </label> \
        </div>');
      $("#chord-select-" + i).on("change", function(e) {
        var isChecked = ($(e.target).attr("checked") ? true : false);
        var chordType = $(e.target).data("chord-type");

        console.log(chordType);

        if (isChecked) {
          selectedChords[chordType] = true;
        } else {
          delete selectedChords[chordType];
        }
        showNextQuizItem();
      });
    }
  }

  function showNextQuizItem() {
    console.log("showNextQuizItem");

    $("#quiz-chord-diagram").empty();
    $("#quiz-chord-answer").empty();
    $("#quiz-chord-answer-input").val("");

    // get random chord type
    var chordIdx = Math.floor(Math.random() * Object.keys(selectedChords).length);
    var chord = Object.keys(selectedChords)[chordIdx];
    // var i = 0;
    // var chord = "";
    // for (var chordType in selectedChords) {
    //   if (i === chordIdx) {
    //     chord = chordType;
    //   }
    // }
    if (chord === "") {
      throw new Error("no chord type picked");
    }

    var numVariations = Voicings.getNumVariations(instrument, tuning, chord);
    var variationNumber = Math.floor(Math.random()*numVariations);

    var keyIdx = Math.floor(Math.random() * Aex.Flow.Music.canonical_notes.length);
    var key = Aex.Flow.Music.canonical_notes[keyIdx];

    curAnswer = {
      key: key.toUpperCase(),
      type: chord
    };

    var chordModel = Voicings.chordModelFromVoicing(instrument, tuning, chord, key, variationNumber, true);

    chordId = "quiz-chord-01";
    $("#quiz-chord-diagram").append('<div id="' + chordId + '" class="chord"></div>');

    new ChordView(
      chordId,
      chordViewOptions,
      chordModel);

    $("#quiz-chord-answer-input").focus();
  }

  function checkAnswer() {
    console.log("checkAnswer");
    
    var answerString = curAnswer.key + curAnswer.type;

    var inputAnswer = $("#quiz-chord-answer-input").val();
    inputAnswer = inputAnswer.charAt(0).toUpperCase() + inputAnswer.slice(1);

    if (inputAnswer === answerString) {
      flashGreen();
      showNextQuizItem();
    } else {
      flashRed();
      showAnswer();
    }
  }

  function flashGreen() {
    $("#quiz-chord-container").css({
      borderColor: "#00ff00",
      backgroundColor: "#ddffdd"
    });
    $("#quiz-chord-container").animate({
      borderTopColor: "#f0f0f0",
      borderLeftColor: "#f0f0f0",
      borderRightColor: "#f0f0f0",
      borderBottomColor: "#f0f0f0",
      backgroundColor: '#ffffff'
    }, 500);
  }

  function flashRed() {
    $("#quiz-chord-container").css({
      borderColor: "#ff0000",
      backgroundColor: "#ffdddd"
    });
    $("#quiz-chord-container").animate({
      borderTopColor: "#f0f0f0",
      borderLeftColor: "#f0f0f0",
      borderRightColor: "#f0f0f0",
      borderBottomColor: "#f0f0f0",
      backgroundColor: '#ffffff'
    }, 500);
  }

  function showAnswer() {
    console.log("showAnswer");

    var answerString = curAnswer.key + curAnswer.type;
    $("#quiz-chord-answer").html("<div>" + answerString + "</div>");
    $("#quiz-chord-answer-input").val(answerString);

    var numVariations = Voicings.getNumVariations(instrument, tuning, curAnswer.type);
    for (var i = 0; i < numVariations; i++) {
      var chordModel = Voicings.chordModelFromVoicing(instrument, tuning, curAnswer.type, curAnswer.key, i, true);
      var chordAnswerId = 'chord-answer-variant-' + i;
      $("#quiz-chord-answer").append('<div id="' + chordAnswerId + '" class="chord"></div>');
      new ChordView(
        chordAnswerId,
        answerViewOptions,
        chordModel);
    }
  }

  function toTitleCase(str)
  {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  $("#quiz-chord-answer-input").on("keyup", function(e) {
    if(e.keyCode === 13){
      checkAnswer();
    }
  });

  $("#quiz-chord-show-answer").on("click", function(e) {
    console.log("show answer clicked");
    showAnswer();
  });
  $("#quiz-chord-show-next").on("click", function(e) {
    console.log("skip button clicked");
    showNextQuizItem();
  });

  $(".tab-link").click(function(e) {
    e.preventDefault();
    $(this).tab('show');
  });

  // keep enter from submitting the form
  $("form").submit(function (e) {
    e.preventDefault();
  });

  createChordSelector();
  showNextQuizItem();

});