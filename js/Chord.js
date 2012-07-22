
Chord = function(_config, _element) {

  var self = {};

  var width;
  var height;

  var data_config_defaults = {
    // DATA DEFAULTS
    num_strings: 6,
    num_frets: 5,
    base_fret: 0,
    notes: [],
    label: ""
  }

  var viz_config_defaults = {
    // RENDER DEFAULTS
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

  var r = null; // raphael object

  var notes;
  var annotations;
  var config;

  var scaleSize = function() {
    _.each(viz_config_defaults, function(num, key) {
      if (key != "scale") {
        self.config[key] = self.config[key] * self.config.scale;
      }
    })
  }

  var render = function() {
    drawGrid(
      self.config.grid_x, self.config.grid_y,
      (self.config.num_strings-1)*self.config.string_gap, self.config.num_frets*self.config.fret_gap,
      self.config.num_strings-1, self.config.num_frets, "#000");
    drawNotes();

    if (self.config.base_fret == 0) {
      drawNut();
    } else {
      drawBaseFret(self.config.base_fret);
    }

    drawLabel();
  };

  var drawGrid = function(x, y, w, h, wv, hv, color) {
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
      self.grid = r.path(path.join(",")).attr({stroke: color, 'stroke-width': self.config.grid_stroke_width})
    );
  };

  var drawNotes = function() {

    var notes = self.config.notes;
    for(var i=0; i<notes.length; i++) {
      if(notes[i].muted) {
        drawMuteStringAnnotatation(notes[i].string);
      } else if (notes[i].open) {
        drawOpenStringAnnotatation(notes[i].string);
      } else {
        drawNote(notes[i].string, notes[i].fret, notes[i].tonic);
        drawFingerAnnotation(notes[i].string, notes[i].finger);
      }
    }
  };

  var drawNote = function(string, fret, tonic) {
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
      r.circle(x,y,self.config.note_radius)
        .attr(note_style)
        .node.setAttribute("class", "chord-note")
    );
  };

  var drawMuteStringAnnotatation = function(string) {
    var x = self.config.grid_x + (string * self.config.string_gap);
    var y = self.config.grid_y - self.config.finger_anno_y;
    self.annotations.push(
      r.text(x, y, "X").attr({ 'font-size': self.config.anno_font_size })
    );
  };

  var drawOpenStringAnnotatation = function(string) {
    var x = self.config.grid_x + (string * self.config.string_gap);
    var y = self.config.grid_y - self.config.finger_anno_y;
    self.annotations.push(
      r.circle(x, y, self.config.open_note_radius).attr({ stroke: "black", fill: "white" })
    );
  };

  var drawFingerAnnotation = function(string, finger) {
    var x = self.config.grid_x + (string * self.config.string_gap);
    var y = self.config.grid_y - self.config.finger_anno_y;
    var annotation_style = {
      fill: "black"
    };
    self.annotations.push(
      r.text(x, y, ""+finger).attr({ 'font-size': self.config.anno_font_size })
    );
  };

  var drawNut = function() {
    self.elems.push(
      r.rect(self.config.grid_x,self.config.grid_y, (self.config.num_strings-1)*self.config.string_gap, self.config.nut_height).attr({ fill: "black"})
    );
  };

  var drawBaseFret = function(base_fret) {
    var x = self.config.num_strings*self.config.string_gap + 20;
    var y = self.config.grid_y + self.config.fret_gap/2;
    self.elems.push(
      r.text(x,y, ""+base_fret+"fr.").attr({ 'font-size': self.config.anno_font_size })
    );
  };

  var drawLabel = function() {
    var x = 0;
    var y = self.config.label_y_offset;
    var fancy_label = self.config.label
      .replace(/b/g, "♭")
      .replace(/\#/g, "♯")
      .replace(/\*/g, "￮");
    self.elems.push(
      r.text(x,y,fancy_label).attr({ "text-anchor": "start", "font-size": self.config.label_font_size })
    );
  }

  // var getString = function() {
  //     return string;
  //   };
  //   self.getString = getString;

  // var addNote = function() {
  //
  // };
  // self.addNote = addNote;
  // var removeNote = function() {
  //
  // };
  // self.removeNote = removeNote;

  var init = function(_config, _element) {
    // Create config dict
    if (!_config) { _config = {}; }
    _.defaults(_config, viz_config_defaults)
    _.defaults(_config, data_config_defaults);
    self.config = _config;

    if (self.config.scale != 1) {
      scaleSize();
    }

    self.width = self.config.num_strings*self.config.string_gap + 20 + 30;
    self.height = self.config.grid_y + self.config.num_frets*self.config.fret_gap + 10;

    if (_.isString(element)) {
      r = Raphael(document.getElementById(element), self.width, self.height);
    } else {
      r = Raphael(element, self.width, self.height);
    }

    self.elems = r.set();
    self.notes = r.set();
    self.annotations = r.set();
    self.elems.push(self.notes, self.annotations);
    render();
  };

  init(_config, _element);
  return self;
};