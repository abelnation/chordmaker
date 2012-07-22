
Chord = function(_element, _config) {

  var self = {};

  var width;
  var height;

  var grid_width;
  var grid_height;

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

    label_font_size: 36,
    label_y_offset: 20,

    base_fret_font_size: 26,
    base_fret_offset: 14
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
    grid_width = (self.config.num_strings-1)*self.config.string_gap;
    grid_height = self.config.num_frets*self.config.fret_gap;

    drawGrid(
      self.config.grid_x, self.config.grid_y,
      grid_width, grid_height,
      self.config.num_strings-1, self.config.num_frets, "#000");
    drawNotes();

    if (self.config.base_fret == 0) {
      drawNut();
    } else {
      drawBaseFret(self.config.base_fret);
    }

    drawLabel();

    // Rotate Horizontally
    var transform_str = "r-90,"+self.config.grid_x+","+self.config.grid_y+"t-"+grid_height+",0";
    //console.log(transform_str);
    //self.neck.transform(transform_str);
    self.notes.forEach(function(e) {
      //e.transform(transform_str);
    })

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

    self.grid_back = r.rect(self.config.grid_x, self.config.grid_y, grid_width, grid_height).attr("fill", "white");
    self.grid = r.path(path.join(",")).attr({stroke: color, 'stroke-width': self.config.grid_stroke_width})
    self.neck.push(
      self.grid,
      self.grid_back
    );

    // TODO: Start Here
    //       Hacky code to do a cursor and to add notes.
    //       Needs to be hella formalized
    self.grid_back.mousemove(_.bind(function(e) {
      var mouse_grid_x = e.offsetX - self.config.grid_x;
      var mouse_grid_y = e.offsetY - self.config.grid_y;

      var closest_string = Math.round(mouse_grid_x / self.config.string_gap);
      var closest_fret = Math.ceil(mouse_grid_y / self.config.fret_gap);
      //console.log(""+closest_string+","+closest_fret);

      if (closest_string != self.cursor_note_string ||
          closest_fret   != self.cursor_note_fret) {
        self.cursor_note_string = closest_string;
        self.cursor_note_fret = closest_fret;
        if (self.cursor_note) {
          self.cursor_note.remove();
        }
        self.cursor_note = drawNote({
          fret: self.cursor_note_fret,
          string: self.cursor_note_string
        });
        self.cursor_note.click(function() {
          self.cursor_note = null;
        });
      }
    }, self));
  };

  var drawNotes = function() {

    var theNotes = self.config.notes;
    for(var i=0; i<theNotes.length; i++) {
      if(theNotes[i].muted) {
        drawMuteStringAnnotatation(theNotes[i].string);
      } else if (theNotes[i].open) {
        drawOpenStringAnnotatation(theNotes[i].string);
      } else {
        if(theNotes[i].frets) {
          drawNoteGroup(theNotes[i]);
        } else {
          drawNote(theNotes[i]);
        }
        if (theNotes[i].finger) {
          drawFingerAnnotation(theNotes[i].string, theNotes[i].finger);
        }
      }
    }
  };

  var drawNoteGroup = function(note_group) {
    var note = {}
    for(var i=0; i<note_group.frets.length; i++) {
     note.string = note_group.string;
     note.fret = note_group.frets[i];
     drawNote(note);
    }
  };

  var drawNote = function(note) {
    if(!note.fret || note.fret == 0) { return; }

    var x = self.config.grid_x + (note.string * self.config.string_gap);
    var y = self.config.grid_y + (note.fret * self.config.fret_gap) - (self.config.fret_gap / 2);
    var note_style = {
      fill: "90-#eee:5-#fff:95"
    };
    if (note.tonic) {
      note_style['fill']         = "90-#000:5-#555:95";
      note_style['stroke-width'] = self.config.note_stroke_width;
      note_style['stroke']      = "black";
    }

    var class_str = "chord-note";
    if (note.class) { class_str = class_str + " " + note.class; }

    var glyph = r.circle(x,y,self.config.note_radius);
    glyph.node.setAttribute("class", class_str);
    glyph.attr(note_style);

    self.notes.push(glyph);
    return glyph;
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
    self.neck.push(
      r.rect(self.config.grid_x,self.config.grid_y, (self.config.num_strings-1)*self.config.string_gap, self.config.nut_height).attr({ fill: "black"})
    );
  };

  var drawBaseFret = function(base_fret) {
    var x = self.config.grid_x + grid_width + self.config.base_fret_offset;
    var y = self.config.grid_y + self.config.fret_gap/2;

    r.text(x,y, ""+base_fret+"fr.").attr({ 'text-anchor': 'start', 'font-size': self.config.base_fret_font_size })
  };

  var drawLabel = function() {
    var x = self.config.grid_x + (grid_width / 2);
    var y = self.config.label_y_offset;
    var fancy_label = self.config.label
      .replace(/b/g, "♭")
      .replace(/\#/g, "♯")
      .replace(/\*/g, "￮");
    r.text(x,y,fancy_label).attr({ "text-anchor": "middle", "font-size": self.config.label_font_size });
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

  var init = function(_element, _config) {
    // Create config dict
    if (!_config) { _config = {}; }
    _.defaults(_config, viz_config_defaults)
    _.defaults(_config, data_config_defaults);
    self.config = _config;

    if (self.config.scale != 1) {
      scaleSize();
    }

    self.width = self.config.num_strings*self.config.string_gap + 20 + 20;
    self.height = self.config.grid_y + self.config.num_frets*self.config.fret_gap + 10;

    if (_.isString(_element)) {
      r = Raphael(document.getElementById(_element), self.width, self.height);
    } else {
      r = Raphael(_element, self.width, self.height);
    }

    self.notes = r.set();
    self.neck = r.set();
    self.annotations = r.set();
    // self.elems.onHover(
    //       function() { alert("hover in"); },
    //       function() { alert("hover out"); },
    //       self,
    //       self
    //     );
    render();


  };

  init(_element, _config);
  return self;
};