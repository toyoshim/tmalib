/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - mask -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.mask = function (options) {
    this._screen = options.screen;
    this.properties = {
        resolution: [ options.width / 8, options.height / 8 ],
        texture: null,
        volume: 1.0
    };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.mask._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.mask._fragmentShader));
    this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
    var patch = null;
    if (options.patch) {
        patch = {
            rgb: MajVj.effect.mask._patchRgb,
            led: MajVj.effect.mask._patchLed,
            panel: MajVj.effect.mask._patchPanel,
            custom: options.image
        }[options.patch];
    }
    if (!patch)
        patch = MajVj.effect.mask._patchRgb;
    this._patch = this._screen.createTexture(
            patch, true, Tma3DScreen.FILTER_NEAREST);
    this.properties.texture = this._patch;
};

// Shader programs.
MajVj.effect.mask._vertexShader = null;
MajVj.effect.mask._fragmentShader = null;
MajVj.effect.mask._patchRgb = null;
MajVj.effect.mask._patchLed = null;
MajVj.effect.mask._patchPanel = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.mask.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'mask', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'mask', 'shaders.html', 'fragment'),
            MajVj.loadImage('effect', 'mask', 'rgb.png'),
            MajVj.loadImage('effect', 'mask', 'led.png'),
            MajVj.loadImage('effect', 'mask', 'panel.png')
        ]).then(function (data) {
            MajVj.effect.mask._vertexShader = data[0];
            MajVj.effect.mask._fragmentShader = data[1];
            MajVj.effect.mask._patchRgb = data[2];
            MajVj.effect.mask._patchLed = data[3];
            MajVj.effect.mask._patchPanel = data[4];
            resolve();
        }, function () { reject('mask.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.mask.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.mask.prototype.draw = function (delta, texture) {
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setTexture('uPatch', this._patch);
    this._program.setUniformVector('uResolution', this.properties.resolution);
    this._program.setUniformVector('uVolume', [this.properties.volume]);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
