/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - mixer -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.mixer = function (options) {
    this._screen = options.screen;
    this._mv = options.mv;
    this.properties = { volume: [0.0, 0.0, 0.0] };
    this._channel = options.channel || 1;
    this._fbo = [];
    this._resize(options.width, options.height);
    var fragmentShader =
            (this._channel == 1) ?  MajVj.frame.mixer._fragment1Shader :
            (this._channel == 2) ?  MajVj.frame.mixer._fragment2Shader :
                                    MajVj.frame.mixer._fragment3Shader;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.mixer._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    fragmentShader));
    this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
};

// Shader programs.
MajVj.frame.mixer._vertexShader = null;
MajVj.frame.mixer._fragment1Shader = null;
MajVj.frame.mixer._fragment2Shader = null;
MajVj.frame.mixer._fragment3Shader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.frame.mixer.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'mixer', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'mixer', 'shaders.html', 'fragment1'),
            MajVj.loadShader('frame', 'mixer', 'shaders.html', 'fragment2'),
            MajVj.loadShader('frame', 'mixer', 'shaders.html', 'fragment3')
        ]).then(function (shaders) {
            MajVj.frame.mixer._vertexShader = shaders[0];
            MajVj.frame.mixer._fragment1Shader = shaders[1];
            MajVj.frame.mixer._fragment2Shader = shaders[2];
            MajVj.frame.mixer._fragment3Shader = shaders[3];
            resolve();
        }, function () { reject('mixer.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.mixer.prototype.onresize = function (aspect) {
    var size = this._mv.size();
    this._resize(size.width, size.height);
};

/**
 * Draws a mixed image.
 * @param delta delta time from the last rendering
 */
MajVj.frame.mixer.prototype.draw = function (delta) {
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture0', this._fbo[0].texture);
    this._program.setUniformVector('uVolume0', [this.properties.volume[0]]);
    if (this._channel >= 2) {
        this._program.setTexture('uTexture1', this._fbo[1].texture);
        this._program.setUniformVector(
                'uVolume1', [this.properties.volume[1]]);
        if (this._channel >= 3) {
            this._program.setTexture('uTexture2', this._fbo[2].texture);
            this._program.setUniformVector(
                    'uVolume2', [this.properties.volume[2]]);
        }
    }
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};

/**
 * Bind an offscreen buffer.
 * @param channel a channel to bind
 * @return a previous fbo bount to the context
 */
MajVj.frame.mixer.prototype.bind = function (channel) {
    return this._fbo[channel].bind();
};

/**
 * Adjust frame buffer object size.
 * @param width offscreen width
 * @param height offscreen height
 */
MajVj.frame.mixer.prototype._resize = function (width, height) {
    for (var ch = 0; ch < this._channel; ++ch)
        this._fbo[ch] = this._screen.createFrameBuffer(width, height);
};
