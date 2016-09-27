/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - glow -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.glow = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = { volume: 0.1, t: 0.0 };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.glow._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.glow._fragmentShader));
    this._noEffect = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.glow._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.glow._noEffectFragmentShader));
    this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
};

// Shader programs.
MajVj.effect.glow._vertexShader = null;
MajVj.effect.glow._fragmentShader = null;
MajVj.effect.glow._noEffectFragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.glow.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'glow', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'glow', 'shaders.html', 'fragment'),
            MajVj.loadShader('effect', 'glow', 'shaders.html',
                    'noEffectFragment')
        ]).then(function (shaders) {
            MajVj.effect.glow._vertexShader = shaders[0];
            MajVj.effect.glow._fragmentShader = shaders[1];
            MajVj.effect.glow._noEffectFragmentShader = shaders[2];
            resolve();
        }, function () { reject('glow.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.glow.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.glow.prototype.draw = function (delta, texture) {
    var volume = this.properties.volume * 3.0;
    var t = this.properties.t;
    if (volume != 0.0) {
        this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
        this._program.setTexture('uTexture', texture);
        this._program.setUniformVector('uVolume', [volume]);
        this._program.setUniformVector('uT', [t]);
        this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    } else {
        this._noEffect.setAttributeArray('aCoord', this._coords, 0, 2, 0);
        this._noEffect.setTexture('uTexture', texture);
        this._noEffect.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    }
};
