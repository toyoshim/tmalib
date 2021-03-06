/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - camera -
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

    this._rsrc = options.rotation || [ 0.0, 0.0, 0.0 ];
    this._rdst = options.rotation || [ 0.0, 0.0, 0.0 ];
    this._rv = [ 0.0, 0.0, 0.0 ];
    this._r = options.rotation || [ 0.0, 0.0, 0.0 ];
    this._rtime = 0;
    this._rduration = 0;
    this._rmode = options.mode || 'ease-in-out';

    this._PI = Math.PI;
    this._PIx2 = Math.PI * 2;
    this._atan2 = Math.atan2;
    this._sqrt = Math.sqrt;
    this._toDegree = 180 / Math.PI;
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
 * Rotates camera position.
 * @param duration time duration to rotate to the destination (in msec)
 * @param destination absolute destination camera rotation
 */
MajVj.misc.camera.prototype.rotateTo = function (duration, destination) {
    var dst = [
        destination[0] % this._PIx2,
        destination[1] % this._PIx2,
        destination[2] % this._PIx2
    ];
    if (duration == 0) {
        this._r[0] = dst[0];
        this._r[1] = dst[1];
        this._r[2] = dst[2];
    }
    for (var i = 0; i < 3; ++i) {
        var diff = dst[i] - this._r[i];
        if (diff > this._PI)
            dst[i] -= this._PIx2;
        else if (diff < -this._PI)
            dst[i] += this._PIx2;
        if (i == 0) {
            if (dst[0] >= this._PI) {
                dst[0] -= this._PI;
                dst[1] = (this._PI - dst[1]) % this._PIx2;
            } else if (dst[0] <= -this._PI) {
                dst[0] += this._PI;
                dst[1] = (-this._PI - dst[1]) % this._PIx2;
            }
        }
    }
    this._rsrc[0] = this._r[0];
    this._rsrc[1] = this._r[1];
    this._rsrc[2] = this._r[2];
    this._rdst[0] = dst[0];
    this._rdst[1] = dst[1];
    this._rdst[2] = dst[2];
    this._rv[0] = this._rdst[0] - this._rsrc[0];
    this._rv[1] = this._rdst[1] - this._rsrc[1];
    this._rv[2] = this._rdst[2] - this._rsrc[2];
    this._rtime = 0;
    this._rduration = duration;
};

/**
 * Rotates camera position.
 * @param duration time duration to rotate to the destination (in msec)
 * @param destination relative destination camera rotation
 */
MajVj.misc.camera.prototype.rotateBy = function (duration, destination) {
    this.rotateTo(duration, [
        this._r[0] + destination[0],
        this._r[1] + destination[1],
        this._r[2] + destination[2]
    ]);
};

/**
 * Looks to the destination.
 * @param duration time duration to rotate to the destination (in msec)
 * @param destination absolute direction camera faces to
 */
MajVj.misc.camera.prototype.lookTo = function (duration, destination) {
    var d = destination;
    var yz = this._sqrt(d[1] * d[1] + d[2] * d[2]);
    this.rotateTo(duration, [
        -this._atan2(d[1], -d[2]),
        this._atan2(d[0], yz),
        0
    ]);
};

/**
 * Looks at the destination.
 * @param duration time duration to rotate to the destination (in msec)
 * @param destination absolute position camera looks at
 */
MajVj.misc.camera.prototype.lookAt = function (duration, destination) {
    this.lookTo(duration, [
        destination[0] - this._p[0],
        destination[1] - this._p[1],
        destination[2] - this._p[2]
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
            var tl = TmaTimeline.convert(this._pmode, t);
            this._p = [
                this._psrc[0] + this._pv[0] * tl,
                this._psrc[1] + this._pv[1] * tl,
                this._psrc[2] + this._pv[2] * tl
            ];
        }
    }
    if (this._rduration != 0) {
        this._rtime += delta;
        var t = this._rtime / this._rduration;
        if (this._rtime > this._rduration) {
            this._rduration = 0;
            this._r[0] = this._rdst[0] % this._PIx2;
            this._r[1] = this._rdst[1] % this._PIx2;
            this._r[2] = this._rdst[2] % this._PIx2;
        } else {
            var tl = TmaTimeline.convert(this._rmode, t);
            this._r = [
                (this._rsrc[0] + this._rv[0] * tl) % this._PIx2,
                (this._rsrc[1] + this._rv[1] * tl) % this._PIx2,
                (this._rsrc[2] + this._rv[2] * tl) % this._PIx2
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

/**
 * Obtains current camera rotation.
 * @return current camera rotation in [x, y, z]
 */
MajVj.misc.camera.prototype.rotation = function () {
    return this._r;
};

/**
 * Obtains current camera orientation.
 * @return current camera orientation in [alpha, beta, gamma]
 */
MajVj.misc.camera.prototype.orientation = function () {
    return [
        -this._r[1] * this._toDegree,
        this._r[2] * this._toDegree,
        this._r[0] * this._toDegree - 90
    ];
};
