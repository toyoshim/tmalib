/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - signal -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.signal = function (options) {
    this._mv = options.mv;
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;
    this._color = options.color || [1.0, 0.0, 0.0, 1.0];
    this._coord = options.coord || [0.0, 0.0, 0.001];
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.signal._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.signal._fragmentShader));
    this._coords = this._screen.createBuffer(this._coord);
};

// Shader programs.
MajVj.frame.signal._vertexShader = null;
MajVj.frame.signal._fragmentShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.signal.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'signal', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'signal', 'shaders.html', 'fragment')
        ]).then(function (results) {
            MajVj.frame.signal._vertexShader = results[0];
            MajVj.frame.signal._fragmentShader = results[1];
            resolve();
        }, function (error) { console.log(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.signal.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.signal.prototype.draw = function (delta) {
    this._screen.setAlphaMode(true, this._screen.gl.ONE, this._screen.gl.ONE);
    this._program.setAttributeArray('aCoord', this._coords, 0, 3, 0);
    this._program.setUniformVector('uColor', this._color);
    this._program.drawArrays(Tma3DScreen.MODE_POINTS, 0, 1);
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.signal.prototype.setController = function (controller) {
    this._controller = controller;
};

/**
 * Sets a color.
 * @param color a color to draw
 */
MajVj.frame.signal.prototype.setColor = function (color) {
    this._color = color;
};

