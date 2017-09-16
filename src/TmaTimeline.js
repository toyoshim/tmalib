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
    this._options = options.options || {};
    if (options.type)
        this._function = TmaTimeline._functionFor(options.type, this._options);
    // TODO: Probably it would be better to pre-calculate a curve for some
    // sorts of functions, e.g. Bezier may take considerable time to calculate
    // values on demand.
}

/**
 * Convert a value with an internal function.
 * @param type function type
 * @param value normalized input value
 * @param options function specific options
 * @return converted value
 */
TmaTimeline.convert = function (type, value, options) {
    var f = TmaTimeline._functionFor(type, options);
    if (!f)
        return value;
    return f(value);
};

TmaTimeline._Math = Math;

/**
 * Obtain a function for a convertion type.
 * @param type function type
 * @param options function specific options
 * @return a function for the type
 */
TmaTimeline._functionFor = function (type, options) {
    switch (type) {
    case 'bypass':
        return TmaTimeline._functionBypass;
    case 'cubic-bezier':
        return TmaTimeline._functionCubicBezier.bind(null, options);
    case 'ease':
        return TmaTimeline._functionCubicBezier.bind(null, {
            x1: 0.25,
            y1: 0.1,
            x2: 0.25,
            y2: 1.0
        });
    case 'ease-in':
        return TmaTimeline._functionCubicBezier.bind(null, {
            x1: 0.42,
            y1: 0.0,
            x2: 1.0,
            y2: 1.0
        });
    case 'ease-in-out':
        return TmaTimeline._functionCubicBezier.bind(null, {
            x1: 0.42,
            y1: 0.0,
            x2: 0.58,
            y2: 1.0
        });
    case 'ease-out':
        return TmaTimeline._functionCubicBezier.bind(null, {
            x1: 0.0,
            y1: 0.0,
            x2: 0.58,
            y2: 1.0
        });
    case 'linear':
        return TmaTimeline._functionCubicBezier.bind(null, {
            x1: 0.0,
            y1: 0.0,
            x2: 1.0,
            y2: 1.0
        });
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

TmaTimeline._cubicBezierInternal = function (t, v1, v2) {
    var s = 1.0 - t;
    var ttt = t * t * t;
    var ts = t * s;
    var tts = t * ts;
    var tss = ts * s;
    return ttt + 3 * (tts * v2 + tss * v1);
};

/**
 * Convert function for cubic bezier.
 * @param options x1, y1, x2, y2
 * @param elapsed original elapsed time
 * @return converted elapsed time
 */
TmaTimeline._functionCubicBezier = function (options, elapsed) {
    var min = 0.0;
    var max = 1.0;
    var t = 0.5;
    var n = 0;
    var d = options.d || 0.0001;
    for (;;) {
        // This is super simple implementation that has room for improvements.
        var x = TmaTimeline._cubicBezierInternal(t, options.x1, options.x2);
        if (TmaTimeline._Math.abs(x - elapsed) < d)
            break;
        if (x < elapsed)
            min = t;
        else
            max = t;
        t = (min + max) / 2.0;
        n++;
        if (n > 100)
            break;
    }
    return TmaTimeline._cubicBezierInternal(t, options.y1, options.y2);
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
