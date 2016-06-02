/**
 * T'MediaArt library for JavaScript.
 */

/**
 * TmaTimeline prototype.
 *
 * This prototype provides a Timeline that schedule tasks.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
function TmaTimeline (options) {
    this._elapsed = 0.0;
    this._convertedTime = 0.0;
    this._input_scale = options.input_scale || 1.0;
    this._output_scale = options.output_scale || 1.0;
    this._function = options.function || TmaTimeline._functionBypass;
    if (options.type)
        this._function = TmaTimeline._functionFor(options.type);
}

TmaTimeline.convert = function (type, value) {
    var f = TmaTimeline._functionFor(type);
    if (!f)
        return value;
    return f(value);
};

TmaTimeline._Math = Math;

TmaTimeline._functionFor = function (type) {
    switch (type) {
    case 'bypass':
        return TmaTimeline._functionBypass;
    case 'power':
        return TmaTimeline._functionPower;
    case 'saturate':
        return TmaTimeline._functionSaturate;
    case 'sin':
        return TmaTimeline._functionSin;
    }
    return null;
};

/**
 * Convert function just to bypass.
 * @param elapsed original elapsed time
 * @return converted elapsed time
 */
TmaTimeline._functionBypass = function (elapsed) {
    return elapsed;
};

/**
 * Convert function in power curve.
 * @param elapsed original elapsed time
 * @return converted elapsed time
 */
TmaTimeline._functionPower = function (elapsed) {
    if (elapsed <= 0)
        return 0.0;
    return TmaTimeline._Math.pow(10.0, elapsed * 2 - 2);
};

/**
 * Convert function in saturated curve.
 * @param elapsed original elapsed time
 * @return converted elapsed time
 */
TmaTimeline._functionSaturate = function (elapsed) {
    if (elapsed < 0.0)
        return 0.0;
    if (elapsed > 1.0)
        return 1.0;
    return elapsed;
};

/**
 * Convert function in sin curve.
 * @param elapsed original elapsed time
 * @return converted elapsed time
 */
TmaTimeline._functionSin = function (elapsed) {
    return TmaTimeline._Math.sin(2.0 * TmaTimeline._Math.PI * elapsed);
};

/**
 * Reset timeline.
 */
TmaTimeline.prototype.reset = function () {
    this._elapsed = 0;
};

/**
 * Update timeline.
 * @param delta delta time in msec from the last call
 * @return delta in converted timeline
 */
TmaTimeline.prototype.update = function (delta) {
    this._elapsed += delta * this._input_scale;
    var lastConvertedTime = this._convertedTime;
    this._convertedTime = this._function(this._elapsed) * this._output_scale;
    return this._convertedTime - lastConvertedTime;
};

/**
 * Convert elapsed timeline.
 * @param elapsed time in msec
 * @return elapsed time in converted timeline
 */
TmaTimeline.prototype.convert = function (elapsed) {
    return this._function(elapsed * this._input_scale) *
            this._output_scale;
};

/**
 * Obtain elapsed time in converted timeline.
 * @return elapsed time in converted timeline
 */
TmaTimeline.prototype.elapsed = function () {
    return this._convertedTime;
}
