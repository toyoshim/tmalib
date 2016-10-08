/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - camera -
 * based on Ken camera's reference implementation of improved noise in Java.
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.camera = function (options) {
    this._psrc = options.position || [ 0.0, 0.0, 0.0 ];
    this._pdst = options.position || [ 0.0, 0.0, 0.0 ];
    this._pv = [ 0.0, 0.0, 0.0 ];
    this._p = options.position || [ 0.0, 0.0, 0.0 ];
    this._ptime = 0;
    this._pduration = 0;
    this._pmode = options.mode || 'ease-in-out';
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
    this._psrc[0] = this._p[0];
    this._psrc[1] = this._p[1];
    this._psrc[2] = this._p[2];
    this._pdst[0] = destination[0];
    this._pdst[1] = destination[1];
    this._pdst[2] = destination[2];
    this._pv[0] = this._pdst[0] - this._psrc[0];
    this._pv[1] = this._pdst[1] - this._psrc[1];
    this._pv[2] = this._pdst[2] - this._psrc[2];
    this._ptime = 0;
    this._pduration = duration;
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
    if (this._pduration != 0) {
        this._ptime += delta;
        var t = this._ptime / this._pduration;
        if (this._ptime > this._pduration) {
            this._pduration = 0;
            this._p[0] = this._pdst[0];
            this._p[1] = this._pdst[1];
            this._p[2] = this._pdst[2];
        } else {
            var tl = TmaTimeline.convert(this._mode, t);
            this._p = [
                this._psrc[0] + this._pv[0] * tl,
                this._psrc[1] + this._pv[1] * tl,
                this._psrc[2] + this._pv[2] * tl
            ];
        }
    }
};

/**
 * Obtains current camera position.
 * @return current camera position in [x, y, z]
 */
MajVj.misc.camera.prototype.position = function () {
    return this._p;
};
