/**
 * T'MediaArt library for JavaScript.
 */

/**
 * TmaTimeline prototype.
 *
 * This prototype provides a Timeline that schedule tasks.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
function TmaTimeline () {
    this._elapsed = 0.0;
    this._convertedTime = 0.0;
    this._function = TmaTimeline._functionBypass;
}

/**
 * Convert function just to bypass.
 * @param elapsed original elapsed time
 * @return converted elapsed time
 */
TmaTimeline._functionBypass = function (elapsed) {
    return elapsed;
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
    this._elapsed += delta;
    var lastConvertedTime = this._convertedTime;
    this._convertedTime = this._function(this._elapsed);
    return this._convertedTime - lastConvertedTime;
};

/**
 * Obtain elapsed time in converted timeline.
 * @return elapsed time in converted timeline
 */
TmaTimeline.prototype.elapsed = function () {
    return this._convertedTime;
}