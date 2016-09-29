/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - crt -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.crt = function (options) {
    this._screen = options.screen;
    this.properties = {
        resolution: [ options.width / 8, options.height / 8 ]
    };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.crt._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.crt._fragmentShader));
    this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
    var patch = null;
    if (options.patch) {
        patch = {
            rgb: MajVj.effect.crt._patchRgb,
            led: MajVj.effect.crt._patchLed,
            panel: MajVj.effect.crt._patchPanel
        }[options.patch];
    }
    if (!patch)
        patch = MajVj.effect.crt._patchRgb;
    this._patch = this._screen.createTexture(
            patch, true, Tma3DScreen.FILTER_LINEAR);
};

// Shader programs.
MajVj.effect.crt._vertexShader = null;
MajVj.effect.crt._fragmentShader = null;
MajVj.effect.crt._patchRgb = null;
MajVj.effect.crt._patchLed = null;
MajVj.effect.crt._patchPanel = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.crt.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'crt', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'crt', 'shaders.html', 'fragment'),
            MajVj.loadImage('effect', 'crt', 'rgb.png'),
            MajVj.loadImage('effect', 'crt', 'led.png'),
            MajVj.loadImage('effect', 'crt', 'panel.png')
        ]).then(function (data) {
            MajVj.effect.crt._vertexShader = data[0];
            MajVj.effect.crt._fragmentShader = data[1];
            MajVj.effect.crt._patchRgb = data[2];
            MajVj.effect.crt._patchLed = data[3];
            MajVj.effect.crt._patchPanel = data[4];
            resolve();
        }, function () { reject('crt.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.crt.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.crt.prototype.draw = function (delta, texture) {
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setTexture('uPatch', this._patch);
    this._program.setUniformVector('uResolution', this.properties.resolution);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
