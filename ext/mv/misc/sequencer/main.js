/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - sequencer -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.sequencer = function(options) {
  this._t = 0.0; // count in sound
  this._index = 0;
  // type:     'move', 'ease', 'ease-in', ease-in-out', 'ease-out', 'linear',
  //           or 'power' (other types defined in TmaTmaline may work too)
  // at:       start time in second
  // from:     start value (n/a for 'move')
  // to:       target value
  // duration: duration time in second
  // [
  //   { type: 'move', at: 0.0, to: 0.0 },
  //   { type: 'linear', at: 1.0, from: 0.0, to: 1.0, duration: 10.0 },
  //   { type: 'repeat', at: 10.0, rollback: 9.0 }  // rollback 9s at 10s
  // ]
  this._sequence = options.sequence;
  var types = ['ease', 'ease-in', 'ease-in-out', 'ease-out'];
  for (var i in types)
    this._prepareCache(types[i]);
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.sequencer.load = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
};

// TmaTimeline conver cache.
MajVj.misc.sequencer._cache = {};

/**
 * Generates automated value.
 * @param delta delta time from the last call (in msec)
 * @return generated value from 0 to 1
 */
MajVj.misc.sequencer.prototype.generate = function(delta) {
  this._t += delta / 1000;
  var result = 0;
  while (this._index < this._sequence.length) {
    var seq = this._sequence[this._index];
    if (seq.at > this._t)
      break;
    if (seq.type == 'repeat') {
      this._index = 0;
      this._t -= seq.rollback;
      continue;
    }
    if (seq.type == 'move') {
      result = seq.to;
    } else {
      var rate = (this._t - seq.at) / seq.duration;
      var volume = seq.to - seq.from;
      result = seq.from + volume * this._convert(seq.type, rate);
    }
    var next = this._index + 1;
    if (next >= this._sequence.length || this._sequence[next].at > this._t)
      break;
    this._index = next;
  }
  return result;
};

MajVj.misc.sequencer.prototype._prepareCache = function(type) {
  if (MajVj.misc.sequencer._cache[type])
    return;
  MajVj.misc.sequencer._cache[type] = [];
  for (var i = 0; i <= 1000; ++i) {
    MajVj.misc.sequencer._cache[type][i] = TmaTimeline.convert(type, i / 1000);
  }
};

MajVj.misc.sequencer.prototype._convert = function(type, rate) {
  if (rate <= 0.0)
    return 0.0;
  if (rate >= 1.0)
    return 1.0;
  if (MajVj.misc.sequencer._cache[type]) {
    var n = (rate * 1000) | 0;
    return MajVj.misc.sequencer._cache[type][n];
  }
  return TmaTimeline.convert(type, rate);
};
