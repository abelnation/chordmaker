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
    "9": true,
    // "7(b9)": true,
    "m": true,
    "m6": true,
    // "m6/9": true,
    // "*7": true,
    "m7": true,
    "m7(b5)": true,
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

  var requireKey = false;
  var curAnswer = {
    key: "C",
    type: "M"
  };
  var curInput = {
    key: null,
    acc: "",
    type: null,
  };

  var factory = new GuitarNoteFactory({ numFrets: 15 });

  function createChordSelectButtons() {

    console.log("createChordSelectButtons");
    $("#quiz-input-type").empty();
    for (var i = 0; i < chordList.length; i++) {
      var isChecked = (chordList[i] in selectedChords);
      if (isChecked) {
        $("#quiz-input-type").append('\
          <button type="button" class="btn btn-default" data-type="' + chordList[i] + '">' + chordList[i] + '</button>\
        ');
      }
    }

    $("#quiz-input-type > button").on("click", function(e) {
      $("#quiz-input-type > button").removeClass("active");
      $(e.target).addClass("active");

      curInput.type = $(e.target).attr("data-type");
      console.log("type: " + curInput.type);

      checkAnswer();

      e.preventDefault();
      return false;
    });
  }

  function createChordSelector() {
    console.log("createChordSelector");

    // Setup Require key control
    $("#require-key-checkbox").prop("checked", requireKey);
    $("#quiz-input-key").toggleClass("hide", !requireKey);
    $("#quiz-input-acc").toggleClass("hide", !requireKey);

    $("#require-key-checkbox").on('change', function(e) {
      var checkedVal = $(e.target).attr("checked");
      console.log("checked: " + checkedVal);

      requireKey = (checkedVal === "checked");
      saveSettings();

      console.log("require key: " + requireKey);

      $("#quiz-input-key").toggleClass("hide", !requireKey);
      $("#quiz-input-acc").toggleClass("hide", !requireKey);

      checkAnswer();

      e.preventDefault();
    });

    // Create checkbox for each chord type
    var selectorForm = $("#quiz-chord-selector");
    for (var i = 0; i < chordList.length; i++) {
      var isChecked = (chordList[i] in selectedChords);

      $("#chordmaker-navbar-collapse > ul").append(' \
        <label class="chord-select"><li><div class="checkbox"> \
            <input type="checkbox"' + (isChecked ? " checked" : "") + ' data-type="' + chordList[i] + '">' + chordList[i] + ' \
        </div><div class="clearfix"></div></li></label> \
      ');
    }

    // Handler for chord type checkboxes
    $("label.chord-select input").on("change", function(e) {
      var isChecked = ($(e.target).attr("checked") ? true : false);
      var chordType = $(e.target).attr("data-type");

      console.log(chordType);

      if (isChecked) {
        selectedChords[chordType] = true;
      } else {
        delete selectedChords[chordType];
      }
      
      saveSettings();

      createChordSelectButtons();
      showNextQuizItem();

      e.preventDefault();
    });
  }

  function saveSettings() {
    console.log("Save settings");

    if (localStorage) {
      localStorage.setItem("selectedChords", JSON.stringify(selectedChords));
      localStorage.setItem("requireKey", requireKey);
    }
  }

  function loadSettings() {
    console.log("Load settings");

    var ls_selectedChords;
    var ls_requireKey;
    if (localStorage) {
      ls_selectedChords = localStorage.getItem("selectedChords");
      ls_requireKey = localStorage.getItem("requireKey");

      if (ls_selectedChords !== null) {
        console.log("selectedChords: " + ls_selectedChords);
        selectedChords = JSON.parse(ls_selectedChords);
      }
      if (ls_requireKey !== null) {
        console.log("requireKey: " + ls_requireKey);
        requireKey = JSON.parse(ls_requireKey);
      }
    }
  }

  function showNextQuizItem() {
    console.log("showNextQuizItem");

    $("#quiz-chord-diagram").empty();
    $("#quiz-chord-answer").empty();
    $("#quiz-chord-answer-input").val("");

    curInput = {
      key: null,
      acc: "",
      type: null,
    };

    // get random chord type
    var chordIdx = Math.floor(Math.random() * Object.keys(selectedChords).length);
    var chord = Object.keys(selectedChords)[chordIdx];

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
    if (requireKey) {
      if (curInput.key===null || curInput.type===null) {
        console.log("no check");
        return;
      }
    } else {
      if (curInput.type===null) {
        console.log("no check");
        return;
      }
    }

    $("#quiz-input button").removeClass("active");
    $("#quiz-input-type button").blur();

    var answerString;
    var inputAnswer;
    if (requireKey) {
      answerString = curAnswer.key + curAnswer.type;
      inputAnswer = curInput.key + curInput.acc + curInput.type;
    } else {
      answerString = curAnswer.type;
      inputAnswer = curInput.type;
    }

    if (inputAnswer === answerString) {
      flashGreen();
      showNextQuizItem();
    } else {
      flashRed();
      showAnswer();
    }

    curInput.key = null;
    curInput.acc = null;
    curInput.type = null;
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

  $("#quiz-input-key > button").on("click", function(e) {
    $("#quiz-input-key > button").removeClass("active");
    $(e.target).addClass("active");

    curInput.key = $(e.target).attr("data-key");
    console.log("key: " + curInput.key);

    checkAnswer();

    e.preventDefault();
    return false;
  });
  $("#quiz-input-acc > button").on("click", function(e) {
    $("#quiz-input-acc > button").removeClass("active");
    $(e.target).addClass("active");

    var accValue = $(e.target).attr("data-acc");
    curInput.acc = (accValue === "flat" ? "b" : (accValue === "sharp" ? "#" : ""));
    console.log("acc: " + curInput.acc);

    checkAnswer();

    e.preventDefault();
    return false;
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

  loadSettings();

  createChordSelector();
  createChordSelectButtons();

  showNextQuizItem();

});