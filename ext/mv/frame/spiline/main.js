/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - spiline -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.spiline = function (options) {
    this._screen = options.screen;
    this._api = options.mv.get2DInterface();
    this.properties = {};
    this._s = 0.0;
    this._r = 1.0;

    this._grid =  { x: 8, y: 8 };
    this._rx = this._api.width / this._grid.x;
    this._ry = this._api.height / this._grid.y;
    this._bx = this._rx / 2;
    this._by = this._ry / 2;
    this._sx = this._rx;
    this._sy = this._ry;

    this._api.background(0, 255);
    this._api.fill(0, 0, 0, 10);
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.spiline.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.spiline.prototype.draw = function (delta) {
    var mouse = this._screen.mouse();
    var c = this._s;
    this._s += delta * mouse.x / this._api.width;
    var n = this._s;
    this._r -= (delta / 100 * mouse.y / this._api.height) % 1;
    if (this._r < 0)
        this._r += 1.0;
    this._api.stroke(0);
    this._api.rect(this._api.width / 2, this._api.height / 2,
                   this._api.width, this._api.height);
    this._api.stroke(30, 30, 255, 150);
    var cy = this._by;
    for (var iy = 0; iy < this._grid.y; ++iy) {
        var cx = this._bx;
        for (var ix = 0; ix < this._grid.x; ++ix) {
            var sx = cx + Math.cos(c) * this._rx;
            var sy = cy + Math.sin(c) * this._ry;
            var ex = cx + Math.cos(n) * this._rx;
            var ey = cy + Math.sin(n) * this._ry;
            this._api.line(sx, sy, ex, ey);
            cx += this._sx;
        }
        cy += this._sy;
    }
};
