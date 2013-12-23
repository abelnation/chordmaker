/* global Aex, Raphael, ChordModel, GuitarNote */

function ChordView(container, options, model) {
  // This first guard ensures that the callee has invoked our Class' constructor function
  // with the `new` keyword - failure to do this will result in the `this` keyword referring
  // to the callee's scope (typically the window global) which will result in the following fields
  // (name and _age) leaking into the global namespace and not being set on this object.
  if (!(this instanceof ChordView)) {
    throw new TypeError("ChordView constructor cannot be called as a function.");
  }
  if (!options) { options = {}; }
  if (!model) { model = new ChordModel(); }

  this._init(container, options, model);
}

// CONSTANTS
// ---------

// Diagram orientation constants
ChordView.NUT_TOP = -1;
ChordView.NUT_LEFT = -2;

// Finger position constants
ChordView.FINGER_TOP = -1;
ChordView.FINGER_LEFT = -2;
ChordView.FINGER_ONNOTE = -3;

ChordView.NOTE_COLORS = {
  'black': '#000',
  'white': '#fff',
  'blue' : '#22f',
  'red'  : '#f22',
  'green': '#0f0'
};
ChordView.NOTE_GRADIENTS = {
  'black': '90-#000:5-#555:95',
  'white': '90-#eee:5-#fff:95',
  'blue' : '90-#22f:5-#55f:95',
  'red'  : '90-#f22:5-#f55:95',
  'green': '90-#0f0:5-#0f0:95'
};

// Positions on neck of neck marker dots
// TODO: only applicable for guitar
ChordView.NECK_MARKERS = [
  [ 5, 1 ],
  [ 7, 2 ],
  [ 9, 1 ],
  [ 12, 2 ],
  [ 15, 1 ],
  [ 17, 1 ]
];

// Render Options
// --------------

// Render attributes are configurable via the ChordView's options object.
// Render options tend to contain measurement, color, and boolean values.

// Default options for a standard chord diagram.  These can be over-ridden
// by passing in a config object to the ChordView constructor.
ChordView.UNSCALABLE = [
  'base_fret',
  'num_frets',
  'min_frets',
  'fret_pad',
  'scale',
  'orientation',
  'finger_position',
];
ChordView.DEFAULT_OPTIONS = {
  // Constant factor to scale all subsquent values by.
  scale: 0.5,

  // Orientation. Side view is useful for longer neck diagrams.
  orientation: ChordView.NUT_TOP,

  string_gap: 30,
  fret_gap: 30,

  // Neck range
  fret_pad: 1,
  min_frets: 5,
  // num_frets: 5,
  // base_fret: 1,

  // Finger number annotations
  show_fingers: true,
  finger_anno_y: 10,
  finger_position: ChordView.FINGER_TOP,
  anno_font_size: 18,
  // TODO: open annotations not really related to finger annotations
  open_note_radius: 6,

  // Note markers
  note_radius: 10,
  note_stroke_width: 1.5,
  note_gradient: true,
  note_color: 'white',
  tonic_color: 'black',

  neck_marker_radius: 8,
  neck_marker_color: "#eee",

  // Nut (zero-th fret) marker
  nut_height: 5,

  // Offset from origin of neck grid
  grid_x: 0,
  grid_y: 0,
  grid_stroke_width: 1.5,

  grid_padding_bottom: 20,
  grid_padding_right: 20,
  grid_padding_left: 20,

  // Chord label
  label_font_size: 36,
  label_y_offset: 20,
  label_height: 40,

  // Instrument tuning annotation
  show_tuning: true,
  tuning_label_font_size: 18,
  tuning_label_offset: 14,

  // Base fret annotation (when chord is offset from the nut)
  base_fret_font_size: 26,
  base_fret_label_width: 20,
  base_fret_offset: 16
};

// Pre-set for compact tiny format
ChordView.OPTIONS_COMPACT = {
  scale: 0.3,
  show_tuning: false,
  show_fingers: false,
  note_stroke_width: 1.0,
  note_color: 'black',
  note_gradient: false,
  base_fret_font_size: 36,
  base_fret_offset: 20,
  grid_padding_right: 40,
  num_frets: 5
};

// Pre-set suitable for longer neck diagram
ChordView.OPTIONS_NECK = {
  scale: 1.0,
  orientation: ChordView.NUT_LEFT,
  show_tuning: true,
  fret_gap: 50,
  num_frets: 15,
};

ChordView.OPTIONS = {
  "default": ChordView.DEFAULT_OPTIONS,
  "compact": ChordView.OPTIONS_COMPACT,
  "neck": ChordView.OPTIONS_NECK
};

// ChordView Class
// ---------------

ChordView.prototype = {
  /**
   * Whenever you replace an Object's Prototype, you need to repoint
   * the base Constructor back at the original constructor Function,
   * otherwise `instanceof` calls will fail.
   */
  constructor: ChordView,

  _init: function(container, options, model) {
    if (_.isString(container)) {
      this.containerId = container.replace("#", "");
    } else if (container instanceof jQuery) {
      this.containerId = container.attr("id");
    } else if (_.isElement(container)) {
      this.containerId = $(container).attr("id");
    } else {
      throw TypeError("container must be a DOM elem or DOM ID string.");
    }

    // Create fresh copy of options object in case they have passed in one of
    // the static pre-set options objects
    this.options = {};
    if (_.isString(options)) {
      if (!_.has(ChordView.OPTIONS, options)) {
        throw TypeError("Invalid options string: " + options);
      }
      _.defaults(this.options, ChordView.OPTIONS[options]);
    } else if (_.isObject(options)) {
      _.defaults(this.options, options);
    }
    _.defaults(this.options, ChordView.DEFAULT_OPTIONS);

    this.model = model;

    this.options.grid_x = this.options.grid_padding_left;
    this.options.grid_y = this.options.anno_font_size + 4;

    if (this.options.orientation === ChordView.NUT_TOP && this.model.getLabel() !== "") {
      this.options.grid_y += this.options.label_height;
    }

    // Scaling is done by scaling all the constant factors in the render code
    console.log("scale: " + this.options.scale);
    if (this.options.scale != 1) {
      this._scaleSize();
    }

    // if both are num_frets and base_fret are not provided, auto-calc missing values
    if (!(_.has(this.options, 'num_frets') && _.has(this.options, 'base_fret'))) {
      this._calcFretRange();
    }

    this.diagram_glyphs = {};
    this.neck = {
      glyphs: {},
      width: 0,
      height: 0
    };
    this.noteGlyphs = {};

    this.transform_str = "";
    // TODO: decomp out this calculation
    this.width = this.options.grid_x + this.model.getNumStrings() * this.options.string_gap + this.options.base_fret_label_width + this.options.grid_padding_right;
    this.height = this.options.grid_y + this.options.num_frets * this.options.fret_gap + this.options.tuning_label_font_size + this.options.grid_padding_bottom;

    if (window.jQuery) {
      $(container).html("");
    } else if (_.isElement(container)) {
      container.innerHtml = "";
    } else {
      console.log(container);
    }

    // var ratio = 1.0;
    // console.log("Width: " + this.width);
    // console.log("Height: " + this.height);
    // console.log("Container Width: " + $(container).parent().width());
    // console.log("Orientation: " + this.options.orientation);
    // if (this.options.orientation == ChordView.NUT_LEFT &&
    //     this.height > $(container).parent().width()) {

    //   ratio = $(container).parent().width() / this.height;
    //   console.log("Auto-scaling to: " + ratio);
    //   this._scaleSize(ratio);
    // } else if (this.options.orientation == ChordView.NUT_TOP &&
    //     this.width > $(container).parent().width()) {

    //   ratio = $(container).parent().width() / this.width;
    //   console.log("Container Width: " + $(container).parent().width());
    //   console.log("Auto-scaling to: " + ratio);
    //   this._scaleSize(ratio);
    // }

    this.r = null;
    console.log(this.containerId);
    this.r = Raphael(this.containerId, this.width, this.height);

    this._render();
    this._setOrientation(this.options.orientation);

    var svgWidth = $("#"+this.containerId).width();
    var parentWidth = $("#"+this.containerId).parent().width();
    if (svgWidth > parentWidth) {
      console.log("shrinking container to fit");
      $("#"+this.containerId).css("width", "" + parentWidth + "px");
    }

  },

  getCode: function() {
    // TODO: implement
    throw Error("Not implemented yet");
  },
  getModel: function() {
    return this.model;
  },

  _scaleSize: function() {
    _.each(ChordView.DEFAULT_OPTIONS, function(num, key) {
      // TODO: improve the fact that we're using negative numbers to distinguish values from consts
      if (_.indexOf(ChordView.UNSCALABLE, key) == -1 && _.isNumber(this.options[key])) {

        this.options[key] = this.options[key] * this.options.scale;
      }
    }, this);
  },

  _calcFretRange: function() {
    var fret_range = this.model.getMaxFret() - this.model.getMinFret();
    var ideal_num_frets = fret_range + this.options.fret_pad;
    var ideal_base_fret = Math.max(this.model.getMinFret(), 1);

    if (!_.has(this.options, 'base_fret')) {
      this.options.base_fret = ideal_base_fret;
    }
    if (!_.has(this.options, 'num_frets')) {
      this.options.num_frets = Math.max(
        this.options.min_frets,
        ideal_num_frets + (ideal_base_fret - this.options.base_fret)
      );
    }

  },

  _render: function() {
    this.neck.width = (this.model.getNumStrings() - 1) * this.options.string_gap;
    this.neck.height = this.options.num_frets * this.options.fret_gap;

    this._drawNeck(
      this.options.grid_x, this.options.grid_y,
      this.neck.width, this.neck.height,
      this.model.getNumStrings() - 1, this.options.num_frets, "#000"
    );

    if (this.options.base_fret == 1) {
      this._drawNut();
    } else {
      this._drawBaseFret(this.options.base_fret);
    }

    if (this.options.orientation === ChordView.NUT_TOP) {
      this._drawLabel();
    }
    if (this.options.show_tuning) {
      this._drawTuningLabel();
    }
    this._drawNotes();
  },

  _setOrientation: function(orientation) {
    if (_.isString(orientation)) {
      if (orientation == "left") {
        this._setOrientation(ChordView.NUT_LEFT);
        return;
      } else if (orientation == "top") {
        this._setOrientation(ChordView.NUT_TOP);
        return;
      } else {
        throw TypeError("Invalid orientation string: " + orientation);
      }
    }
    if (!_.include([ ChordView.NUT_TOP, ChordView.NUT_LEFT ], orientation)) {
      throw TypeError("Invalid orientation: " + orientation);
    }

    // TODO: Deal correctly with chord label

    if (orientation == ChordView.NUT_TOP) {

      this.transform_str = "";
      this.width = this.options.grid_x + this.model.getNumStrings() * this.options.string_gap + this.options.base_fret_label_width + this.options.grid_padding_right;
      this.height = this.options.grid_y + this.options.num_frets * this.options.fret_gap + this.options.tuning_label_font_size + this.options.grid_padding_bottom;
      this.r.setSize(this.width, this.height);

    } else if (orientation == ChordView.NUT_LEFT) {
      // Rotate Horizontally
      // var transform_str = "t-"+this.neck.height+",0" + "r-90,"+this.options.grid_x+","+this.options.grid_y;

      var rotate_o_x = (this.options.grid_x + (this.neck.width / 2));
      var rotate_o_y = (this.options.grid_y + (this.neck.height / 2));
      var translate_x = -(this.width - this.height) / 2;
      var translate_y = (this.height - this.width) / 2;

      // TODO: explain this transformation
      // don't include right padding for sideways layouts
      // TODO: position base fret label differently depending on orientation
      this.transform_str = "r-90,0,0" + "t-"+(this.width - (this.options.base_fret_label_width + this.options.grid_padding_right)) + ",0";

      this.height = this.options.grid_x + this.model.getNumStrings() * this.options.string_gap;
      this.width = this.options.grid_y + this.options.num_frets * this.options.fret_gap + this.options.tuning_label_font_size + this.options.grid_padding_bottom;

      this.r.setSize(this.width, this.height);
    }
    _.each(_.values(this.neck.glyphs), function(glyph) {
      if (_.isArray(glyph)) {
        _.each(glyph, function(glyph) {
          glyph.transform(this.transform_str);
        }, this);
      } else {
        glyph.transform(this.transform_str);
      }
    }, this);
    _.each(_.values(this.noteGlyphs), function(note) {
      _.each(_.values(note), function(glyph) {
        if (orientation == ChordView.NUT_LEFT) {
          glyph.transform(this.transform_str + "r90");
        } else {
          glyph.transform(this.transform_str);
        }
      }, this);
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

    // this.neck.glyphs['grid_back'] = this.r.rect(this.options.grid_x, this.options.grid_y, this.neck.width, this.neck.height).attr("fill", "white");
    this._drawNeckMarkers();
    this.neck.glyphs['grid'] = this.r.path(path.join(",")).attr({
      'stroke': color,
      'stroke-width': this.options.grid_stroke_width
    });
  },

  _drawNeckMarkers: function() {
    this.neck.glyphs['neck-markers'] = [];

    for (var i = 0; i < ChordView.NECK_MARKERS.length; i++) {
      var marker = ChordView.NECK_MARKERS[i];
      if (marker[0] > this.options.base_fret &&
         marker[0] < this.options.base_fret+this.options.num_frets) {
        this._drawNeckMarker(marker);
      }
    }
  },

  _drawNeckMarker: function(neck_marker) {
    if (_.isUndefined(neck_marker)) { return; }

    var y = this.options.grid_y + ((neck_marker[0] - (this.options.base_fret - 1)) * this.options.fret_gap) - (this.options.fret_gap / 2);
    var marker_style = {
      fill: this.options.neck_marker_color,
      stroke: "none"
    };

    if (neck_marker[1] == 1) {
      var x = this.options.grid_x + this.neck.width / 2;

      var glyph = this.r.circle(x,y,this.options.neck_marker_radius);
      glyph.attr(marker_style);
      this.neck.glyphs['neck-markers'].push(glyph);

    } else if (neck_marker[1] == 2) {
      var x1 = this.options.grid_x + (1.2 * this.options.string_gap);
      var x2 = this.options.grid_x + (3.8 * this.options.string_gap);

      var glyph1 = this.r.circle(x1,y,this.options.neck_marker_radius);
      glyph1.attr(marker_style);
      this.neck.glyphs['neck-markers'].push(glyph1);

      var glyph2 = this.r.circle(x2,y,this.options.neck_marker_radius);
      glyph2.attr(marker_style);
      this.neck.glyphs['neck-markers'].push(glyph2);
    }
  },

  _drawNut: function() {
    var glyph = this.r.rect(
      this.options.grid_x,this.options.grid_y,
      (this.model.getNumStrings() - 1) * this.options.string_gap,
      this.options.nut_height).attr({ fill: "black" }
    );

    this.neck.glyphs['nut'] = glyph;
    //this.neck.push(glyph);
  },

  _drawTuningLabel: function() {
    this.neck.glyphs['tuning-labels'] = [];
    for (var i = 0; i < this.model.getNumStrings(); i++) {
      var note = this.model.getTuning().notes[i];

      var x = this.options.grid_x + (i * this.options.string_gap);
      var y = this.options.grid_y + this.neck.height + this.options.tuning_label_offset;
      var annotation_style = {
        fill: "black"
      };

      var glyph = this.r.text(x, y, "" + note).attr({
        'font-size': this.options.tuning_label_font_size
      });
      this.neck.glyphs['tuning-labels'].push(glyph);
    }
  },

  _drawBaseFret: function(base_fret) {
    var x = this.options.grid_x + this.neck.width + this.options.base_fret_offset;
    var y = this.options.grid_y + this.options.fret_gap / 2;

    this.r.text(x,y, "" + base_fret + "fr.").attr({
      'text-anchor': 'start',
      'font-size': this.options.base_fret_font_size
    });
  },

  _drawNotes: function() {
    _.each(this.model.getNotes(), this._drawNote, this);
  },

  _drawNote: function(note) {
    if (_.isUndefined(note) || _.isNull(note)) {
      throw TypeError("Model has undefined note");
    }

    if (note instanceof GuitarNote) {
      if (_.isUndefined(this.noteGlyphs[note.getKey()])) {
        this.noteGlyphs[note.getKey()] = {};
      }
      if (note.isMuted()) {
        this._drawMuteStringAnnotatation(note).transform(this.transform_str);
      } else if (note.isOpen()) {
        this._drawOpenStringAnnotatation(note).transform(this.transform_str);
      } else {
        var marker = this._drawFretMarker(note);
        if (marker) {
          marker.transform(this.transform_str);
        }
        if (this.options.show_fingers && note.finger) {
          this._drawFingerAnnotation(note).transform(this.transform_str);
        }
      }
    }
  },

  _drawFretMarker: function(note) {
    if (_.isUndefined(note.fret) || note.fret === 0) { return; }

    if (note.fret < this.options.base_fret ||
        note.fret >= this.options.base_fret + this.options.num_frets) { return; }

    var x = this.options.grid_x + (note.string * this.options.string_gap) + 0.5;
    var y = this.options.grid_y + ((note.fret - this.options.base_fret + 1) * this.options.fret_gap) - (this.options.fret_gap / 2) + 0.5;

    var note_style = {
      fill: this._colorValueForName(this.options.note_color)
    };
    note_style['stroke-width'] = this.options.note_stroke_width;
    if (note.options.color) {
      note_style['fill'] = this._colorValueForName(note.options.color);
    }
    if (note.options.tonic) {
      note_style['fill'] = this._colorValueForName(this.options.tonic_color);
      // note_style['stroke-width'] = this.options.note_stroke_width;
      note_style['stroke'] = "black";
    }

    var class_str = "chord-note";
    if (note.class) { class_str = class_str + " " + note.class; }

    var glyph = this.r.circle(x,y,this.options.note_radius);
    glyph.node.setAttribute("class", class_str);
    glyph.attr(note_style);

    this.noteGlyphs[note.getKey()]['fret-marker'] = glyph;
    return glyph;
  },

  _drawMuteStringAnnotatation: function(note) {
    if (_.isUndefined(note.string)) { return; }
    var x = this.options.grid_x + (note.string * this.options.string_gap);
    var y = this.options.grid_y - this.options.finger_anno_y;

    var glyph = this.r.text(x, y, "X").attr({ 'font-size': this.options.anno_font_size });
    this.noteGlyphs[note.getKey()]['finger-annotation'] = glyph;
    return glyph;
  },

  _drawOpenStringAnnotatation: function(note) {
    if (_.isUndefined(note.string)) { return; }
    var x = this.options.grid_x + (note.string * this.options.string_gap);
    var y = this.options.grid_y - this.options.finger_anno_y;

    var glyph = this.r.circle(x, y, this.options.open_note_radius).attr({
      stroke: "black",
      fill: "white",
      "stroke-width": this.options.note_stroke_width
    });
    this.noteGlyphs[note.getKey()]['finger-annotation'] = glyph;
    return glyph;
  },

  _drawFingerAnnotation: function(note) {
    if (_.isUndefined(note.string) || _.isUndefined(note.finger)) { return; }

    var x;
    var y;
    var annotation_style;

    if (this.options.finger_position === ChordView.FINGER_TOP) {
      x = this.options.grid_x + (note.string * this.options.string_gap);
      y = this.options.grid_y - this.options.finger_anno_y;
      annotation_style = {
        fill: "black"
      };
    } else if (this.options.finger_position === ChordView.FINGER_LEFT) {
      x = this.options.grid_x + (note.string * this.options.string_gap) - (this.options.note_radius * 2) + 0.5;
      y = this.options.grid_y + ((note.fret - this.options.base_fret+1) * this.options.fret_gap) - (this.options.fret_gap / 2) + 0.5;
      annotation_style = {
        fill: "black"
      };
    } else if (this.options.finger_position === ChordView.FINGER_ONNOTE) {
      x = this.options.grid_x + (note.string * this.options.string_gap) + 0.5;
      y = this.options.grid_y + ((note.fret - this.options.base_fret+1) * this.options.fret_gap) - (this.options.fret_gap / 2) + 0.5;
      annotation_style = {
        fill: "black"
      };
    } else {
      throw TypeError("Invalid finger_position: " + this.options.finger_position);
    }

    var glyph = this.r.text(x, y, ""+note.finger).attr({ 'font-size': this.options.anno_font_size });
    this.noteGlyphs[note.getKey()]['finger-annotation'] = glyph;
    return glyph;
  },

  _drawLabel: function() {
    var x = this.options.grid_x + (this.neck.width / 2);
    var y = this.options.label_y_offset;
    var fancy_label = this.model.getLabel()
      .replace(/b/g, "♭")
      .replace(/\#/g, "♯")
      .replace(/\*/g, "￮");
    this.r.text(x,y,fancy_label).attr({ "text-anchor": "middle", "font-size": this.options.label_font_size });
  },

  _colorValueForName: function(colorName) {
    if (this.options.note_gradient) {
      return ChordView.NOTE_GRADIENTS[colorName];
    } else {
      return ChordView.NOTE_COLORS[colorName];
    }
  }
};
