/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - light -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.light = function (options) {
    this._screen = options.screen;
    this.properties = {
        color: options.color || [ 0.0, 0.0, 0.03, 1.0 ],
        coord: options.coord || [ 0.0, -1.2 ],
        scale: options.scale || [ 1.0, 5.0 ]
    };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.light._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.light._fragmentShader));
    this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
};

// Shader programs.
MajVj.frame.light._vertexShader = null;
MajVj.frame.light._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.frame.light.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'light', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'light', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.light._vertexShader = shaders[0];
            MajVj.frame.light._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('light.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.light.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.light.prototype.draw = function (delta) {
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setUniformVector('uColor', this.properties.color);
    this._program.setUniformVector('uCoord', this.properties.coord);
    this._program.setUniformVector('uScale', this.properties.scale);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
