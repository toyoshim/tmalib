/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.nicofarre = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre._fragmentShader));
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
            1720 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // G (ceiling): (1760, 870) - (1858, 1040) / (1920, 1080)
            1760 / 1920 * 2 - 1, 870 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1858 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1858 / 1920 * 2 - 1, 870 / 1080 * 2 - 1,
            // LEFT_STAGE_RIGHT - C
            40 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // LEFT_STAGE_RIGHT - B
            40 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // LEFT_STAGE_RIGHT - A
            40 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            ]);
    this._texCoods = this._screen.createBuffer([
            0, 0, 0, 1, 1, 1, 1, 0,  // A
            0, 0, 0, 1, 1, 1, 1, 0,  // B
            0, 0, 0, 1, 1, 1, 1, 0,  // C
            0, 0, 0, 1, 1, 1, 1, 0,  // D
            0, 0, 0, 1, 1, 1, 1, 0,  // E
            0, 0, 0, 1, 1, 1, 1, 0,  // F
            0, 0, 0, 1, 1, 1, 1, 0,  // G
            // LEFT_STAGE_RIGHT - C, B, A
            0, 0, 0, 1, 1480 / 3800, 1, 1480 / 3800, 0,
            1480 / 3800, 0, 1480 / 3800, 1, 2320 / 3800, 1, 2320 / 3800, 0,
            2320 / 3800, 0, 2320 / 3800, 1, 3800 / 3800, 1, 3800 / 3800, 0,
            ]);
    var size = [
      [1480, 280],  // A
      [840, 280],   // B
      [1480, 280],  // C
      [840, 280],   // D
      [160, 280],   // E
      [160, 280],   // F
      [98, 170],    // G
      // LEFT_STAGE_RIGHT - C, B, A
      [3800, 280], [], [],
      ];
    this._led = options.led;
    this._mirror = options.mirror;
    if (this._mirror === undefined)
      this._mirror = MajVj.frame.nicofarre.MIRROR_OFF;
    var w = size[this._led[0]][0] * this._width / 1920;
    var h = size[this._led[0]][1] * this._height / 1080;
    this._fbo = this._screen.createFrameBuffer(w, h);
    this._frames = [];
    for (var i = 0; i < options.frames.length; ++i) {
      var frame = options.frames[i];
      var flags = {};
      if (typeof frame != 'string') {
        flags = frame.options;
        frame = frame.name;
      }
      flags.width = flags.width || w;
      flags.height = flags.height || h;
      flags.aspect = flags.aspect || w / h;
      this._frames[i] = options.mv.create('frame', frame, flags);
    }
};

// Const values to specify the showing LED screen.
MajVj.frame.nicofarre.LED_A = [0];
MajVj.frame.nicofarre.LED_B = [1];
MajVj.frame.nicofarre.LED_C = [2];
MajVj.frame.nicofarre.LED_D = [3];
MajVj.frame.nicofarre.LED_E = [4];
MajVj.frame.nicofarre.LED_F = [5];
MajVj.frame.nicofarre.LED_G = [6];
MajVj.frame.nicofarre.LED_WALL_RIGHT = [0];
MajVj.frame.nicofarre.LED_STAGE = [1];
MajVj.frame.nicofarre.LED_WALL_LEFT = [2];
MajVj.frame.nicofarre.LED_BACK = [3];
MajVj.frame.nicofarre.LED_FRONT_RIGHT = [4];
MajVj.frame.nicofarre.LED_FRONT_LEFT = [5];
MajVj.frame.nicofarre.LED_CEILING = [6];
MajVj.frame.nicofarre.LED_FRONT_BOTH = [4, 5];
MajVj.frame.nicofarre.LED_WALL_BOTH = [0, 2];
MajVj.frame.nicofarre.LED_STAGE_AND_BACK = [1, 3];
MajVj.frame.nicofarre.LED_LEFT_STAGE_RIGHT = [7, 8, 9];

// Const values to specify mirroing mode.
MajVj.frame.nicofarre.MIRROR_OFF = 2;
MajVj.frame.nicofarre.MIRROR_ON_RIGHT = 0;
MajVj.frame.nicofarre.MIRROR_ON_LEFT = 1;

// Shader programs.
MajVj.frame.nicofarre._vertexShader = null;
MajVj.frame.nicofarre._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.nicofarre.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'nicofarre', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'nicofarre', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.nicofarre._vertexShader = shaders[0];
            MajVj.frame.nicofarre._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('nicofarre.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.nicofarre.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.nicofarre.prototype.draw = function (delta) {
    var fbo = this._fbo.bind();
    var i;
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(true, this._screen.gl.ONE, this._screen.gl.ONE);
    this._screen.fillColor(0.0, 0.0, 0.0, 1.0);
    for (i = 0; i < this._frames.length; ++i)
      this._frames[i].draw(delta);
    this._screen.popAlphaMode();
    fbo.bind();
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setAttributeArray('aTexCoord', this._texCoods, 0, 2, 0);
    this._program.setTexture('uTexture', this._fbo.texture);
    for (i = 0; i < this._led.length; ++i) {
      var offset = this._led[i] * 4;
      var mirror = (i == this._mirror) ? 1 : 0;
      this._program.setUniformVector('uMirror', [mirror]);
      this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, offset, 4);
    }
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.nicofarre.prototype.setController = function (controller) {
    this._controller = controller;
};
