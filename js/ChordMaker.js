var ChordMaker = (function() {
  var self={}

  self.data_config_defaults = {
    // DATA DEFAULTS
    num_strings: 6,
    num_frets: 5,
    base_fret: 0,
    notes: [],
    label: ""
  }

  self.viz_config_defaults = {
    // RENDER PARAMERTES
    scale: 0.5,

    string_gap: 30,
    fret_gap: 30,

    finger_anno_y: 10,
    anno_font_size: 18,
    open_note_radius: 6,

    note_radius: 10,
    note_stroke_width: 1.5,

    nut_height: 5,
    grid_x: 20,
    grid_y: 60,
    grid_stroke_width: 1.5,

    label_font_size: 24,
    label_y_offset: 20,
  };

  self.r = null;

  self.scaleSize = function() {
    _.each(self.viz_config_defaults, function(num, key) {
      if (key != "scale") {
        self.config[key] = self.config[key] * self.config.scale;
      }
    })
  }

  self.render = function() {
    self.drawGrid(
      self.config.grid_x, self.config.grid_y,
      (self.config.num_strings-1)*self.config.string_gap, self.config.num_frets*self.config.fret_gap,
      self.config.num_strings-1, self.config.num_frets, "#000");
    self.drawNotes();

    if (self.config.base_fret == 0) {
      self.drawNut();
    } else {
      self.drawBaseFret(self.config.base_fret);
    }

    self.drawLabel();
  };

  self.drawGrid = function(x, y, w, h, wv, hv, color) {
    color = color || "#000";
    var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5, Math.round(x + w) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y) + .5],
        rowHeight = h / hv,
        columnWidth = w / wv;
    for (var i = 1; i < hv; i++) {
        path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
    }
    for (i = 1; i < wv; i++) {
        path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
    }
    self.elems.push(
      self.grid = self.r.path(path.join(",")).attr({stroke: color, 'stroke-width': self.config.grid_stroke_width})
    );
  };

  self.drawNotes = function() {

    var notes = self.config.notes;
    for(var i=0; i<notes.length; i++) {
      if(notes[i].muted) {
        self.drawMuteStringAnnotatation(notes[i].string);
      } else if (notes[i].open) {
        self.drawOpenStringAnnotatation(notes[i].string);
      } else {
        self.drawNote(notes[i].string, notes[i].fret, notes[i].tonic);
        self.drawFingerAnnotation(notes[i].string, notes[i].finger);
      }
    }
  };

  self.drawNote = function(string, fret, tonic) {
    if(!fret || fret == 0) { return; }

    var x = self.config.grid_x + (string * self.config.string_gap);
    var y = self.config.grid_y + (fret * self.config.fret_gap) - (self.config.fret_gap / 2);
    var note_style = {
      fill: "black"
    };
    if (tonic) {
      note_style['fill']         = "white";
      note_style['stroke-width'] = self.config.note_stroke_width;
      note_style['stroke']      = "black";
    }
    self.notes.push(
      self.r.circle(x,y,self.config.note_radius)
        .attr(note_style)
        .node.setAttribute("class", "chord-note")
    );
  };

  self.drawMuteStringAnnotatation = function(string) {
    var x = self.config.grid_x + (string * self.config.string_gap);
    var y = self.config.grid_y - self.config.finger_anno_y;
    self.annotations.push(
      self.r.text(x, y, "X").attr({ 'font-size': self.config.anno_font_size })
    );
  };

  self.drawOpenStringAnnotatation = function(string) {
    var x = self.config.grid_x + (string * self.config.string_gap);
    var y = self.config.grid_y - self.config.finger_anno_y;
    self.annotations.push(
      self.r.circle(x, y, self.config.open_note_radius).attr({ stroke: "black", fill: "white" })
    );
  };

  self.drawFingerAnnotation = function(string, finger) {
    var x = self.config.grid_x + (string * self.config.string_gap);
    var y = self.config.grid_y - self.config.finger_anno_y;
    var annotation_style = {
      fill: "black"
    };
    self.annotations.push(
      self.r.text(x, y, ""+finger).attr({ 'font-size': self.config.anno_font_size })
    );
  };

  self.drawNut = function() {
    self.elems.push(
      self.r.rect(self.config.grid_x,self.config.grid_y, (self.config.num_strings-1)*self.config.string_gap, self.config.nut_height).attr({ fill: "black"})
    );
  };

  self.drawBaseFret = function(base_fret) {
    var x = self.config.num_strings*self.config.string_gap + 20;
    var y = self.config.grid_y + self.config.fret_gap/2;
    self.elems.push(
      self.r.text(x,y, ""+base_fret+"fr.").attr({ 'font-size': self.config.anno_font_size })
    );
  };

  self.drawLabel = function() {
    var x = 0;
    var y = self.config.label_y_offset;
    var fancy_label = self.config.label
      .replace(/b/g, "♭")
      .replace(/\#/g, "♯")
      .replace(/\*/g, "￮");
    self.elems.push(
      self.r.text(x,y,fancy_label).attr({ "text-anchor": "start", "font-size": self.config.label_font_size })
    );
  }

  return {
    makeChord: function(element, config) {

      // Create config dict
      if (!config) { config = {}; }
      _.defaults(config, self.viz_config_defaults)
      _.defaults(config, self.data_config_defaults);
      self.config = config;

      if (self.config.scale != 1) {
        self.scaleSize();
      }

      self.width = self.config.num_strings*self.config.string_gap + 20 + 30;
      self.height = self.config.grid_y + self.config.num_frets*self.config.fret_gap + 10;

      if (_.isString(element)) {
        self.r = Raphael(document.getElementById(element), self.width, self.height);
      } else {
        self.r = Raphael(element, self.width, self.height);
      }

      self.elems = self.r.set().transform("S"+self.scale+","+self.scale);
      self.notes = self.r.set();
      self.annotations = self.r.set();
      self.elems.push(self.notes, self.annotations);
      self.render();

      var result = self.r;

      // Clean up
      self.r = null;
      self.config = null;

      return result;
    },

    // Ex. "2,T|4,4|4,3|3,2|2,1|2,1"
    makeChordFromString: function(element, chord_str, scale) {
      if (!scale) { scale = 1; }
      var tokens = chord_str.split("|");
      var num_strings = tokens.length;
      var num_frets = 5;
      var notes = [];
      _.each(tokens, function(token, index) {
        var note = {};
        var nums = token.split(",");

        var fret = nums[0];
        var finger = nums[1];
        var tonic = nums[2];

        if (!fret) { return; }
        if (fret.match(/[oO0]/)) {
          note.string = index;
          note.fret = 0;
          note.open = true;
        } else if (fret.match(/[mMxX]/)) {
          note.string = index;
          note.muted = true;
        } else {
          if (parseInt(fret) > num_frets) { num_frets = parseInt(fret); }
          note.string = index;
          note.fret = parseInt(fret);
        }

        if (finger) {
          note.finger = finger;
        }

        if (tonic) {
          note.tonic = true;
        }

        notes.push(note);
      });

      ChordMaker.makeChord(element, {
        'scale': scale,
        'notes': notes,
        'num_frets': num_frets,
        'num_strings': num_strings
      });
    },

    parseChordsInPage: function(class_name) {
      if(!class_name) { class_name = "chord"; }
      $("."+class_name).each(function() {
        var chord_str = $(this).html();
        var elem = $(this)[0];
        $(this).html("");
        $(this).append('<p class="chord-str" style="display: none;">'+chord_str+'</p>');
        $(this).css("display","inline-block");
        ChordMaker.makeChordFromString(elem, chord_str, 0.5);
      });
    }
  };

})();