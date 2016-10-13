/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - automator -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.automator = function (options) {
    this._options = options;
    this._mv = options.mv;
    this._t = 0.0;
    this._delta = 0.0;
    this._v = [0.0];
    this._o = [];
    this._random = Math.random;
    this._sin = Math.sin;
    this._last = 0.0;
    switch (this._options.type) {
    case 'randomly_gated_random':
        this._generate = this._randomlyGatedRandom.bind(this);
        break;
    case 'sine':
        this._generate = this._sine.bind(this);
        break;
    case 'vibration':
        this._generate = this._vibration.bind(this);
        break;
    case 'nested':
        for (var i = 0; i < this._options.options; ++i) {
            var opt = this._options.options[i];
            opt.mv = opt.mv || this._mv;
            this._o[i] = this._mv.create('misc', 'automator', opt);
        }
        this._generate = this._nested.bind(this);
        break;
    default:
        this._generate = function() { return 0; };
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
 * @return generated value from 0 to 1
 */
MajVj.misc.automator.prototype.generate = function (delta) {
    this._t += delta;
    this._delta = delta;
    return this._generate();
};

/**
 * Generates automated value for type 'randomly_gated_random'.
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

/**
 * Generates automated value for type 'sine'.
 * options.rate: how often should it be updated (0: never -)
 * options.offset: offset value
 * options.volume: offset + volume * Math.sin() is applied
 */
MajVj.misc.automator.prototype._sine = function () {
    var opt = this._options;
    return opt.offset + this._sin(this._t * opt.rate) * opt.volume;
};

/**
 * Generates automated value for type 'vibration'.
 * options.rate: how often should it be updated (0: never -)
 * options.input[options.index]: input value
 * options.threshold: ignore if value is less than threshold
 * options.offset: offset value
 * options.volume: sine is mutiplied by volume-ish value
 * options.tension: how quicktly value affects input (0: never - 1: immediately)
 */
MajVj.misc.automator.prototype._vibration = function () {
    var opt = this._options;
    var v = opt.input[opt.index];
    if (v < opt.threshold)
        v = 0;
    var diff = v - this._v[0];
    this._v[0] += diff * opt.tension;
    var t = this._t * opt.rate;
    return opt.offset + this._sin(t) * opt.volume * this._v[0];
};

/**
 * Generates automated value for type 'nested'.
 * Everything depend on nested automators.
 */
MajVj.misc.automator.prototype._nested = function () {
    var v = 0;
    for (var i = 0; i < this._o.length; ++i)
        v += this._o[i].generate(this._delta);
    return v;
};
