/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - morphere -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.morphere = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = { volume: 1.0 };

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.morphere._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.morphere._fragmentShader));
    this._sphere = TmaModelPrimitives.createSphere(
            MajVj.frame.morphere.resolution,
            TmaModelPrimitives.SPHERE_METHOD_EVEN);
    this._sphere.scale(10);
    this._pMatrix = mat4.identity();
    this._color = [0.1, 0.1, 0.4];
    this._vertices = this._sphere.getVertices().length;
    this._b = new Array(this._vertices);
    this._v = new Array(this._vertices);
    this._r = new Array(this._vertices);
    this._t = new Array(this._vertices);
    for (var i = 0; i < this._vertices; ++i) {
        this._b[i] = this._sphere.getVertices()[i];
        this._v[i] = Math.random();
        this._r[i] = Math.random() * 5;
        this._t[i] = Math.random() * Math.PI * 2;
    }

    this.onresize(this._aspect);
};

MajVj.frame.morphere.resolution = 4;

// Shader programs.
MajVj.frame.morphere._vertexShader = null;
MajVj.frame.morphere._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.morphere.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'morphere', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'morphere', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.morphere._vertexShader = shaders[0];
            MajVj.frame.morphere._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('morphere.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.morphere.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(45, aspect, 0.1, 100.0, this._pMatrix);
    mat4.translate(this._pMatrix, [ 0.0, 0.0, -70.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.morphere.prototype.draw = function (delta) {
    var buffer = this._sphere.getVerticesBuffer(this._screen);
    var vertices = buffer.buffer();
    var sin = Math.sin;
    var d = delta / 100;
    for (var i = 0; i < this._vertices; ++i) {
        this._t[i] += this._v[i] * d;
        vertices[i] = this._b[i] + sin(this._t[i]) * this._r[i];
    }
    buffer.update();
    var size = 2.0 * this.properties.volume;
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(false);
    var matrix = mat4.create();
    mat4.scale(this._pMatrix, [size, size, size], matrix);
    this._program.setAttributeArray('aVertexPosition', buffer, 0, 3, 0);
    this._program.setUniformMatrix('uPMatrix', matrix);
    this._program.setUniformVector('uColor', this._color);
    this._program.drawElements(Tma3DScreen.MODE_TRIANGLES,
                               this._sphere.getIndicesBuffer(this._screen),
                               0,
                               this._sphere.items());
    this._screen.popAlphaMode();
};
