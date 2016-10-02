/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - api2d -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.api2d = function (options) {
    this.width = options.width;
    this.height = options.height;

    this._ellipseResolution = 64;

    this._options = options;
    this._screen = options.screen;

    this._divX = (this.width - 1) / 2;
    this._divY = (this.height - 1) / 2;
    this._strokeWeight = 1.0;
    this._subX = 1.0;
    this._subY = 1.0;
    this._background = [ 0.8, 0.8, 0.8, 1.0 ];
    this._basePosition =  [ 0.0, 0.0 ];
    this._baseSize = [ 1.0, 1.0 ];
    this._divColor = [ 255.0, 255.0, 255.0, 255.0 ];
    this._fill = [ 1.0, 1.0, 1.0, 1.0 ];
    this._stroke = [ 1.0, 1.0, 1.0, 1.0 ];  // FIXME: 255?
    this._position = [ 0.0, 0.0 ];
    this._size = [ 1.0, 1.0 ];
    this._lineBuffer = this._screen.createBuffer(new Array(4));

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                                       MajVj.misc.api2d._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                                       MajVj.misc.api2d._fragmentShader));

    var ellipseCoords = [];
    ellipseCoords.push(0);
    ellipseCoords.push(0);
    for (var i = 0; i < this._ellipseResolution; ++i) {
      ellipseCoords.push(
              Math.cos(Math.PI * 2 * i / (this._ellipseResolution - 1)));
      ellipseCoords.push(
              Math.sin(Math.PI * 2 * i / (this._ellipseResolution - 1)));
    }
    this._ellipseCoords = this._screen.createBuffer(ellipseCoords);

    this._rectCoords = this._screen.createBuffer(
            [-1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0]);
};

// Shader programs.
MajVj.misc.api2d._vertexShader = null;
MajVj.misc.api2d._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.api2d.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('misc', 'api2d', 'shaders.html', 'vertex'),
            MajVj.loadShader('misc', 'api2d', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.misc.api2d._vertexShader = shaders[0];
            MajVj.misc.api2d._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('api2d.load fails'); });
    });
};

/**
 * Returns a random value of [0, high).
 * @param high maximum value
 * @return a float value
 */
MajVj.misc.api2d.prototype.random = function (high) {
    return Math.random() * high;
};

/**
 * Draws background with a specified color.
 * argument type 1: (gray)
 * argument type 2: (gray, alpha)
 * argument type 3: (v1, v2, v3)
 * argument type 4: (v1, v2, v3, alpha)
 * @param gray color in gray level (0, 255]
 * @param alpha alpha (0, 255]
 * @param v1 red (0, 255]
 * @param v1 green (0, 255]
 * @param v1 blue (0, 255]
 */
MajVj.misc.api2d.prototype.background = function () {
    switch (arguments.length) {
        case 1:
            this._background[0] = this._V1(arguments[0]);
            this._background[1] = this._V2(arguments[0]);
            this._background[2] = this._V3(arguments[0]);
            break;
        case 2:
            this._background[0] = this._V1(arguments[0]);
            this._background[1] = this._V2(arguments[0]);
            this._background[2] = this._V3(arguments[0]);
            this._background[3] = this._Alpha(arguments[1]);
            break;
        case 3:
            this._background[0] = this._V1(arguments[0]);
            this._background[1] = this._V2(arguments[1]);
            this._background[2] = this._V3(arguments[2]);
            break;
        case 4:
            this._background[0] = this._V1(arguments[0]);
            this._background[1] = this._V2(arguments[1]);
            this._background[2] = this._V3(arguments[2]);
            this._background[3] = this._Alpha(arguments[3]);
            break;
        default:
            return;
    }
    this._screen.fillColor(this._background[0],
                           this._background[1],
                           this._background[2],
                           this._background[3]);
};

/**
 * Sets stroke weight.
 * @param weight stroke weight
 */
MajVj.misc.api2d.prototype.strokeWeight = function (weight) {
    this._strokeWeight = weight;
};

/**
 * Set stroke color.
 * argument type 1: (gray)
 * argument type 2: (gray, alpha)
 * argument type 3: (v1, v2, v3)
 * argument type 4: (v1, v2, v3, alpha)
 * @param gray color in gray level (0, 255]
 * @param alpha alpha (0, 255]
 * @param v1 red (0, 255]
 * @param v1 green (0, 255]
 * @param v1 blue (0, 255]
 */
MajVj.misc.api2d.prototype.stroke = function () {
    switch (arguments.length) {
        case 1:
            this._stroke[0] = this._V1(arguments[0]);
            this._stroke[1] = this._V2(arguments[0]);
            this._stroke[2] = this._V3(arguments[0]);
            break;
        case 2:
            this._stroke[0] = this._V1(arguments[0]);
            this._stroke[1] = this._V2(arguments[0]);
            this._stroke[2] = this._V3(arguments[0]);
            this._stroke[3] = this._Alpha(arguments[1]);
            break;
        case 3:
            this._stroke[0] = this._V1(arguments[0]);
            this._stroke[1] = this._V2(arguments[1]);
            this._stroke[2] = this._V3(arguments[2]);
            break;
        case 4:
            this._stroke[0] = this._V1(arguments[0]);
            this._stroke[1] = this._V2(arguments[1]);
            this._stroke[2] = this._V3(arguments[2]);
            this._stroke[3] = this._Alpha(arguments[3]);
            break;
        default:
            return;
    }
};

/**
 * Sets fill color.
 * argument type 1: (gray)
 * argument type 2: (gray, alpha)
 * argument type 3: (v1, v2, v3)
 * argument type 4: (v1, v2, v3, alpha)
 * @param gray color in gray level (0, 255]
 * @param alpha alpha (0, 255]
 * @param v1 red (0, 255]
 * @param v1 green (0, 255]
 * @param v1 blue (0, 255]
 */
MajVj.misc.api2d.prototype.fill = function () {
    switch (arguments.length) {
        case 1:
            this._fill[0] = this._V1(arguments[0]);
            this._fill[1] = this._V2(arguments[0]);
            this._fill[2] = this._V3(arguments[0]);
            break;
        case 2:
            this._fill[0] = this._V1(arguments[0]);
            this._fill[1] = this._V2(arguments[0]);
            this._fill[2] = this._V3(arguments[0]);
            this._fill[3] = this._Alpha(arguments[1]);
            break;
        case 3:
            this._fill[0] = this._V1(arguments[0]);
            this._fill[1] = this._V2(arguments[1]);
            this._fill[2] = this._V3(arguments[2]);
            break;
        case 4:
            this._fill[0] = this._V1(arguments[0]);
            this._fill[1] = this._V2(arguments[1]);
            this._fill[2] = this._V3(arguments[2]);
            this._fill[3] = this._Alpha(arguments[3]);
            break;
        default:
            return;
    }
};

/**
 * Draws a line.
 * @param x1 start x position
 * @param y1 start y position
 * @param x2 end x position
 * @param y2 end y position
 */
MajVj.misc.api2d.prototype.line = function (x1, y1, x2, y2) {
    this._screen.setLineWidth(this._strokeWeight);
    this._screen.setAlphaMode(true,
                              this._screen.gl.SRC_ALPHA,
                              this._screen.gl.ONE_MINUS_SRC_ALPHA);
    var buffer = this._lineBuffer.buffer();
    buffer[0] = this._X(x1);
    buffer[1] = this._Y(y1);
    buffer[2] = this._X(x2);
    buffer[3] = this._Y(y2);
    this._lineBuffer.update();
    this._program.setAttributeArray('aCoord', this._lineBuffer, 0, 2, 0);
    this._program.setUniformVector('uSize', this._baseSize);
    this._program.setUniformVector("uPosition", this._basePosition);
    this._program.setUniformVector('uColor', this._stroke);
    this._program.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);
};

/**
 * Draws a ellipse.
 * @param x center position x
 * @param y center position y
 * @param width width
 * @param height height
 */
MajVj.misc.api2d.prototype.ellipse = function (x, y, width, height) {
    this._screen.setLineWidth(this._strokeWeight);
    this._screen.setAlphaMode(true,
                              this._screen.gl.SRC_ALPHA,
                              this._screen.gl.ONE_MINUS_SRC_ALPHA);
    this._program.setAttributeArray('aCoord', this._ellipseCoords, 0, 2, 0);
    this._size[0] = this._Width(width);
    this._size[1] = this._Height(height);
    this._program.setUniformVector('uSize', this._size);
    this._position[0] = this._X(x);
    this._position[1] = this._Y(y);
    this._program.setUniformVector('uPosition', this._position);
    this._program.setUniformVector('uColor', this._fill);
    this._program.drawArrays(
            Tma3DScreen.MODE_TRIANGLE_FAN, 0, this._ellipseResolution + 1);

    this._program.setUniformVector('uColor', this._stroke);
    this._program.drawArrays(
            Tma3DScreen.MODE_LINE_LOOP, 1, this._ellipseResolution);
};

/**
 * Draws a rectangle.
 * @param x center position x
 * @param y center position y
 * @param width width
 * @param height height
 */
MajVj.misc.api2d.prototype.rect = function (x, y, width, height) {
    this._screen.setLineWidth(this._strokeWeight);
    this._screen.setAlphaMode(true,
                              this._screen.gl.SRC_ALPHA,
                              this._screen.gl.ONE_MINUS_SRC_ALPHA);
    this._program.setAttributeArray('aCoord', this._rectCoords, 0, 2, 0);
    this._size[0] = this._Width(width);
    this._size[1] = this._Height(height);
    this._program.setUniformVector('uSize', this._size);
    this._position[0] = this._X(x);
    this._position[1] = this._Y(y);
    this._program.setUniformVector('uPosition', this._position);
    this._program.setUniformVector('uColor', this._fill);
    this._program.drawArrays(
            Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);

    this._program.setUniformVector('uColor', this._stroke);
    this._program.drawArrays(
            Tma3DScreen.MODE_LINE_LOOP, 0, 5);
};

/**
 * Normalize X position.
 * @param x original x
 * @return normalized x
 */
MajVj.misc.api2d.prototype._X = function (x) {
    return x / this._divX - this._subX;
};

/**
 * Normalize Y position.
 * @param y original y
 * @return normalized y
 */
MajVj.misc.api2d.prototype._Y = function (y) {
    return y / this._divY - this._subY;
};

/**
 * Normalize width.
 * @param width original width
 * @return normalized width
 */
MajVj.misc.api2d.prototype._Width = function (width) {
    return width / this.width;
};

/**
 * Normalize height.
 * @param height original height
 * @return normalized height
 */
MajVj.misc.api2d.prototype._Height = function (height) {
    return height / this.height;
};

/**
 * Normalize V1 color.
 * @param v1 original v1
 * @return normalized v1
 */
MajVj.misc.api2d.prototype._V1 = function (v1) {
    return v1 / this._divColor[0];
};

/**
 * Normalize V2 color.
 * @param v2 original v2
 * @return normalized v2
 */
MajVj.misc.api2d.prototype._V2 = function (v2) {
    return v2 / this._divColor[1];
};

/**
 * Normalize V3 color.
 * @param v3 original v3
 * @return normalized v3
 */
MajVj.misc.api2d.prototype._V3 = function (v3) {
    return v3 / this._divColor[2];
};

/**
 * Normalize alpha color.
 * @param alpha original alpha
 * @return normalized alpha
 */
MajVj.misc.api2d.prototype._Alpha = function (alpha) {
    return alpha / this._divColor[3];
};
