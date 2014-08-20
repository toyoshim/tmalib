/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nico_test -
 * @param mv MajVj object
 * @param screen Tma3DScreen object
 * @param width offscreen width
 * @param height offscreen height
 * @param aspect screen aspect ratio (screen width / screen height)
 */
MajVj.frame.nico_test = function (mv, screen, width, height, aspect) {
    this._screen = screen;
    this._width = width;
    this._height = height;
    this._aspect = aspect;
    this._controller = null;
    this._speed = 4;
    this._x = 0;
    this._y = 0;
    this._z = 0;
    this._ax = this._speed;
    this._ay = this._speed;
    this._az = this._speed;
    this._t = 0;

    this._program = screen.createProgram(
            screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nico_test._vertexShader),
            screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nico_test._fragmentShader));
    this._coords = screen.createBuffer([
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
            1720 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // G (ceiling): (1760, 870) - (1858, 1040) / (1920, 1080)
            1760 / 1920 * 2 - 1, 870 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1858 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1858 / 1920 * 2 - 1, 870 / 1080 * 2 - 1]);
    this._texCoods = screen.createBuffer([
            // A (right)
            880, 20, 40,
            880, 300, 40,
            880, 300, 1520,
            880, 20, 1520,
            // B (stage)
            20, 20, 0,
            20, 300, 0,
            860, 300, 0,
            860, 20, 0,
            // C (left)
            0, 20, 1520,
            0, 300, 1520,
            0, 300, 40,
            0, 20, 40,
            // D (back)
            860, 20, 1560,
            860, 300, 1560,
            20, 300, 1560,
            20, 20, 1560,
            // E (stage right)
            700, 20, 280,  // 280 is just a estimation
            700, 300, 280,
            860, 300, 280,
            860, 20, 280,
            // F (stage left)
            20, 20, 280,
            20, 300, 280,
            180, 300, 280,
            180, 20, 280,
            // G (ceiling)
            20, 320, 40,
            20, 320, 1520,
            860, 320, 1520,
            860, 320, 40]);
};

// Shader programs.
MajVj.frame.nico_test._vertexShader = null;
MajVj.frame.nico_test._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.nico_test.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'nico_test', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'nico_test', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.nico_test._vertexShader = shaders[0];
            MajVj.frame.nico_test._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('nico_test.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.nico_test.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.nico_test.prototype.draw = function (delta) {
    this._x += this._ax;
    if (this._x < 0)
        this._ax = this._speed;
    else if (this._x > 880)
        this._ax = -this._speed;
    this._y += this._ay;
    if (this._y < 0)
        this._ay = this._speed;
    else if (this._y > 320)
        this._ay = -this._speed;
    if (this._controller && this._controller.volume &&
        this._controller.volume[2]) {
        this._az = 0;
        this._z += this._controller.volume[2];
        console.log(this._z);
    }
    this._z += this._az;
    if (this._z < 0)
        this._az = this._speed;
    else if (this._z > 1480)
        this._az = -this._speed;
    this._t += delta;
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(true, this._screen.gl.SRC_ALPHA,
            this._screen.gl.ONE);
    this._screen.fillColor(0.0, 0.0, 0.0, 1.0);
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setAttributeArray('aTexCoord', this._texCoods, 0, 3, 0);
    this._program.setUniformVector('uX', [this._x]);
    this._program.setUniformVector('uY', [this._y]);
    this._program.setUniformVector('uZ', [this._z]);
    var uT = [Math.sin(this._t / 300) / 20,
              Math.sin(this._t / 500) / 30,
              Math.sin(this._t / 700) / 40 + 0.1]
    this._program.setUniformVector('uT', uT);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 4, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 8, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 12, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 16, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 20, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 24, 4);
    this._screen.popAlphaMode();
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.nico_test.prototype.setController = function (controller) {
    this._controller = controller;
};
