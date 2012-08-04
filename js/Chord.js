
Chord = function(_element, _config) {

  // CONSTANTS
  var NUT_TOP = 1,
      NUT_LEFT = 2;

  var self = {};

  self.config = {};
  self.diagram_glyphs = {};
  var notes = [];
  var neck = {
    glyphs: {},
    width: 0,
    height: 0
  };
  var note_colors = {
    'black': '90-#000:5-#555:95',
    'white': '90-#eee:5-#fff:95',
    'blue' : '90-#22f:5-#55f:95',
    'red'  : '90-#f22:5-#f55:95',
    'green': '90-#0f0:5-#0f0:95'
  }

  // raphael object
  var r = null;
  var transform_str = "";

  var data_config_defaults = {
    // DATA DEFAULTS
    num_strings: 6,
    num_frets: 5,
    base_fret: 1,
    notes: [],
    label: "",
    tuning: "EADGBe"
  }

  var viz_config_defaults = {
    // RENDER DEFAULTS
    scale: 0.5,
    orientation: NUT_TOP,

    string_gap: 30,
    fret_gap: 30,

    finger_anno_y: 10,
    anno_font_size: 18,
    open_note_radius: 6,

    note_radius: 10,
    note_stroke_width: 1.5,
    note_color: 'white',
    tonic_color: 'black',

    neck_marker_radius: 8,
    neck_marker_color: "#999",

    nut_height: 5,
    grid_x: 20,
    grid_y: 60,
    grid_stroke_width: 1.5,
    grid_bottom_padding: 20,

    label_font_size: 36,
    label_y_offset: 20,

    tuning_label_font_size: 18,
    tuning_label_offset: 14,

    base_fret_font_size: 26,
    base_fret_offset: 14
  };

  var scaleSize = function() {
    _.each(viz_config_defaults, function(num, key) {
      if (key != "scale" && _.isNumber(self.config[key])) {
        self.config[key] = self.config[key] * self.config.scale;
      }
    })
  }

  var registerGlyph = function(model, glyph, glyph_name) {
    model.glyphs[glyph_name] = glyph;
    self.diagram_glyphs(glyph);
  }

  var render = function() {
    neck.width = (self.config.num_strings-1)*self.config.string_gap;
    neck.height = self.config.num_frets*self.config.fret_gap;

    drawNeck(
      self.config.grid_x, self.config.grid_y,
      neck.width, neck.height,
      self.config.num_strings-1, self.config.num_frets, "#000"
    );

    if (self.config.base_fret == 1) {
      drawNut();
    } else {
      drawBaseFret(self.config.base_fret);
    }

    drawLabel();
    drawTuningLabel();

  };

  var setOrientation = function(orientation) {
    if (_.isString(orientation)) {
      if (orientation == "left") { setOrientation(NUT_LEFT); }
      else if (orientation == "top") { setOrientation(NUT_TOP); }
    }
    if (!_.include([NUT_TOP, NUT_LEFT], orientation)) { return; }

    // TODO: Deal correctly with chord label

    if (orientation == NUT_TOP) {

      transform_str = "";
      self.width = self.config.grid_x + neck.width + 20 + 20;
      self.height = self.config.grid_y + neck.height + 10 + self.config.grid_bottom_padding;
      r.setSize(self.width, self.height);

    } else if (orientation == NUT_LEFT) {
      // Rotate Horizontally
      // var transform_str = "t-"+neck.height+",0" + "r-90,"+self.config.grid_x+","+self.config.grid_y;

      var rotate_o_x = (self.config.grid_x+(neck.width/2));
      var rotate_o_y = (self.config.grid_y+(neck.height/2));
      var translate_x = -(self.width - self.height) / 2;
      var translate_y = (self.height - self.width) / 2;
      transform_str = "r-90,"+ rotate_o_x +","+ rotate_o_y +"t"+translate_x+"," + translate_y;

      //console.log(transform_str);

      self.width = self.config.grid_x + neck.height + 20 + 20;
      self.height = self.config.grid_y + neck.width + 10 + self.config.grid_bottom_padding;
      r.setSize(self.width, self.height);

    }
    _.each(neck.glyphs, function(glyph) {
      _.each(neck.glyphs, function(glyph) {
        if(_.isArray(glyph)) {
          _.each(glyph, function(glyph) {
            glyph.transform(transform_str);
          });
        } else {
          glyph.transform(transform_str);
        }

      });
    });
    _.each(notes, function(note, note_id) {
      _.each(note.glyphs, function(glyph) {
        glyph.transform(transform_str);
      });
    });
  }

  var drawNeck = function(x, y, w, h, wv, hv, color) {
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

    neck.glyphs['grid_back'] = r.rect(self.config.grid_x, self.config.grid_y, neck.width, neck.height).attr("fill", "white");
    drawNeckMarkers();
    neck.glyphs['grid'] = r.path(path.join(",")).attr({stroke: color, 'stroke-width': self.config.grid_stroke_width});

    // TODO: Start Here
    //       Hacky code to do a cursor and to add notes.
    //       Needs to be hella formalized
    // self.grid_back.mousemove(_.bind(function(e) {
    //       var mouse_grid_x = e.offsetX - self.config.grid_x;
    //       var mouse_grid_y = e.offsetY - self.config.grid_y;
    //
    //       var closest_string = Math.round(mouse_grid_x / self.config.string_gap);
    //       var closest_fret = Math.ceil(mouse_grid_y / self.config.fret_gap);
    //       //console.log(""+closest_string+","+closest_fret);
    //
    //       if (closest_string != self.cursor_note_string ||
    //           closest_fret   != self.cursor_note_fret) {
    //         self.cursor_note_string = closest_string;
    //         self.cursor_note_fret = closest_fret;
    //         if (self.cursor_note) {
    //           self.cursor_note.remove();
    //         }
    //         self.cursor_note = drawNote({
    //           fret: self.cursor_note_fret,
    //           string: self.cursor_note_string
    //         });
    //         self.cursor_note.click(function() {
    //           self.cursor_note = null;
    //         });
    //       }
    //     }, self));
  };

  var drawNeckMarkers = function() {
    var markers = [
      [5, 1],
      [7, 2],
      [9, 1],
      [12,2],
      [15,1],
      [17,1]
    ];
    neck.glyphs['neck-markers'] = [];

    for (var i=0; i<markers.length; i++) {
      var marker = markers[i];
      if(marker[0] > self.config.base_fret &&
         marker[0] < self.config.base_fret+self.config.num_frets) {
        drawNeckMarker(marker);
      }
    }
  };

  var drawNeckMarker = function(neck_marker) {
    if(_.isUndefined(neck_marker)) { return; }

    var y = self.config.grid_y + ((neck_marker[0]-(self.config.base_fret-1)) * self.config.fret_gap) - (self.config.fret_gap/2);
    var marker_style = {
      fill: "90-#bbb:5-#ccc:95",
      stroke: "none"
    };

    if (neck_marker[1] == 1) {
      var x = self.config.grid_x + neck.width/2;

      var glyph = r.circle(x,y,self.config.neck_marker_radius);
      glyph.attr(marker_style);
      neck.glyphs['neck-markers'].push(glyph);

    } else if (neck_marker[1] == 2) {
      var x1 = self.config.grid_x + (1.2 * self.config.string_gap);
      var x2 = self.config.grid_x + (3.8 * self.config.string_gap);

      var glyph1 = r.circle(x1,y,self.config.neck_marker_radius);
      glyph1.attr(marker_style);
      neck.glyphs['neck-markers'].push(glyph1);

      var glyph2 = r.circle(x2,y,self.config.neck_marker_radius);
      glyph2.attr(marker_style);
      neck.glyphs['neck-markers'].push(glyph2);
    }
  };

  var drawNut = function() {
    var glyph = r.rect(self.config.grid_x,self.config.grid_y, (self.config.num_strings-1)*self.config.string_gap, self.config.nut_height).attr({ fill: "black"});

    neck.glyphs['nut'] = glyph;
    //self.neck.push(glyph);
  };

  var drawTuningLabel = function() {
    neck.glyphs['tuning-labels'] = [];
    for (var i=0; i<self.config.tuning.length; i++) {
      var note = self.config.tuning[i];

      var x = self.config.grid_x + (i * self.config.string_gap);
      var y = self.config.grid_y + neck.height + self.config.tuning_label_offset;
      var annotation_style = {
        fill: "black"
      };

      var glyph = r.text(x, y, "" + note).attr({ 'font-size': self.config.tuning_label_font_size });
      neck.glyphs['tuning-labels'].push(glyph);
    }
  }

  var drawBaseFret = function(base_fret) {
    var x = self.config.grid_x + neck.width + self.config.base_fret_offset;
    var y = self.config.grid_y + self.config.fret_gap/2;

    r.text(x,y, ""+base_fret+"fr.").attr({ 'text-anchor': 'start', 'font-size': self.config.base_fret_font_size });
  };

  var drawNotes = function(notes) {
    if (_.isArray(notes)) {
      _.each(notes, _.bind(drawNote, self));
    } else if (_.isString(notes)) {
      // TODO
    }
  };

  var drawNote = function(note) {
    if (_.isUndefined(note)) { return; }

    if (_.isString(note)) {
      // TODO:
    } else if (_.isObject(note)) {
      if(note.muted) {
        drawMuteStringAnnotatation(note).transform(transform_str);
      } else if (note.fret == 0 || note.open) {
        drawOpenStringAnnotatation(note).transform(transform_str);
      } else {
        drawFretMarker(note).transform(transform_str);
        if (note.finger) {
          drawFingerAnnotation(note).transform(transform_str);
        }
      }
    }
  }

  var drawFretMarker = function(note) {
    if(_.isUndefined(note.fret) || note.fret == 0) { return; }

    if (note.fret < self.config.base_fret ||
        note.fret > self.config.base_fret + self.config.num_frets) { return; }

    var x = self.config.grid_x + (note.string * self.config.string_gap);
    var y = self.config.grid_y + ((note.fret-self.config.base_fret+1) * self.config.fret_gap) - (self.config.fret_gap / 2);
    var note_style = {
      fill: note_colors[self.config.note_color]
    };
    if (note.color) {
      note_style['fill'] = note_colors[note.color];
    }
    if (note.tonic) {
      note_style['fill']         = note_colors[self.config.tonic_color];
      note_style['stroke-width'] = self.config.note_stroke_width;
      note_style['stroke']      = "black";
    }

    var class_str = "chord-note";
    if (note.class) { class_str = class_str + " " + note.class; }

    var glyph = r.circle(x,y,self.config.note_radius);
    glyph.node.setAttribute("class", class_str);
    glyph.attr(note_style);

    note.glyphs['fret-marker'] = glyph;
    return glyph;
  };

  // TODO: adjust this api
  //       This is not robust at all
  var drawFretMarkerGroup = function(note_group) {
    var note;
    for(var i=0; i<note_group.frets.length; i++) {
      note = {};
      note.string = note_group.string;
      note.fret = note_group.frets[i];
      note.glyphs = {};

      drawNote(note);
    }
  };

  var drawMuteStringAnnotatation = function(note) {
    if (_.isUndefined(note.string)) { return; }
    var x = self.config.grid_x + (note.string * self.config.string_gap);
    var y = self.config.grid_y - self.config.finger_anno_y;

    var glyph = r.text(x, y, "X").attr({ 'font-size': self.config.anno_font_size });
    note.glyphs['finger-annotation'] = glyph;
    return glyph;
  };

  var drawOpenStringAnnotatation = function(note) {
    if (_.isUndefined(note.string)) { return; }
    var x = self.config.grid_x + (note.string * self.config.string_gap);
    var y = self.config.grid_y - self.config.finger_anno_y;

    var glyph = r.circle(x, y, self.config.open_note_radius).attr({ stroke: "black", fill: "white" });
    note.glyphs['finger-annotation'] = glyph;
    return glyph;
  };

  var drawFingerAnnotation = function(note) {
    if (_.isUndefined(note.string) || _.isUndefined(note.finger)) { return; }

    var x = self.config.grid_x + (note.string * self.config.string_gap);
    var y = self.config.grid_y - self.config.finger_anno_y;
    var annotation_style = {
      fill: "black"
    };

    var glyph = r.text(x, y, ""+note.finger).attr({ 'font-size': self.config.anno_font_size });
    note.glyphs['finger-annotation'] = glyph;
    return glyph;
  };

  var drawLabel = function() {
    var x = self.config.grid_x + (neck.width / 2);
    var y = self.config.label_y_offset;
    var fancy_label = self.config.label
      .replace(/b/g, "♭")
      .replace(/\#/g, "♯")
      .replace(/\*/g, "￮");
    r.text(x,y,fancy_label).attr({ "text-anchor": "middle", "font-size": self.config.label_font_size });
  }

  var getNumStrings = function() {
    return self.config.num_strings;
  };
  self.getNumStrings = getNumStrings;
  var getBaseFret = function() {
    return self.config.base_fret;
  };
  self.getBaseFret = getBaseFret;
  var getNumFrets = function() {
    return self.config.num_frets;
  };
  self.getNumFrets = getNumFrets;
  var getTuning = function() {
    return self.config.tuning;
  };
  self.getTuning = getTuning;

  var getCode = function() {
    return "TODO";
  };
  self.getCode = getCode;

  // var getString = function() {
  //     return string;
  //   };
  //   self.getString = getString;

  var addNote = function(note, color) {
    if (_.isUndefined(note)) { return; }

    if (_.isString(note)) {}
    else if (_.isObject(note)) {

      if (color) { note.color = color; }
      if (note.frets) {
        var groupNote = {}
        for(var i=0; i<note.frets.length; i++) {
          groupNote = {};
          groupNote.string = note.string;
          groupNote.fret = note.frets[i];
          groupNote.glyphs = {};

          drawNote(groupNote);
          notes.push(_.clone(groupNote));
        }
      } else {
        note.glyphs = {};
        drawNote(note);
        notes.push(_.clone(note));
      }

    }
  };
  self.addNote = addNote;

  var addNotes = function(notes, color) {
    if (_.isArray(notes)) {
      for (var i=0; i<notes.length; i++) {
        addNote(notes[i], color);
      }
    }
  }
  self.addNotes = addNotes;

  var removeNote = function(note) {
    if (_.isString(note)) { // note id

    } else if (_.isObject(note)) {

    } else if (_.isArray(note)) {

    }
  };
  self.removeNote = removeNote;

  var init = function(_element, _config) {
    // Create config dict, filling in defaults where not provided
    if (!_config) { _config = {}; }
    _.defaults(_config, viz_config_defaults)
    _.defaults(_config, data_config_defaults);
    self.config = _config;

    if (self.config.label == "") {
      self.config.grid_y = 10;
    }

    // Scaling is done by scaling all the constant factors in the render code
    if (self.config.scale != 1) {
      scaleSize();
    }

    self.width = self.config.grid_x + self.config.num_strings*self.config.string_gap + 20 + 20;
    self.height = self.config.grid_y + self.config.num_frets*self.config.fret_gap + 10 + self.config.grid_bottom_padding + 20;

    if (_.isString(_element)) {
      r = Raphael(document.getElementById(_element), self.width, self.height);
    } else {
      r = Raphael(_element, self.width, self.height);
    }

    render();

    self.addNotes(self.config.notes);

    if (self.config.orientation == "left") {
      setOrientation(NUT_LEFT);
    }

  };

  init(_element, _config);
  return self;
};