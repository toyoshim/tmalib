/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - laser -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.laser = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._draw = options.draw || function (api) {};

    this.properties = {};
    this.onresize(options.aspect);

    this._line2dProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.laser._vLine2dShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.laser._fLine2dShader));

    // 0 1                      2 3
    // +-+----------------------+-+
    // + -s                     -e|
    // +-+----------------------+-+
    // 4 5                      6 7
    this._coords = this._screen.createBuffer(new Float32Array(32));
    this._indices = this._screen.createElementBuffer([0, 4, 1, 5, 2, 6, 3, 7]);
    this._indices.items = 8;

    this._api = {
        line2d: this._line2d.bind(this),
        color: [ 0.0, 0.0, 1.0, 1.0 ],
        properties: this.properties
    };
};

// Shader programs.
MajVj.frame.laser._vLine2dShader = null;
MajVj.frame.laser._fLine2dShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.laser.load = function () {
    return new Promise(function (resolve, reject) {
        var name = 'laser';
        var path = 'shaders.html';
        Promise.all([
                MajVj.loadShader('frame', name, path, 'v_line2d'),
                MajVj.loadShader('frame', name, path, 'f_line2d')
        ]).then(function (results) {
            MajVj.frame.laser._vLine2dShader = results[0];
            MajVj.frame.laser._fLine2dShader = results[1];
            resolve();
        }, function () { reject('laser.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.laser.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.laser.prototype.draw = function (delta) {
    var zoom = [1.0, 1.0];
    if (this._aspect > 1.0)
        zoom[1] = this._aspect;
    else
        zoom[0] = 1 / this._aspect;
    this._line2dProgram.setUniformVector('uZoom', zoom);

    this._draw(this._api);
};

/**
 * Draws a line to all displays.
 * @param src source position in [x, y] (0 <= x, y <= 1)
 * @param dst destination position in [x, y] (0 <= x, y <= 1)
 * @param width line width
 */
MajVj.frame.laser.prototype._line2d = function (src, dst, width) {
    var coords = this._coords.buffer();
    var sx = src[0];
    var sy = src[1];
    var ex = dst[0];
    var ey = dst[1];
    var len = Math.sqrt(Math.pow(ex - sx, 2) + Math.pow(ey - ex, 2));
    var vx = width * (ex - sx) / len / 2;
    var vy = width * (ey - sy) / len / 2;
    coords[ 0] = sx - vx + vy; coords[ 1] = sy - vx - vy;
    coords[ 2] = sx; coords[ 3] = sy;
    coords[ 4] = sx + vy; coords[ 5] = sy - vx;
    coords[ 6] = sx; coords[ 7] = sy;
    coords[ 8] = ex + vy; coords[ 9] = ey - vx;
    coords[10] = ex; coords[11] = ey;
    coords[12] = ex + vx + vy; coords[13] = ey - vx + vy;
    coords[14] = ex; coords[15] = ey;
    coords[16] = sx - vx - vy; coords[17] = sy + vx - vy;
    coords[18] = sx; coords[19] = sy;
    coords[20] = sx - vy; coords[21] = sy + vx;
    coords[22] = sx; coords[23] = sy;
    coords[24] = ex - vy; coords[25] = ey + vx;
    coords[26] = ex; coords[27] = ey;
    coords[28] = ex + vx - vy; coords[29] = ey + vx + vy;
    coords[30] = ex; coords[31] = ey;
    this._coords.update();
    this._line2dProgram.setAttributeArray('aCoord', this._coords, 0, 4, 0);
    this._line2dProgram.setUniformVector('uColor', this._api.color);
    this._line2dProgram.setUniformVector('uWidth', [width]);
    this._line2dProgram.drawElements(Tma3DScreen.MODE_TRIANGLE_STRIP,
                                     this._indices, 0, this._indices.items);
};
