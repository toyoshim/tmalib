/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - api3d -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.api3d = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._noclear = options.noclear || false;
    this.properties = {
        vr: false,
        parallax_overlap: 0.0,
        parallax_distance: 100,
        orientation: [ 0.0, 0.0, -90.0 ],
        position: [ 0.0, 0.0, 0.0 ],
        rotation: [ 0.0, 0.0, 0.0 ],
        use_orientation: true,
        use_rotation: false
    };
    this.onresize(options.aspect);

    this._drawProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    options.drawModeVertexShader ||
                    MajVj.frame.api3d._vDrawShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    options.drawModeFragmentShader ||
                    MajVj.frame.api3d._fDrawShader));
    this._textureProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    options.textureModeVertexShader ||
                    MajVj.frame.api3d._vTextureShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    options.textureModeFragmentShader ||
                    MajVj.frame.api3d._fTextureShader));
    this._pointProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    options.pointModeVertexShader ||
                    MajVj.frame.api3d._vPointShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    options.pointModeFragmentShader ||
                    MajVj.frame.api3d._fPointShader));

    this._api = {
      clear: this._clear.bind(this),
      color: [1.0, 1.0, 1.0, 1.0],
      createFont: this._createFont.bind(this),
      createTexture: this._screen.createTexture,
      delta: 0.0,
      drawBox: this._drawBox.bind(this),
      drawCharacter: this._drawCharacter.bind(this),
      drawCube: this._drawCube.bind(this),
      drawLine: this._drawLine.bind(this),
      drawPrimitive: this._drawPrimitive.bind(this),
      fill: this._fill.bind(this),
      gl: this._screen.gl,
      screen: this._screen,
      setAlphaMode: this._screen.setAlphaMode,
      drawModeShader: this._drawProgram,
      textureModeShader: this._textureProgram,
      pointModeShader: this._pointProgram,
      vr: false,
      properties: this.properties
    };

    this._pMatrix = mat4.identity(mat4.create());
    this._rMatrix = mat4.identity(mat4.create());
    this._mvMatrixL = mat4.identity(mat4.create());
    this._mvMatrixR = mat4.identity(mat4.create());
    this._iMatrix = mat4.identity(mat4.create());
    this._matrix = mat4.create();

    this._buffer2 = this._screen.createBuffer(new Array(2 * 3));
    this._bufferICoord = this._screen.createBuffer(
            [-1, -1, 1, -1, 1, 1, 1, 1, 1, 1, -1, 1]);
    this._box = TmaModelPrimitives.createBox();
    this._cube = TmaModelPrimitives.createCube();

    var opt = options.options || {};
    opt.screen = this._screen;
    opt.api = this._api;
    opt.properties = this.properties;
    this._module = options.module ? new options.module(opt) : {
        draw: options.draw || function (api) {},
        clear: options.clear || function (api) {}
    };
};

// Shader programs.
MajVj.frame.api3d._vDrawShader = null;
MajVj.frame.api3d._fDrawShader = null;
MajVj.frame.api3d._vTextureShader = null;
MajVj.frame.api3d._fTextureShader = null;
MajVj.frame.api3d._vPointShader = null;
MajVj.frame.api3d._fPointShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.api3d.load = function () {
    return new Promise(function (resolve, reject) {
        var name = 'api3d';
        var path = 'shaders.html';
        Promise.all([
                MajVj.loadShader('frame', name, path, 'v_draw'),
                MajVj.loadShader('frame', name, path, 'f_draw'),
                MajVj.loadShader('frame', name, path, 'v_texture'),
                MajVj.loadShader('frame', name, path, 'f_texture'),
                MajVj.loadShader('frame', name, path, 'v_point'),
                MajVj.loadShader('frame', name, path, 'f_point'),
        ]).then(function (results) {
            MajVj.frame.api3d._vDrawShader = results[0];
            MajVj.frame.api3d._fDrawShader = results[1];
            MajVj.frame.api3d._vTextureShader = results[2];
            MajVj.frame.api3d._fTextureShader = results[3];
            MajVj.frame.api3d._vPointShader = results[4];
            MajVj.frame.api3d._fPointShader = results[5];
            resolve();
        }, function () { reject('api3d.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.api3d.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.api3d.prototype.draw = function (delta) {
    var api = this.beginDraw(delta);
    if (!this._noclear)
      this._module.clear(api);
    this._module.draw(api);
    this.endDraw();
};

/**
 * Sets up to call APIs and returns an API handle.
 * @param delta delta time from the last rendering
 * @return an API handle
 */
MajVj.frame.api3d.prototype.beginDraw = function (delta) {
    this._screen.pushAlphaMode();

    var aspect = this._aspect;

    var rx, ry, rz;
    if (this.properties.use_rotation) {
        var rotation = this.properties.rotation;
        rx = rotation[0];
        ry = rotation[1];
        rz = rotation[2];
    } else if (this.properties.use_orientation) {
        // TODO: Something is wrong on looking at sides.
        var orientation = this.properties.orientation;
        rx = (90 + orientation[2]) / 360 * Math.PI * 2;
        ry = -orientation[0] / 360 * Math.PI * 2;
        rz = orientation[1] / 360 * Math.PI * 2;
    }
    mat4.identity(this._mvMatrixL);
    mat4.rotateZ(this._mvMatrixL, this._mvMatrixL, rz);
    mat4.rotateY(this._mvMatrixL, this._mvMatrixL, ry);
    mat4.rotateX(this._mvMatrixL, this._mvMatrixL, rx);

    this._api.vr = this.properties.vr;

    if (this._api.vr) {
        // TODO: Parallax calculation is also wrong.
        aspect *= (1 + this.properties.parallax_overlap) / 2;
        var distance = this.properties.parallax_distance;
        mat4.translate(this._mvMatrixR, this._mvMatrixL, [-distance, 0, 0]);
        mat4.translate(this._mvMatrixL, this._mvMatrixL, [distance, 0, 0]);
    }
    mat4.perspective(this._pMatrix, Math.PI / 3, aspect, 0.1, 10000.0);
    this._viewport(this._api.vr ? 1 : 0);

    this._api.delta = delta;
    return this._api;
};

/**
 * Cleans up to call APIs. Should be called for each beginDraw().
 */
MajVj.frame.api3d.prototype.endDraw = function () {
    this._screen.popAlphaMode();
};

/**
 * Sets viewport.
 * @param mode 0: normal, 1: left, 2: right
 */
MajVj.frame.api3d.prototype._viewport = function (view) {
    var c = this._width / 2;
    var d = c * this.properties.parallax_overlap;
    var x = view == 2 ? (c - d) : 0;
    var w = view == 0 ? this._width : (c + d);
    this._screen.gl.viewport(x, 0, w, this._height);
};

/**
 * Clears the display.
 * @param flag flag, e.g., gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT
 */
MajVj.frame.api3d.prototype._clear = function (flag) {
    this._screen.gl.clearColor(this._api.color[0], this._api.color[1],
                               this._api.color[2], this._api.color[3]);
    this._screen.gl.clear(flag);
    if (this._api.vr) {
        this._viewport(2);
        this._screen.gl.clear(flag);
        this._viewport(1);
    }
};

/**
 * Draws a box.
 * @param w width
 * @param h height
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 * @param texture texture (optional)
 */
MajVj.frame.api3d.prototype._drawBox = function (w, h, p, r, texture) {
    this._box.setTexture(texture);
    return this._drawPrimitive(this._box, w, h, 1.0, p, r);
};

/**
 * Draws a character.
 * @param font a font set that is created by createFont API
 * @param c a character to show
 * @param w width scale (actual size depends on font size)
 * @param h height scale (actual size depends on font size)
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 */
MajVj.frame.api3d.prototype._drawCharacter =
        function (font, c, w, h, p, r) {
    var texture = font[c];
    this._box.setTexture(texture);
    var width = texture.width * w;
    var height = texture.height * h;
    return this._drawPrimitive(this._box, width, height, 1.0, p, r);
};

/**
 * Draws a cube.
 * @param w width
 * @param h height
 * @param d depth
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 */
MajVj.frame.api3d.prototype._drawCube = function (w, h, d, p, r) {
    return this._drawPrimitive(this._cube, w, h, d, p, r);
};

/**
 * Draws a line.
 * @param src source position in [x, y, z]
 * @param dst destination position in [x, y, z]
 */
MajVj.frame.api3d.prototype._drawLine = function (src, dst) {
    var buffer = this._buffer2.buffer();
    buffer[0] = src[0] - this.properties.position[0];
    buffer[1] = src[1] - this.properties.position[1];
    buffer[2] = src[2] - this.properties.position[2];
    buffer[3] = dst[0] - this.properties.position[0];
    buffer[4] = dst[1] - this.properties.position[1];
    buffer[5] = dst[2] - this.properties.position[2];
    this._buffer2.update();
    this._drawProgram.setAttributeArray('aCoord', this._buffer2, 0, 3, 0);
    this._drawProgram.setUniformVector('uColor', this._api.color);
    this._drawProgram.setUniformMatrix('uMatrix', this._iMatrix);

    this._drawProgram.setUniformMatrix('uPMatrix', this._pMatrix);
    this._drawProgram.setUniformMatrix('uMVMatrix', this._mvMatrixL);
    this._drawProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);

    if (this._api.vr) {
        this._viewport(2);
        this._drawProgram.setUniformMatrix('uMVMatrix', this._mvMatrixR);
        this._drawProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);
        this._viewport(1);
    }
};

/**
 * Draws a primitive.
 * @param o primitive
 * @param w width
 * @param h height
 * @param d depth
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 * @param v volume (optional)
 */
MajVj.frame.api3d.prototype._drawPrimitive = function (o, w, h, d, p, r, v) {
    var texture = o.getTexture();
    var mode = o.getDrawMode();
    var point = mode == Tma3DScreen.MODE_POINTS;
    var program = texture ? this._textureProgram :
                  point ? this._pointProgram : this._drawProgram;
    program.setAttributeArray(
            'aCoord', o.getVerticesBuffer(this._screen), 0, 3, 0);
    if (texture) {
        program.setAttributeArray(
               'aTexCoord', o.getCoordsBuffer(this._screen), 0, 2, 0);
        program.setTexture('uTexture', texture);
        program.setUniformVector('uVolume', [v === undefined ? 1.0 : v]);
    } else if (point) {
        program.setUniformVector('uSize', [(w + h + d) / 3]);
        program.setAttributeArray(
                'aColor', o.getColorsBuffer(this._screen), 0, 4, 0);
    } else {
        program.setUniformVector('uColor', this._api.color);
    }

    var rp = [
        p[0] - this.properties.position[0],
        p[1] - this.properties.position[1],
        p[2] - this.properties.position[2]
    ];
    mat4.translate(this._matrix, this._iMatrix, rp);
    mat4.translate(this._rMatrix, this._iMatrix, [0, 0, 0]);
    if (r) {
        for (var i = r.length - 1; i >= 0; --i) {
            var rotate = r[i];
            mat4.rotateX(this._matrix, this._matrix, rotate[0]);
            mat4.rotateY(this._matrix, this._matrix, rotate[1]);
            mat4.rotateZ(this._matrix, this._matrix, rotate[2]);
            mat4.rotateX(this._rMatrix, this._rMatrix, rotate[0]);
            mat4.rotateY(this._rMatrix, this._rMatrix, rotate[1]);
            mat4.rotateZ(this._rMatrix, this._rMatrix, rotate[2]);
        }
    }
    mat4.scale(this._matrix, this._matrix, [w, h, d]);
    program.setUniformMatrix('uMatrix', this._matrix);
    if (texture)
        program.setUniformMatrix('uRMatrix', this._rMatrix);
    program.setUniformMatrix('uPMatrix', this._pMatrix);
    program.setUniformMatrix('uMVMatrix', this._mvMatrixL);
    if (mode != Tma3DScreen.MODE_LINE_TRIANGLES) {
        program.drawElements(
                mode, o.getIndicesBuffer(this._screen), o.getIndicesOffset(),
                o.getIndicesLength());
    } else {
        for (var i = o.getIndicesOffset(); i < o.getIndicesLength(); i += 3) {
            program.drawElements(
                    Tma3DScreen.MODE_LINE_LOOP,
                    o.getIndicesBuffer(this._screen), i * 2, 3);
        }
    }
    if (this._api.vr) {
        this._viewport(2);
        program.setUniformMatrix('uMVMatrix', this._mvMatrixR);
        if (mode != Tma3DScreen.MODE_LINE_TRIANGLES) {
            program.drawElements(
                    mode, o.getIndicesBuffer(this._screen),
                    o.getIndicesOffset(), o.getIndicesLength());
        } else {
            for (var i = o.getIndicesOffset(); i < o.getIndicesLength();
                    i += 3) {
                program.drawElements(
                        Tma3DScreen.MODE_LINE_LOOP,
                        o.getIndicesBuffer(this._screen), i * 2, 3);
            }
        }
        this._viewport(1);
    }
};

/**
 * Fills display textures.
 * @param color a color in [r, g, b, a]
 */
MajVj.frame.api3d.prototype._fill = function (color) {
    var c = color || this._api.color;
    this._drawProgram.setAttributeArray('aCoord', this._bufferICoord, 0, 3, 0);
    this._drawProgram.setUniformVector('uColor', c);
    this._drawProgram.setUniformMatrix('uPMatrix', this._iMatrix);
    this._drawProgram.setUniformMatrix('uMVMatrix', this._iMatrix);
    this._drawProgram.setUniformMatrix('uMatrix', this._iMatrix);
    this._drawProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    if (this._api.vr) {
        this._viewport(2);
        this._drawProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
        this._viewport(1);
    }
};

/**
 * Creates a font context.
 * @param font font information for Tma3DScreen.prototype.createStringTexture()
 * @param text a string that contains characters
 */
MajVj.frame.api3d.prototype._createFont = function (font, text) {
    var result = {};
    // FIXME: Support surrogate code pairs
    for (var i = 0; i < text.length; ++i)
        result[text[i]] = this._screen.createStringTexture(text[i], font);
    return result;
};
