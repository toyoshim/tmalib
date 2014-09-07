/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - sandbox -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.sandbox = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;
    this._time = 0;
    this._program = null;
    if (options.id)
        this.setShader(options.id);
    else if (options.shader)
        this.setShader(options.shader);
    this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
};

// Shader programs.
MajVj.frame.sandbox._vertexShader = null;
MajVj.frame.sandbox._fragmentShaders = {};

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.sandbox.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19291.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18918.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18922.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18916.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18713.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18613.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18568.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18451.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19297.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18759.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19336.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18981.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18543.2'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19674.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19624.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18357.1'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18794.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '1674.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19689.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19528.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19698.3'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19454.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '14282.0')
        ]).then(function (results) {
            MajVj.frame.sandbox._vertexShader = results[0];
            MajVj.frame.sandbox._fragmentShaders['19291.0'] = results[1];
            MajVj.frame.sandbox._fragmentShaders['18918.0'] = results[2];
            MajVj.frame.sandbox._fragmentShaders['18922.0'] = results[3];
            MajVj.frame.sandbox._fragmentShaders['18916.0'] = results[4];
            MajVj.frame.sandbox._fragmentShaders['18713.0'] = results[5];
            MajVj.frame.sandbox._fragmentShaders['18613.0'] = results[6];
            MajVj.frame.sandbox._fragmentShaders['18568.0'] = results[7];
            MajVj.frame.sandbox._fragmentShaders['18451.0'] = results[8];
            MajVj.frame.sandbox._fragmentShaders['19297.0'] = results[9];
            MajVj.frame.sandbox._fragmentShaders['18759.0'] = results[10];
            MajVj.frame.sandbox._fragmentShaders['19336.0'] = results[11];
            MajVj.frame.sandbox._fragmentShaders['18981.0'] = results[12];
            MajVj.frame.sandbox._fragmentShaders['18543.2'] = results[13];
            MajVj.frame.sandbox._fragmentShaders['19674.0'] = results[14];
            MajVj.frame.sandbox._fragmentShaders['19624.0'] = results[15];
            MajVj.frame.sandbox._fragmentShaders['18357.1'] = results[16];
            MajVj.frame.sandbox._fragmentShaders['18794.0'] = results[17];
            MajVj.frame.sandbox._fragmentShaders['1674.0'] = results[18];
            MajVj.frame.sandbox._fragmentShaders['19689.0'] = results[19];
            MajVj.frame.sandbox._fragmentShaders['19528.0'] = results[20];
            MajVj.frame.sandbox._fragmentShaders['19698.3'] = results[21];
            MajVj.frame.sandbox._fragmentShaders['19454.0'] = results[22];
            MajVj.frame.sandbox._fragmentShaders['14282.0'] = results[23];
            resolve();
        }, function (error) { console.log(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.sandbox.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.sandbox.prototype.draw = function (delta) {
    this._time += delta / 1000;
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setUniformVector('time', [this._time]);
    this._program.setUniformVector('mouse', [0.5, 0.5]);
    this._program.setUniformVector('resolution', [this._width, this._height]);
    // TODO: backbuffer
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.sandbox.prototype.setController = function (controller) {
    this._controller = controller;
};

/**
 * Sets a fragment shader.
 * @param shader a fragment shader or preset name
 */
MajVj.frame.sandbox.prototype.setShader = function (name) {
    var shader = MajVj.frame.sandbox._fragmentShaders[name];
    if (!shader)
        shader = name;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.sandbox._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER, shader));
};

