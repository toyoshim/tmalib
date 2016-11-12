/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - hue -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.hue = function (options) {
    this._screen = options.screen;
    this.properties = { hue: options.hue || 0 }; /* [0:1] */
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.hue._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.hue._fragmentShader));
    this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
};

// Shader programs.
MajVj.effect.hue._vertexShader = null;
MajVj.effect.hue._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.hue.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'hue', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'hue', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.hue._vertexShader = shaders[0];
            MajVj.effect.hue._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('hue.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.hue.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.hue.prototype.draw = function (delta, texture) {
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setUniformVector('uHue', [this.properties.hue]);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
