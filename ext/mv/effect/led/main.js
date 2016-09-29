/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - led -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.led = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {
        resolution: [ this._width / 8, this._height / 8 ],
        rotation: { count: 0, speed: 0 }
    };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.led._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.led._fragmentShader));
    this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
};

// Shader programs.
MajVj.effect.led._vertexShader = null;
MajVj.effect.led._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.led.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'led', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'led', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.led._vertexShader = shaders[0];
            MajVj.effect.led._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('led.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.led.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.led.prototype.draw = function (delta, texture) {
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(true,
                              this._screen.gl.SRC_ALPHA,
                              this._screen.gl.ONE_MINUS_SRC_ALPHA);
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    var time = [Date.now() / 1000];
    this._program.setUniformVector('uTime', time);
    this._program.setUniformVector('uResolution', this.properties.resolution);
    this._program.setUniformVector('uRotation', [
        this.properties.rotation.count,
        this.properties.rotation.speed
    ]);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    this._screen.popAlphaMode();
};
