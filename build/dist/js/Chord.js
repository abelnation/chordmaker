/* global Vex, Raphael */

function Chord(_element, _config) {
  // This first guard ensures that the callee has invoked our Class' constructor function
  // with the `new` keyword - failure to do this will result in the `this` keyword referring 
  // to the callee's scope (typically the window global) which will result in the following fields
  // (name and _age) leaking into the global namespace and not being set on this object.
  if (!(this instanceof Chord)) {
    throw new TypeError("Chord constructor cannot be called as a function.");
  }
  if (!_config) { _config = {}; }
  
  this._init(_element, _config);
}

// CONSTANTS
Chord.NUT_TOP = 1;
Chord.NUT_LEFT = 2;
Chord.NOTE_COLORS = {
  'black': '90-#000:5-#555:95',
  'white': '90-#eee:5-#fff:95',
  'blue' : '90-#22f:5-#55f:95',
  'red'  : '90-#f22:5-#f55:95',
  'green': '90-#0f0:5-#0f0:95'
};

Chord.DATA_CONFIG_DEFAULTS = {
  // DATA DEFAULTS
  num_strings: 6,
  num_frets: 5,
  base_fret: 1,
  notes: [],
  label: "",
  tuning: "EADGBe"
};

Chord.VIZ_CONFIG_DEFAULTS = {
  // RENDER DEFAULTS
  scale: 0.5,
  orientation: Chord.NUT_TOP,

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

Chord.prototype = {
  /**
   * Whenever you replace an Object's Prototype, you need to repoint
   * the base Constructor back at the original constructor Function, 
   * otherwise `instanceof` calls will fail.
   */
  constructor: Chord,

  _init: function(_element, _config) {
    // Create config dict, filling in defaults where not provided
    _.defaults(_config, Chord.VIZ_CONFIG_DEFAULTS);
    _.defaults(_config, Chord.DATA_CONFIG_DEFAULTS);
    this.config = _config;

    if (this.config.label === "") {
      this.config.grid_y = 10;
    }

    // Scaling is done by scaling all the constant factors in the render code
    if (this.config.scale != 1) {
      this._scaleSize();
    }

    this.diagram_glyphs = {};
    this.notes = [];
    this.neck = {
      glyphs: {},
      width: 0,
      height: 0
    };

    // raphael object
    this.r = null;
    this.transform_str = "";

    this.width = this.config.grid_x + this.config.num_strings * this.config.string_gap + 20 + 20;
    this.height = this.config.grid_y + this.config.num_frets * this.config.fret_gap + 10 + this.config.grid_bottom_padding + 20;

    if (_.isString(_element)) {
      this.r = Raphael(document.getElementById(_element), this.width, this.height);
    } else {
      this.r = Raphael(_element, this.width, this.height);
    }

    this._render();

    this.addNotes(this.config.notes);

    if (this.config.orientation == "left") {
      this._setOrientation(Chord.NUT_LEFT);
    }
  },

  getNumStrings: function() {
    return this.config.num_strings;
  },
  getBaseFret: function() {
    return this.config.base_fret;
  },
  getNumFrets: function() {
    return this.config.num_frets;
  },
  getTuning: function() {
    return this.config.tuning;
  },

  getCode: function() {
    return "TODO";
  },

  // var getString = function() {
  //     return string;
  //   };
  //   this.getString = getString;

  addNote: function(note, color) {
    if (_.isUndefined(note)) { return; }
      // TODO: throw
    if (_.isString(note)) {
      // TODO
    } else if (_.isObject(note)) {

      if (color) { note.color = color; }
      if (note.frets) {
        var groupNote = {};
        for (var i = 0; i < note.frets.length; i++) {
          groupNote = {};
          groupNote.string = note.string;
          groupNote.fret = note.frets[i];
          groupNote.glyphs = {};

          this._drawNote(groupNote);
          this.notes.push(_.clone(groupNote));
        }
      } else {
        note.glyphs = {};
        this._drawNote(note);
        this.notes.push(_.clone(note));
      }

    }
  },

  addNotes: function(notes, color) {
    if (_.isArray(notes)) {
      for (var i = 0; i < notes.length; i++) {
        this.addNote(notes[i], color);
      }
    }
  },

  removeNote: function(note) {
    if (_.isString(note)) { // note id

    } else if (_.isObject(note)) {

    } else if (_.isArray(note)) {

    }
  },

  toString: function() {

  },

  _scaleSize: function() {
    _.each(Chord.VIZ_CONFIG_DEFAULTS, function(num, key) {
      if (key != "scale" && _.isNumber(this.config[key])) {
        this.config[key] = this.config[key] * this.config.scale;
      }
    }, this);
  },

  _registerGlyph: function(model, glyph, glyph_name) {
    model.glyphs[glyph_name] = glyph;
    this._diagram_glyphs(glyph);
  },

  _render: function() {
    this.neck.width = (this.config.num_strings - 1) * this.config.string_gap;
    this.neck.height = this.config.num_frets * this.config.fret_gap;

    this._drawNeck(
      this.config.grid_x, this.config.grid_y,
      this.neck.width, this.neck.height,
      this.config.num_strings - 1, this.config.num_frets, "#000"
    );

    if (this.config.base_fret == 1) {
      this._drawNut();
    } else {
      this._drawBaseFret(this.config.base_fret);
    }

    this._drawLabel();
    this._drawTuningLabel();

  },

  _setOrientation: function(orientation) {
    if (_.isString(orientation)) {
      if (orientation == "left") {
        this._setOrientation(Chord.NUT_LEFT);
        return;
      } else if (orientation == "top") {
        this._setOrientation(Chord.NUT_TOP);
        return;
      }
    }
    if (!_.include([ Chord.NUT_TOP, Chord.NUT_LEFT ], orientation)) { return; }

    // TODO: Deal correctly with chord label

    if (orientation == Chord.NUT_TOP) {

      this.transform_str = "";
      this.width = this.config.grid_x + this.neck.width + 20 + 20;
      this.height = this.config.grid_y + this.neck.height + 10 + this.config.grid_bottom_padding;
      this.r.setSize(this.width, this.height);

    } else if (orientation == Chord.NUT_LEFT) {
      // Rotate Horizontally
      // var transform_str = "t-"+this.neck.height+",0" + "r-90,"+this.config.grid_x+","+this.config.grid_y;

      var rotate_o_x = (this.config.grid_x+(this.neck.width / 2));
      var rotate_o_y = (this.config.grid_y+(this.neck.height / 2));
      var translate_x = -(this.width - this.height) / 2;
      var translate_y = (this.height - this.width) / 2;
      this.transform_str = "r-90," + rotate_o_x + "," + rotate_o_y + "t" + translate_x + "," + translate_y;

      //console.log(transform_str);

      this.width = this.config.grid_x + this.neck.height + 20 + 20;
      this.height = this.config.grid_y + this.neck.width + 10 + this.config.grid_bottom_padding;
      this.r.setSize(this.width, this.height);

    }
    _.each(this.neck.glyphs, function(glyph) {
      if (_.isArray(glyph)) {
        _.each(glyph, function(glyph) {
          glyph.transform(this.transform_str);
        });
      } else {
        glyph.transform(this.transform_str);
      }
    }, this);
    _.each(this.notes, function(note, note_id) {
      _.each(note.glyphs, function(glyph) {
        glyph.transform(this.transform_str);
      });
    }, this);
  },

  _drawNeck: function(x, y, w, h, wv, hv, color) {
    color = color || "#000";
    var path = [ "M", Math.round(x) + 0.5, Math.round(y) + 0.5, "L", Math.round(x + w) + 0.5, Math.round(y) + 0.5, Math.round(x + w) + 0.5, Math.round(y + h) + 0.5, Math.round(x) + 0.5, Math.round(y + h) + 0.5, Math.round(x) + 0.5, Math.round(y) + 0.5 ];
    var rowHeight = h / hv;
    var columnWidth = w / wv;
    for (var i = 1; i < hv; i++) {
      path = path.concat([ "M", Math.round(x) + 0.5, Math.round(y + i * rowHeight) + 0.5, "H", Math.round(x + w) + 0.5 ]);
    }
    for (i = 1; i < wv; i++) {
      path = path.concat([ "M", Math.round(x + i * columnWidth) + 0.5, Math.round(y) + 0.5, "V", Math.round(y + h) + 0.5 ]);
    }

    this.neck.glyphs['grid_back'] = this.r.rect(this.config.grid_x, this.config.grid_y, this.neck.width, this.neck.height).attr("fill", "white");
    this._drawNeckMarkers();
    this.neck.glyphs['grid'] = this.r.path(path.join(",")).attr({ stroke: color, 'stroke-width': this.config.grid_stroke_width });

    // TODO: Start Here
    //       Hacky code to do a cursor and to add notes.
    //       Needs to be hella formalized
    // this.grid_back.mousemove(_.bind(function(e) {
    //       var mouse_grid_x = e.offsetX - this.config.grid_x;
    //       var mouse_grid_y = e.offsetY - this.config.grid_y;
    //
    //       var closest_string = Math.round(mouse_grid_x / this.config.string_gap);
    //       var closest_fret = Math.ceil(mouse_grid_y / this.config.fret_gap);
    //       //console.log(""+closest_string+","+closest_fret);
    //
    //       if (closest_string != this.cursor_note_string ||
    //           closest_fret   != this.cursor_note_fret) {
    //         this.cursor_note_string = closest_string;
    //         this.cursor_note_fret = closest_fret;
    //         if (this.cursor_note) {
    //           this.cursor_note.remove();
    //         }
    //         this.cursor_note = drawNote({
    //           fret: this.cursor_note_fret,
    //           string: this.cursor_note_string
    //         });
    //         this.cursor_note.click(function() {
    //           this.cursor_note = null;
    //         });
    //       }
    //     }, self));
  },

  _drawNeckMarkers: function() {
    var markers = [
      [ 5, 1 ],
      [ 7, 2 ],
      [ 9, 1 ],
      [ 12, 2 ],
      [ 15, 1 ],
      [ 17, 1 ]
    ];
    this.neck.glyphs['neck-markers'] = [];

    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i];
      if (marker[0] > this.config.base_fret &&
         marker[0] < this.config.base_fret+this.config.num_frets) {
        this._drawNeckMarker(marker);
      }
    }
  },

  _drawNeckMarker: function(neck_marker) {
    if (_.isUndefined(neck_marker)) { return; }

    var y = this.config.grid_y + ((neck_marker[0] - (this.config.base_fret - 1)) * this.config.fret_gap) - (this.config.fret_gap / 2);
    var marker_style = {
      fill: "90-#bbb:5-#ccc:95",
      stroke: "none"
    };

    if (neck_marker[1] == 1) {
      var x = this.config.grid_x + this.neck.width / 2;

      var glyph = this.r.circle(x,y,this.config.neck_marker_radius);
      glyph.attr(marker_style);
      this.neck.glyphs['neck-markers'].push(glyph);

    } else if (neck_marker[1] == 2) {
      var x1 = this.config.grid_x + (1.2 * this.config.string_gap);
      var x2 = this.config.grid_x + (3.8 * this.config.string_gap);

      var glyph1 = this.r.circle(x1,y,this.config.neck_marker_radius);
      glyph1.attr(marker_style);
      this.neck.glyphs['neck-markers'].push(glyph1);

      var glyph2 = this.r.circle(x2,y,this.config.neck_marker_radius);
      glyph2.attr(marker_style);
      this.neck.glyphs['neck-markers'].push(glyph2);
    }
  },

  _drawNut: function() {
    var glyph = this.r.rect(this.config.grid_x, this.config.grid_y, (this.config.num_strings - 1) * this.config.string_gap, this.config.nut_height).attr({ fill: "black" });

    this.neck.glyphs['nut'] = glyph;
    //this.neck.push(glyph);
  },

  _drawTuningLabel: function() {
    this.neck.glyphs['tuning-labels'] = [];
    for (var i = 0; i < this.config.tuning.length; i++) {
      var note = this.config.tuning[i];

      var x = this.config.grid_x + (i * this.config.string_gap);
      var y = this.config.grid_y + this.neck.height + this.config.tuning_label_offset;
      var annotation_style = {
        fill: "black"
      };

      var glyph = this.r.text(x, y, "" + note).attr({ 'font-size': this.config.tuning_label_font_size });
      this.neck.glyphs['tuning-labels'].push(glyph);
    }
  },

  _drawBaseFret: function(base_fret) {
    var x = this.config.grid_x + this.neck.width + this.config.base_fret_offset;
    var y = this.config.grid_y + this.config.fret_gap / 2;

    this.r.text(x,y, ""+base_fret+"fr.").attr({ 'text-anchor': 'start', 'font-size': this.config.base_fret_font_size });
  },

  _drawNotes: function(notes) {
    if (_.isArray(notes)) {
      _.each(notes, this._drawNote, this);
    } else if (_.isString(notes)) {
      // TODO
    }
  },

  _drawNote: function(note) {
    if (_.isUndefined(note)) { return; }

    if (_.isString(note)) {
      // TODO:
    } else if (_.isObject(note)) {
      if (note.muted) {
        this._drawMuteStringAnnotatation(note).transform(this.transform_str);
      } else if (note.fret === 0 || note.open) {
        this._drawOpenStringAnnotatation(note).transform(this.transform_str);
      } else {
        this._drawFretMarker(note).transform(this.transform_str);
        if (note.finger) {
          this._drawFingerAnnotation(note).transform(this.transform_str);
        }
      }
    }
  },

  _drawFretMarker: function(note) {
    if (_.isUndefined(note.fret) || note.fret === 0) { return; }

    if (note.fret < this.config.base_fret ||
        note.fret > this.config.base_fret + this.config.num_frets) { return; }

    var x = this.config.grid_x + (note.string * this.config.string_gap);
    var y = this.config.grid_y + ((note.fret - this.config.base_fret + 1) * this.config.fret_gap) - (this.config.fret_gap / 2);
    var note_style = {
      fill: Chord.NOTE_COLORS[this.config.note_color]
    };
    if (note.color) {
      note_style['fill'] = Chord.NOTE_COLORS[note.color];
    }
    if (note.tonic) {
      note_style['fill']         = Chord.NOTE_COLORS[this.config.tonic_color];
      note_style['stroke-width'] = this.config.note_stroke_width;
      note_style['stroke']       = "black";
    }

    var class_str = "chord-note";
    if (note.class) { class_str = class_str + " " + note.class; }

    var glyph = this.r.circle(x,y,this.config.note_radius);
    glyph.node.setAttribute("class", class_str);
    glyph.attr(note_style);

    note.glyphs['fret-marker'] = glyph;
    return glyph;
  },

  // TODO: adjust this api
  //       This is not robust at all
  _drawFretMarkerGroup: function(note_group) {
    var note;
    for (var i = 0; i < note_group.frets.length; i++) {
      note = {};
      note.string = note_group.string;
      note.fret = note_group.frets[i];
      note.glyphs = {};

      this._drawNote(note);
    }
  },

  _drawMuteStringAnnotatation: function(note) {
    if (_.isUndefined(note.string)) { return; }
    var x = this.config.grid_x + (note.string * this.config.string_gap);
    var y = this.config.grid_y - this.config.finger_anno_y;

    var glyph = this.r.text(x, y, "X").attr({ 'font-size': this.config.anno_font_size });
    note.glyphs['finger-annotation'] = glyph;
    return glyph;
  },

  _drawOpenStringAnnotatation: function(note) {
    if (_.isUndefined(note.string)) { return; }
    var x = this.config.grid_x + (note.string * this.config.string_gap);
    var y = this.config.grid_y - this.config.finger_anno_y;

    var glyph = this.r.circle(x, y, this.config.open_note_radius).attr({ stroke: "black", fill: "white" });
    note.glyphs['finger-annotation'] = glyph;
    return glyph;
  },

  _drawFingerAnnotation: function(note) {
    if (_.isUndefined(note.string) || _.isUndefined(note.finger)) { return; }

    var x = this.config.grid_x + (note.string * this.config.string_gap);
    var y = this.config.grid_y - this.config.finger_anno_y;
    var annotation_style = {
      fill: "black"
    };

    var glyph = this.r.text(x, y, ""+note.finger).attr({ 'font-size': this.config.anno_font_size });
    note.glyphs['finger-annotation'] = glyph;
    return glyph;
  },

  _drawLabel: function() {
    var x = this.config.grid_x + (this.neck.width / 2);
    var y = this.config.label_y_offset;
    var fancy_label = this.config.label
      .replace(/b/g, "♭")
      .replace(/\#/g, "♯")
      .replace(/\*/g, "￮");
    this.r.text(x,y,fancy_label).attr({ "text-anchor": "middle", "font-size": this.config.label_font_size });
  },
};
