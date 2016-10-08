/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - camera -
 * based on Ken camera's reference implementation of improved noise in Java.
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.camera = function (options) {
    this._src = options.position || [ 0.0, 0.0, 0.0 ];
    this._dst = options.position || [ 0.0, 0.0, 0.0 ];
    this._v = [ 0.0, 0.0, 0.0 ];
    this._p = options.position || [ 0.0, 0.0, 0.0 ];
    this._time = 0;
    this._duration = 0;
    this._mode = options.mode || 'ease-in-out';
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.camera.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Moves camera position.
 * @param duration time duration to move to the destination (in msec)
 * @param destination absolute destination camera position
 */
MajVj.misc.camera.prototype.moveTo = function (duration, destination) {
    if (duration == 0) {
        this._p[0] = destination[0];
        this._p[1] = destination[1];
        this._p[2] = destination[2];
    }
    this._src[0] = this._p[0];
    this._src[1] = this._p[2];
    this._src[2] = this._p[1];
    this._dst[0] = destination[0];
    this._dst[1] = destination[1];
    this._dst[2] = destination[2];
    this._v[0] = this._dst[0] - this._src[0];
    this._v[1] = this._dst[1] - this._src[1];
    this._v[2] = this._dst[2] - this._src[2];
    this._time = 0;
    this._duration = duration;
};

/**
 * Moves camera position.
 * @param duration time duration to move to the destination (in msec)
 * @param destination relative destination camera position
 */
MajVj.misc.camera.prototype.moveBy = function (duration, destination) {
    this.moveTo(duration, [
        this._p[0] + destination[0],
        this._p[1] + destination[1],
        this._p[2] + destination[2]
    ]);
};


/**
 * Updates camera position.
 * @param delta delta time from the last rendering (in msec)
 */
MajVj.misc.camera.prototype.update = function (delta) {
    if (this._duration == 0)
        return;
    this._time += delta;
    var t = this._time / this._duration;
    if (this._time > 1000.0) {
        this._duration = 0;
        this._p[0] = this._dst[0];
        this._p[1] = this._dst[1];
        this._p[2] = this._dst[2];
        return;
    }
    var tl = TmaTimeline.convert(this._mode, t);
    this._p = [
        this._src[0] + this._v[0] * tl,
        this._src[1] + this._v[1] * tl,
        this._src[2] + this._v[2] * tl
    ];
};

/**
 * Obtains current camera position.
 * @return current camera position in [x, y, z]
 */
MajVj.misc.camera.prototype.position = function () {
    return this._p;
};
