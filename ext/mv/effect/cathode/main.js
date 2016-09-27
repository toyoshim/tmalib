/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - cathode -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.cathode = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this.properties = {};
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.cathode._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.cathode._fragmentShader));
    this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
};

// Shader programs.
MajVj.effect.cathode._vertexShader = null;
MajVj.effect.cathode._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.cathode.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'cathode', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'cathode', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.cathode._vertexShader = shaders[0];
            MajVj.effect.cathode._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('cathode.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.cathode.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.cathode.prototype.draw = function (delta, texture) {
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setUniformVector('uVolume', [1.0]);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
