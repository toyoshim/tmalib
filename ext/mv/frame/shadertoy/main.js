/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - shadertoy -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.shadertoy = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;
    this._time = 0.0;
    this._program = null;
    if (options.shader)
        this.setShader(options.shader);
    this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
};

// Shader programs.
MajVj.frame.shadertoy._vertexShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.shadertoy.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'shadertoy', 'shaders.html', 'vertex'),
            MajVj.loadShader(
                'frame', 'shadertoy', 'shaders.html', 'fragment_head')
        ]).then(function (results) {
            MajVj.frame.shadertoy._vertexShader = results[0];
            MajVj.frame.shadertoy._shadertoyUniforms = results[1];
            resolve();
        }, function (error) { tma.log(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.shadertoy.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.shadertoy.prototype.draw = function (delta) {
    // Set shadertoy compatible uniforms.
    this._time += delta / 1000.0;
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setUniformVector(
        'iResolution', [this._width, this._height, 1.0]);
    this._program.setUniformVector('iGlobalTime', [this._time]);
    this._program.setUniformVector(
        'iChannelTime', [this._time, this._time, this._time, this._time]);
    // TODO.
    //  - uniform vec3 iChannelResolution[4];
    //  - uniform vec4 iMouse;
    //  - uniform sampler2D iChannel0;
    //  - uniform sampler2D iChannel1;
    //  - uniform sampler2D iChannel2;
    //  - uniform sampler2D iChannel3;
    //  - uniform vec4 iDate;

    // Set shadertone compatible uniforms.
    this._program.setUniformVector('iOvertoneVolume', [this._controller.sound.volume]);

    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.shadertoy.prototype.setController = function (controller) {
    this._controller = controller;
};

/**
 * Sets a fragment shader.
 * @param shader a fragment shader
 */
MajVj.frame.shadertoy.prototype.setShader = function (shader) {
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.shadertoy._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.shadertoy._shadertoyUniforms + shader));
};

