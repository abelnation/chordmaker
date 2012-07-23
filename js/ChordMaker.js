var ChordMaker = (function() {
  var self={}

  return {
    makeChord: function(element, config) {
      return Chord(element, config);
    },

    // TODO: Goddamn, clean up this function
    makeChordFromString: function(element, chord_str, scale) {
      if (!scale) { scale = 1; }
      chord_str = chord_str.replace(/^\s+|\s+$/g, '');
      if (chord_str == "") { return; }

      var num_strings = 6;
      var num_frets = 5;
      var base_fret = 1;
      var label = "";
      var notes = [];

      var color = "white";

      var lines = chord_str.split("\n");
      _.each(lines, function(line) {
        if (line == "") { return; }
        if (line.indexOf("[")!=-1) {
          line = line.replace(/^\[|\]$/g, '');
          var params = line.split(",");
          _.each(params, function(param) {
            var tokens = param.split("=");
            var key = tokens[0];
            var val = tokens[1];
            if (key=="base_fret") {
              base_fret = parseInt(val);
            } else if (key=="label") {
              label = val;
            }
          });
          return;
        }
        var notes_regex = /(\d{1,2},(\d{1,2}|[mMxX]),([\d|[mMxXTt])\|?)+/g;
        notes_str = line.match(notes_regex)[0];
        console.log(notes_str);

        // Deal with config string
        var config_regex = /\(.*\)/g;
        config_str = line.match(config_regex);

        if (config_str) {
          config_str2 = config_str[0];
          config_str2 = config_str2.replace(/^\(|\)$/g, '');
          var params = config_str2.split(",");
          _.each(params, function(param) {
            var tokens = param.split("=");
            var key = tokens[0];
            var val = tokens[1];
            if (key == "color") {
              color = val;
            }
          });
        }

        // Deal with note string
        var tokens = notes_str.split("|");
        _.each(tokens, function(token, index) {
          var note = {};
          var nums = token.split(",");

          var string = nums[0];
          var fret = nums[1];
          var finger = nums[2];
          var tonic = undefined;

          if (!fret || !string) { return; }
          if (fret.match(/^[oO0]$/)) {
            note.string = string;
            note.fret = 0;
            note.open = true;
          } else if (fret.match(/[mMxX]/)) {
            note.string = string;
            note.muted = true;
          } else {
            if ((parseInt(fret)-base_fret) > num_frets) { num_frets = parseInt(fret); }
            note.string = string;
            note.fret = parseInt(fret);
          }

          if (finger) {
            note.finger = finger;
          }
          if (tonic) {
            note.tonic = true;
          }
          if (color) {
            note.color = color;
          }

          notes.push(note);
        });


      });

      var result = Chord(element, {
        'scale': scale,
        'num_frets': num_frets,
        'num_strings': num_strings,
        'base_fret': base_fret,
        'label': label
      });
      result.addNotes(notes);
      return result
    },

    parseChordsInPage: function(class_name) {
      if(!class_name) { class_name = "chord"; }
      $("."+class_name).each(function() {
        var chord_str = $(this).html();
        var elem = $(this)[0];
        $(this).html("");
        $(this).append('<p class="chord-str" style="display: none;">'+chord_str+'</p>');
        $(this).css("display","inline-block");
        return ChordMaker.makeChordFromString(elem, chord_str, 0.5);
      });
    }
  };

})();