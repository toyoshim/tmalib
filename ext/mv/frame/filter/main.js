/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - filter -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.filter = function (options) {
    this._mv = options.mv;
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;
    this._color = options.color || [0.0, 0.0, 0.0, 1.0];
    this._zoom = (typeof options.zoom != 'undefined') ? options.zoom : 1.0;
    this._fade = (typeof options.fade != 'undefined') ? options.fade : 1.0;
    this._offset = options.offset || [0.0, 0.0];
    this._texture = null;
    this._colorProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.filter._vColorShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.filter._fColorShader));
    this._textureProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.filter._vTextureShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.filter._fTextureShader));
    this._coords = null;
    this._texCoords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
    this._blend_src = this._screen.gl.ZERO;
    this._blend_dst = this._screen.gl.ZERO;
    this._setFilterType(options.filter);
    if (options.texture)
        this.setTexture(options.texture);
    else
        this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
};

// Filter type.
MajVj.frame.filter.REVERSE = 0;     // 1 - DST
MajVj.frame.filter.SRC = 1;         // SRC
MajVj.frame.filter.ALPHA = 2;       // SRC * a + DST * (1 - a)
MajVj.frame.filter.ADD = 3;         // SRC + DST
MajVj.frame.filter.MUL = 4;         // SRC * DST

// Shader programs.
MajVj.frame.filter._vColorShader = null;
MajVj.frame.filter._fColorShader = null;
MajVj.frame.filter._vTextureShader = null;
MajVj.frame.filter._fTextureShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.filter.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'filter', 'shaders.html', 'vColor'),
            MajVj.loadShader('frame', 'filter', 'shaders.html', 'fColor'),
            MajVj.loadShader('frame', 'filter', 'shaders.html', 'vTexture'),
            MajVj.loadShader('frame', 'filter', 'shaders.html', 'fTexture')
        ]).then(function (results) {
            MajVj.frame.filter._vColorShader = results[0];
            MajVj.frame.filter._fColorShader = results[1];
            MajVj.frame.filter._vTextureShader = results[2];
            MajVj.frame.filter._fTextureShader = results[3];
            resolve();
        }, function (error) { tma.log(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.filter.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.filter.prototype.draw = function (delta) {
    this._screen.setAlphaMode(true, this._blend_src, this._blend_dst);
    if (this._texture) {
        this._textureProgram.setAttributeArray('aCoord', this._coords, 0, 2, 0);
        this._textureProgram.setAttributeArray(
                'aTexCoord', this._texCoords, 0, 2, 0);
        this._textureProgram.setTexture('uTexture', this._texture);
        this._textureProgram.setUniformVector('uFade', [this._fade]);
        this._textureProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    } else if (this._coords) {
        this._colorProgram.setAttributeArray('aCoord', this._coords, 0, 2, 0);
        this._colorProgram.setUniformVector('uColor', this._color);
        this._colorProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    }
};

/**
 * Sets a controller.
 */
MajVj.frame.filter.prototype.setController = function (controller) {
    this._controller = controller;
};

/**
 * Sets a color.
 * @param color a color in [r, g, b, a]
 */
MajVj.frame.filter.prototype.setColor = function (color) {
    this._color = color;
};

/**
 * Sets a texture.
 * @param texture a URL to point a image data for textrue, or Image object
 */
MajVj.frame.filter.prototype.setTexture = function (texture) {
    if (typeof texture === 'object' &&
        texture.constructor.name === 'HTMLImageElement') {
        this._texture = this._screen.createTexture(
              texture, true, Tma3DScreen.FILTER_LINEAR);
        this._resetCoords();
    } else {
        MajVj.loadImageFrom(texture).then(function (image) {
            this._texture = this._screen.createTexture(
                    image, true, Tma3DScreen.FILTER_LINEAR);
            this._resetCoords();
        }.bind(this), function (e) { tma.log(e); });
    }
};

/**
 * Sets texture zoom ratio.
 * @param zoom zoom ratio
 */
MajVj.frame.filter.prototype.setZoom = function (zoom) {
    this._zoom = zoom;
    this._resetCoords();
};

/**
 * Sets texture offset.
 * @param offset texture offset ratio
 */
MajVj.frame.filter.prototype.setOffset = function (offset) {
    this._offset = offset;
    this._resetCoords();
};

/**
 * Sets fade level.
 * @param fade fade level
 * offset texture offset ratio
 */
MajVj.frame.filter.prototype.setFade = function (fade) {
    this._fade = fade;
};

/**
 * Resets coords.
 */
MajVj.frame.filter.prototype._resetCoords = function () {
    if (!this._texture)
        return;
    var aspect = this._texture.width / this._texture.height;
    var w = this._zoom;
    var h = this._zoom;
    if (this._aspect > aspect)
        w *= aspect / this._aspect;
    else
        h *= this._aspect / aspect;
    var x = this._offset[0] * this._zoom;
    var y = this._offset[1] * this._zoom;
    var coords = [-w + x, -h + y, -w + x, h + y, w + x, h + y, w + x, -h + y];
    if (!this._coords) {
        this._coords = this._screen.createBuffer(coords);
    } else {
        var buffer = this._coords.buffer();
        for (var i = 0; i < coords.length; ++i)
            buffer[i] = coords[i];
        this._coords.update();
    }
};

/**
 * Sets a filter type.
 */
MajVj.frame.filter.prototype._setFilterType = function (type) {
    if (!type)
        type = MajVj.frame.filter.REVERSE;
    var gl = this._screen.gl;
    switch (type) {
        case MajVj.frame.filter.REVERSE:
            this._blend_src = gl.ZERO;
            this._blend_dst = gl.ONE_MINUS_DST_COLOR;
            break;
        case MajVj.frame.filter.SRC:
            this._blend_src = gl.ONE;
            this._blend_dst = gl.ZERO;
            break;
        case MajVj.frame.filter.ALPHA:
            this._blend_src = gl.SRC_ALPHA;
            this._blend_dst = gl.ONE_MINUS_SRC_ALPHA;
            break;
        case MajVj.frame.filter.ADD:
            this._blend_src = gl.ONE;
            this._blend_dst = gl.ONE;
            break;
        case MajVj.frame.filter.MUL:
            this._blend_src = gl.DST_COLOR;
            this._blend_dst = gl.ZERO;
            break;
    }
};
