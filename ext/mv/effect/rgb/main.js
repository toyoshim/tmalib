/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - wired -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.rgb = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;
    this._distance = options.distance || 0.1;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.rgb._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.rgb._fragmentShader));
    this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
};

// Shader programs.
MajVj.effect.rgb._vertexShader = null;
MajVj.effect.rgb._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.rgb.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'rgb', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'rgb', 'shaders.html', 'fragment'),
        ]).then(function (shaders) {
            MajVj.effect.rgb._vertexShader = shaders[0];
            MajVj.effect.rgb._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('rgb.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.rgb.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.rgb.prototype.draw = function (delta, texture) {
    var distance = this._distance;
    if (this._controller && this._controller.volume)
        distance = this._controller.volume[0] / 2;
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setUniformVector('uDistance', [distance]);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.effect.rgb.prototype.setController = function (controller) {
    this._controller = controller;
};
