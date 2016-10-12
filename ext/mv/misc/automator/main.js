/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - automator -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.automator = function (options) {
    this._options = options;
    this._t = 0;
    this._random = Math.random;
    this._last = 0;
    switch (this._options.type) {
    case 'randomly_gated_random':
        this._generate = this._randomlyGatedRandom.bind(this);
        break;
    default:
        this._generate = function() {};
        break;
    }
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.automator.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Generates automated value.
 * @param delta delta time from the last call (in msec)
 * @return generated value
 */
MajVj.misc.automator.prototype.generate = function (delta) {
    this._t += delta;
    return this._generate();
};

/**
 * options.rate: how often should it be updated (0: never - 1: always)
 * options.offset: offset value that would be applied in |gate_rate| rate
 * options.volume: offset + volume * Math.random() is applied if it isn't gated
 * options.gate_rate: how often offset should be applied (0: never - 1: always)
 */
MajVj.misc.automator.prototype._randomlyGatedRandom = function () {
    var opt = this._options;
    var rnd = this._random;

    if (rnd() > opt.rate)
        return this._last;
    if (rnd() < opt.gate_rate)
        this._last = opt.offset;
    else
        this._last = opt.offset + opt.volume * rnd();
    return this._last;
};
