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
      var fret_gap = 30;
      var scale = 0.5;
      var orientation = "top";
      var notes_to_add = [];

      var default_color = "white";
      var color = "white";

      var lines = chord_str.split("\n");
      _.each(lines, function(line) {

        if (line == "") { return; }

        // Deal with chord config string
        if (line.indexOf("[")!=-1) {
          line = line.replace(/^\[|\]$/g, '');
          var params = line.split(",");
          _.each(params, function(param) {
            param = param.replace(/^\s+|\s+$/g, '');
            var tokens = param.split("=");
            var key = tokens[0];
            var val = tokens[1];
            if (key=="base_fret") {
              base_fret = parseInt(val);
            } else if (key=="label") {
              label = val;
            } else if (key=="orientation") {
              orientation = val;
            } else if (key=="num_frets") {
              num_frets = parseInt(val);
            } else if (key=="scale") {
              scale = parseFloat(val);
            } else if (key=="fret_gap") {
              fret_gap = parseInt(val);
            }
          });
          return;
        }

        var string_regex = /\s*(\d{1,2}):/;
        var string_num = parseInt(line.match(string_regex)[1].replace(/^\s+|\s+$/g, ''));
        // console.log(string_num);

        var notes_part = line.replace(string_regex, "");
        // console.log(notes_part);

        var notes = notes_part.split(',');
        _.each(notes, function(note) {
          color = default_color;

          // Deal with config string
          var config_regex = /\(.*\)/g;
          var config_str = note.match(config_regex);

          if (config_str) {
            var config_str2 = config_str[0];
            note = note.replace(config_str2, "");
            config_str2 = config_str2.replace(/^\(|\)$/g, '');
            var params = config_str2.split(";");
            _.each(params, function(param) {
              if (param == "") { return; }
              var tokens = param.split(":");
              // console.log("param: " + param);
              var key = tokens[0].replace(/^\s+|\s+$/g, '');
              var val = tokens[1].replace(/^\s+|\s+$/g, '');

              if (key == "color") {
                color = val;
              }
            });
          }

          var theNote = {};
          theNote.string = string_num;

          if (note.indexOf("{") != -1) {
            note = note.replace(/[{|}]/g, "");
            var tokens = note.split(" ");
            theNote.fret = tokens[0].replace(/^\s+|\s+$/g, '');
            if (tokens[1]) { theNote.finger = tokens[1]; }
          } else {
            theNote.fret = note.replace(/^\s+|\s+$/g, '');
          }

          if (theNote.fret.match(/^[oO0]$/)) {
            theNote.fret = 0;
            theNote.open = true;
          } else if (theNote.fret.match(/[mMxX]/)) {
            theNote.muted = true;
          } else {
            theNote.fret = parseInt(theNote.fret);
            var fret_amt = (parseInt(theNote.fret)-base_fret);
            if (fret_amt > num_frets) { num_frets = theNote.fret+1; }
          }

          theNote.color = color;
          notes_to_add.push(_.clone(theNote));
        });


      });

      var result = Chord(element, {
        'scale': scale,
        'num_frets': num_frets,
        'num_strings': num_strings,
        'base_fret': base_fret,
        'scale': scale,
        'orientation': orientation,
        'label': label,
        'fret_gap': fret_gap
      });
      result.addNotes(notes_to_add);
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