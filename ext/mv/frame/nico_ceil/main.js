/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nico_ceil -
 * @param mv MajVj object
 * @param screen Tma3DScreen object
 * @param width offscreen width
 * @param height offscreen height
 * @param aspect screen aspect ratio (screen width / screen height)
 */
MajVj.frame.nico_ceil = function (mv, screen, width, height, aspect) {
    this._screen = screen;
    this._width = width;
    this._height = height;
    this._aspect = aspect;
    this._controller = null;

    this._program = screen.createProgram(
            screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nico_ceil._vertexShader),
            screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nico_ceil._fragmentShader));
    this._coords = screen.createBuffer([
            // G (ceiling): (1760, 870) - (1858, 1040) / (1920, 1080)
            1760 / 1920 * 2 - 1, 870 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1858 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1858 / 1920 * 2 - 1, 870 / 1080 * 2 - 1]);
    this._texCoods = screen.createBuffer([
            // G (ceiling)
            0, 0,
            0, 1,
            1, 1,
            1, 0]);
    this._fbo = screen.createFrameBuffer(98, 170);
    this._wired = mv.createWith('frame', 'wired', 98, 170);
    this._crlogo = mv.createWith('frame', 'ab2', 98, 170);
};

// Shader programs.
MajVj.frame.nico_ceil._vertexShader = null;
MajVj.frame.nico_ceil._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.nico_ceil.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'nico_ceil', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'nico_ceil', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.nico_ceil._vertexShader = shaders[0];
            MajVj.frame.nico_ceil._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('nico_ceil.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.nico_ceil.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.nico_ceil.prototype.draw = function (delta) {
    var fbo = this._fbo.bind();
    this._wired.draw(delta);
    this._crlogo.draw(delta);
    fbo.bind();
    this._screen.fillColor(0.0, 0.0, 0.0, 1.0);
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setAttributeArray('aTexCoord', this._texCoods, 0, 2, 0);
    this._program.setTexture('uTexture', this._fbo.texture);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.nico_ceil.prototype.setController = function (controller) {
    this._controller = controller;
};
