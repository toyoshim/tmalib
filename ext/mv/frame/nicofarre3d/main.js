/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.nicofarre3d = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {};
    this._clearCallback = options.clear;
    this._drawCallback = options.draw;
    this._modules = [];
    this._api = {
      clear: this._clear.bind(this),
      color: [1.0, 1.0, 1.0, 1.0],
      createFont: this._createFont.bind(this),
      createTexture: this._screen.createTexture.bind(this._screen),
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
    };

    this._screenProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre3d._vScreenShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre3d._fScreenShader));
    this._drawProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre3d._vDrawShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre3d._fDrawShader));
    this._textureProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre3d._vTextureShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre3d._fTextureShader));
    this._pointProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre3d._vPointShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre3d._fPointShader));
    this._coords = this._screen.createBuffer([
            // A (right): (40, 760) - (1520, 1040) / (1920, 1080)
            40 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            // B (stage): (40, 120) - (880, 400) / (1920, 1080)
            40 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // C (left): (40, 440) - (1520, 720) / (1920, 1080)
            40 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // D (back): (920, 120) - (1760, 400) / (1920, 1080)
            920 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            920 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // E (stage right): (1560, 760) - (1720, 1040) / (1920, 1080)
            1560 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            1560 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            // F (stage left): (1560, 440) - (1720, 720) / (1920, 1080)
            1560 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            1560 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 440 / 1080 * 2 - 1]);
    this._texCoods = this._screen.createBuffer([
            0, 0, 0, 1, 1, 1, 1, 0,    // A: 1480
            0, 0, 0, 1, 1, 1, 1, 0,    // B: 840
            0, 0, 0, 1, 1, 1, 1, 0,    // C: 1480
            0, 0, 0, 1, 1, 1, 1, 0,    // D: 840
            0, 0, 0, 1, 1, 1, 1, 0,    // E: 160
            0, 0, 0, 1, 1, 1, 1, 0]);  // F: 160
    var scale = this._width / 1920;  // FIXME: check if it works
    var height = 280 * this._height / 1080;
    this._fboRight = this._screen.createFrameBuffer(1480 * scale, height);
    this._fboStage = this._screen.createFrameBuffer(840 * scale, height);
    this._fboLeft = this._screen.createFrameBuffer(1480 * scale, height);
    this._fboBack = this._screen.createFrameBuffer(840 * scale, height);

    var theta0 = Math.atan(1480 / 840);
    var theta1 = Math.PI - theta0 * 2;
    var theta2 = Math.PI - theta1;
    var scale1 = [840 / 280, 840 / 280, 1];
    var scale2 = [1480 / 280, 1480 / 280, 1];
    this._iMatrix = mat4.identity(mat4.create());
    this._pMatrixRight = mat4.scale(
            mat4.create(),
            mat4.perspective(mat4.create(), theta2, 1480 / 280, 420, 100000),
            scale2);
    this._pMatrixStage = mat4.scale(
            mat4.create(),
            mat4.perspective(mat4.create(), theta1, 840 / 280, 740, 100000),
            scale1);
    this._pMatrixLeft = mat4.scale(
            mat4.create(),
            mat4.perspective(mat4.create(), theta2, 1480 / 280, 420, 100000),
            scale2);
    this._pMatrixBack = mat4.scale(
            mat4.create(),
            mat4.perspective(mat4.create(), theta1, 840 / 280, 740, 100000),
            scale1);
    this._mvMatrixRight =
            mat4.rotateY(mat4.create(), this._iMatrix, Math.PI / 2);
    this._mvMatrixStage = mat4.clone(this._iMatrix);
    this._mvMatrixLeft =
            mat4.rotateY(mat4.create(), this._iMatrix, -Math.PI / 2);
    this._mvMatrixBack =
            mat4.rotateY(mat4.create(), this._iMatrix, -Math.PI);
    this._matrix = mat4.create();

    this._buffer2 = this._screen.createBuffer(new Array(2 * 3));
    this._bufferICoord = this._screen.createBuffer(
            [-1, -1, 1, -1, 1, 1, 1, 1, 1, 1, -1, 1]);
    this._box = TmaModelPrimitives.createBox();
    this._cube = TmaModelPrimitives.createCube();

    if (options.module) {
        var opt = options.options || {};
        opt.screen = this._screen;
        opt.api = this._api;
        opt.properties = this.properties;
        this._modules[0] =
                new MajVj.frame.nicofarre3d.modules[options.module](opt);
    } else if (options.modules) {
        for (var i = 0; i < options.modules.length; ++i) {
            var module = options.modules[i];
            var opt = module.options || {};
            opt.screen = this._screen;
            opt.api = this._api;
            opt.properties = this.properties;
            this._modules[i] =
                    new MajVj.frame.nicofarre3d.modules[module.name](opt);
        }
    }
};

// Sub modules that draw frames using nicofarre3d API.
MajVj.frame.nicofarre3d.modules = {};

// Shader programs.
MajVj.frame.nicofarre3d._vScreenShader = null;
MajVj.frame.nicofarre3d._fScreenShader = null;
MajVj.frame.nicofarre3d._vDrawShader = null;
MajVj.frame.nicofarre3d._fDrawShader = null;
MajVj.frame.nicofarre3d._vTextureShader = null;
MajVj.frame.nicofarre3d._fTextureShader = null;
MajVj.frame.nicofarre3d._vPointShader = null;
MajVj.frame.nicofarre3d._fPointShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.nicofarre3d.load = function () {
    return new Promise(function (resolve, reject) {
        var name = 'nicofarre3d';
        var path = 'shaders.html';
        Promise.all([
                MajVj.loadShader('frame', name, path, 'v_screen'),
                MajVj.loadShader('frame', name, path, 'f_screen'),
                MajVj.loadShader('frame', name, path, 'v_draw'),
                MajVj.loadShader('frame', name, path, 'f_draw'),
                MajVj.loadShader('frame', name, path, 'v_texture'),
                MajVj.loadShader('frame', name, path, 'f_texture'),
                MajVj.loadShader('frame', name, path, 'v_point'),
                MajVj.loadShader('frame', name, path, 'f_point'),
                MajVj.loadScript('frame', name, 'cube.js'),
                MajVj.loadScript('frame', name, 'waypoints.js'),
                MajVj.loadScript('frame', name, 'beams.js'),
                MajVj.loadScript('frame', name, 'train.js'),
                MajVj.loadScript('frame', name, 'lines.js'),
                MajVj.loadScript('frame', name, 'harrier.js'),
                MajVj.loadScript('frame', name, 'roll.js')
        ]).then(function (results) {
            MajVj.frame.nicofarre3d._vScreenShader = results[0];
            MajVj.frame.nicofarre3d._fScreenShader = results[1];
            MajVj.frame.nicofarre3d._vDrawShader = results[2];
            MajVj.frame.nicofarre3d._fDrawShader = results[3];
            MajVj.frame.nicofarre3d._vTextureShader = results[4];
            MajVj.frame.nicofarre3d._fTextureShader = results[5];
            MajVj.frame.nicofarre3d._vPointShader = results[6];
            MajVj.frame.nicofarre3d._fPointShader = results[7];
            resolve();
        }, function () { reject('nicofarre3d.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.nicofarre3d.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.nicofarre3d.prototype.draw = function (delta) {
    this._screen.pushAlphaMode();
    var screen = this._fboRight.bind();

    this._api.delta = delta;
    if (this._clearCallback)
        this._clearCallback(this._api)
    else if (this._modules.length > 0)
        this._modules[0].clear(this._api);
    for (var i = 0; i < this._modules.length; ++i)
        this._modules[i].draw(this._api);
    if (this._drawCallback)
        this._drawCallback(this._api);

    screen.bind();
    this._screen.popAlphaMode();
    this._screenProgram.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._screenProgram.setAttributeArray('aTexCoord', this._texCoods, 0, 2, 0);
    this._screenProgram.setTexture('uTexture', this._fboRight.texture);
    this._screenProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    this._screenProgram.setTexture('uTexture', this._fboStage.texture);
    this._screenProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 4, 4);
    this._screenProgram.setTexture('uTexture', this._fboLeft.texture);
    this._screenProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 8, 4);
    this._screenProgram.setTexture('uTexture', this._fboBack.texture);
    this._screenProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 12, 4);
};

/**
 * Clears all displays.
 * @param flag flag, e.g., gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT
 */
MajVj.frame.nicofarre3d.prototype._clear = function (flag) {
    this._screen.gl.clearColor(this._api.color[0], this._api.color[1],
                               this._api.color[2], this._api.color[3]);
    this._fboRight.bind();
    this._screen.gl.clear(flag);
    this._fboStage.bind();
    this._screen.gl.clear(flag);
    this._fboLeft.bind();
    this._screen.gl.clear(flag);
    this._fboBack.bind();
    this._screen.gl.clear(flag);
};

/**
 * Draws a box to all displays.
 * @param w width
 * @param h height
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 * @param texture texture (optional)
 */
MajVj.frame.nicofarre3d.prototype._drawBox = function (w, h, p, r, texture) {
    this._box.setTexture(texture);
    return this._drawPrimitive(this._box, w, h, 1.0, p, r);
};

/**
 * Draws a character to all displays.
 * @param font a font set that is created by createFont API
 * @param c a character to show
 * @param w width scale (actual size depends on font size)
 * @param h height scale (actual size depends on font size)
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 */
MajVj.frame.nicofarre3d.prototype._drawCharacter =
        function (font, c, w, h, p, r) {
    var texture = font[c];
    this._box.setTexture(texture);
    var width = texture.width * w;
    var height = texture.height * h;
    return this._drawPrimitive(this._box, width, height, 1.0, p, r);
};

/**
 * Draws a cube to all displays.
 * @param w width
 * @param h height
 * @param d depth
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 */
MajVj.frame.nicofarre3d.prototype._drawCube = function (w, h, d, p, r) {
    return this._drawPrimitive(this._cube, w, h, d, p, r);
};

/**
 * Draws a line to all displays.
 * @param src source position in [x, y, z]
 * @param dst destination position in [x, y, z]
 */
MajVj.frame.nicofarre3d.prototype._drawLine = function (src, dst) {
    var buffer = this._buffer2.buffer();
    buffer[0] = src[0]; buffer[1] = src[1]; buffer[2] = src[2];
    buffer[3] = dst[0]; buffer[4] = dst[1]; buffer[5] = dst[2];
    this._buffer2.update();
    this._drawProgram.setAttributeArray('aCoord', this._buffer2, 0, 3, 0);
    this._drawProgram.setUniformVector('uColor', this._api.color);
    this._drawProgram.setUniformMatrix('uMatrix', this._iMatrix);

    this._fboRight.bind();
    this._drawProgram.setUniformMatrix('uPMatrix', this._pMatrixRight);
    this._drawProgram.setUniformMatrix('uMVMatrix', this._mvMatrixRight);
    this._drawProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);

    this._fboStage.bind();
    this._drawProgram.setUniformMatrix('uPMatrix', this._pMatrixStage);
    this._drawProgram.setUniformMatrix('uMVMatrix', this._mvMatrixStage);
    this._drawProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);

    this._fboLeft.bind();
    this._drawProgram.setUniformMatrix('uPMatrix', this._pMatrixLeft);
    this._drawProgram.setUniformMatrix('uMVMatrix', this._mvMatrixLeft);
    this._drawProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);

    this._fboBack.bind();
    this._drawProgram.setUniformMatrix('uPMatrix', this._pMatrixBack);
    this._drawProgram.setUniformMatrix('uMVMatrix', this._mvMatrixBack);
    this._drawProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);
};

/**
 * Draws a primitive to all displays.
 * @param o primitive
 * @param w width
 * @param h height
 * @param d depth
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 */
MajVj.frame.nicofarre3d.prototype._drawPrimitive = function (o, w, h, d, p, r) {
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
    } else if (point) {
        program.setAttributeArray(
                'aColor', o.getColorsBuffer(this._screen), 0, 4, 0);
    } else {
        program.setUniformVector('uColor', this._api.color);
    }

    mat4.translate(this._matrix, this._iMatrix, p);
    if (r) {
        if (typeof r[0] === 'number') {
            // TODO: Remove this useless mod. Exist just for compat.
            mat4.rotateX(this._matrix, this._matrix, r[0]);
            mat4.rotateY(this._matrix, this._matrix, r[1]);
            mat4.rotateZ(this._matrix, this._matrix, r[2]);
        } else {
            for (var i = r.length - 1; i >= 0; --i) {
                var rotate = r[i];
                mat4.rotateX(this._matrix, this._matrix, rotate[0]);
                mat4.rotateY(this._matrix, this._matrix, rotate[1]);
                mat4.rotateZ(this._matrix, this._matrix, rotate[2]);
            }
        }
    }
    mat4.scale(this._matrix, this._matrix, [w, h, d]);
    program.setUniformMatrix('uMatrix', this._matrix);

    this._fboRight.bind();
    if (texture) program.setTexture('uTexture', texture);
    program.setUniformMatrix('uPMatrix', this._pMatrixRight);
    program.setUniformMatrix('uMVMatrix', this._mvMatrixRight);
    program.drawElements(mode, o.getIndicesBuffer(this._screen), 0, o.items());

    this._fboStage.bind();
    if (texture) program.setTexture('uTexture', texture);
    program.setUniformMatrix('uPMatrix', this._pMatrixStage);
    program.setUniformMatrix('uMVMatrix', this._mvMatrixStage);
    program.drawElements(mode, o.getIndicesBuffer(this._screen), 0, o.items());

    this._fboLeft.bind();
    if (texture) program.setTexture('uTexture', texture);
    program.setUniformMatrix('uPMatrix', this._pMatrixLeft);
    program.setUniformMatrix('uMVMatrix', this._mvMatrixLeft);
    program.drawElements(mode, o.getIndicesBuffer(this._screen), 0, o.items());

    this._fboBack.bind();
    if (texture) program.setTexture('uTexture', texture);
    program.setUniformMatrix('uPMatrix', this._pMatrixBack);
    program.setUniformMatrix('uMVMatrix', this._mvMatrixBack);
    program.drawElements(mode, o.getIndicesBuffer(this._screen), 0, o.items());
};

/**
 * Fills display textures.
 * @param color a color in [r, g, b, a]
 */
MajVj.frame.nicofarre3d.prototype._fill = function (color) {
    var c = color || this._api.color;
    this._drawProgram.setAttributeArray('aCoord', this._bufferICoord, 0, 3, 0);
    this._drawProgram.setUniformVector('uColor', c);
    this._drawProgram.setUniformMatrix('uPMatrix', this._iMatrix);
    this._drawProgram.setUniformMatrix('uMVMatrix', this._iMatrix);
    this._drawProgram.setUniformMatrix('uMatrix', this._iMatrix);
    this._fboRight.bind();
    this._drawProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    this._fboStage.bind();
    this._drawProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    this._fboLeft.bind();
    this._drawProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    this._fboBack.bind();
    this._drawProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};

/**
 * Creates a font context.
 * @param font font information for Tma3DScreen.prototype.createStringTexture()
 * @param text a string that contains characters
 */
MajVj.frame.nicofarre3d.prototype._createFont = function (font, text) {
    var result = {};
    // FIXME: Support surrogate code pairs
    for (var i = 0; i < text.length; ++i)
        result[text[i]] = this._screen.createStringTexture(text[i], font);
    return result;
};
