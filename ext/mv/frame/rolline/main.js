/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - rolline -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.rolline = function (options) {
    this._screen = options.screen;
    this._aspect = options.aspect;
    this._controller = options.controller;
    this._time = 0.0;

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.rolline._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.rolline._fragmentShader));
    var points = new Array(6 * 128);
    var i;
    for (i = 0; i < points.length; ++i) points[i] = 0.0;
    this._lines = this._screen.createBuffer(points);
    this._lines.items = 128 * 2;
    var colors = new Array(6 * 128);
    for (i = 0; i < colors.length; ++i) colors[i] = 0.0;
    this._colors = this._screen.createBuffer(colors);

    this._pMatrix = mat4.identity();
    this.onresize(this._aspect);
};

// Shader programs.
MajVj.frame.rolline._vertexShader = null;
MajVj.frame.rolline._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.rolline.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'rolline', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'rolline', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.rolline._vertexShader = shaders[0];
            MajVj.frame.rolline._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('rolline.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.rolline.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(45, this._aspect, 0.1, 1000.0, this._pMatrix);
    mat4.translate(this._pMatrix, [ 0.0, 0.0, -3.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.rolline.prototype.draw = function (delta) {
    this._time += delta;
    var t = this._time / 10000.0;
    var points = this._lines.buffer();
    var colors = this._colors.buffer();
    for (var i = 0; i < 128; ++i) {
        t += 0.02;
        var offset = i * 6;
        var r = t * 10;
        var x = Math.sin(t + 7 * Math.cos(t + Math.sin(t)));
        var y = Math.cos(t + 3 * Math.sin(Math.cos(t)));
        var dx = Math.cos(r);
        var dy = Math.sin(r);
        if (this._controller && this._controller.midi) {
            dx *= this._controller.midi.keymap[i] / 32.0;
            dy *= this._controller.midi.keymap[i] / 32.0;
        }
        points[offset + 0] = x + dx;
        points[offset + 1] = y + dy;
        points[offset + 2] = 0.0;
        points[offset + 3] = x - dx;
        points[offset + 4] = y - dy;
        points[offset + 5] = 0.0;
        var rgb = TmaScreen.HSV2RGB((t + i) % 360, 1.0, 1.0);
        rgb.r /= 256.0;
        rgb.g /= 256.0;
        rgb.b /= 256.0;
        colors[offset + 0] = rgb.r;
        colors[offset + 1] = rgb.g;
        colors[offset + 2] = rgb.b;
        colors[offset + 3] = rgb.r;
        colors[offset + 4] = rgb.g;
        colors[offset + 5] = rgb.b;
    }
    this._lines.update();
    this._colors.update();
    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    this._program.setAttributeArray(
            'aVertexPosition', this._lines, 0, 3, 0);
    this._program.setAttributeArray(
            'aVertexColor', this._colors, 0, 3, 0);
    this._program.drawArrays(Tma3DScreen.MODE_LINES, 0, this._lines.items);
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.rolline.prototype.setController = function (controller) {
    this._controller = controller;
};
