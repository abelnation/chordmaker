/* global TuningFactory, Tuning */

describe("TuningFactory", function() {
  
  it("fromInstrument errors if provided invalid arguments", function() {
    expect(function() { TuningFactory.fromInstrument(); }).toThrow();
    expect(function() { TuningFactory.fromInstrument("asdf"); }).toThrow();
    expect(function() { TuningFactory.fromInstrument([ "guitar" ]); }).toThrow();
    expect(function() { TuningFactory.fromInstrument("guitar", "asdf"); }).toThrow();
    expect(function() { TuningFactory.fromInstrument("guitar", 234); }).toThrow();
    expect(function() { TuningFactory.fromInstrument("guitar", [ "standard" ]); }).toThrow();
  });
  it("default tunings work", function() {
    var t = null;
    for (var inst in Tuning.instruments) {
      t = TuningFactory.fromInstrument(inst);
      expect(t.tuningStr).toEqual(Tuning.instruments[inst]['default']);
    }
  });

});
