/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - specticle -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.specticle = function (options) {
    this._mv = options.mv;
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = { fftDb: new Float32Array(1024) };
    this._color = options.color || [0.7, 0.2, 0.5, 1.0];
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.specticle._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.specticle._fragmentShader));
    this._matrix = mat4.identity();
    this.onresize(this._aspect);
    this._t = 0.0;
    this._n = 500;
    this._coords = this._screen.createBuffer(new Array(this._n * 3));
    this._dh = new Array(this._n);
    this._dv = new Array(this._n);
    this._r = new Array(this._n);
    this._sv = new Array(this._n);
    this._sh = new Array(this._n);
    var random = options.random || 1.0;
    for (var i = 0; i < this._n; ++i) {
        this._dh[i] = Math.random() * Math.PI * 2;
        this._dv[i] = Math.random() * Math.PI * 2;
        this._r[i] = Math.random() * random * 6 + (3 - random);
        this._sv[i] = Math.random() * 10 + 10;
        this._sh[i] = Math.random() * 20 + 20;
    }
};

// Shader programs.
MajVj.frame.specticle._vertexShader = null;
MajVj.frame.specticle._fragmentShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.specticle.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'specticle', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'specticle', 'shaders.html', 'fragment')
        ]).then(function (results) {
            MajVj.frame.specticle._vertexShader = results[0];
            MajVj.frame.specticle._fragmentShader = results[1];
            resolve();
        }, function (error) { tma.log(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.specticle.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(45, aspect, 0.1, 100.0, this._matrix);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.specticle.prototype.draw = function (delta) {
    this._t += delta;
    var t = this._t / 10000;
    var buffer = this._coords.buffer();
    var useLength = this.properties.fftDb.length - 128;
    for (var i = 0; i < this._n; ++i) {
        var y = Math.sin(t * this._sv[i] + this._dv[i]) * 10;
        var r = 1.0;
        var n = 0 | (useLength * (y + 10) / 20);
        var d = 80.0 + this.properties.fftDb[128 + n];
        if (d < 0)
            d = 0;
        r = d / 20;
        buffer[i * 3 + 0] =
            Math.cos(t * this._sh[i] + this._dh[i]) * this._r[i] * r;
        buffer[i * 3 + 1] = y;
        buffer[i * 3 + 2] =
            Math.sin(t * this._sh[i] + this._dh[i]) * this._r[i] * r - 40;
    }
    this._coords.update();
    this._screen.setAlphaMode(true, this._screen.gl.ONE, this._screen.gl.ONE);
    this._program.setAttributeArray('aCoord', this._coords, 0, 3, 0);
    this._program.setUniformMatrix('uMatrix', this._matrix);
    this._program.setUniformVector('uColor', this._color);
    this._program.drawArrays(Tma3DScreen.MODE_POINTS, 0, this._n);
};
