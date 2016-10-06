/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - equalizer -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.equalizer = function (options) {
    this._laser = options.mv.create('frame', 'laser', {
            draw: this._draw.bind(this)
    });
    this.properties = {
        fft: new Uint8Array(1024),
        low_color: [ 0.0, 0.0, 1.0, 0.5 ],
        high_color: [ 1.0, 0.0, 0.0, 0.5 ],
        weak_color: [ 0.0, 0.0, 0.0, 0.5 ],
        strong_color: [ 0.3, 0.3, 0.3, 0.5 ]
    };
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.equalizer.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.equalizer.prototype.onresize = function (aspect) {
    this._laser.onresize(aspect);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.equalizer.prototype.draw = function (delta) {
    this._laser.draw(delta);
};

MajVj.frame.equalizer.prototype._draw = function (api) {
    api.color = [ 0.1, 1.0, 0.1, 1.0 ];
    var n = 2;
    var prop = this.properties;
    for (var i = 0; i < 16; ++i) {
        var v = prop.fft[n - 1];
        var sx = i / 8.0 - 1.0 + 0.035;
        var ex = (i + 1) / 8.0 - 1.0 - 0.035;
        var r = i / 15;
        var rr = 1 - r;
        var color = [
            prop.low_color[0] * rr + prop.high_color[0] * r,
            prop.low_color[1] * rr + prop.high_color[1] * r,
            prop.low_color[2] * rr + prop.high_color[2] * r,
            prop.low_color[3] * rr + prop.high_color[3] * r
        ];
        for (var h = 0; h < 16; ++h) {
            r = h / 15;
            rr = 1 - r;
            api.color = [
                color[0] + prop.weak_color[0] * rr + prop.strong_color[0] * r,
                color[1] + prop.weak_color[1] * rr + prop.strong_color[1] * r,
                color[2] + prop.weak_color[2] * rr + prop.strong_color[2] * r,
                color[3] + prop.weak_color[3] * rr + prop.strong_color[3] * r
            ];
            var y = -0.9 + h * 0.1;
            if (v > (h * 16))
                api.line2d([sx, y], [ex, y], 0.45);
        }
        n += (n / 2)|0;
    }
};
