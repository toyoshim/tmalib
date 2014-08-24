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
    this._controller = options.controller;
    this._draw = options.draw;
    this._api = {
      color: [1, 1, 1, 1],
      drawLine: this._drawLine.bind(this),
      gl: this._screen.gl,
      setAlphaMode: this._screen.setAlphaMode,
    };

    this._screenProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre3d._vScreenShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre3d._fScreenShader));
    this._lineProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre3d._vLineShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre3d._fLineShader));
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

    var theta0 = Math.atan(1480 / 840) * 180 / Math.PI;
    var theta1 = 180 - theta0 * 2;
    var theta2 = 180 - theta1;
    var scale1 = [840 / 280, 840 / 280, 1];
    var scale2 = [1480 / 280, 1480 / 280, 1];
    this._pMatrixRight = mat4.scale(
            mat4.perspective(theta2, 1480 / 280, 420, 100000), scale2);
    this._pMatrixStage = mat4.scale(
            mat4.perspective(theta1, 840 / 280, 740, 100000), scale1);
    this._pMatrixLeft = mat4.scale(
            mat4.perspective(theta2, 1480 / 280, 420, 100000), scale2);
    this._pMatrixBack = mat4.scale(
            mat4.perspective(theta1, 840 / 280, 740, 100000), scale1);
    this._mvMatrixRight = mat4.rotateY(mat4.identity(), Math.PI / 2);
    this._mvMatrixStage = mat4.identity();
    this._mvMatrixLeft = mat4.rotateY(mat4.identity(), -Math.PI / 2);
    this._mvMatrixBack = mat4.rotateY(mat4.identity(), -Math.PI);

    this._buffer2 = this._screen.createBuffer(new Array(2 * 3));
};

// Shader programs.
MajVj.frame.nicofarre3d._vScreenShader = null;
MajVj.frame.nicofarre3d._fScreenShader = null;

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
                MajVj.loadShader('frame', name, path, 'v_line'),
                MajVj.loadShader('frame', name, path, 'f_line')
        ]).then(function (shaders) {
            MajVj.frame.nicofarre3d._vScreenShader = shaders[0];
            MajVj.frame.nicofarre3d._fScreenShader = shaders[1];
            MajVj.frame.nicofarre3d._vLineShader = shaders[2];
            MajVj.frame.nicofarre3d._fLineShader = shaders[3];
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

    this._draw(this._api);

    screen.bind();
    this._screen.setAlphaMode(false);
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

    this._screen.popAlphaMode();
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.nicofarre3d.prototype.setController = function (controller) {
    this._controller = controller;
};

MajVj.frame.nicofarre3d.prototype._drawLine =
        function (sx, sy, sz, dx, dy, dz) {
    var buffer = this._buffer2.buffer();
    buffer[0] = sx; buffer[1] = sy; buffer[2] = sz;
    buffer[3] = dx; buffer[4] = dy; buffer[5] = dz;
    this._buffer2.update();
    this._lineProgram.setAttributeArray('aCoord', this._buffer2, 0, 3, 0);
    this._lineProgram.setUniformVector('uColor', this._api.color);

    this._fboRight.bind();
    this._lineProgram.setUniformMatrix('uPMatrix', this._pMatrixRight);
    this._lineProgram.setUniformMatrix('uMVMatrix', this._mvMatrixRight);
    this._lineProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);

    this._fboStage.bind();
    this._lineProgram.setUniformMatrix('uPMatrix', this._pMatrixStage);
    this._lineProgram.setUniformMatrix('uMVMatrix', this._mvMatrixStage);
    this._lineProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);

    this._fboLeft.bind();
    this._lineProgram.setUniformMatrix('uPMatrix', this._pMatrixLeft);
    this._lineProgram.setUniformMatrix('uMVMatrix', this._mvMatrixLeft);
    this._lineProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);

    this._fboBack.bind();
    this._lineProgram.setUniformMatrix('uPMatrix', this._pMatrixBack);
    this._lineProgram.setUniformMatrix('uMVMatrix', this._mvMatrixBack);
    this._lineProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);
};
