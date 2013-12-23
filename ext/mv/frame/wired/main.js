/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - wired -
 * @param screen Tma3DScreen object
 * @param width offscreen width
 * @param height offscreen height
 * @param aspect screen aspect ratio (screen height / screen width)
 */
MajVj.frame.wired = function (screen, width, height, aspect) {
    this._screen = screen;
    this._width = width;
    this._height = height;
    this._aspect = aspect;
    this._controller = null;
    this._rotate = 0.0;

    this._program = screen.createProgram(
            screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.wired._vertexShader),
            screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.wired._fragmentShader));
    this._lines = screen.createBuffer(function () {
        var i = 0;
        var lines = new Array()
        for (var z = -900; z <= 900; z += 100) {
            for (var x = -900; x <= 900; x += 100) {
                lines[i + 0] = x;
                lines[i + 1] = -900;
                lines[i + 2] = z;
                lines[i + 3] = x;
                lines[i + 4] = 900;
                lines[i + 5] = z;
                i += 6;
            }
            for (var y = -900; y <= 900; y += 100) {
                lines[i + 0] = -900;
                lines[i + 1] = y;
                lines[i + 2] = z;
                lines[i + 3] = 900;
                lines[i + 4] = y;
                lines[i + 5] = z;
                i += 6;
            }
        }
        for (var x = -900; x <= 900; x += 100) {
            for (var y = -900; y <= 900; y += 100) {
                lines[i + 0] = x;
                lines[i + 1] = y;
                lines[i + 2] = -900;
                lines[i + 3] = x;
                lines[i + 4] = y;
                lines[i + 5] = 900;
                i += 6;
            }
        }
        return lines;
    } ());
    this._lines.items = 1944;
    this._pMatrix = mat4.create();
    this.onresize(aspect);
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.wired.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'wired', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'wired', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.wired._vertexShader = shaders[0];
            MajVj.frame.wired._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('wired.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.wired.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(45, aspect, 0.1, 1000.0, this._pMatrix);
    mat4.translate(this._pMatrix, [ 0.0, 0.0, -250.0 ]);
    mat4.rotate(this._pMatrix, this._rotate, [ 0.1, 0.2, 0.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.wired.prototype.draw = function (delta) {
    var rotate = 0.002 * delta;
    if (this._controller)
        rotate = rotate * (0.5 + this._controller.slider * 1.5);
    this._rotate += rotate;
    mat4.rotate(this._pMatrix, rotate, [ 0.1, 0.2, 0.0 ]);
    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    this._program.setAttributeArray(
            'aVertexPosition', this._lines, 0, 3, 0);
    this._program.drawArrays(Tma3DScreen.MODE_LINES, 0, this._lines.items);
};

/**
 * Sets a controller.
 */
MajVj.frame.wired.prototype.setController = function (controller) {
    this._controller = controller;
};
