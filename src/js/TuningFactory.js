/* global Tuning */

function TuningFactory() {
  throw Error("Cannot instantiate TuningFactory.");
}

TuningFactory.fromInstrument = function(instrument, tuning_type) {
  if (!instrument || !_.isString(instrument)) {
    throw TypeError("Must provide an instrument string");
  }
  instrument = instrument.toLowerCase();
  
  if (!_.has(Tuning.instruments, instrument)) {
    throw TypeError("Invalid instrument");
  }

  if (!tuning_type) {
    tuning_type = "default";
  } else if (!_.isString(tuning_type)) {
    throw TypeError("tuning_type must be a string");
  }
  
  tuning_type = tuning_type.toLowerCase();
  if (!_.has(Tuning.instruments[instrument], tuning_type)) {
    throw TypeError("Invalid tuning type: " + tuning_type);
  }

  return new Tuning(Tuning.instruments[instrument][tuning_type]);
};
