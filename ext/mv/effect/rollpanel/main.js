/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - rollpanel -
 * @param options options (See MajVj.prototype.create)
 */
/* global MajVj */
/* global Tma3DScreen */
/* global TmaTimeline */
/* global mat4 */
MajVj.effect.rollpanel = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;
    this._panels = options.panels || 3;
    this._delay = options.delay || 0.25;
    this._delay *= 2 * Math.PI;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.rollpanel._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.rollpanel._fragmentShader));
    var coords = [];
    var left = -1.0;
    var step = 2.0 / this._panels;
    for (var i = 0; i < this._panels; ++i) {
        var right = left + step;
        coords.push([left, -1, left, 1, right, 1, right, -1]);
        left += step;
    }
    this._coords =
            this._screen.createBuffer(Array.prototype.concat.apply([], coords));
    this._matrix = mat4.perspective(90, 1, 0.1, 2.0, mat4.create());
    mat4.translate(this._matrix, [0.0, 0.0, -1.0]);
    this._scaleTimeline = new TmaTimeline({
            type: 'bypass',
            input_scale: 0.0001 * (options.speed || 1)
    });
    this._oneshotTimeline = new TmaTimeline({
            type: options.oneshot ? 'saturate' : 'bypass',
            output_scale: Math.PI * 2
    });
};

// Shader programs.
MajVj.effect.rollpanel._vertexShader = null;
MajVj.effect.rollpanel._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.rollpanel.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'rollpanel', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'rollpanel', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.rollpanel._vertexShader = shaders[0];
            MajVj.effect.rollpanel._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('rollpanel.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.rollpanel.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.rollpanel.prototype.draw = function (delta, texture) {
    this._scaleTimeline.update(delta);
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setUniformMatrix('uMatrix', this._matrix);
    this._program.setTexture('uTexture', texture);
    var center = (this._panels - 1) / 2;
    var matrix = mat4.identity();
    var time = this._scaleTimeline.elapsed();
    for (var i = 0; i < this._panels; ++i) {
        var local_time = time - Math.abs(i - center) * this._delay;
        mat4.identity(matrix);
        mat4.rotateX(matrix, this._oneshotTimeline.convert(local_time));
        this._program.setUniformMatrix('uMvMatrix', matrix);
        this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 4 * i, 4);
    }
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.effect.rollpanel.prototype.setController = function (controller) {
    this._controller = controller;
};

/**
 * Restart timeline.
 */
MajVj.effect.rollpanel.prototype.restart = function (controller) {
    this._time = 0;
};
