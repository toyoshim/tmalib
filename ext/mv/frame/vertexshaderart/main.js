/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - vertexshaderart -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.vertexshaderart = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._vshader = options.vshader || MajVj.frame.vertexshaderart._vshader;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.vertexshaderart._vheader + this._vshader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.vertexshaderart._fshader));
    this._sound = this._screen.createAlphaTexture(
            new Uint8Array(1024 * 240), 1024, 240, false);
    this._floatSound = this._screen.createAlphaFloatTexture(
            new Float32Array(1024 * 240), 1024, 240, false);
    this._vertexCount = 0;
    this._vertices = null;
    this.properties = {
        vertexCount: options.vertexCount || 1024,
        background: options.background || [ 0.0, 0.0, 0.0, 1.0 ],
        mode: options.mode || Tma3DScreen.MODE_POINTS,
        time: 0.0,
        sound: new Uint8Array(1024),
        floatSound: new Float32Array(1024)
    };
};

MajVj.frame.vertexshaderart._vheader = ' \
        attribute float vertexId; \
        uniform float vertexCount; \
        uniform vec2 resolution; \
        uniform float time; \
        uniform sampler2D sound; \
        uniform sampler2D floatSound; \
        uniform vec4 background; \
        varying vec4 v_color;';

MajVj.frame.vertexshaderart._vshader = ' \
        void main() { \
            gl_Position = vec4(vec3(0.), 1.); \
            v_color = vec4(1.); \
        }';

MajVj.frame.vertexshaderart._fshader = ' \
        precision mediump float; \
        varying vec4 v_color; \
        void main() { \
            gl_FragColor = v_color; \
        }';

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.vertexshaderart.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.vertexshaderart.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.vertexshaderart.prototype.draw = function (delta) {
    // **************************************************************
    // * Spec from the help at https://www.vertexshaderart.com/new/ *
    // **************************************************************
    // Inputs
    // -------------------------------------------------------------
    // vertexId    : float     : number of the vertex 0, 1, 2
    // vertexCount : float     : total number of vertices
    // resoluton   : vec2      : resolution of the art
    // mouse       : vec2      : mouse position normalized (-1 to 1)
    // touch       : sampler2D : touch history 32x240 (4sec @60fps)
    //             :           : x = x, y = y, z = pressure, w = time
    //             :           : column 0 is mouse or first finger.
    //             :           : column 1 is second finger ...
    // time        : float     : time in seconds
    // sound       : sampler2D : data from the music Nx240, alpha only
    //             :           : 240 rows of history (4secs @60fps)
    // floatSound  : sampler2D : data from the music Nx240, alpha only
    //             :           : 240 rows of history (4secs @60fps)
    //             :           : see spec for difference between
    //             :           : getFloatFrequencyData and
    //             :           : getByteFrenquencyData.
    // soundRes    : vec2      : resolution of sound
    // background  : vec4      : background color
    // 
    // Outputs:
    // -------------------------------------------------------------
    // gl_Position : vec4    : standard GLSL vertex shader output
    // v_color     : vec4    : color to output from fragment shader
    // 
    // BLEND is enabled, function is ONE,ONE_MINUS_SRC_ALPHA,
    // DEPTH_TEST is enabled.

    this.properties.time += delta;

    var sound = this._sound.data;
    var floatSound = this._floatSound.data;
    for (var i = 1024 * 240 - 1; i >= 1024; --i) {
        var j = i - 1024;
        sound[i] = sound[j];
        floatSound[i] = floatSound[j];
    }
    for (; i >= 0; --i) {
        sound[i] = this.properties.sound[i];
        floatSound[i] = this.properties.floatSound[i];
    }
    this._sound.update(sound);
    this._floatSound.update(floatSound);

    if (this.properties.vertexCount != this._vertexCount)
        this._prepareVertices();

    this._screen.fillColor(this.properties.background[0],
                           this.properties.background[1],
                           this.properties.background[2],
                           this.properties.background[3]);

    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(true,
                              this._screen.gl.ONE,
                              this._screen.gl.ONE_MINUS_SRC_ALPHA,
                              true);

    this._program.setAttributeArray('vertexId', this._vertices, 0, 1, 0);
    this._program.setUniformVector('vertexCount', [ this._vertexCount ]);
    this._program.setUniformVector('resolution', [ this._width, this._height ]);
    // TODO: mouse
    // TODO: touch
    this._program.setUniformVector('time', [ this.properties.time / 1000 ]);
    this._program.setTexture('sound', this._sound);
    this._program.setTexture('floatSound', this._floatSound);
    // TODO: soundRes
    this._program.setUniformVector('background', this.properties.background);

    this._program.drawArrays(this.properties.mode, 0, this._vertexCount);

    this._screen.popAlphaMode();
};

MajVj.frame.vertexshaderart.prototype._prepareVertices = function () {
    this._vertexCount = this.properties.vertexCount;
    var vertices = new Array(this._vertexCount);
    for (var i = 0; i < this._vertexCount; ++i)
        vertices[i] = i;
    this._vertices = this._screen.createBuffer(vertices);
};