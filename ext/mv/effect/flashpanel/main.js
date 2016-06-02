/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - flashpanel -
 * @param options options (See MajVj.prototype.create)
 */
/* global MajVj */
/* global Tma3DScreen */
MajVj.effect.flashpanel = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._controller = options.controller;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.flashpanel._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.flashpanel._fragmentShader));
    this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
    this._time = 0.0;
    this._panels = options.panels || [10.0, 5.0];
    this._speed = options.speed || 1.0;
    this._origin = options.origin || [0.0, 0.0];
    this._color = options.color || [0.5, 0.5, 1.0];
};

// Shader programs.
MajVj.effect.flashpanel._vertexShader = null;
MajVj.effect.flashpanel._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.flashpanel.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'flashpanel', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'flashpanel', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.flashpanel._vertexShader = shaders[0];
            MajVj.effect.flashpanel._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('flashpanel.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.flashpanel.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.flashpanel.prototype.draw = function (delta, texture) {
    this._time += delta;
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setUniformVector('uTime', [this._time * this._speed]);
    this._program.setUniformVector('uPanels', this._panels);
    this._program.setUniformVector('uOrigin', this._origin);
    this._program.setUniformVector('uColor', this._color);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.effect.flashpanel.prototype.setController = function (controller) {
    this._controller = controller;
};

/**
 * Restart timeline.
 */
MajVj.effect.flashpanel.prototype.restart = function (controller) {
    this._time = 0;
};