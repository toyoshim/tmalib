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
            // G (ceiling): (1760, 870) - (1858, 1040) / (1920, 1080)
            1760 / 1920 * 2 - 1, 870 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1858 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1858 / 1920 * 2 - 1, 870 / 1080 * 2 - 1]);
    this._texCoods = this._screen.createBuffer([
            // G (ceiling)
            0, 0,
            0, 1,
            1, 1,
            1, 0]);
    this._fbo = this._screen.createFrameBuffer(98, 170);
    var flags = { width: 98, height: 170, aspect: 98 / 170 };
    this._wired = options.mv.create('frame', 'wired', flags);
    this._crlogo = options.mv.create('frame', 'ab2', flags);
};

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
    this._wired.draw(delta);
    this._crlogo.draw(delta);
    fbo.bind();
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setAttributeArray('aTexCoord', this._texCoods, 0, 2, 0);
    this._program.setTexture('uTexture', this._fbo.texture);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.nicofarre.prototype.setController = function (controller) {
    this._controller = controller;
};
