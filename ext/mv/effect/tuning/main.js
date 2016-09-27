/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - tuning -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.tuning = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = { volume: 0.0 };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.tuning._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.tuning._fragmentShader));
    this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
};

// Shader programs.
MajVj.effect.tuning._vertexShader = null;
MajVj.effect.tuning._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.tuning.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'tuning', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'tuning', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.tuning._vertexShader = shaders[0];
            MajVj.effect.tuning._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('tuning.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.tuning.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.tuning.prototype.draw = function (delta, texture) {
    var t = this.properties.volume;
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setUniformVector('uT', [t]);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};