/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - crt -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.crt = function (options) {
    this._screen = options.screen;
    this._aspect = options.aspect;
    this._ex = options.ex;
    this.properties = {
        resolution: [ options.width / 8, options.height / 8 ],
        wave: new Float32Array(2048),
        wave_zoom: 1.0,
        zoom: 1.0
    };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.crt._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    this._ex ? MajVj.effect.crt._fragmentExShader
                             : MajVj.effect.crt._fragmentShader));
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

    if (this._ex) {
        this._waveData = new Float32Array(2048 * 4);
        this._waveTexture = this._screen.createFloatTexture(
            this._waveData, 2048, 1, true);
    }
};

// Shader programs.
MajVj.effect.crt._vertexShader = null;
MajVj.effect.crt._fragmentShader = null;
MajVj.effect.crt._fragmentExShader = null;
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
            MajVj.loadShader('effect', 'crt', 'shaders.html', 'fragment_ex'),
            MajVj.loadImage('effect', 'crt', 'rgb.png'),
            MajVj.loadImage('effect', 'crt', 'led.png'),
            MajVj.loadImage('effect', 'crt', 'panel.png')
        ]).then(function (data) {
            MajVj.effect.crt._vertexShader = data[0];
            MajVj.effect.crt._fragmentShader = data[1];
            MajVj.effect.crt._fragmentExShader = data[2];
            MajVj.effect.crt._patchRgb = data[3];
            MajVj.effect.crt._patchLed = data[4];
            MajVj.effect.crt._patchPanel = data[5];
            resolve();
        }, function () { reject('crt.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.crt.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.crt.prototype.draw = function (delta, texture) {
    if (this._ex) {
        for (var i = 0; i < 2048; ++i)
            this._waveData[i * 4] = this.properties.wave[i];
        this._waveTexture.update(this._waveData);
        this._program.setTexture('uWave', this._waveTexture);
        this._program.setUniformVector('uWaveZoom',
                                       [this.properties.wave_zoom]);
        this._program.setUniformVector('uWaveAspect', [this._aspect]);
    }
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    var zoom = 1 / this.properties.zoom;
    this._program.setUniformVector('uZoom', [zoom, zoom]);
    this._program.setUniformVector('uResolution', this.properties.resolution);
    this._program.setTexture('uTexture', texture);
    this._program.setTexture('uPatch', this._patch);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
