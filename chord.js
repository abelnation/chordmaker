var ChordModel = Backbone.Model.extend({
  defaults: {
    label: "F#M",
    num_strings: 6,
    num_frets: 5,
    base_fret: 0,
    notes: [
      { 'finger': "T", 'fret': 2, 'tonic': true },
      { 'open': true },
      { 'finger': "2", 'fret': 4 },
      { 'finger': "3", 'fret': 2 },
      { 'muted': true },
      { 'finger': "2", 'fret': 2 }
    ],
  },

  initialize: function() {
    console.log("chord created");
  }
});

var ChordView = Backbone.View.extend({

  initialize: function() {
    this.el = "chord-ui";

    this.string_gap = 30;
    this.fret_gap = 30;
    this.finger_anno_y = 20;
    this.note_radius = 10;
    this.open_note_radius = 6;
    this.nut_height = 5;
    this.x = 20;
    this.y = 30;

    this.r = Raphael(this.el);
    this.grid = null;
    this.notes = null;
    this.fingers = null;

    this.render();
  },

  render: function(){
    this.drawGrid(
      this.x, this.y,
      (this.model.get("num_strings")-1)*this.string_gap, this.model.get("num_frets")*this.fret_gap,
      this.model.get("num_strings")-1, this.model.get("num_frets"), "#000");
    this.drawNotes();
    if (this.model.get("base_fret") == 0) {
      this.drawNut();
    } else {
      this.drawBaseFret(this.model.get("base_fret"));
    }
  },

  drawGrid: function(x, y, w, h, wv, hv, color) {
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
    this.grid = this.r.path(path.join(",")).attr({stroke: color, 'stroke-width': 1.5});
  },

  drawNotes: function() {
    if (this.notes != undefined ) {
      this.r.remove(this.notes);
    }
    if (this.fingers != undefined ) {
      this.r.remove(this.fingers);
    }
    this.notes = this.r.set();
    this.fingers = this.r.set();

    var notes = this.model.get("notes");
    for(var i=0; i<notes.length; i++) {
      if(notes[i].muted) {
        this.drawMuteStringAnnotatation(i);
      } else if (notes[i].open) {
        this.drawOpenStringAnnotatation(i);
      } else {
        this.drawNote(i, notes[i].fret, notes[i].tonic);
        this.drawFingerAnnotation(i, notes[i].finger);
      }
    }
  },

  drawNote: function(string, fret, tonic) {
    if(!fret || fret == 0) { return; }

    var x = this.x + (string * this.string_gap);
    var y = this.y + (fret * this.fret_gap) - (this.fret_gap / 2);
    var note_style = {
      fill: "black"
    };
    if (tonic) {
      note_style['fill']         = "white";
      note_style['stroke-width'] = 2;
      note_style['stroke']      = "black";
    }
    this.notes.push(
      this.r.circle(x,y,this.note_radius).attr(note_style)
    );

  },

  drawMuteStringAnnotatation: function(string) {
    var x = this.x + (string * this.string_gap);
    var y = this.finger_anno_y;
    this.fingers.push(
      this.r.text(x, y, "X").attr({ 'font-size': 18 })
    );
  },
  drawOpenStringAnnotatation: function(string) {
    var x = this.x + (string * this.string_gap);
    var y = this.finger_anno_y;
    this.fingers.push(
      this.r.circle(x, y, this.open_note_radius).attr({ stroke: "black", fill: "white" })
    );
  },
  drawFingerAnnotation: function(string, finger) {
    var x = this.x + (string * this.string_gap);
    var y = this.finger_anno_y;
    var annotation_style = {
      fill: "black"
    };
    this.fingers.push(
      this.r.text(x, y, ""+finger).attr({ 'font-size': 18 })
    );
  },

  drawNut: function() {
    this.r.rect(this.x,this.y, (this.model.get("num_strings")-1)*this.string_gap, this.nut_height).attr({ fill: "black"});
  },
  drawBaseFret: function(base_fret) {
    var x = this.model.get("num_strings")*this.string_gap + 20;
    var y = this.y + this.fret_gap/2;

    this.r.text(x,y, ""+base_fret+"fr.").attr({ 'font-size': 18 });
  }

});

$(function() {
  var chord = new ChordView({ model: new ChordModel() });
})