/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - acrylic -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.acrylic = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {
        color: [0.0, 0.0, 1.0, 1.0]
    };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.acrylic._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.acrylic._fragmentShader));
    this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
};

// Shader programs.
MajVj.effect.acrylic._vertexShader = null;
MajVj.effect.acrylic._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.acrylic.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'acrylic', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'acrylic', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.acrylic._vertexShader = shaders[0];
            MajVj.effect.acrylic._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('acrylic.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.acrylic.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.acrylic.prototype.draw = function (delta, texture) {
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setUniformVector('uColor', this.properties.color);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
