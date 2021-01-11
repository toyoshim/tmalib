Polymer('majvj-suite', {
  width: 0,
  height: 0,
  type: 'frame',
  name: undefined,
  options: undefined,
  base: '',
  ready: function () {
    var _majvj = this.$.majvj;
    var _core = _majvj.core;
    var tma = _core.tma;
    var TmaScreen = _core.TmaScreen;
    var Tma2DScreen = _core.Tma2DScreen;
    var Tma3DScreen = _core.Tma3DScreen;
    var TmaModelPrimitives = _core.TmaModelPrimitives;
    var TmaParticle = _core.TmaParticle;
    var TmaSequencer = _core.TmaSequencer;
    var TmaTimeline = _core.TmaTimeline;
    var TmaMotionBvh = _core.TmaMotionBvh;
    var TmaModelPly = _core.TmaModelPly;
    var TmaModelPs2Ico = _core.TmaModelPs2Ico;
    var MajVj = _majvj.MajVj;
    var vec2 = _majvj.vec2;
    var vec3 = _majvj.vec3;
    var vec4 = _majvj.vec4;
    var mat2 = _majvj.mat2;
    var mat3 = _majvj.mat3;
    var mat4 = _majvj.mat4;
    var quat4 = _majvj.quat4;
    MajVj.loadScript = function (type, name, src) {
      tma.log('all script should be preloaded to avoid name space pollution: ' +
              'ignore MajVj.loadScript(' + type + ', ' + name + ', ' + src +
              ');');
      return new Promise(function (resolve, reject) { resolve() });
    };
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - tuning -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.tuning = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = { volume: 0.0 };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.tuning._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.tuning._fragmentShader));
    this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
};

// Shader programs.
MajVj.effect.tuning._vertexShader = null;
MajVj.effect.tuning._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.tuning.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'tuning', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'tuning', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.tuning._vertexShader = shaders[0];
            MajVj.effect.tuning._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('tuning.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.tuning.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.tuning.prototype.draw = function (delta, texture) {
    var t = this.properties.volume;
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setUniformVector('uT', [t]);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};/**
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
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - acrylic -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.acrylic = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {
        color: [0.0, 0.0, 1.0, 1.0]
    };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.acrylic._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.acrylic._fragmentShader));
    this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
};

// Shader programs.
MajVj.effect.acrylic._vertexShader = null;
MajVj.effect.acrylic._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.acrylic.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'acrylic', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'acrylic', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.acrylic._vertexShader = shaders[0];
            MajVj.effect.acrylic._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('acrylic.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.acrylic.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.acrylic.prototype.draw = function (delta, texture) {
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setUniformVector('uColor', this.properties.color);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
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
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - rollpanel -
 * @param options options (See MajVj.prototype.create)
 */
/* global MajVj */
/* global Tma3DScreen */
/* global TmaTimeline */
/* global mat4 */
MajVj.effect.rollpanel = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {
        restart: false
    };
    this._panels = options.panels || 3;
    this._delay = options.delay || 0.25;
    this._delay *= 2 * Math.PI;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.rollpanel._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.rollpanel._fragmentShader));
    var coords = [];
    var left = -1.0;
    var step = 2.0 / this._panels;
    for (var i = 0; i < this._panels; ++i) {
        var right = left + step;
        coords.push([left, -1, left, 1, right, 1, right, -1]);
        left += step;
    }
    this._coords =
            this._screen.createBuffer(Array.prototype.concat.apply([], coords));
    this._matrix = mat4.create();
    mat4.perspective(this._matrix, Math.PI / 2, 1, 0.1, 2.0);
    mat4.translate(this._matrix, this._matrix, [0.0, 0.0, -1.0]);
    mat4.scale(this._matrix, this._matrix, [2, 2, 2]);
    this._scaleTimeline = new TmaTimeline({
            type: 'bypass',
            input_scale: 0.0001 * (options.speed || 1)
    });
    this._oneshotTimeline = new TmaTimeline({
            type: options.oneshot ? 'saturate' : 'bypass',
            output_scale: Math.PI * 2
    });
};

// Shader programs.
MajVj.effect.rollpanel._vertexShader = null;
MajVj.effect.rollpanel._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.rollpanel.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'rollpanel', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'rollpanel', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.rollpanel._vertexShader = shaders[0];
            MajVj.effect.rollpanel._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('rollpanel.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.rollpanel.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.rollpanel.prototype.draw = function (delta, texture) {
    if (this.properties.restart) {
        this.properties.restart = false;
        this._scaleTimeline.reset();
        this._oneshotTimeline.reset();
    }
    this._scaleTimeline.update(delta);
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setUniformMatrix('uMatrix', this._matrix);
    this._program.setTexture('uTexture', texture);
    var center = (this._panels - 1) / 2;
    var matrix = mat4.create();
    var time = this._scaleTimeline.elapsed();
    for (var i = 0; i < this._panels; ++i) {
        var local_time = time - Math.abs(i - center) * this._delay;
        mat4.identity(matrix);
        mat4.rotateX(matrix, matrix, this._oneshotTimeline.convert(local_time));
        this._program.setUniformMatrix('uMvMatrix', matrix);
        this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 4 * i, 4);
    }
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - noise -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.noise = function (options) {
    this._screen = options.screen;
    this._mv = options.mv;
    this._width = options.width;
    this._height = options.height;
    var prop = function (name) {
        if (options.enable)
            return options.enable.indexOf(name) >= 0;
        if (options.disable)
            return options.disable.indexOf(name) < 0;
        if (options[name] !== undefined)
            return options[name];
        return true;
    };
    this.properties = {
        // for scanline, analog, and raster that needs updating a line texture.
        update: prop('update'),

        scanline: prop('scanline'),
        scanline_frequency: this._height / 4,
        scanline_velocity: 0.5,

        analog: prop('analog'),
        analog_frequency: 8,
        analog_speed: 0.0001,
        analog_color_distribution: [0.5, 0.7, 0.3],

        raster: prop('raster'),
        raster_velocity: 7,
        raster_speed: 0.005,
        raster_level: 0.6,

        color: prop('color'),
        color_shift: [-0.005, 0.0, 0.005],
        color_level: [0.1, 0.1, 0.1],
        color_weight: [1.0, 0.7, 0.4],  // sepia

        noise: prop('noise'),
        noise_level: [0.05, 0.2, 0.01],  // white, pink, perlin
        noise_color: [1, 1, 1],

        slitscan: prop('slitscan'),
        slitscan_size: 4,

        adjust: prop('adjust'),
        adjust_repeat: [1, 1],
        adjust_offset: [0, 0],

        tube: prop('tube'),
        tube_adjust: [0.1, 48],

        film: prop('film'),
        film_lines: 3,  // 0-5
        film_flash: 0.4
    };

    this._noise = this._mv.create('misc', 'perlin');
    this._delta = 0;

    this._effectProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.noise._effectVertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.noise._effectFragmentShader));
    this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);

    this._lineProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.noise._lineVertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.noise._lineFragmentShader));
    this._lineCoords = this._screen.createBuffer([
        0.0, -1, 0.0, 1,
        0.1, -1, 0.1, 1,
        0.2, -1, 0.2, 1,
        0.3, -1, 0.3, 1,
        0.4, -1, 0.4, 1
    ]);

    this._lineImage = this._screen.createImage(1, this._height);
    this._updateLineImage();
    this._lineTexture = this._screen.createTexture(
            this._lineImage, false, Tma3DScreen.FILTER_LINEAR);

    this._noiseImage = this._screen.createImage(this._width, this._height);
    var nhist = 100;
    for (var y = 0; y < this._height; ++y) {
        var rhist = [];
        for (var i = 0; i < (nhist - 1); ++i)
            rhist[i] = Math.random();
        for (var x = 0; x < this._width; ++x) {
            var white = ((Math.random() * 256)|0) % 256;
            var parlin1 = (this._noise.noise(x / 3, y / 3, 0.3) + 1) * 127;
            var parlin2 = (this._noise.noise(x / 3, y / 3, 0.6) + 1) * 127;
            rhist[nhist - 1 + x] = Math.random();
            var pink = 0;
            for (i = nhist; i > 0; --i)
                pink += rhist[x + nhist - i] / i / 2;
            pink = ((pink + 1) * 128) % 256;
            this._noiseImage.setPixel(x, y, white, pink, parlin1, parlin2);
        }
    }
    this._noiseTexture = this._screen.createTexture(
            this._noiseImage, false, Tma3DScreen.FILTER_NEAREST);
};

// Shader programs.
MajVj.effect.noise._lineVertexShader = null;
MajVj.effect.noise._lineFragmentShader = null;
MajVj.effect.noise._effectVertexShader = null;
MajVj.effect.noise._effectFragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.noise.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'noise', 'shaders.html', 'lineVertex'),
            MajVj.loadShader('effect', 'noise', 'shaders.html', 'lineFragment'),
            MajVj.loadShader('effect', 'noise', 'shaders.html', 'effectVertex'),
            MajVj.loadShader(
                    'effect', 'noise', 'shaders.html', 'effectFragment')
        ]).then(function (data) {
            MajVj.effect.noise._lineVertexShader = data[0];
            MajVj.effect.noise._lineFragmentShader = data[1];
            MajVj.effect.noise._effectVertexShader = data[2];
            MajVj.effect.noise._effectFragmentShader = data[3];
            resolve();
        }, function () { reject('noise.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.noise.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.noise.prototype.draw = function (delta, texture) {
    this._delta += delta;

    if (this.properties.update) {
        this._updateLineImage();
        this._lineTexture.update(this._lineImage);
    }

    this._effectProgram.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._effectProgram.setTexture('uTexture', texture);
    this._effectProgram.setTexture('uLineTexture', this._lineTexture);
    this._effectProgram.setTexture('uNoiseTexture', this._noiseTexture);
    this._effectProgram.setUniformVector('uColorShift',
            this.properties.color ? this.properties.color_shift : [0, 0, 0]);
    this._effectProgram.setUniformVector('uColorLevel',
            this.properties.color ? this.properties.color_level : [1, 1, 1]);
    this._effectProgram.setUniformVector('uColorWeight',
            this.properties.color ? this.properties.color_weight : [1, 1, 1]);
    this._effectProgram.setUniformVector('uNoiseShift',
            this.properties.noise ? [Math.random(), Math.random()] : [0, 0]);
    this._effectProgram.setUniformVector('uNoiseLevel',
            this.properties.noise ? this.properties.noise_level : [0, 0]);
    this._effectProgram.setUniformVector('uNoiseColor',
            this.properties.noise ? this.properties.noise_color : [0, 0, 0]);
    this._effectProgram.setUniformVector('uSlitscanResolution',
            this.properties.slitscan
                    ? [this._width / this.properties.slitscan_size]
                    : [this._width]);
    this._effectProgram.setUniformVector('uTime', [this._delta / 10]);
    this._effectProgram.setUniformVector('uAdjustRepeat',
            this.properties.adjust ? this.properties.adjust_repeat : [1, 1]);
    this._effectProgram.setUniformVector('uAdjustOffset',
            this.properties.adjust ? this.properties.adjust_offset : [0, 0]);
    var adjust = [
        this.properties.tube_adjust[0],
        this.properties.tube_adjust[1]
    ];
    if (this.properties.film)
        adjust[1] = adjust[1] * (1 +
                this._noise.noise(0.1, 0.1, this._delta / 10) *
                this.properties.film_flash);
    this._effectProgram.setUniformVector('uTubeAdjust',
            this.properties.tube ? adjust : [1, 0]);
    this._effectProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);

    if (this.properties.film && this.properties.film_lines != 0) {
        this._screen.pushAlphaMode();
        this._screen.setAlphaMode(
                true, this._screen.gl.ONE, this._screen.gl.SRC_ALPHA);
        var buffer = this._lineCoords.buffer();
        for (var i = 0; i < this.properties.film_lines; ++i) {
            buffer[i * 4 + 0] = buffer[i * 4 + 2] = 2 *
                    (this._noise.noise(this._delta / 1000, i * 3.33, i * 7.77) +
                     this._noise.noise(this._delta / 10, i * 4, i * 8) * 0.01);
        }
        this._lineCoords.update();
        this._lineProgram.setAttributeArray(
                'aCoord', this._lineCoords, 0, 2, 0);
        this._lineProgram.drawArrays(
                Tma3DScreen.MODE_LINES, 0, this.properties.film_lines * 2);
        this._screen.popAlphaMode();
    }
};

MajVj.effect.noise.prototype._updateLineImage = function () {
    var scanlineEnabled = this.properties.scanline;
    var scanlineTheta = 0;
    var scanlineMaxTheta = 2 * Math.PI * this.properties.scanline_frequency;
    var scanlineNoiseVelocity = this.properties.scanline_velocity;
    var scanlineBaseVelocity = (1 - scanlineNoiseVelocity);
    var analogEnabled = this.properties.analog;
    var analogFrequency = this.properties.analog_frequency;
    var analogTime = this._delta * this.properties.analog_speed;
    var analogZ = this.properties.analog_color_distribution;
    var rasterEnabled = this.properties.raster;
    var rasterVelocity = this.properties.raster_velocity;
    var rasterTime = this._delta * this.properties.raster_speed;
    var rasterLevel = 1.0 - this.properties.raster_level;
    var sin = Math.sin;
    for (var y = 0; y < this._height; ++y) {
        var fy = y / (this._height - 1);
        var r = 255;
        var g = 255;
        var b = 255;
        var a = 0;
        if (scanlineEnabled) {
            var normal_sin = (sin(scanlineMaxTheta * fy) + 1) / 2
            var l = scanlineBaseVelocity + normal_sin * scanlineNoiseVelocity;
            r *= l;
            g *= l;
            b *= l;
        }
        if (analogEnabled) {
            var ay = fy * analogFrequency;
            var rn = (1 + this._noise.noise(ay, analogTime, analogZ[0])) / 2;
            var gn = (1 + this._noise.noise(ay, analogTime, analogZ[1])) / 2;
            var bn = (1 + this._noise.noise(ay, analogTime, analogZ[2])) / 2;
            r *= rn;
            g *= gn;
            b *= bn;
        }
        if (rasterEnabled) {
            var ry1 = fy * 256;
            var ry2 = fy * 32;
            var n1 = this._noise.noise(ry1, rasterTime, 2.27);
            var n2 = this._noise.noise(ry2, rasterTime, 6.23);
            a = (((n2 > rasterLevel) ? (1 + n1) : 0) + (1 + n2) * 0.1) *
                    rasterVelocity;
        }
        this._lineImage.setPixel(0, y, r|0, g|0, b|0, a|0);
    }
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - zoom -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.zoom = function(options) {
  this.properties = {
    multi: [1, 1],
    scale: [1, 1],
    volume: 1
  };

  this._program = options.screen.createProgram(
    options.screen.compileShader(Tma3DScreen.VERTEX_SHADER,
      MajVj.effect.zoom._vertexShader),
    options.screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
      MajVj.effect.zoom._fragmentShader));
  this._coords = options.screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
};

// Shader programs.
MajVj.effect.zoom._vertexShader = null;
MajVj.effect.zoom._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.zoom.load = function() {
  return new Promise(function(resolve, reject) {
    Promise.all([
      MajVj.loadShader('effect', 'zoom', 'shaders.html', 'vertex'),
      MajVj.loadShader('effect', 'zoom', 'shaders.html', 'fragment'),
    ]).then(function(data) {
      MajVj.effect.zoom._vertexShader = data[0];
      MajVj.effect.zoom._fragmentShader = data[1];
      resolve();
    }, function() {
      reject('zoom.load fails');
    });
  });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.zoom.prototype.onresize = function(aspect) {};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.zoom.prototype.draw = function(delta, texture) {
  this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
  this._program.setTexture('uTexture', texture);
  this._program.setUniformVector('uMulti', this.properties.multi);
  this._program.setUniformVector('uScale', this.properties.scale);
  this._program.setUniformVector('uVolume', [this.properties.volume]);
  this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - rgb -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.rgb = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = { volume: options.distance || 0.1 };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.rgb._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.rgb._fragmentShader));
    this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
};

// Shader programs.
MajVj.effect.rgb._vertexShader = null;
MajVj.effect.rgb._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.rgb.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'rgb', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'rgb', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.rgb._vertexShader = shaders[0];
            MajVj.effect.rgb._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('rgb.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.rgb.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.rgb.prototype.draw = function (delta, texture) {
    var distance = this.properties.volume / 2;
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setUniformVector('uDistance', [distance]);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - hue -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.hue = function (options) {
    this._screen = options.screen;
    this.properties = { hue: options.hue || 0 }; /* [0:1] */
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.hue._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.hue._fragmentShader));
    this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
};

// Shader programs.
MajVj.effect.hue._vertexShader = null;
MajVj.effect.hue._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.hue.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'hue', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'hue', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.hue._vertexShader = shaders[0];
            MajVj.effect.hue._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('hue.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.hue.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.hue.prototype.draw = function (delta, texture) {
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setUniformVector('uHue', [this.properties.hue]);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
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
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - mirror -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.mirror = function (options) {
    this._screen = options.screen;
    this.onresize(options.aspect);
    this.properties = {
        division: options.division || 4,
        zoom: 1.5
    };
    this._coords = null;
    this._indices = null;
    this._division = 0;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.mirror._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.mirror._fragmentShader));
};

// Shader programs.
MajVj.effect.mirror._vertexShader = null;
MajVj.effect.mirror._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.mirror.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'mirror', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'mirror', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.mirror._vertexShader = shaders[0];
            MajVj.effect.mirror._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('mirror.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.mirror.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    this._zoom = [ 1.0, 1.0 ];
    if (this._aspect > 1)
        this._zoom[1] = this._aspect;
    else
        this._zoom[0] = 1 / this._aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.mirror.prototype.draw = function (delta, texture) {
    if (this._division != this.properties.division)
        this._prepareCoords();

    this._program.setAttributeArray('aCoord', this._coords, 0, 4, 0);
    var zoom = [
        this._zoom[0] * this.properties.zoom,
        this._zoom[1] * this.properties.zoom
    ];
    this._program.setUniformVector('uZoom', zoom);
    this._program.setTexture('uTexture', texture);
    var length = this._division * 6;
    this._program.drawElements(
            Tma3DScreen.MODE_TRIANGLES, this._indices, 0, length);
};

MajVj.effect.mirror.prototype._prepareCoords = function () {
    var n = this.properties.division;
    var coords = [];
    var delta = Math.PI * 2 / n;
    var theta = 0;
    var p0 = [ 0, 0 ];
    var p1 = [ Math.cos(theta), Math.sin(theta) ];
    var p2 = [ Math.cos(delta), Math.sin(delta) ];
    var p3 = [ p1[0] + p2[0], p1[1] + p2[1] ];
    var index = 0;
    var indices = [];
    for (var i = 0; i < n; ++i) {
        var t1 = theta;
        theta += delta;
        var t2 = theta;
        var qa = [ Math.cos(t1), Math.sin(t1) ];
        var qb = [ Math.cos(t2), Math.sin(t2) ];
        var q1 = (i % 2) ? qb : qa;
        var q2 = (i % 2) ? qa : qb;
        var q3 = [ q1[0] + q2[0], q1[1] + q2[1] ];
        [].push.apply(coords, [ 0, 0, p0[0], p0[1] ]);
        [].push.apply(coords, [ q1[0], q1[1], p1[0], p1[1] ]);
        [].push.apply(coords, [ q2[0], q2[1], p2[0], p2[1] ]);
        indices.push(index + 0);
        indices.push(index + 1);
        indices.push(index + 2);
        [].push.apply(coords, [ q3[0], q3[1], p3[0], p3[1] ]);
        indices.push(index + 1);
        indices.push(index + 2);
        indices.push(index + 3);
        index += 4;
    }
    this._coords = this._screen.createBuffer(coords);
    this._indices = this._screen.createElementBuffer(indices);
    this._division = n;
};/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - nicofarre -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.nicofarre = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = { volume: [ 0.0, 0.0 ] };
    this._front = (options.front !== undefined) ? options.front : true;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.nicofarre._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.nicofarre._fragmentShader));
    this._programForCeiling = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.nicofarre._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.nicofarre._fragmentShaderForCeiling));
    this._pMatrix = mat4.create();
    this.onresize(this._aspect);
    this._mvMatrix = mat4.identity(mat4.create());
    var position = options.position || [0, 0, -500];
    mat4.translate(this._mvMatrix, this._mvMatrix, position);
    this._coords = this._screen.createBuffer([
            // A (right): 1480x280, x=420
            420, -140, -740,
            420, 140, -740,
            420, 140, 740,
            420, -140, 740,
            // B (stage): 840x280, z=-740
            -420, -140, -740,
            -420, 140, -740,
            420, 140, -740,
            420, -140, -740,
            // C (left): 1480x280, 4=-420
            -420, -140, 740,
            -420, 140, 740,
            -420, 140, -740,
            -420, -140, -740,
            // D (back): 840x280, z=740
            420, -140, 740,
            420, 140, 740,
            -420, 140, 740,
            -420, -140, 740,
            // E (stage right): 160x280, z=-580
            260, -140, -580,
            260, 140, -580,
            420, 140, -580,
            420, -140, -580,
            // F (stage left): 160x280, z=-580
            -420, -140, -580,
            -420, 140, -580,
            -260, 140, -580,
            -260, -140, -580,
            // G (ceiling): 840x1480, y=140
            -420, 140, -740,
            -420, 140, 740,
            420, 140, 740,
            420, 140, -740]);
    this._texCoords = this._screen.createBuffer([
            // A (right): (40, 760) - (1520, 1040) / (1920, 1080)
            40 / 1920, 760 / 1080,
            40 / 1920, 1040 / 1080,
            1520 / 1920, 1040 / 1080,
            1520 / 1920, 760 / 1080,
            // B (stage): (40, 120) - (880, 400) / (1920, 1080)
            40 / 1920, 120 / 1080,
            40 / 1920, 400 / 1080,
            880 / 1920, 400 / 1080,
            880 / 1920, 120 / 1080,
            // C (left): (40, 440) - (1520, 720) / (1920, 1080)
            40 / 1920, 440 / 1080,
            40 / 1920, 720 / 1080,
            1520 / 1920, 720 / 1080,
            1520 / 1920, 440 / 1080,
            // D (back): (920, 120) - (1760, 400) / (1920, 1080)
            920 / 1920, 120 / 1080,
            920 / 1920, 400 / 1080,
            1760 / 1920, 400 / 1080,
            1760 / 1920, 120 / 1080,
            // E (stage right): (1560, 760) - (1720, 1040) / (1920, 1080)
            1560 / 1920, 760 / 1080,
            1560 / 1920, 1040 / 1080,
            1720 / 1920, 1040 / 1080,
            1720 / 1920, 760 / 1080,
            // F (stage left): (1560, 440) - (1720, 720) / (1920, 1080)
            1560 / 1920, 440 / 1080,
            1560 / 1920, 720 / 1080,
            1720 / 1920, 720 / 1080,
            1720 / 1920, 440 / 1080,
            // G (ceiling): (1760, 870) - (1858, 1040) / (1920, 1080)
            1760 / 1920, 870 / 1080,
            1760 / 1920, 1040 / 1080,
            1858 / 1920, 1040 / 1080,
            1858 / 1920, 870 / 1080]);
    this._phase = this._screen.createBuffer([
            // A, B, C, D, E, F
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            // G (0, 0) - (138, 210) * PI
            0, 0,
            0, 210 * Math.PI,
            138 * Math.PI, 210 * Math.PI,
            138 * Math.PI, 0]);
};

// Shader programs.
MajVj.effect.nicofarre._vertexShader = null;
MajVj.effect.nicofarre._fragmentShader = null;
MajVj.effect.nicofarre._fragmentShaderForCeiling = null;


/**
 * Loads resources asynchronously.
 */
MajVj.effect.nicofarre.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'nicofarre', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'nicofarre', 'shaders.html', 'fragment'),
            MajVj.loadShader('effect', 'nicofarre', 'shaders.html',
                    'fragmentForCeiling'),
        ]).then(function (shaders) {
            MajVj.effect.nicofarre._vertexShader = shaders[0];
            MajVj.effect.nicofarre._fragmentShader = shaders[1];
            MajVj.effect.nicofarre._fragmentShaderForCeiling = shaders[2];
            resolve();
        }, function () { reject('nicofarre.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.nicofarre.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(this._pMatrix, Math.PI / 4, aspect, 0.1, 10000.0);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.nicofarre.prototype.draw = function (delta, texture) {
    var mvMatrix = mat4.clone(this._mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0, 0, 1000 * this.properties.volume[0]]);
    mat4.rotate(mvMatrix, mvMatrix, Math.PI * this.properties.volume[1], [0, 1, 0]);
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(false);
    this._screen.pushCullingMode();
    this._screen.setCullingMode(true, false);
    this._program.setAttributeArray('aCoord', this._coords, 0, 3, 0);
    this._program.setAttributeArray('aTexCoord', this._texCoords, 0, 2, 0);
    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    this._program.setUniformMatrix('uMVMatrix', mvMatrix);
    this._program.setTexture('uTexture', texture);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 4, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 8, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 12, 4);
    if (this._front) {
        this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 16, 4);
        this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 20, 4);
    }
    this._programForCeiling.setAttributeArray('aCoord', this._coords, 0, 3, 0);
    this._programForCeiling.setAttributeArray('aTexCoord', this._texCoords, 0,
            2, 0);
    this._programForCeiling.setAttributeArray('aPhase', this._phase, 0, 2, 0)
    this._programForCeiling.setUniformMatrix('uPMatrix', this._pMatrix);
    this._programForCeiling.setUniformMatrix('uMVMatrix', mvMatrix);
    this._programForCeiling.setTexture('uTexture', texture);
    this._programForCeiling.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 24, 4);
    this._screen.popCullingMode();
    this._screen.popAlphaMode();
};
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
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - flashpanel -
 * @param options options (See MajVj.prototype.create)
 */
/* global MajVj */
/* global Tma3DScreen */
MajVj.effect.flashpanel = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this.properties = { time: 0.0, origin: options.origin || [ 0.0, 0.0 ] };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.flashpanel._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.flashpanel._fragmentShader));
    this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
    this._panels = options.panels || [10.0, 5.0];
    this._speed = options.speed || 1.0;
    this._color = options.color || [0.5, 0.5, 1.0];
};

// Shader programs.
MajVj.effect.flashpanel._vertexShader = null;
MajVj.effect.flashpanel._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.flashpanel.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'flashpanel', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'flashpanel', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.flashpanel._vertexShader = shaders[0];
            MajVj.effect.flashpanel._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('flashpanel.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.flashpanel.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.flashpanel.prototype.draw = function (delta, texture) {
    this.properties.time += delta;
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setUniformVector('uTime', [this.properties.time * this._speed]);
    this._program.setUniformVector('uPanels', this._panels);
    this._program.setUniformVector('uOrigin', this.properties.origin);
    this._program.setUniformVector('uColor', this._color);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - cathode -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.cathode = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this.properties = {
        volume: 1.0,
        bend: 0.1,
    };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.cathode._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.cathode._fragmentShader));
    this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
};

// Shader programs.
MajVj.effect.cathode._vertexShader = null;
MajVj.effect.cathode._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.cathode.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'cathode', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'cathode', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.cathode._vertexShader = shaders[0];
            MajVj.effect.cathode._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('cathode.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.cathode.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.cathode.prototype.draw = function (delta, texture) {
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setUniformVector('uVolume', [this.properties.volume]);
    this._program.setUniformVector('uBend', [this.properties.bend]);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - saiyaan -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.saiyaan = function (options) {
  this._mv = options.mv;
  this.properties = {
    volume: 0.0,
    rap: 0.0,
    fftDb: new Float32Array(1024)
  };

  this._mixer = this._mv.create('frame', 'mixer', { channel: 3 });

  this._waypoints = this._mv.create('frame', 'nicofarre3d', {
    modules: [ {
      name: 'waypoints',
      options: { particles: 5000 }
    } ]
  });
  this._mirage = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_LEFT_STAGE_RIGHT,
    frames: [ { name: 'sandbox', options: { id: '19454.0' } } ]
  });
  this._spark = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_STAGE_AND_BACK,
    mirror: MajVj.frame.nicofarre.MIRROR_ON_RIGHT,
    frames: [ { name: 'sandbox', options: { id: '14282.0' } } ]
  });
  this._city = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_STAGE,
    frames: [ { name: 'sandbox', options: { id: '18922.0' } } ]
  });
  this._tunnel = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_STAGE,
    frames: [ { name: 'sandbox', options: { id: '14373.1' } } ]
  });
  this._ceil = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_CEILING,
    frames: [ { name: 'sandbox', options: { id: '18794.0' } } ]
  });
  this._front = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_FRONT_BOTH,
    mirror: MajVj.frame.nicofarre.MIRROR_ON_RIGHT,
    frames: [ {
      name: 'effect',
      options: {
        frames: ['wired', { name: 'morphere' } ],
        effects: [ { name: 'tuning' } ]
      }
    } ]
  });
  this._prop_fft = this._front.getFrame(0).getFrame(1).properties;
  this._prop_fft.volume = 0.0;
  this._prop_tuning = this._front.getFrame(0).getEffect(0).properties;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.saiyaan.prototype.draw = function (delta) {
  var fft = this.properties.fftDb;
  var fftUnit = (fft.length / 4) | 0;
  this._prop_fft.volume = fft[fftUnit * 3] / 512;
  var tuning = 0;
  if (fft[fftUnit] > 240)
    tuning = (fft[fftUnit] - 240) / 16;
  this._prop_tuning.volume = tuning;

  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  this._mirage.draw(delta);
  this._ceil.draw(delta);
  this._front.draw(delta);

  var screen = this._mixer.bind(0);
  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  var volume = this.properties.volume;
  if (volume < 0.1) {
    //this._waypoints.draw(delta);
    this._mixer.properties.volume[0] = volume * 10.0;
  } else if (volume < 0.2) {
    //this._waypoints.draw(delta);
    this._mixer.properties.volume[0] = (0.2 - volume) * 10.0;
  } else if (volume < 0.3) {
    this._tunnel.draw(delta);
    this._mixer.properties.volume[0] = (volume - 0.2) * 10.0;
  } else if (volume < 0.4) {
    this._tunnel.draw(delta);
    this._mixer.properties.volume[0] = (0.4 - volume) * 10.0;
  } else if (volume < 0.5) {
    this._city.draw(delta);
    this._mixer.properties.volume[0] = (volume - 0.4) * 10.0;
  } else if (volume < 0.6) {
    this._city.draw(delta);
    this._mixer.properties.volume[0] = (0.6 - volume) * 10.0;
  }
  this._mixer.bind(1);
  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  if (volume < 0.1) {
    this._mixer.properties.volume[1] = 0.0;
  } else if (volume < 0.2) {
    this._city.draw(delta);
    this._mixer.properties.volume[1] = (volume - 0.1) * 10.0;
  } else if (volume < 0.3) {
    this._city.draw(delta);
    this._mixer.properties.volume[1] = (0.3 - volume) * 10.0;
  } else if (volume < 0.4) {
    //this._waypoints.draw(delta);
    this._mixer.properties.volume[1] = (volume - 0.3) * 10.0;
  } else if (volume < 0.5) {
    //this._waypoints.draw(delta);
    this._mixer.properties.volume[1] = (0.5 - volume) * 10.0;
  } else if (volume < 0.6) {
    this._tunnel.draw(delta);
    this._mixer.properties.volume[1] = (volume - 0.5) * 10.0;
  } else if (volume < 0.7) {
    this._tunnel.draw(delta);
    this._mixer.properties.volume[1] = (0.7 - volume) * 10.0;
  }
  this._mixer.properties.volume[2] = this.properties.rap;
  if (this.properties.rap != 0.0) {
    this._mixer.bind(2);
    this._mv.screen().setAlphaMode(false);
    this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
    this._spark.draw(delta);
  }
  screen.bind();
  this._mv.screen().setAlphaMode(
      true, this._mv.screen().gl.ONE, this._mv.screen().gl.ONE);
  this._mixer.draw(delta);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - noop -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.noop = function (options) {
    this.properties = {};
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.noop.prototype.draw = function (delta) {
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - waypoints -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.waypoints = function (options) {
  this._mv = options.mv;
  this.properties = {
    tuning: 0.0,
    rgb: 0.01
  };
  var nico3d = { name: 'nicofarre3d', options: {
    modules: [ {
      name: 'waypoints',
      options: {
        size: 8192,
        particles: 300,
        wayspeed: 50,
        gravity: 1000,
        emit: 1
      }
    } ]
  } };
  var tuning = { name: 'tuning' };
  var rgb = { name: 'rgb' };
  this._frame = this._mv.create('frame', 'effect', {
      frames: [nico3d],
      effects: [tuning, rgb]
  });
  this._frame.getEffect(0).properties.volume = this.properties.tuning;
  this._frame.getEffect(1).properties.volume = this.properties.rgb;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.waypoints.prototype.draw = function (delta) {
  this._frame.getEffect(0).properties.volume = this.properties.tuning;
  this._frame.getEffect(1).properties.volume = this.properties.rgb;
  this._frame.draw(delta);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - miku -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.miku = function (options) {
  this._mv = options.mv;
  this.properties = {
    // 0 - 1
    volume: 0.0,
    glow: 0,
    rgb: 0,
    fftDb: null
  };

  var N = MajVj.frame.nicofarre;
  this._stageMixer = this._createFrame(N.LED_STAGE_AND_BACK, 'effect', {
    frames: [ {
      name: 'mixer',
      options: {
        channel: 2
      }
    } ],
    effects: [
      { name: 'glow' },
      { name: 'rgb' }
    ]
  });
  this._stageMixer.getFrame(0).getEffect(1).properties.volume = 0.02;
  this._mixer = this._stageMixer.getFrame(0).getFrame(0);
  this._front = this._createSandboxFrame(N.LED_FRONT_BOTH, '18794.0');
  this._fft = this._createFrame(N.LED_FRONT_BOTH, 'specticle', {
    color: [0.1, 0.5, 0.1, 1.0]
  });
  this.properties.fftDb = this._fft.getFrame(0).properties.fftDb;
  this._ceil = this._createSandboxFrame(N.LED_CEILING, '18981.0');

  this._wallBall = this._createSandboxFrame(N.LED_WALL_BOTH, '18451.0');
  this._wallWave = this._createSandboxFrame(N.LED_WALL_BOTH, '18873.0');
  this._wallPulse = this._createSandboxFrame(N.LED_WALL_BOTH, '19136.0');

  this._stageNeon = this._createStageFrame('19291.0');
  this._stageWarp = this._createStageFrame('19512.0');
  this._stageTunnel = this._createStageFrame('19150.0');
  this._stageGate = this._createStageFrame('17945.0');

  this._stageCube = this._createStageFrame('18602.4t');
  this._stageLight = this._createStageFrame('18770.0');
  this._stageHill = this._createStageFrame('18760.0');
};

/**
 * Creates a stage frame.
 * @param name a frame name
 * @param options options
 * @return a frame object
 */
MajVj.scene.miku.prototype._createStageFrame = function (id) {
  return this._mv.create('frame', 'sandbox', {
    id: id,
    width: 840,
    height: 280,
    aspect: 840 / 280});
};


/**
 * Creates a sandbox frame with nicofarre layouter.
 * @param led which led should be used
 * @param name a frame name
 * @param options options
 * @return a frame object
 */
MajVj.scene.miku.prototype._createFrame = function (led, name, options) {
  return this._mv.create('frame', 'nicofarre', {
    led: led,
    mirror: MajVj.frame.nicofarre.MIRROR_ON_LEFT,
    frames: [ { name: name, options: options } ]
  });
};


/**
 * Creates a sandbox frame with nicofarre layouter.
 * @param led which led should be used
 * @param id shader id
 * @return a frame object
 */
MajVj.scene.miku.prototype._createSandboxFrame = function (led, id) {
  return this._createFrame(led, 'sandbox', { id: id });
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.miku.prototype.draw = function (delta) {
  this._stageMixer.getFrame(0).getEffect(0).properties.t =
      this.properties.glow;
  this._stageMixer.getFrame(0).getEffect(1).properties.volume =
      this.properties.rgb;

  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  this._front.draw(delta);
  var gl = this._mv.screen().gl;
  this._mv.screen().setAlphaMode(true, gl.ONE, gl.ONE);
  this._fft.draw(delta);
  this._ceil.draw(delta);
  this._wallPulse.draw(delta);

  var screen = this._mixer.bind(0);
  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  this._mv.screen().setAlphaMode(true, gl.ONE, gl.ONE);
  var mixer = this._mixer.properties;
  var volume = this.properties.volume;
  if (volume == 0.0) {
    mixer.volume[0] = 0.0;
  } else if (volume < 0.1) {
    this._stageNeon.draw(delta);
    mixer.volume[0] = volume * 10.0;
  } else if (volume < 0.2) {
    this._stageNeon.draw(delta);
    mixer.volume[0] = (0.2 - volume) * 10.0;
  } else if (volume < 0.3) {
    this._stageWarp.draw(delta);
    mixer.volume[0] = (volume - 0.2) * 10.0;
  } else if (volume < 0.4) {
    this._stageWarp.draw(delta);
    mixer.volume[0] = (0.4 - volume) * 10.0;
  } else if (volume < 0.5) {
    this._stageTunnel.draw(delta);
    mixer.volume[0] = (volume - 0.4) * 10.0;
  } else if (volume < 0.6) {
    this._stageTunnel.draw(delta);
    mixer.volume[0] = (0.6 - volume) * 10.0;
  } else if (volume < 0.7) {
    this._stageGate.draw(delta);
    mixer.volume[0] = (volume - 0.6) * 10.0;
  } else if (volume < 0.8) {
    this._stageGate.draw(delta);
    mixer.volume[0] = (0.8 - volume) * 10.0;
  }
  this._mixer.bind(1);
  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  this._mv.screen().setAlphaMode(true, gl.ONE, gl.ONE);
  if (volume < 0.1) {
    mixer.volume[1] = 0.0;
  } else if (volume < 0.2) {
    this._stageCube.draw(delta);
    mixer.volume[1] = (volume - 0.1) * 10.0;
  } else if (volume < 0.3) {
    this._stageCube.draw(delta);
    mixer.volume[1] = (0.3 - volume) * 10.0;
  } else if (volume < 0.4) {
    this._stageLight.draw(delta);
    mixer.volume[1] = (volume - 0.3) * 10.0;
  } else if (volume < 0.5) {
    this._stageLight.draw(delta);
    mixer.volume[1] = (0.5 - volume) * 10.0;
  } else if (volume < 0.6) {
    this._stageHill.draw(delta);
    mixer.volume[1] = (volume - 0.5) * 10.0;
  } else if (volume < 0.7) {
    this._stageHill.draw(delta);
    mixer.volume[1] = (0.7 - volume) * 10.0;
  }
  screen.bind();
  this._mv.screen().setAlphaMode(
      true, this._mv.screen().gl.ONE, this._mv.screen().gl.ONE);
  this._stageMixer.draw(delta);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - perfume1mm -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.perfume1mm = function (options) {
  this._mv = options.mv;
  this.properties = {
    fftDb: new Float32Array(1024)
  };
  this._sound = options.sound;

  this._skip = 0;
  //this._skip = (2300 + 2184 * 25) / 1000;  // A
  //this._skip = (2300 + 2184 * 33) / 1000;  // B
  //this._skip = (2300 + 2184 * 41) / 1000;  // C
  //this._skip = (2300 + 2184 * 57) / 1000;  // I
  //this._skip = (2300 + 2184 * 65) / 1000;  // A
  //this._skip = (2300 + 2184 * 73) / 1000;  // B
  //this._skip = (2300 + 2184 * 81) / 1000;  // C
  //this._skip = (2300 + 2184 * 97) / 1000;  // I1
  //this._skip = (2300 + 2184 * 105) / 1000;  // I2

  // Setup frames.
  this._signalL = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_FRONT_LEFT,
    frames: [ { name: 'signal', options: {
      coord: [0.0, 0.2, 0.007],
      color: [0.0, 0.0, 0.0, 0.0]
    } } ]
  });
  this._signalR = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_FRONT_RIGHT,
    frames: [ { name: 'signal', options: {
      coord: [0.0, 0.2, 0.007],
      color: [0.0, 0.0, 0.0, 0.0]
    } } ]
  });
  this._signalOn = true;
  this._signalC = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_CEILING,
    frames: [ { name: 'signal', options: {
      coord: [0.0, 0.2, 0.007],
      color: [0.0, 0.0, 0.0, 0.0]
    } } ]
  });
  this._signalCeilingOn = false;

  this._beams = this._mv.create('frame', 'nicofarre3d', {
    modules: [ {
      name: 'beams',
      options: { period: 1092, unit: 10 }
    }, {
      name: 'harrier',
      options: { color: [0.1, 0.1, 0.2] }
    } ]
  });
  this._propHarrier = this._beams.properties;
  this._propHarrier.harrier = 0.0;
  this._beamsOn = false;
  this._screw = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_LEFT_STAGE_RIGHT,
    frames: [ { name: 'sandbox', options: { id: '19624.0' } } ]
  });
  this._screwOn = false;
  this._tunnel = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_LEFT_STAGE_RIGHT,
    frames: [ { name: 'sandbox', options: {
       shader: MajVj.scene.perfume1mm._shader19528 } } ]
  });
  this._tunnelOn = false;
  this._specticle = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_FRONT_BOTH,
    mirror: MajVj.frame.nicofarre.MIRROR_ON_RIGHT,
    frames: [ { name: 'specticle', options: {
      color: [0.7, 0.2, 0.5, 1.0],
      controller: this._fftController
    } } ]
  });
  this._specticleOn = false;
  this._wired = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_FRONT_BOTH,
    mirror: MajVj.frame.nicofarre.MIRROR_ON_RIGHT,
    frames: [ {
      name: 'effect',
      options: {
        frames: ['wired'],
        effects: [ { name: 'glow' } ]
      }
    } ]
  });
  var propGlow = this._wired.getFrame(0).getEffect(0).properties;
  propGlow.volume = 1.0;
  propGlow.t = 0.0;
  this._wiredOn = false;
  this._train  = this._mv.create('frame', 'effect', {
    frames: [ {
      name: 'nicofarre3d',
      options: {
        draw: this._drawMoon.bind(this),
        modules: [ {
          name: 'train',
          options: { period: 1092 / 4 }
        }, {
          name: 'beams',
          options: {
            period: 500, //1092 * 4,
            unit: 1, //5,
            speed: 200,
            dir: MajVj.frame.nicofarre3d.modules.beams.DIR_B2F
          }
        }, {
          name: 'lines',
          options: { lines: 1 }
        } ]
      }
    } ],
    effects: [ {
      name: 'glow',
      options: { controller: this._glowController }
    } ]
  });
  this._propTrain = this._train.getFrame(0).properties;
  this._propTrain.train[0] = 5.0;
  this._propTrain.train[1] = 0.0;
  propGlow = this._train.getEffect(0).properties;
  propGlow.volume = 1.0;
  propGlow.t = 0.0;
  this._trainOn = false;
  this._ceil = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_CEILING,
    frames: [ { name: 'sandbox', options: { id: '18357.1' } } ]
  });
  this._ceilOn = false;
  this._flare = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_CEILING,
    frames: [ { name: 'sandbox', options: { id: '1674.0' } } ]
  });
  this._flareOn = false;
  this._poles = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_FRONT_BOTH,
    mirror: MajVj.frame.nicofarre.MIRROR_ON_RIGHT,
    frames: [ { name: 'sandbox', options: { id: '19698.3' } } ]
  });
  this._polesOn = false;

  this._moon = TmaModelPrimitives.createSphere(
      3, TmaModelPrimitives.SPHERE_METHOD_EVEN);
  if (MajVj.scene.perfume1mm._moon) {
    var moon = this._mv.screen().convertImage(MajVj.scene.perfume1mm._moon);
    for (var i = 0; i < moon.width * moon.height * 4; ++i)
      moon.data[i] /= 8;
    this._moon.setTexture(this._mv.screen().createTexture(
        moon, true, Tma3DScreen.FILTER_LINEAR));
  }

  // Setup sequencers.
  this._sequencer = new TmaSequencer();
  var serial = new TmaSequencer.SerialTask();
  this._sequencer.register(2000, serial);

  serial.append(new TmaSequencer.Task(300, function () {
    var skip = this._skip;
    if (skip)
      skip -= 2.3;
    if (this._sound)
      this._sound.play(MajVj.scene.perfume1mm._sound, 2, skip);
  }.bind(this)));

  var parallel = new TmaSequencer.ParallelTask();
  parallel.append(new TmaSequencer.Task(
      TmaSequencer.Task.INFINITE, this._signalTask.bind(this)));
  serial.append(parallel);

  var part = new TmaSequencer.SerialTask();
  parallel.append(part);
  part.append(new TmaSequencer.Task(2184));  // Drums
  part.append(new TmaSequencer.Task(0, function () {
    this._beamsOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // Intro
  part.append(new TmaSequencer.Task(0, function () {
    this._specticleOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // Intro + Bass
  part.append(new TmaSequencer.Task(0, function () {
    this._ceilOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // Intro + Melody
  part.append(new TmaSequencer.Task(0, function () {
    // A
    this._specticleOn = false;
    this._signalOn = false;
    this._beamsOn = false;
    this._screwOn = true;
    this._polesOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // A
  part.append(new TmaSequencer.Task(0, function () {
    // B
    this._screwOn = false;
    this._polesOn = false;
    this._ceilOn = false;
    this._wiredOn = true;
    this._tunnelOn = true;
    this._flareOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // B
  part.append(new TmaSequencer.Task(0, function () {
    // C
    this._flareOn = false;
    this._tunnelOn = false;
    this._screwOn = false;
    this._wiredOn = false;
    this._trainOn = true;
    this._signalOn = true;
    this._signalCeilingOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 16));  // C
  part.append(new TmaSequencer.Task(0, function () {
    // I
    this._signalCeilingOn = false;
    this._trainOn = false;
    this._screwOn = false;
    this._beamsOn = true;
    this._ceilOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // I
  part.append(new TmaSequencer.Task(0, function () {
    // A
    this._specticleOn = false;
    this._signalOn = false;
    this._beamsOn = false;
    this._screwOn = true;
    this._polesOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // A
  part.append(new TmaSequencer.Task(0, function () {
    // B
    this._screwOn = false;
    this._polesOn = false;
    this._wiredOn = true;
    this._tunnelOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // B
  part.append(new TmaSequencer.Task(0, function () {
    // C1
    this._tunnelOn = false;
    this._ceilOn = false;
    this._screwOn = false;
    this._wiredOn = false;
    this._trainOn = true;
    this._signalOn = true;
    this._signalCeilingOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // C1
  part.append(new TmaSequencer.Task(0, function () {
    // C2
    this._propTrain.train[0]  = 0.506;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // C2
  part.append(new TmaSequencer.Task(0, function () {
    // I1
    this._propTrain.train[0] = 0.50;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // I1
  var flyTask = new TmaSequencer.ParallelTask();
  flyTask.append(new TmaSequencer.Task(2184 * 16, this._flyTask.bind(this)));
  part.append(flyTask);  // I2

  this._sequencer.run(this._skip * 1000);
};

// Resources.
MajVj.scene.perfume1mm._sound = null;
MajVj.scene.perfume1mm._moon = null;

MajVj.scene.perfume1mm._shader19528 = ' \
precision mediump float; \
uniform float time; \
uniform vec2 resolution; \
float distance1(vec2 p1, vec2 p2){ \
        return max(abs((p2-p1).x),abs((p2-p1).y)); \
} \
void main(void) { \
        vec2 p = gl_FragCoord.xy/resolution.xx*2.-vec2(1.0,0.1); \
        gl_FragColor = distance1(p,vec2(0.0))*vec4(vec3((mod(.3/distance1(p,vec2(.0))+time*.1,.1)>cos(time+p.x)*0.05+0.05)^^(mod(atan(p.y,p.x)*7./22.+time*.1,.1)>sin(time+p.y)*0.05+0.05)),1.)*.4; \
}';

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.scene.perfume1mm.load = function () {
  return new Promise(function (resolve, reject) {
    /*
    Promise.all([
      sound.fetch('songs/1mm.mp3'),
      MajVj.loadImageFrom('images/moon.png')
    ]).then(function (resources) {
      scene.perfume1mm._sound = resources[0];
      scene.perfume1mm._moon = resources[1];
      resolve();
    }, function () { reject('scene.perfume1mm.load fails'); });
    */
    resolve();
  });
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.perfume1mm.prototype.draw = function (delta) {
  var fft = 0;
  if (this._sound) {
    var fftCount = this.properties.fftDb.length;
    this._sound.normalizeFrequencyData(
        this.properties.fftDb[(fftCount / 10)|0]);
  }
  this._propHarrier.harrier = fft / 10.0;
  this._sequencer.run(delta);
  var screen = this._mv.screen();
  screen.setAlphaMode(false);
  screen.fillColor(0.0, 0.0, 0.0, 1.0);
  screen.setAlphaMode(true, screen.gl.ONE, screen.gl.ONE);
  if (this._screwOn)
    this._screw.draw(delta);
  if (this._tunnelOn)
    this._tunnel.draw(delta);
  if (this._trainOn)
    this._train.draw(delta);
  if (this._signalOn) {
    this._signalL.draw(delta);
    this._signalR.draw(delta);
  }
  if (this._specticleOn)
    this._specticle.draw(delta);
  if (this._wiredOn)
    this._wired.draw(delta);
  if (this._polesOn)
    this._poles.draw(delta);
  if (this._beamsOn)
    this._beams.draw(delta);
  if (this._ceilOn)
    this._ceil.draw(delta);
  if (this._flareOn)
    this._flare.draw(delta);
  if (this._signalCeilingOn)
    this._signalC.draw(delta);
};

MajVj.scene.perfume1mm.prototype._signalTask = function (delta, time) {
  var t = time / 173.7;
  var s = Math.sin(t);
  var l = (s < 0) ? 0 : s;
  var r = (s < 0) ? -s : 0;
  var lgb = l / 4.0;
  var rgb = r / 4.0;
  this._signalL.getFrame(0).setColor([l, lgb, lgb, 1.0]);
  this._signalR.getFrame(0).setColor([r, rgb, rgb, 1.0]);
  this._signalC.getFrame(0).setColor([l + r, lgb + rgb, lgb + rgb, 1.0]);
};

MajVj.scene.perfume1mm.prototype._flyTask = function (delta, time) {
  this._propTrain.train[1] = time / 15000;
};

MajVj.scene.perfume1mm.prototype._drawMoon = function (api) {
  api.setAlphaMode(false);
  var r = this._propTrain.train[1];
  var y = (1 - r) * 3000;
  var z = -5000 + 2000 * r;
  api.drawPrimitive(this._moon, 1000, 1000, 1000,
                    [0, y, z],
                    [0, Math.PI / 2, 0]);
};

/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - computerbrain -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.computerbrain = function (options) {
  this._mv = options.mv;
  this.properties = {};

  this._stage = this._mv.create('frame', 'nicofarre', {
      led: MajVj.frame.nicofarre.LED_STAGE_AND_BACK,
      mirror: MajVj.frame.nicofarre.MIRROR_ON_LEFT,
      frames: [
          { name: 'sandbox', options: { id: '18922.0' } }
      ]});
  this._wall = this._mv.create('frame', 'nicofarre', {
      led: MajVj.frame.nicofarre.LED_WALL_BOTH,
      mirror: MajVj.frame.nicofarre.MIRROR_ON_RIGHT,
      frames: [
          { name: 'sandbox', options: { id: '18918.0' } }
      ]});
  this._side = this._mv.create('frame', 'nicofarre', {
      led: MajVj.frame.nicofarre.LED_FRONT_BOTH,
      mirror: MajVj.frame.nicofarre.MIRROR_ON_RIGHT,
      frames: [
          { name: 'sandbox', options: { id: '18451.0' } }
      ]});
  this._ceil = this._mv.create('frame', 'nicofarre', {
      led: MajVj.frame.nicofarre.LED_CEILING,
      frames: [
          { name: 'sandbox', options: { id: '18568.0' } }
      ]});
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.computerbrain.prototype.draw = function (delta) {
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  this._stage.draw(delta);
  this._wall.draw(delta);
  this._side.draw(delta);
  this._ceil.draw(delta);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - noisybase -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.noisybase = function (options) {
  this._mv = options.mv;
  this.properties = {
    slitter: 0.0,
    rgb: 0.0,
    color: 0.0,
    multi: 0.0,
    tube: 0.0,
    film: 0.0,
    noise1: 0.0,
    noise2: 0.0,
  };
  this._fbo = this._mv.screen().createFrameBuffer();
  this._frame = this._mv.create('frame', 'sandbox', { id: '14373.1' });
  this._effect = this._mv.create('effect', 'noise', {
      enable: [
        'scanline', 'raster', 'color', 'noise', 'slitscan', 'adjust',
        'tube', 'film'
      ]
  });
  this._effect.properties.noise_level[2] = 0;
  this._effect.properties.raster_level = 0;
  this._effect.properties.scanline_velocity = 0;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.noisybase.prototype.draw = function (delta) {
  var screen = this._fbo.bind();
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  this._frame.draw(delta);
  screen.bind();
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  var rgb = this.properties.rgb / 1000;
  this._effect.properties.color_shift[0] = -rgb;
  this._effect.properties.color_shift[2] = rgb;
  var c = 1 - this.properties.color / 127;
  this._effect.properties.color_level = [c, c, c];
  this._effect.properties.noise_level[0] = this.properties.noise1 / 128;
  this._effect.properties.noise_level[1] = this.properties.noise2 / 63;
  this._effect.properties.slitscan_size = 1 + this.properties.slitter;
  this._effect.properties.tube_adjust[0] = 1 - this.properties.tube / 127;
  this._effect.properties.tube_adjust[1] = 16 + this.properties.tube / 4;
  this._effect.properties.film_lines = (this.properties.film / 25) | 0;
  this._effect.properties.film_flash = this.properties.film / 96;
  var multi = 1 + (this.properties.multi / 16) | 0;
  this._effect.properties.adjust_repeat[0] = multi;
  this._effect.properties.adjust_repeat[1] = multi;
  this._effect.draw(delta, this._fbo.texture);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - lines -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.lines = function (options) {
  this._mv = options.mv;
  this.properties = { volume: 0.0 };

  this._frame = this._mv.create('frame', 'nicofarre3d', {
      draw: MajVj.scene.lines.draw3d.bind(this) });
};

/**
 * Get a random value for a position.
 * @return a random value from -50000 to 50000.
 */
MajVj.scene.lines._getRandomPosition = function () {
  return (Math.random() - 0.5) * 100000;
};

/**
 * A callback to draws a frame by using nicofarre3d API.
 * @param api nicofarre3d interfaces
 */
MajVj.scene.lines.draw3d = function (api) {
  var p = MajVj.scene.lines._getRandomPosition;
  api.setAlphaMode(true, api.gl.DST_COLOR, api.gl.ZERO);
  var rate = 0.95 + 0.049 * this.properties.volume;
  api.fill([rate, rate, rate, 1.0]);
  api.setAlphaMode(true, api.gl.ONE, api.gl.ONE);
  for (var i = 0; i < 128; ++i) {
    api.color = [Math.random(), Math.random(), Math.random(), Math.random()];
    api.drawLine([p(), p(), p()], [p(), p(), p()]);
  }
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.lines.prototype.draw = function (delta) {
  this._mv.screen().fillColor(0, 0, 0, 1);
  this._frame.draw(delta);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - white -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.white = function (options) {
  this._mv = options.mv;
  this.properties = {};
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.white.prototype.draw = function (delta) {
  this._mv.screen().pushAlphaMode();
  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(1.0, 1.0, 1.0, 1.0);
  this._mv.screen().popAlphaMode();
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - church -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.church = function (options) {
  this._mv = options.mv;
  this.properties = {};

  this._frame = this._mv.create('frame', 'nicofarre', {
      led: MajVj.frame.nicofarre.LED_WHOLE_WALLS,
      frames: [
          { name: 'sandbox', options: { shader: MajVj.scene.church.shader } }
      ]});
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.church.prototype.draw = function (delta) {
  this._mv.screen().setAlphaMode(false);
  this._frame.draw(delta);
};

// Fragment shader conforming the glsl sandbox.
MajVj.scene.church.shader = ' \
precision mediump float; \
uniform float time; \
uniform vec2 resolution; \
void main( void ) { \
  vec2 coord = gl_FragCoord.xy / resolution * 3.141592 * 2.0; \
  float dr = sin(coord.x * 10.0 + time * 3.0) - sin(coord.y + time * 10.0); \
  float dg = \
      sin(coord.x * 20.0 - time * 2.0) - sin(coord.y * 2.0 + time * 5.0); \
  float db = sin(coord.x * 15.0 - time) - sin(coord.y * 1.5 + time * 7.0); \
  float er = sin(coord.x * 12.0 + time * 5.0) - sin(coord.y + time * 11.0); \
  float eg = \
      sin(coord.x * 22.0 - time * 1.0) - sin(coord.y * 2.0 + time * 9.0); \
  float eb = \
      sin(coord.x * 32.0 - time * 4.0) - sin(coord.y * 1.5 + time * 3.0); \
  float r = dr * dg * er * eg; \
  float g = dg * db * eg * eb; \
  float b = db * dr * eb * er; \
  gl_FragColor = vec4(r, g, b, 1.0); \
}';
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - dreamcube -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.dreamcube = function (options) {
  this._mv = options.mv;
  this.properties = {};

  var nico3d = { name: 'nicofarre3d', options: { module: 'cube' } };
  this._frame = this._mv.create('frame', 'effect', {
      frames: [nico3d],
      effects: ['glow']});
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.dreamcube.prototype.draw = function (delta) {
  this._frame.draw(delta);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - noop -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.roll = function (options) {
  this._mv = options.mv;
  this.properties = {
    fftDb: new Float32Array(1024)
  }

  this._front = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_FRONT_BOTH,
    frames: [ {
      name: 'specticle',
      options: {
        random: 0.3,
        color: [0.1, 0.1, 0.3, 1.0]
      }
    } ]
  });
  this._front.getFrame(0).properties.fftDb = this.properties.fftDb;
  this._frame = this._mv.create('frame', 'nicofarre3d', {
      modules: [ {
        name: 'waypoints',
        options: {
          size: 8192,
          height: 4096,
          particles: 1000,
          waypoints: 16,
          wayspeed: 70,
          gravity: 10,
          range: 1000000,
          emit: 1
        }
      }, {
        name: 'roll',
        options: {
          script: options.script || MajVj.scene.roll._script,
          delay: 0,
          font: {
            size: 70,
            name: 'Sans',
            foreground: 'rgba(76, 38, 51, 200)',
            background: 'rgba(0, 0, 0, 255)'
          },
          headFont: {
            size: 90,
            name: 'Sans',
            foreground: 'rgba(76, 51, 76, 200)',
            background: 'rgba(0, 0, 0, 255)'
          }
        }
      } ]
  });
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.roll.prototype.draw = function (delta) {
  this._mv.screen().setAlphaMode(false);
  this._frame.draw(delta);
  this._front.draw(delta);
};

MajVj.scene.roll._script = [
  { head: true, text: 'End Roll' },
  { text: 'This is a sample script' },
  { text: '' },
  { text: 'by toyoshim' }
];
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - host -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.host = function (options) {
    this._type = options.type;
    this._name = options.name;
    this._path = options.path;
    this._map = options.map;
    this._mv = options.mv;
    this._frame = null;
    this.properties = {
        controls: new Array(128),  // MIDI control change
        fftDb: null,
        fft: null
    };
    MajVj.loadPlugin(this._type, this._name, this._path).then(() => {
        this._frame = this._mv.create(this._type, this._name, options.options);
        if (this._frame.properties.fftDb !== undefined)
            this.properties.fftDb = this._frame.properties.fftDb;
        if (this._frame.properties.fft !== undefined)
            this.properties.fft = this._frame.properties.fft;
    });
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.host.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Rewind to the first frame.
 */
MajVj.misc.host.prototype.rewind = function () {
  if (this._frame.rewind)
    this._frame.rewind();
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.misc.host.prototype.onresize = function (aspect) {
    if (this._frame && this._frame.onresize)
        this._frame.onresize();
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.misc.host.prototype.draw = function (delta) {
    if (!this._frame)
        return;
    for (var n in this._map) {
        if (this.properties.controls[n] === undefined)
            continue;
        var map = this._map[n];
        this._frame.properties[map.name] =
                map.offset + this.properties.controls[n] * map.scale;
    }
    this._frame.draw(delta);
};

/**
 * Shutdowns the frame.
 */
MajVj.misc.host.prototype.shutdown = function () {
  if (this._frame && this._frame.shutdown)
    this._frame.shutdown();
};

/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - camera -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.camera = function (options) {
    this._psrc = options.position || [ 0.0, 0.0, 0.0 ];
    this._pdst = options.position || [ 0.0, 0.0, 0.0 ];
    this._pv = [ 0.0, 0.0, 0.0 ];
    this._p = options.position || [ 0.0, 0.0, 0.0 ];
    this._ptime = 0;
    this._pduration = 0;
    this._pmode = options.mode || 'ease-in-out';

    this._rsrc = options.rotation || [ 0.0, 0.0, 0.0 ];
    this._rdst = options.rotation || [ 0.0, 0.0, 0.0 ];
    this._rv = [ 0.0, 0.0, 0.0 ];
    this._r = options.rotation || [ 0.0, 0.0, 0.0 ];
    this._rtime = 0;
    this._rduration = 0;
    this._rmode = options.mode || 'ease-in-out';

    this._PI = Math.PI;
    this._PIx2 = Math.PI * 2;
    this._atan2 = Math.atan2;
    this._sqrt = Math.sqrt;
    this._toDegree = 180 / Math.PI;
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.camera.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Moves camera position.
 * @param duration time duration to move to the destination (in msec)
 * @param destination absolute destination camera position
 */
MajVj.misc.camera.prototype.moveTo = function (duration, destination) {
    if (duration == 0) {
        this._p[0] = destination[0];
        this._p[1] = destination[1];
        this._p[2] = destination[2];
    }
    this._psrc[0] = this._p[0];
    this._psrc[1] = this._p[1];
    this._psrc[2] = this._p[2];
    this._pdst[0] = destination[0];
    this._pdst[1] = destination[1];
    this._pdst[2] = destination[2];
    this._pv[0] = this._pdst[0] - this._psrc[0];
    this._pv[1] = this._pdst[1] - this._psrc[1];
    this._pv[2] = this._pdst[2] - this._psrc[2];
    this._ptime = 0;
    this._pduration = duration;
};

/**
 * Moves camera position.
 * @param duration time duration to move to the destination (in msec)
 * @param destination relative destination camera position
 */
MajVj.misc.camera.prototype.moveBy = function (duration, destination) {
    this.moveTo(duration, [
        this._p[0] + destination[0],
        this._p[1] + destination[1],
        this._p[2] + destination[2]
    ]);
};

/**
 * Rotates camera position.
 * @param duration time duration to rotate to the destination (in msec)
 * @param destination absolute destination camera rotation
 */
MajVj.misc.camera.prototype.rotateTo = function (duration, destination) {
    var dst = [
        destination[0] % this._PIx2,
        destination[1] % this._PIx2,
        destination[2] % this._PIx2
    ];
    if (duration == 0) {
        this._r[0] = dst[0];
        this._r[1] = dst[1];
        this._r[2] = dst[2];
    }
    for (var i = 0; i < 3; ++i) {
        var diff = dst[i] - this._r[i];
        if (diff > this._PI)
            dst[i] -= this._PIx2;
        else if (diff < -this._PI)
            dst[i] += this._PIx2;
        if (i == 0) {
            if (dst[0] >= this._PI) {
                dst[0] -= this._PI;
                dst[1] = (this._PI - dst[1]) % this._PIx2;
            } else if (dst[0] <= -this._PI) {
                dst[0] += this._PI;
                dst[1] = (-this._PI - dst[1]) % this._PIx2;
            }
        }
    }
    this._rsrc[0] = this._r[0];
    this._rsrc[1] = this._r[1];
    this._rsrc[2] = this._r[2];
    this._rdst[0] = dst[0];
    this._rdst[1] = dst[1];
    this._rdst[2] = dst[2];
    this._rv[0] = this._rdst[0] - this._rsrc[0];
    this._rv[1] = this._rdst[1] - this._rsrc[1];
    this._rv[2] = this._rdst[2] - this._rsrc[2];
    this._rtime = 0;
    this._rduration = duration;
};

/**
 * Rotates camera position.
 * @param duration time duration to rotate to the destination (in msec)
 * @param destination relative destination camera rotation
 */
MajVj.misc.camera.prototype.rotateBy = function (duration, destination) {
    this.rotateTo(duration, [
        this._r[0] + destination[0],
        this._r[1] + destination[1],
        this._r[2] + destination[2]
    ]);
};

/**
 * Looks to the destination.
 * @param duration time duration to rotate to the destination (in msec)
 * @param destination absolute direction camera faces to
 */
MajVj.misc.camera.prototype.lookTo = function (duration, destination) {
    var d = destination;
    var yz = this._sqrt(d[1] * d[1] + d[2] * d[2]);
    this.rotateTo(duration, [
        -this._atan2(d[1], -d[2]),
        this._atan2(d[0], yz),
        0
    ]);
};

/**
 * Looks at the destination.
 * @param duration time duration to rotate to the destination (in msec)
 * @param destination absolute position camera looks at
 */
MajVj.misc.camera.prototype.lookAt = function (duration, destination) {
    this.lookTo(duration, [
        destination[0] - this._p[0],
        destination[1] - this._p[1],
        destination[2] - this._p[2]
    ]);
};

/**
 * Updates camera position.
 * @param delta delta time from the last rendering (in msec)
 */
MajVj.misc.camera.prototype.update = function (delta) {
    if (this._pduration != 0) {
        this._ptime += delta;
        var t = this._ptime / this._pduration;
        if (this._ptime > this._pduration) {
            this._pduration = 0;
            this._p[0] = this._pdst[0];
            this._p[1] = this._pdst[1];
            this._p[2] = this._pdst[2];
        } else {
            var tl = TmaTimeline.convert(this._pmode, t);
            this._p = [
                this._psrc[0] + this._pv[0] * tl,
                this._psrc[1] + this._pv[1] * tl,
                this._psrc[2] + this._pv[2] * tl
            ];
        }
    }
    if (this._rduration != 0) {
        this._rtime += delta;
        var t = this._rtime / this._rduration;
        if (this._rtime > this._rduration) {
            this._rduration = 0;
            this._r[0] = this._rdst[0] % this._PIx2;
            this._r[1] = this._rdst[1] % this._PIx2;
            this._r[2] = this._rdst[2] % this._PIx2;
        } else {
            var tl = TmaTimeline.convert(this._rmode, t);
            this._r = [
                (this._rsrc[0] + this._rv[0] * tl) % this._PIx2,
                (this._rsrc[1] + this._rv[1] * tl) % this._PIx2,
                (this._rsrc[2] + this._rv[2] * tl) % this._PIx2
            ];
        }
    }
};

/**
 * Obtains current camera position.
 * @return current camera position in [x, y, z]
 */
MajVj.misc.camera.prototype.position = function () {
    return this._p;
};

/**
 * Obtains current camera rotation.
 * @return current camera rotation in [x, y, z]
 */
MajVj.misc.camera.prototype.rotation = function () {
    return this._r;
};

/**
 * Obtains current camera orientation.
 * @return current camera orientation in [alpha, beta, gamma]
 */
MajVj.misc.camera.prototype.orientation = function () {
    return [
        -this._r[1] * this._toDegree,
        this._r[2] * this._toDegree,
        this._r[0] * this._toDegree - 90
    ];
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - sequencer -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.sequencer = function(options) {
  this._t = 0.0; // count in sound
  this._index = 0;
  // type:     'move', 'ease', 'ease-in', ease-in-out', 'ease-out', 'linear',
  //           or 'power' (other types defined in TmaTmaline may work too)
  // at:       start time in second
  // from:     start value (n/a for 'move')
  // to:       target value
  // duration: duration time in second
  // [
  //   { type: 'move', at: 0.0, to: 0.0 },
  //   { type: 'linear', at: 1.0, from: 0.0, to: 1.0, duration: 10.0 },
  //   { type: 'repeat', at: 10.0, rollback: 9.0 }  // rollback 9s at 10s
  // ]
  this._sequence = options.sequence;
  var types = ['ease', 'ease-in', 'ease-in-out', 'ease-out'];
  for (var i in types)
    this._prepareCache(types[i]);
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.sequencer.load = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
};

// TmaTimeline conver cache.
MajVj.misc.sequencer._cache = {};

/**
 * Generates automated value.
 * @param delta delta time from the last call (in msec)
 * @return generated value from 0 to 1
 */
MajVj.misc.sequencer.prototype.generate = function(delta) {
  this._t += delta / 1000;
  var result = 0;
  while (this._index < this._sequence.length) {
    var seq = this._sequence[this._index];
    if (seq.at > this._t)
      break;
    if (seq.type == 'repeat') {
      this._index = 0;
      this._t -= seq.rollback;
      continue;
    }
    if (seq.type == 'move') {
      result = seq.to;
    } else {
      var rate = (this._t - seq.at) / seq.duration;
      var volume = seq.to - seq.from;
      result = seq.from + volume * this._convert(seq.type, rate);
    }
    var next = this._index + 1;
    if (next >= this._sequence.length || this._sequence[next].at > this._t)
      break;
    this._index = next;
  }
  return result;
};

MajVj.misc.sequencer.prototype._prepareCache = function(type) {
  if (MajVj.misc.sequencer._cache[type])
    return;
  MajVj.misc.sequencer._cache[type] = [];
  for (var i = 0; i <= 1000; ++i) {
    MajVj.misc.sequencer._cache[type][i] = TmaTimeline.convert(type, i / 1000);
  }
};

MajVj.misc.sequencer.prototype._convert = function(type, rate) {
  if (rate <= 0.0)
    return 0.0;
  if (rate >= 1.0)
    return 1.0;
  if (MajVj.misc.sequencer._cache[type]) {
    var n = (rate * 1000) | 0;
    return MajVj.misc.sequencer._cache[type][n];
  }
  return TmaTimeline.convert(type, rate);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - midi -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.midi = function (options) {
    this._options = options;
};

// MIDIAccess and MIDIInputs shared in all instances.
MajVj.misc.midi.useSysex = MajVj.getSetting('misc', 'midi', 'useSysex', false);
MajVj.misc.midi.record = MajVj.getSetting('misc', 'midi', 'record', false);
MajVj.misc.midi.portmaps = [];
MajVj.misc.midi.devicemaps = [];
MajVj.misc.midi.keymap = [];
MajVj.misc.midi.messages = [];
MajVj.misc.midi._access = null;
MajVj.misc.midi._devices = {};
MajVj.misc.midi._inputs = [];
MajVj.misc.midi._output = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.midi.load = function () {
    return new Promise(function (resolve, reject) {
        navigator.requestMIDIAccess({ sysex: MajVj.misc.midi.useSysex }).then(
                function (a) {
            MajVj.misc.midi._access = a;
            for (var i = 0; i < 128; ++i)
                MajVj.misc.midi.keymap[i] = 0;
            MajVj.misc.midi._access.onstatechange =
                    MajVj.misc.midi._onStateChange;
            var ii = a.inputs.values();
            for (var input = ii.next(); !input.done; input = ii.next())
                MajVj.misc.midi._addInputDevice(input.value);
            var oi = a.outputs.values();
            for (var output = oi.next(); !output.done; output = oi.next())
                MajVj.misc.midi._output = output.value;
            resolve();
        }, function (e) {
            reject(e);
        });
    });
};

/**
 * Updates keymap by random triggers.
 */
MajVj.misc.midi.auto = function () {
    for (var i = 0; i < 128; ++i) {
        if (MajVj.misc.midi.keymap[i] > 0) {
            if (Math.random() > 0.99) {
                MajVj.misc.midi.keymap[i] = 0.0;
                if (MajVj.misc.midi._output) {
                    var data = [0x80, i, 0];
                    MajVj.misc.midi._output.send(data);
                }
            }
        }
        var p = (i > 4) ? i - 4 : 0;
        if (Math.random() + (MajVj.misc.midi.keymap[p] / 1024) > 0.9998) {
            MajVj.misc.midi.keymap[i] = (Math.random() * 128) | 0;
            if (MajVj.misc.midi._output) {
                var data = [0x90, i, MajVj.misc.midi.keymap[i]];
                MajVj.misc.midi._output.send(data);
            }
        }
    }
};

/**
 * Decays keymap values.
 */
MajVj.misc.midi.decay = function () {
    for (var i = 0; i < 128; ++i) {
        if (MajVj.misc.midi.keymap[i] > 0) {
            var value = (MajVj.misc.midi.keymap[i] * 0.99) | 0;
            if (value == 0)
                value = 1;
            MajVj.misc.midi.keymap[i] = value;
        }
    }
};

/**
 * Add MIDIInput and make it ready to use.
 * @param port MIDIInput port to be added
 */
MajVj.misc.midi._addInputDevice = function (port) {
    if (MajVj.misc.midi._devices[port.id] !== undefined)
        return;
    console.log(port);
    var index = MajVj.misc.midi._inputs.length;
    MajVj.misc.midi._devices[port.id] = index;
    MajVj.misc.midi._inputs[index] = port;
    MajVj.misc.midi.portmaps[index] = [];
    MajVj.misc.midi.devicemaps[index] = [];
    var i;
    for (i = 0; i < 128; ++i)
        MajVj.misc.midi.devicemaps[index][i] = 0;
    for (var ch = 0; ch < 16; ++ch) {
        MajVj.misc.midi.portmaps[index][ch] = [];
        for (i = 0; i < 128; ++i)
            MajVj.misc.midi.portmaps[index][ch][i] = 0;
    }
    port.onmidimessage = MajVj.misc.midi._onMidiMessage;
};

/**
 * Event handler for onstatechange of MIDIAccess.
 * @param e MIDIConnectionEvent
 */
MajVj.misc.midi._onStateChange = function (e) {
    if (e.port.type != "input")
        return;
    MajVj.misc.midi._addInputDevice(e.port);
};

/**
 * Event handler for onmidimessage of MIDIInput.
 * @param e MIDIMessageEvent
 */
MajVj.misc.midi._onMidiMessage = function (e) {
    var data = e.data;
    var type = data[0] & 0xf0;
    if (type != 0x90 && type != 0x80)
        return;
    var index = MajVj.misc.midi._devices[e.target.id];
    var ch = data[0] & 0x0f;
    var note = data[1];
    if (0x90 == type) {
        // Note ON
        MajVj.misc.midi.portmaps[index][ch][note] = data[2];
        MajVj.misc.midi.devicemaps[index][note] = data[2];
        MajVj.misc.midi.keymap[note] = data[2];
    } else if (0x80 == type) {
        // Note OFF
        MajVj.misc.midi.portmaps[index][ch][note] = 0;
        MajVj.misc.midi.devicemaps[index][note] = 0;
        MajVj.misc.midi.keymap[note] = 0;
    }
    if (MajVj.misc.midi.record) {
        MajVj.misc.midi.messages.push(data);
    }
};

/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - automator -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.automator = function (options) {
    this._options = options;
    this._mv = options.mv;
    this._t = 0.0;
    this._delta = 0.0;
    this._v = [0.0];
    this._o = [];
    this._random = Math.random;
    this._sin = Math.sin;
    this._last = 0.0;
    switch (this._options.type) {
    case 'randomly_gated_random':
        this._generate = this._randomlyGatedRandom.bind(this);
        break;
    case 'sine':
        this._generate = this._sine.bind(this);
        break;
    case 'vibration':
        this._generate = this._vibration.bind(this);
        break;
    case 'nested':
        for (var i = 0; i < this._options.options; ++i) {
            var opt = this._options.options[i];
            opt.mv = opt.mv || this._mv;
            this._o[i] = this._mv.create('misc', 'automator', opt);
        }
        this._generate = this._nested.bind(this);
        break;
    default:
        this._generate = function() { return 0; };
        break;
    }
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.automator.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Generates automated value.
 * @param delta delta time from the last call (in msec)
 * @return generated value from 0 to 1
 */
MajVj.misc.automator.prototype.generate = function (delta) {
    this._t += delta;
    this._delta = delta;
    return this._generate();
};

/**
 * Generates automated value for type 'randomly_gated_random'.
 * options.rate: how often should it be updated (0: never - 1: always)
 * options.offset: offset value that would be applied in |gate_rate| rate
 * options.volume: offset + volume * Math.random() is applied if it isn't gated
 * options.gate_rate: how often offset should be applied (0: never - 1: always)
 */
MajVj.misc.automator.prototype._randomlyGatedRandom = function () {
    var opt = this._options;
    var rnd = this._random;

    if (rnd() > opt.rate)
        return this._last;
    if (rnd() < opt.gate_rate)
        this._last = opt.offset;
    else
        this._last = opt.offset + opt.volume * rnd();
    return this._last;
};

/**
 * Generates automated value for type 'sine'.
 * options.rate: how often should it be updated (0: never -)
 * options.offset: offset value
 * options.volume: offset + volume * Math.sin() is applied
 */
MajVj.misc.automator.prototype._sine = function () {
    var opt = this._options;
    return opt.offset + this._sin(this._t * opt.rate) * opt.volume;
};

/**
 * Generates automated value for type 'vibration'.
 * options.rate: how often should it be updated (0: never -)
 * options.input[options.index]: input value
 * options.threshold: ignore if value is less than threshold
 * options.offset: offset value
 * options.volume: sine is mutiplied by volume-ish value
 * options.tension: how quicktly value affects input (0: never - 1: immediately)
 */
MajVj.misc.automator.prototype._vibration = function () {
    var opt = this._options;
    var v = opt.input[opt.index];
    if (v < opt.threshold)
        v = 0;
    var diff = v - this._v[0];
    this._v[0] += diff * opt.tension;
    var t = this._t * opt.rate;
    return opt.offset + this._sin(t) * opt.volume * this._v[0];
};

/**
 * Generates automated value for type 'nested'.
 * Everything depend on nested automators.
 */
MajVj.misc.automator.prototype._nested = function () {
    var v = 0;
    for (var i = 0; i < this._o.length; ++i)
        v += this._o[i].generate(this._delta);
    return v;
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - random -
 * based on Ken random's reference implementation of improved noise in Java.
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.random = function (options) {
  // Generates [min, max) or [min, max] if options.inclusive is true
  this._base = options.min || 0.0;
  var max = options.max !== undefined ? options.max : 1.0;
  this._scale = max - this._base;
  this._n = options.seed || 19760227;
  this._divisor = options.inclusive ? 0x7fffffff : 0x80000000;
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.random.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Generates a random value in [options.min, options.max), or
 * [options.min, options.max] if options.inclusive is true. |min| and |max|
 * should be specified together if caller want to overwrite options values.
 * @param min minimum value that overwrites options.min (optional)
 * @param max maximum value that overwrites options.max (optional)
 * @return a random value
 */
MajVj.misc.random.prototype.generate = function (min, max) {
  var base = this._base;
  var scale = this._scale;
  if (min !== undefined && max !== undefined) {
    base = min;
    scale = max - min;
  }
  var n = this._n;
  n = n ^ (n << 13);
  n = n ^ (n >> 17);
  n = n ^ (n << 5);
  this._n = n;
  n = (n & 0x7fffffff) / this._divisor;
  return base + n * scale;
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - sound -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.sound = function (options) {
    this._channel = options.channel || 1;
    this._audio = MajVj.misc.sound.context();
    this._gain = new Array(this._channel);
    for (var ch = 0; ch < this._channel; ++ch)
        this._gain[ch] = this._audio.createGain();
    this._splitter = this._audio.createChannelSplitter(2);
    this._analyserGain = this._audio.createGain();
    this._analyser = this._audio.createAnalyser();
    this._leftAnalyser = this._audio.createAnalyser();
    this._rightAnalyser = this._audio.createAnalyser();
    var fftSize = 2048;
    this._analyser.fftSize = fftSize;
    this._leftAnalyser.fftSize = fftSize;
    this._rightAnalyser.fftSize = fftSize;
    this._delay = this._audio.createDelay();
    if (options.delay)
        this._delay.delayTime.value = options.delay;
    this._buffer = new Array(this._channel);
    this._data = null;
    this._playing = 0;
    if (options.url)
        this.fetch(options.url, options.play);
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.sound.load = function () {
    return new Promise(function (resolve, reject) {
        if (!MajVj.misc.sound.useMicrophone) {
            resolve();
            return;
        }

        navigator.mediaDevices.getUserMedia({audio: true}).then(function (a) {
            MajVj.misc.sound._microphone = a;
            resolve();
        }.bind(this), function (e) {
            tma.warn('microphone is not available. continue...');
            resolve();
        });
    });
};

/**
 * Gets a common Web Audio context.
 * @return a Web Autio context
 */
MajVj.misc.sound.context = function () {
    if (!MajVj.misc.sound._context)
        MajVj.misc.sound._context = new AudioContext();
    return MajVj.misc.sound._context;
};

/**
 * Preloads a sound data.
 * @param url url from where a sound data will be loaded
 * @return a Promise object
 */
MajVj.misc.sound.prefetch = function (url) {
    return new Promise(function (resolve, reject) {
        tma.fetch(url).then(function (data) {
            MajVj.misc.sound.context().decodeAudioData(data, function (buffer) {
                resolve(buffer);
            }.bind(this), function (e) { tma.log(e); });
        }.bind(this), reject);
    }.bind(this));
};

// AudioContext shared in all instances.
MajVj.misc.sound.useMicrophone =
        MajVj.getSetting('misc', 'sound', 'useMicrophone', false);
MajVj.misc.sound._microphone = null;
MajVj.misc.sound._context = null;

/**
 * Loads a sound data.
 * @param url url from where a sound data will be loaded
 * @param play automatically once the data is ready
 * @return a Promise object
 */
MajVj.misc.sound.prototype.fetch = function (url, play) {
    // FIXME: |play| does not work when multiple fetch requests run.
    this._play = play || false;
    this._data = null;
    return new Promise(function (resolve, reject) {
        var promise = tma.fetch(url);
        promise.then(function (data) {
            this._audio.decodeAudioData(data, function (buffer) {
                this._data = buffer;
                if (this._play)
                    this.play();
                resolve(buffer);
            }.bind(this), function (e) { tma.log(e); });
        }.bind(this), reject);
    }.bind(this));
};

/**
 * Plays.
 * @param data an AudioBuffer object (optional: fetched data is used by default)
 * @param channel a channel to play (optional: 0)
 * @param offset in sec (optional: 0)
 * @return true if succeeded
 */
MajVj.misc.sound.prototype.play = function (data, channel, offset) {
    if (!this._data && !data)
        return false;
    var ch = channel || 0;
    if (ch >= this._channel)
        return false;
    this.stop(ch);
    this._buffer[ch] = this._audio.createBufferSource();
    this._buffer[ch].buffer = data || this._data;
    this._connect(ch, true, offset);
    return true;
};

/**
 * Capture from microphone.
 * @param chananel a channel for using a capture (optional: 0)
 * @return true if succeeded
 */
MajVj.misc.sound.prototype.capture = function (channel) {
    var ch = channel || 0;
    if (ch >= this._channel)
        return false;
    this.stop(ch);
    this._buffer[ch] =
            this._audio.createMediaStreamSource(MajVj.misc.sound._microphone);
    this._connect(ch, false);
    return true;
};

/**
 * Connects nodes for play or record.
 * (Restriction: on using multiple channels, audio destination will be
 * connected if one or more channels are used for audio playback)
 * @aram channel a channel to connect
 * @param play a flag to connect to the audio destination
 * @param offset in sec (optional: 0)
 */
MajVj.misc.sound.prototype._connect = function (ch, play, offset) {
    // buffer* +=> gain*        ==> delay    --> destination
    //         +=> analyserGain +-> analyser
    //                          +-> splitter +-> leftAnalyser
    //                                       +-> rightAnalyser
    this._buffer[ch].connect(this._gain[ch]);
    this._gain[ch].connect(this._delay);
    this._buffer[ch].connect(this._analyserGain);
    if (this._playing == 0) {
        this._analyserGain.connect(this._analyser);
        this._analyserGain.connect(this._splitter);
        this._splitter.connect(this._leftAnalyser, 0);
        this._splitter.connect(this._rightAnalyser, 1);
        if (play)
            this._delay.connect(this._audio.destination);
    }
    if (play)
        this._buffer[ch].start(0, offset || 0);
    this._playing++;
};

/**
 * Stops.
 * @param channel a channel to stop (optional: 0)
 */
MajVj.misc.sound.prototype.stop = function (channel) {
    var ch = channel || 0;
    if (ch > this._channel)
        return;
    if (!this._buffer[ch])
        return;
    if (this._buffer[ch].stop)
      this._buffer[ch].stop();
    this._buffer[ch].disconnect();
    this._gain[ch].disconnect();
    this._buffer[ch] = null;
    this._data = null;
    this._playing--;
    if (this._playing == 0) {
        this._analyserGain.disconnect();
        this._splitter.disconnect();
        this._delay.disconnect();
    }
};

/**
 * Sets sound gain.
 * @param gain a gain to set in float from 0.0 to 1.0
 * @param channel a channel to set (optional: 0)
 */
MajVj.misc.sound.prototype.setGain = function (gain, channel) {
    var ch = channel || 0;
    if (ch > this._channel)
        return;
    this._gain[ch].gain.value = gain;
};

/**
 * Sets analyser gain.
 * @param gain a gain to set in float from 0.0 to 1.0
 */
MajVj.misc.sound.prototype.setAnalyserGain = function (gain) {
    this._analyserGain.gain.value = gain;
};

/**
 * Sets sound delay.
 * @param delay a delay time in second.
 */
MajVj.misc.sound.prototype.setDelay = function (delay) {
    this._delay.delayTime.value = delay;
};

/**
 * Sets playback rate.
 * @param rate playback rate
 * @param channel a channel to set (optional: 0)
 */
MajVj.misc.sound.prototype.setPlaybackRate = function (rate, channel) {
    var ch = channel || 0;
    if (ch > this._channel || !this._buffer[ch] ||
            !this._buffer[ch].playbackRate) {  // for capture.
        return;
    }
    this._buffer[ch].playbackRate.value = rate;
};

/**
 * Gets an effective FFT item count.
 * The result can be used to allocate an ArrayBuffer as;
 *   var count = sound.getFftCount();
 *   var buffer = new Float32Array(count);
 *   sound.getByteFrequencyData(buffer);
 * buffer[0:count-1] caontains valid data.
 * @return a FFT length
 */
MajVj.misc.sound.prototype.getFftCount = function () {
    return this._analyser.frequencyBinCount;
};

/**
 * Normalizes a FFT result.
 * @param data a float value from -30 to -100 in dB
 * @return a float value almost from 0.0 to 1.0
 */
MajVj.misc.sound.prototype.normalizeFrequencyData = function (data) {
    var a = this._analyser;
    return (data - a.minDecibels) / (a.maxDecibels - a.minDecibels);
};

/**
 * Gets FFT results in Uint8Array.
 * @param laft an Uint8Array to receive a result for left channel, or merged
 * @param right an Uint8Array to receive a result for right channel (optional)
 */
MajVj.misc.sound.prototype.getByteFrequencyData = function (left, right) {
    if (!right) {
      this._analyser.getByteFrequencyData(left);
    } else {
      this._leftAnalyser.getByteFrequencyData(left);
      this._rightAnalyser.getByteFrequencyData(right);
    }
};

/**
 * Gets FFT results in Float32Array.
 * @param laft an Float32Array to receive a result for left channel, or merged
 * @param right an Float32Array to receive a result for right channel (optional)
 */
MajVj.misc.sound.prototype.getFloatFrequencyData = function (left, right) {
    if (!right) {
        this._analyser.getFloatFrequencyData(left);
    } else {
        this._leftAnalyser.getFloatFrequencyData(left);
        this._rightAnalyser.getFloatFrequencyData(right);
    }
};

/**
 * Gets time domain wave table count.
 * @return a time domain wave table length
 */
MajVj.misc.sound.prototype.getWaveTableCount = function () {
    return this._analyser.fftSize;
};

/**
 * Gets FFT results in Float32Array.
 * @param laft an Float32Array to receive a result for left channel, or merged
 * @param right an Float32Array to receive a result for right channel (optional)
 */
MajVj.misc.sound.prototype.getFloatWaveTable = function (left, right) {
    if (!right) {
        this._analyser.getFloatTimeDomainData(left);
    } else {
        this._leftAnalyser.getFloatTimeDomainData(left);
        this._rightAnalyser.getFloatTimeDomainData(right);
    }
};

/**
 * Checks if any channel plays.
 * @return true if plays
 */
MajVj.misc.sound.prototype.isPlaying = function () {
  return this._playing != 0;
};

/**
 * Checks if any playable data is ready.
 * @return true if it can play
 */
MajVj.misc.sound.prototype.isReady = function () {
  return this._data != null;
};
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

    this._divX = this.width / 2;
    this._divY = this.height / 2;
    this._strokeWeight = 1.0;
    this._subX = 1.0;
    this._subY = 1.0;
    this._background = [ 0.8, 0.8, 0.8, 1.0 ];
    this._basePosition =  [ 0.0, 0.0 ];
    this._baseSize = [ 1.0, 1.0 ];
    this._divColor = [ 255.0, 255.0, 255.0, 255.0 ];
    this._fill = [ 1.0, 1.0, 1.0, 1.0 ];
    this._stroke = [ 1.0, 1.0, 1.0, 1.0 ];
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
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - perlin -
 * based on Ken Perlin's reference implementation of improved noise in Java.
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.perlin = function (options) {
    this._options = options;
    this._p = MajVj.misc.perlin._permutation;
};

MajVj.misc.perlin._permutation = [
    151, 160, 137,  91,  90,  15, 131,  13,
    201,  95,  96,  53, 194, 233,   7, 225,
    140,  36, 103,  30,  69, 142,   8,  99,
     37, 240,  21,  10,  23, 190,   6, 148,
    247, 120, 234,  75,   0,  26, 197,  62,
     94, 252, 219, 203, 117,  35,  11,  32,
     57, 177,  33,  88, 237, 149,  56,  87,
    174,  20, 125, 136, 171, 168,  68, 175,
     74, 165,  71, 134, 139,  48,  27, 166,
     77, 146, 158, 231,  83, 111, 229, 122,
     60, 211, 133, 230, 220, 105,  92,  41,
     55,  46, 245,  40, 244, 102, 143,  54,
     65,  25,  63, 161,   1, 216,  80,  73,
    209,  76, 132, 187, 208,  89,  18, 169,
    200, 196, 135, 130, 116, 188, 159,  86,
    164, 100, 109, 198, 173, 186,   3,  64,
     52, 217, 226, 250, 124, 123,   5, 202,
     38, 147, 118, 126, 255,  82,  85, 212,
    207, 206,  59, 227,  47,  16,  58,  17,
    182, 189,  28,  42, 223, 183, 170, 213,
    119, 248, 152,   2,  44, 154, 163,  70,
    221, 153, 101, 155, 167,  43, 172,   9,
    129,  22,  39, 253,  19,  98, 108, 110,
     79, 113, 224, 232, 178, 185, 112, 104,
    218, 246,  97, 228, 251,  34, 242, 193,
    238, 210, 144,  12, 191, 179, 162, 241,
     81,  51, 145, 235, 249,  14, 239 ,107,
     49, 192, 214,  31, 181, 199, 106, 157,
    184,  84, 204, 176, 115, 121,  50,  45,
    127,   4, 150, 254, 138, 236, 205,  93,
    222, 114,  67,  29,  24,  72, 243, 141,
    128, 195,  78,  66, 215,  61, 156, 180
];

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.perlin.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Returns a corresponding perlin noise value to the location.
 * @param x X location
 * @param y Y location
 * @param z Z location
 * @return a perlin noise value
 */
MajVj.misc.perlin.prototype.noise = function (x, y, z) {
    var X = Math.floor(x) & 255;
    var Y = Math.floor(y) & 255;
    var Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    var u = this._fade(x);
    var v = this._fade(y);
    var w = this._fade(z);
    var A = this._p[X] + Y;
    var AA = this._p[A % 256] + Z;
    var AB = this._p[(A + 1) % 256] + Z;
    var B = this._p[(X + 1) % 256] + Y;
    var BA = this._p[B % 256] + Z;
    var BB = this._p[(B + 1) % 256] + Z;

    return this._lerp(w,
                      this._lerp(v,
                                 this._lerp(u,
                                            this._grad(this._p[AA % 256],
                                                       x,
                                                       y,
                                                       z),
                                            this._grad(this._p[BA % 256],
                                                       x - 1,
                                                       y,
                                                       z)),
                                 this._lerp(u,
                                            this._grad(this._p[AB % 256],
                                                       x,
                                                       y - 1,
                                                       z),
                                            this._grad(this._p[BB % 256],
                                                       x - 1,
                                                       y - 1,
                                                       z))),
                      this._lerp(v,
                                 this._lerp(u,
                                            this._grad(this._p[(AA + 1) % 256],
                                                       x,
                                                       y,
                                                       z - 1),
                                            this._grad(this._p[(BA + 1) % 256],
                                                       x - 1,
                                                       y,
                                                       z - 1)),
                                 this._lerp(u,
                                            this._grad(this._p[(AB + 1) % 256],
                                                       x,
                                                       y - 1,
                                                       z - 1),
                                            this._grad(this._p[(BB + 1) % 256],
                                                       x - 1,
                                                       y - 1,
                                                       z - 1))));
}

MajVj.misc.perlin.prototype._fade = function (t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

MajVj.misc.perlin.prototype._lerp = function (t, a, b) {
    return a + t * (b - a);
}

MajVj.misc.perlin.prototype._grad = function (hash, x, y, z) {
    var h = hash & 15;
    var u = h < 8 ? x : y;
    var v = h < 4 ? y : h == 12 || h == 14 ? x : z;
    return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
}/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - sandbox -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.sandbox = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {
      mouse: [0.5, 0.5]
    };
    this._time = 0;
    this._program = null;
    if (options.id)
        this.setShader(options.id);
    else if (options.shader)
        this.setShader(options.shader);
    this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
};

// Shader programs.
MajVj.frame.sandbox._vertexShader = null;
MajVj.frame.sandbox._fragmentShaders = {};

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.sandbox.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19291.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18918.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18922.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18916.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18713.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18613.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18568.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18451.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19297.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18759.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19336.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18981.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18543.2'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19674.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19624.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18357.1'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18794.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '1674.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19689.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19528.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19698.3'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19454.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '14282.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '14373.1'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19512.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19150.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '19136.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18981.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18873.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18770.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18760.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18602.4'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18602.4t'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '18142.0'),
            MajVj.loadShader('frame', 'sandbox', 'shaders.html', '17945.0')
        ]).then(function (results) {
            MajVj.frame.sandbox._vertexShader = results[0];
            MajVj.frame.sandbox._fragmentShaders['19291.0'] = results[1];
            MajVj.frame.sandbox._fragmentShaders['18918.0'] = results[2];
            MajVj.frame.sandbox._fragmentShaders['18922.0'] = results[3];
            MajVj.frame.sandbox._fragmentShaders['18916.0'] = results[4];
            MajVj.frame.sandbox._fragmentShaders['18713.0'] = results[5];
            MajVj.frame.sandbox._fragmentShaders['18613.0'] = results[6];
            MajVj.frame.sandbox._fragmentShaders['18568.0'] = results[7];
            MajVj.frame.sandbox._fragmentShaders['18451.0'] = results[8];
            MajVj.frame.sandbox._fragmentShaders['19297.0'] = results[9];
            MajVj.frame.sandbox._fragmentShaders['18759.0'] = results[10];
            MajVj.frame.sandbox._fragmentShaders['19336.0'] = results[11];
            MajVj.frame.sandbox._fragmentShaders['18981.0'] = results[12];
            MajVj.frame.sandbox._fragmentShaders['18543.2'] = results[13];
            MajVj.frame.sandbox._fragmentShaders['19674.0'] = results[14];
            MajVj.frame.sandbox._fragmentShaders['19624.0'] = results[15];
            MajVj.frame.sandbox._fragmentShaders['18357.1'] = results[16];
            MajVj.frame.sandbox._fragmentShaders['18794.0'] = results[17];
            MajVj.frame.sandbox._fragmentShaders['1674.0'] = results[18];
            MajVj.frame.sandbox._fragmentShaders['19689.0'] = results[19];
            MajVj.frame.sandbox._fragmentShaders['19528.0'] = results[20];
            MajVj.frame.sandbox._fragmentShaders['19698.3'] = results[21];
            MajVj.frame.sandbox._fragmentShaders['19454.0'] = results[22];
            MajVj.frame.sandbox._fragmentShaders['14282.0'] = results[23];
            MajVj.frame.sandbox._fragmentShaders['14373.1'] = results[24];
            MajVj.frame.sandbox._fragmentShaders['19512.0'] = results[25];
            MajVj.frame.sandbox._fragmentShaders['19150.0'] = results[26];
            MajVj.frame.sandbox._fragmentShaders['19136.0'] = results[27];
            MajVj.frame.sandbox._fragmentShaders['18981.0'] = results[28];
            MajVj.frame.sandbox._fragmentShaders['18873.0'] = results[29];
            MajVj.frame.sandbox._fragmentShaders['18770.0'] = results[30];
            MajVj.frame.sandbox._fragmentShaders['18760.0'] = results[31];
            MajVj.frame.sandbox._fragmentShaders['18602.4'] = results[32];
            MajVj.frame.sandbox._fragmentShaders['18602.4t'] = results[33];
            MajVj.frame.sandbox._fragmentShaders['18142.0'] = results[34];
            MajVj.frame.sandbox._fragmentShaders['17945.0'] = results[35];
            resolve();
        }, function (error) { tma.log(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.sandbox.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.sandbox.prototype.draw = function (delta) {
    this._time += delta / 1000;
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setUniformVector('time', [this._time]);
    this._program.setUniformVector('mouse', this.properties.mouse);
    this._program.setUniformVector('resolution', [this._width, this._height]);
    // TODO: backbuffer
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};

/**
 * Sets a fragment shader.
 * @param shader a fragment shader or preset name
 */
MajVj.frame.sandbox.prototype.setShader = function (name) {
    var shader = MajVj.frame.sandbox._fragmentShaders[name];
    if (!shader)
        shader = name;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.sandbox._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER, shader));
};

/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - crlogo -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.crlogo = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = { knob: 0.0, slider: 0.0 };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.crlogo._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.crlogo._fragmentShader));
    this._pMatrix = mat4.create();
    this._mvMatrix = mat4.identity(mat4.create());
    this._rotate = 0.0;

    var logo = MajVj.frame.crlogo._logos[0];
    this._vertices = this._screen.createBuffer(logo.vertices);
    this._vertices.items = logo.items;
    this._offsets = this._screen.createBuffer(logo.offsets);
    this._colors = this._screen.createBuffer(logo.colors);
    this._ps = new MajVj.frame.crlogo.ps(this, 0);

    this.onresize(this._aspect);
};

/**
 * Creates logo data
 * @param path resource file relative path from the plugin directory
 */
MajVj.frame.crlogo._createLogo = function (path) {
    return new Promise(function (resolve, reject) {
        MajVj.loadImage('frame', 'crlogo', path).then(function (image) {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            var context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, image.width, image.height);

            var bitmap = context.getImageData(
                    0, 0, image.width, image.height).data;
            var getPixel = function (x, y) {
                var ix = x|0;
                var iy = y|0;
                if (ix < 0 || iy < 0 ||
                        ix >= canvas.width || iy >= canvas.height)
                    return [ 0.0, 0.0, 0.0, 0.0 ];
                var index = iy * image.width + ix;
                var base = index * 4;
                return [bitmap[base + 0] / 255,
                        bitmap[base + 1] / 255,
                        bitmap[base + 2] / 255,
                        bitmap[base + 3] / 255];
            };

            var size = Math.max(image.width, image.height);
            var offset_x = (image.width - size) / 2;
            var offset_y = (image.height - size) / 2;
            var resolution = 48;
            var zoom = 4;
            var step = size / resolution;

            var y = offset_y;
            var data = [];
            for (var index_y = 0; index_y < resolution; ++index_y) {
                var x = offset_x;
                for (var index_x = 0; index_x < resolution; ++index_x) {
                    var c = getPixel(x, y);
                    x += step;
                    var px = index_x - resolution / 2 - 0.5;
                    var py = resolution / 2 - index_y - 0.5;
                    px *= zoom;
                    py *= zoom;
                    if ((c[0] > 0.7 && c[1] > 0.7 && c[2] > 0.7) ||
                            (c[0] < 0.3 && c[1] < 0.3 && c[2] < 0.3) ||
                            c[3] < 0.3) {
                        data.push([px, py, 1.0, 1.0, 1.0, 0.0]);
                    } else {
                        data.push([px, py, c[0], c[1], c[2], c[3]]);
                    }
                }
                y += step;
            }
            var length = data.length;
            var vertices = MajVj.frame.crlogo._createVertices(data);
            var items = MajVj.frame.crlogo._resolution * 3 * length;
            var offsets = MajVj.frame.crlogo._createOffsets(data);
            var colors = MajVj.frame.crlogo._createColors(data);
            resolve({
                raw: data,
                vertices: vertices,
                items: items,
                offsets: offsets,
                colors: colors
            });
        }, function (error) { reject(error); });
    });
};

/**
 * Creates vertices data
 * @param data created particle data.
 * @return vertices data
 */
MajVj.frame.crlogo._createVertices = function (data) {
    var circleLength = MajVj.frame.crlogo._circle.length;
    var length = circleLength * data.length;
    var vertices = new Array(length);
    for (var i = 0; i < length; i += circleLength) {
        for (var j = 0; j < circleLength; ++j)
            vertices[i + j] = MajVj.frame.crlogo._circle[j];
    }
    return vertices;
};

/**
 * Creates offsets data
 * @param data created particle data.
 * @return offsets data
 */
MajVj.frame.crlogo._createOffsets = function (data) {
    var points = MajVj.frame.crlogo._resolution * 3;
    var length = data.length * 3 * points;
    var offsets = new Array(length);
    for (var i = 0; i < data.length; i++) {
        var point = data[i];
        var base = i * 3 * points;
        for (var j = 0; j < 3 * points; j += 3) {
            offsets[base + j + 0] = point[0];
            offsets[base + j + 1] = point[1];
            offsets[base + j + 2] = 0.0;
        }
    }
    return offsets;
};

/**
 * Creates colors data
 * @param data created particle data.
 * @return colors data
 */
MajVj.frame.crlogo._createColors = function (data) {
    var points = MajVj.frame.crlogo._resolution * 3;
    var length = data.length * 4 * points;
    var colors = new Array(length);
    for (var i = 0; i < data.length; i++) {
        var point = data[i];
        var base = i * 4 * points;
        for (var j = 0; j < 4 * points; j += 4) {
            colors[base + j + 0] = point[2];
            colors[base + j + 1] = point[3];
            colors[base + j + 2] = point[4];
            colors[base + j + 3] = point[5];
        }
    }
    return colors;
};


// Shader programs.
MajVj.frame.crlogo._vertexShader = null;
MajVj.frame.crlogo._fragmentShader = null;

// Logo data.
MajVj.frame.crlogo._logos = [];

// Circle resolution.
MajVj.frame.crlogo._resolution = 4;

// Circle vertices.
MajVj.frame.crlogo._circle = (function () {
    var circle = [];
    var resolution = MajVj.frame.crlogo._resolution;
    for (var i = 0; i < resolution; ++i) {
        circle = circle.concat([0.0, 0.0, 0.0]);
        var w = 2.0 * Math.PI * i / resolution;
        circle = circle.concat([ Math.cos(w), Math.sin(w), 0.0 ]);
        w = 2.0 * Math.PI * (i + 1) / resolution;
        circle = circle.concat([ Math.cos(w), Math.sin(w), 0.0 ]);
    }
    return circle;
})();

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.crlogo.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'crlogo', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'crlogo', 'shaders.html', 'fragment'),
            MajVj.frame.crlogo._createLogo('logo0.jpg'),
            MajVj.frame.crlogo._createLogo('logo1.jpg')
            // Add other logos here.
        ]).then(function (results) {
            MajVj.frame.crlogo._vertexShader = results[0];
            MajVj.frame.crlogo._fragmentShader = results[1];
            MajVj.frame.crlogo._logos[0] = results[2];
            MajVj.frame.crlogo._logos[1] = results[3];
            // Store other logo data here.
            resolve();
        }, function (error) { reject(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.crlogo.prototype.onresize = function (aspect) {
    mat4.perspective(this._pMatrix, 45, aspect, 0.1, 1000.0);
    mat4.translate(this._pMatrix, this._pMatrix, [ 0.0, 0.0, -250.0 ]);
    mat4.rotate(this._pMatrix, this._pMatrix, this._rotate, [ 0.1, 0.2, 0.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.crlogo.prototype.draw = function (delta) {
    this._program.setUniformMatrix('uMVMatrix', this._mvMatrix);
    var rotate = 0.002 * delta * (0.5 + this.properties.slider * 1.5);
    this._rotate += rotate;
    mat4.rotate(this._pMatrix, this._pMatrix, rotate, [ 0.1, 0.2, 0.0 ]);

    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    this._program.setAttributeArray(
            'aVertexPosition', this._vertices, 0, 3, 0);
    this._program.setAttributeArray('aVertexOffset', this._offsets, 0, 3, 0);
    this._program.setAttributeArray('aColor', this._colors, 0, 4, 0);
    this._program.drawArrays(
            Tma3DScreen.MODE_TRIANGLES, 0, this._vertices.items);
    this._ps.update(delta);
};

MajVj.frame.crlogo.ps = function(parent, index) {
    // Function aliases for speed optimization.
    this._random = Math.random;
    this._PI = Math.PI;
    this._sin = Math.sin;
    this._cos = Math.cos;
    this._pow = Math.pow;

    this._parent = parent;
    this._index = index;
    this._data = MajVj.frame.crlogo._logos[index].raw;
    this._mode = 0;
    this._autoCount = 0;
    this._morph = false;
    this._morphSrc = null;
    this._morphDst = null;
    this._morphSpeed = 0.0;
    this._morphCount = 0.0;
    this._morphIndex = 0;
    this._length = this._data.length;
    this._x = new Float32Array(this._length);
    this._y = new Float32Array(this._length);
    this._z = new Float32Array(this._length);
    this._bx = new Float32Array(this._length);
    this._by = new Float32Array(this._length);
    this._bz = new Float32Array(this._length);
    this._vx = new Float32Array(this._length);
    this._vy = new Float32Array(this._length);
    this._vz = new Float32Array(this._length);
    this._gx = 0.0;
    this._gy = 0.0;
    this._gz = 0.0;
    this._rx = 0.0;
    this._ry = 0.0;
    for (var i = 0; i < this._length; ++i) {
        var p = this._data[i];
        this._x[i] = p[0];
        this._y[i] = p[1];
        this._z[i] = 0.0;
        this._bx[i] = p[0];
        this._by[i] = p[1];
        this._bz[i] = 0.0;
        this._vx[i] = 0.0;
        this._vy[i] = 0.0;
        this._vz[i] = 0.0;
    }
};

MajVj.frame.crlogo.ps.prototype.crash = function () {
    this._mode = 0;
    for (var i = 0; i < this._length; ++i) {
        this._vx[i] = this._random() * 100 - 50;
        this._vy[i] = this._random() * 100 - 50;
        this._vz[i] = this._random() * 100 - 50;
    }
};

MajVj.frame.crlogo.ps.prototype.pilot = function () {
    if (this._autoCount > 0) {
        this._autoCount--;
        return;
    }
    var timeout = Math.random() * 100 /
            (this._parent.properties.knob * 2.2 + 0.2);

    this._mode = Math.floor(Math.random() * 4);
    if (this._mode == 0)
        timeout *= 1.6;
    this._autoCount = Math.floor(timeout);
    if (this._mode == 2)
        this.crash();
    if (this._mode == 3)
        this.autoMorph(false);
};

MajVj.frame.crlogo.ps.prototype.autoMorph = function (force) {
    if (!force && Math.random() > 0.1) {
        this._mode = 0;
        return;
    }
    if (this._morph)
        return;
    var src = this._morphIndex;
    this._morphIndex++;
    if (this._morphIndex == MajVj.frame.crlogo._logos.length)
        this._morphIndex = 0;
    var dst = this._morphIndex;
    this.morph(MajVj.frame.crlogo._logos[src].colors,
            MajVj.frame.crlogo._logos[dst].colors, 0.3);
    this._mode = 0;
};

MajVj.frame.crlogo.ps.prototype.morph = function (src, dst, speed) {
    if (src.length != dst.length) {
        tma.log('image size is different');
        return;
    }
    this._morphSrc = src;
    this._morphDst = dst;
    this._morphCount = 0;
    this._morphSpeed = speed;
    this._morph = true;
};

MajVj.frame.crlogo.ps.prototype.update = function (delta) {
    this.pilot();
    if (this._morph) {
        this._morphCount += this._morphSpeed * delta;
        var ratio = this._morphCount / 1000;
        if (ratio >= 1.0) {
            ratio = 1.0;
            this._morph = false;
        }
        var colors = this._parent._colors.buffer();
        var sr = 1.0 - ratio;
        var dr = ratio;
        var length = this._morphSrc.length;
        for (var i = 0; i < length; ++i)
            colors[i] = this._morphSrc[i] * sr + this._morphDst[i] * dr;
        this._parent._colors.update();
    }

    var buffer = this._parent._offsets.buffer();
    var points = MajVj.frame.crlogo._resolution * 3;
    var i;
    this._rx += 0.0002 * delta;
    this._ry += 0.0004 * delta;
    var radx = 2.0 * this._PI * this._rx / 360;
    var rady = 2.0 * this._PI * this._ry / 360;
    this._gx = this._sin(radx) * this._sin(rady);
    this._gy = this._cos(radx);
    this._gz = -this._sin(radx) * this._cos(rady);
    if (this._mode == 0) {
        var t1 = this._pow(0.9, delta / 30);
        var t2 = 0.01 *  delta / 30;
        for (i = 0; i < this._length; ++i) {
            this._vx[i] *= t1;
            this._vy[i] *= t1;
            this._vz[i] *= t1;
            this._vx[i] += (this._bx[i] - this._x[i]) * t2;
            this._vy[i] += (this._by[i] - this._y[i]) * t2;
            this._vz[i] += (this._bz[i] - this._z[i]) * t2;
        }
    } else {
        var gx = this._gx * delta / 30;
        var gy = this._gy * delta / 30;
        var gz = this._gz * delta / 30;
        var range = 100.0;
        for (i = 0; i < this._length; ++i) {
            if (this._x[i] < -range || range < this._x[i])
                this._vx[i] *= -1.0;
            else
                this._vx[i] += gx;
            if (this._y[i] < -range || range < this._y[i])
                this._vy[i] *= -1.0;
            else
                this._vy[i] += gy;
            if (this._z[i] < -range || range < this._z[i])
                this._vz[i] *= -1.0;
            else
                this._vz[i] += gz;
        }
    }
    var dst = 0;
    var zoom = 1.0;
    if (window['player'] && player['average'])
        zoom = 1.0 + (player.average / 10.0);
    for (i = 0; i < this._length; ++i) {
        this._x[i] += this._vx[i];
        this._y[i] += this._vy[i];
        this._z[i] += this._vz[i];
        for (var point = 0; point < points; point++) {
            buffer[dst + 0] = this._x[i] * zoom;
            buffer[dst + 1] = this._y[i] * zoom;
            buffer[dst + 2] = this._z[i] * zoom;
            dst += 3;
        }
    }
    this._parent._offsets.update();
};
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
    this._vertexCount = 0;
    this._vertices = null;
    this.properties = {
        vertexCount: options.vertexCount || 1024,
        resolution: options.resolution || [ this._width, this._height ],
        mouse: options.mouse || [ 0, 0 ],
        background: options.background || [ 0.0, 0.0, 0.0, 1.0 ],
        mode: options.mode || Tma3DScreen.MODE_POINTS,
        time: 0.0,
        sound: options.sound || new Uint8Array(1024),
        soundHistory: options.soundHistory || new Uint8Array(1024 * 240),
        floatSound: options.floatSound || new Float32Array(1024),
        floatSoundHistory:
                options.floatSoundHistory || new Float32Array(1024 * 240),
        soundRes: [ 1024, 240 ],
        update : {
            mouse: options.updateMouse !== false,
            time: options.updateTime !== false,
            soundHistory: options.soundHistory === undefined,
            floatSoundHistory: options.floatSoundHistory === undefined,
        }
    };
    this._touch = this._screen.createFloatTexture(
            new Float32Array(32 * 240 * 4), 32, 240, false);
    this._sound = this._screen.createAlphaTexture(
            this.properties.soundHistory, 1024, 240, false,
            Tma3DScreen.FILTER_LINEAR);
    this._floatSound = this._screen.createAlphaFloatTexture(
            this.properties.floatSoundHistory, 1024, 240, false,
            Tma3DScreen.FILTER_LINEAR);
};

MajVj.frame.vertexshaderart._vheader = ' \
        attribute float vertexId; \
        uniform float vertexCount; \
        uniform vec2 resolution; \
        uniform vec2 mouse; \
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

MajVj.frame.vertexshaderart.updateSoundHistory = function (h, n) {
    var i;
    for (i = 1024 * 240 - 1; i >= 1024; --i)
        h[i] = h[i - 1024];
    for (; i >= 0; --i)
        h[i] = n[i];
};

MajVj.frame.vertexshaderart.updateFloatSoundHistory = function (h, n) {
    var i;
    for (i = 1024 * 240 - 1; i >= 1024; --i)
        h[i] = h[i - 1024];
    for (; i >= 0; --i)
        h[i] = n[i];
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

    if (this.properties.update.mouse) {
        var mouse = this._screen.mouse();
        if (!mouse.over) {
            mouse.x = mouse.width / 2;
            mouse.y = mouse.height / 2;
        }
        this.properties.mouse[0] = -1 + mouse.x * 2 / mouse.width;
        this.properties.mouse[1] = -1 + mouse.y * 2 / mouse.height;
    }

    // TODO: Update touch information.

    if (this.properties.update.time)
        this.properties.time += delta;

    var i;
    if (this.properties.update.soundHistory) {
        MajVj.frame.vertexshaderart.updateSoundHistory(
                this.properties.soundHistory,
                this.properties.sound);
    }
    this._sound.update(this.properties.soundHistory);
    if (this.properties.update.floatSoundHistory) {
        MajVj.frame.vertexshaderart.updateFloatSoundHistory(
                this.properties.floatSoundHistory,
                this.properties.floatSound);
    }
    this._floatSound.update(this.properties.floatSoundHistory);

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
    this._program.setUniformVector('mouse', this.properties.mouse);
    this._program.setTexture('touch', this._touch);
    this._program.setUniformVector('time', [ this.properties.time / 1000 ]);
    this._program.setTexture('sound', this._sound);
    this._program.setTexture('floatSound', this._floatSound);
    this._program.setUniformVector('soundRes', this.properties.soundRes);
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
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.nicofarre3d = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {};
    this._clearCallback = options.clear;
    this._drawCallback = options.draw;
    this._modules = [];
    this._api = {
      clear: this._clear.bind(this),
      color: [1.0, 1.0, 1.0, 1.0],
      createFont: this._createFont.bind(this),
      createTexture: this._screen.createTexture.bind(this._screen),
      delta: 0.0,
      drawBox: this._drawBox.bind(this),
      drawCharacter: this._drawCharacter.bind(this),
      drawCube: this._drawCube.bind(this),
      drawLine: this._drawLine.bind(this),
      drawPrimitive: this._drawPrimitive.bind(this),
      fill: this._fill.bind(this),
      gl: this._screen.gl,
      screen: this._screen,
      setAlphaMode: this._screen.setAlphaMode,
    };

    this._screenProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre3d._vScreenShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre3d._fScreenShader));
    this._drawProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre3d._vDrawShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre3d._fDrawShader));
    this._textureProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre3d._vTextureShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre3d._fTextureShader));
    this._pointProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre3d._vPointShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre3d._fPointShader));
    this._coords = this._screen.createBuffer([
            // A (right): (40, 760) - (1520, 1040) / (1920, 1080)
            40 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            // B (stage): (40, 120) - (880, 400) / (1920, 1080)
            40 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // C (left): (40, 440) - (1520, 720) / (1920, 1080)
            40 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // D (back): (920, 120) - (1760, 400) / (1920, 1080)
            920 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            920 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // E (stage right): (1560, 760) - (1720, 1040) / (1920, 1080)
            1560 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            1560 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            // F (stage left): (1560, 440) - (1720, 720) / (1920, 1080)
            1560 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            1560 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 440 / 1080 * 2 - 1]);
    this._texCoods = this._screen.createBuffer([
            0, 0, 0, 1, 1, 1, 1, 0,    // A: 1480
            0, 0, 0, 1, 1, 1, 1, 0,    // B: 840
            0, 0, 0, 1, 1, 1, 1, 0,    // C: 1480
            0, 0, 0, 1, 1, 1, 1, 0,    // D: 840
            0, 0, 0, 1, 1, 1, 1, 0,    // E: 160
            0, 0, 0, 1, 1, 1, 1, 0]);  // F: 160
    var scale = this._width / 1920;  // FIXME: check if it works
    var height = 280 * this._height / 1080;
    this._fboRight = this._screen.createFrameBuffer(1480 * scale, height);
    this._fboStage = this._screen.createFrameBuffer(840 * scale, height);
    this._fboLeft = this._screen.createFrameBuffer(1480 * scale, height);
    this._fboBack = this._screen.createFrameBuffer(840 * scale, height);

    var theta0 = Math.atan(1480 / 840);
    var theta1 = Math.PI - theta0 * 2;
    var theta2 = Math.PI - theta1;
    var scale1 = [840 / 280, 840 / 280, 1];
    var scale2 = [1480 / 280, 1480 / 280, 1];
    this._iMatrix = mat4.identity(mat4.create());
    this._pMatrixRight = mat4.scale(
            mat4.create(),
            mat4.perspective(mat4.create(), theta2, 1480 / 280, 420, 100000),
            scale2);
    this._pMatrixStage = mat4.scale(
            mat4.create(),
            mat4.perspective(mat4.create(), theta1, 840 / 280, 740, 100000),
            scale1);
    this._pMatrixLeft = mat4.scale(
            mat4.create(),
            mat4.perspective(mat4.create(), theta2, 1480 / 280, 420, 100000),
            scale2);
    this._pMatrixBack = mat4.scale(
            mat4.create(),
            mat4.perspective(mat4.create(), theta1, 840 / 280, 740, 100000),
            scale1);
    this._mvMatrixRight =
            mat4.rotateY(mat4.create(), this._iMatrix, Math.PI / 2);
    this._mvMatrixStage = mat4.clone(this._iMatrix);
    this._mvMatrixLeft =
            mat4.rotateY(mat4.create(), this._iMatrix, -Math.PI / 2);
    this._mvMatrixBack =
            mat4.rotateY(mat4.create(), this._iMatrix, -Math.PI);
    this._matrix = mat4.create();

    this._buffer2 = this._screen.createBuffer(new Array(2 * 3));
    this._bufferICoord = this._screen.createBuffer(
            [-1, -1, 1, -1, 1, 1, 1, 1, 1, 1, -1, 1]);
    this._box = TmaModelPrimitives.createBox();
    this._cube = TmaModelPrimitives.createCube();

    if (options.module) {
        var opt = options.options || {};
        opt.screen = this._screen;
        opt.api = this._api;
        opt.properties = this.properties;
        this._modules[0] =
                new MajVj.frame.nicofarre3d.modules[options.module](opt);
    } else if (options.modules) {
        for (var i = 0; i < options.modules.length; ++i) {
            var module = options.modules[i];
            var opt = module.options || {};
            opt.screen = this._screen;
            opt.api = this._api;
            opt.properties = this.properties;
            this._modules[i] =
                    new MajVj.frame.nicofarre3d.modules[module.name](opt);
        }
    }
};

// Sub modules that draw frames using nicofarre3d API.
MajVj.frame.nicofarre3d.modules = {};

// Shader programs.
MajVj.frame.nicofarre3d._vScreenShader = null;
MajVj.frame.nicofarre3d._fScreenShader = null;
MajVj.frame.nicofarre3d._vDrawShader = null;
MajVj.frame.nicofarre3d._fDrawShader = null;
MajVj.frame.nicofarre3d._vTextureShader = null;
MajVj.frame.nicofarre3d._fTextureShader = null;
MajVj.frame.nicofarre3d._vPointShader = null;
MajVj.frame.nicofarre3d._fPointShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.nicofarre3d.load = function () {
    return new Promise(function (resolve, reject) {
        var name = 'nicofarre3d';
        var path = 'shaders.html';
        Promise.all([
                MajVj.loadShader('frame', name, path, 'v_screen'),
                MajVj.loadShader('frame', name, path, 'f_screen'),
                MajVj.loadShader('frame', name, path, 'v_draw'),
                MajVj.loadShader('frame', name, path, 'f_draw'),
                MajVj.loadShader('frame', name, path, 'v_texture'),
                MajVj.loadShader('frame', name, path, 'f_texture'),
                MajVj.loadShader('frame', name, path, 'v_point'),
                MajVj.loadShader('frame', name, path, 'f_point'),
                MajVj.loadScript('frame', name, 'cube.js'),
                MajVj.loadScript('frame', name, 'waypoints.js'),
                MajVj.loadScript('frame', name, 'beams.js'),
                MajVj.loadScript('frame', name, 'train.js'),
                MajVj.loadScript('frame', name, 'lines.js'),
                MajVj.loadScript('frame', name, 'harrier.js'),
                MajVj.loadScript('frame', name, 'roll.js')
        ]).then(function (results) {
            MajVj.frame.nicofarre3d._vScreenShader = results[0];
            MajVj.frame.nicofarre3d._fScreenShader = results[1];
            MajVj.frame.nicofarre3d._vDrawShader = results[2];
            MajVj.frame.nicofarre3d._fDrawShader = results[3];
            MajVj.frame.nicofarre3d._vTextureShader = results[4];
            MajVj.frame.nicofarre3d._fTextureShader = results[5];
            MajVj.frame.nicofarre3d._vPointShader = results[6];
            MajVj.frame.nicofarre3d._fPointShader = results[7];
            resolve();
        }, function () { reject('nicofarre3d.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.nicofarre3d.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.nicofarre3d.prototype.draw = function (delta) {
    this._screen.pushAlphaMode();
    var screen = this._fboRight.bind();

    this._api.delta = delta;
    if (this._clearCallback)
        this._clearCallback(this._api)
    else if (this._modules.length > 0)
        this._modules[0].clear(this._api);
    for (var i = 0; i < this._modules.length; ++i)
        this._modules[i].draw(this._api);
    if (this._drawCallback)
        this._drawCallback(this._api);

    screen.bind();
    this._screen.popAlphaMode();
    this._screenProgram.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._screenProgram.setAttributeArray('aTexCoord', this._texCoods, 0, 2, 0);
    this._screenProgram.setTexture('uTexture', this._fboRight.texture);
    this._screenProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    this._screenProgram.setTexture('uTexture', this._fboStage.texture);
    this._screenProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 4, 4);
    this._screenProgram.setTexture('uTexture', this._fboLeft.texture);
    this._screenProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 8, 4);
    this._screenProgram.setTexture('uTexture', this._fboBack.texture);
    this._screenProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 12, 4);
};

/**
 * Clears all displays.
 * @param flag flag, e.g., gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT
 */
MajVj.frame.nicofarre3d.prototype._clear = function (flag) {
    this._screen.gl.clearColor(this._api.color[0], this._api.color[1],
                               this._api.color[2], this._api.color[3]);
    this._fboRight.bind();
    this._screen.gl.clear(flag);
    this._fboStage.bind();
    this._screen.gl.clear(flag);
    this._fboLeft.bind();
    this._screen.gl.clear(flag);
    this._fboBack.bind();
    this._screen.gl.clear(flag);
};

/**
 * Draws a box to all displays.
 * @param w width
 * @param h height
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 * @param texture texture (optional)
 */
MajVj.frame.nicofarre3d.prototype._drawBox = function (w, h, p, r, texture) {
    this._box.setTexture(texture);
    return this._drawPrimitive(this._box, w, h, 1.0, p, r);
};

/**
 * Draws a character to all displays.
 * @param font a font set that is created by createFont API
 * @param c a character to show
 * @param w width scale (actual size depends on font size)
 * @param h height scale (actual size depends on font size)
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 */
MajVj.frame.nicofarre3d.prototype._drawCharacter =
        function (font, c, w, h, p, r) {
    var texture = font[c];
    this._box.setTexture(texture);
    var width = texture.width * w;
    var height = texture.height * h;
    return this._drawPrimitive(this._box, width, height, 1.0, p, r);
};

/**
 * Draws a cube to all displays.
 * @param w width
 * @param h height
 * @param d depth
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 */
MajVj.frame.nicofarre3d.prototype._drawCube = function (w, h, d, p, r) {
    return this._drawPrimitive(this._cube, w, h, d, p, r);
};

/**
 * Draws a line to all displays.
 * @param src source position in [x, y, z]
 * @param dst destination position in [x, y, z]
 */
MajVj.frame.nicofarre3d.prototype._drawLine = function (src, dst) {
    var buffer = this._buffer2.buffer();
    buffer[0] = src[0]; buffer[1] = src[1]; buffer[2] = src[2];
    buffer[3] = dst[0]; buffer[4] = dst[1]; buffer[5] = dst[2];
    this._buffer2.update();
    this._drawProgram.setAttributeArray('aCoord', this._buffer2, 0, 3, 0);
    this._drawProgram.setUniformVector('uColor', this._api.color);
    this._drawProgram.setUniformMatrix('uMatrix', this._iMatrix);

    this._fboRight.bind();
    this._drawProgram.setUniformMatrix('uPMatrix', this._pMatrixRight);
    this._drawProgram.setUniformMatrix('uMVMatrix', this._mvMatrixRight);
    this._drawProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);

    this._fboStage.bind();
    this._drawProgram.setUniformMatrix('uPMatrix', this._pMatrixStage);
    this._drawProgram.setUniformMatrix('uMVMatrix', this._mvMatrixStage);
    this._drawProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);

    this._fboLeft.bind();
    this._drawProgram.setUniformMatrix('uPMatrix', this._pMatrixLeft);
    this._drawProgram.setUniformMatrix('uMVMatrix', this._mvMatrixLeft);
    this._drawProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);

    this._fboBack.bind();
    this._drawProgram.setUniformMatrix('uPMatrix', this._pMatrixBack);
    this._drawProgram.setUniformMatrix('uMVMatrix', this._mvMatrixBack);
    this._drawProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);
};

/**
 * Draws a primitive to all displays.
 * @param o primitive
 * @param w width
 * @param h height
 * @param d depth
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 */
MajVj.frame.nicofarre3d.prototype._drawPrimitive = function (o, w, h, d, p, r) {
    var texture = o.getTexture();
    var mode = o.getDrawMode();
    var point = mode == Tma3DScreen.MODE_POINTS;
    var program = texture ? this._textureProgram :
                  point ? this._pointProgram : this._drawProgram;
    program.setAttributeArray(
            'aCoord', o.getVerticesBuffer(this._screen), 0, 3, 0);
    if (texture) {
        program.setAttributeArray(
               'aTexCoord', o.getCoordsBuffer(this._screen), 0, 2, 0);
        program.setTexture('uTexture', texture);
    } else if (point) {
        program.setAttributeArray(
                'aColor', o.getColorsBuffer(this._screen), 0, 4, 0);
    } else {
        program.setUniformVector('uColor', this._api.color);
    }

    mat4.translate(this._matrix, this._iMatrix, p);
    if (r) {
        if (typeof r[0] === 'number') {
            // TODO: Remove this useless mod. Exist just for compat.
            mat4.rotateX(this._matrix, this._matrix, r[0]);
            mat4.rotateY(this._matrix, this._matrix, r[1]);
            mat4.rotateZ(this._matrix, this._matrix, r[2]);
        } else {
            for (var i = r.length - 1; i >= 0; --i) {
                var rotate = r[i];
                mat4.rotateX(this._matrix, this._matrix, rotate[0]);
                mat4.rotateY(this._matrix, this._matrix, rotate[1]);
                mat4.rotateZ(this._matrix, this._matrix, rotate[2]);
            }
        }
    }
    mat4.scale(this._matrix, this._matrix, [w, h, d]);
    program.setUniformMatrix('uMatrix', this._matrix);

    this._fboRight.bind();
    if (texture) program.setTexture('uTexture', texture);
    program.setUniformMatrix('uPMatrix', this._pMatrixRight);
    program.setUniformMatrix('uMVMatrix', this._mvMatrixRight);
    program.drawElements(mode, o.getIndicesBuffer(this._screen), 0, o.items());

    this._fboStage.bind();
    if (texture) program.setTexture('uTexture', texture);
    program.setUniformMatrix('uPMatrix', this._pMatrixStage);
    program.setUniformMatrix('uMVMatrix', this._mvMatrixStage);
    program.drawElements(mode, o.getIndicesBuffer(this._screen), 0, o.items());

    this._fboLeft.bind();
    if (texture) program.setTexture('uTexture', texture);
    program.setUniformMatrix('uPMatrix', this._pMatrixLeft);
    program.setUniformMatrix('uMVMatrix', this._mvMatrixLeft);
    program.drawElements(mode, o.getIndicesBuffer(this._screen), 0, o.items());

    this._fboBack.bind();
    if (texture) program.setTexture('uTexture', texture);
    program.setUniformMatrix('uPMatrix', this._pMatrixBack);
    program.setUniformMatrix('uMVMatrix', this._mvMatrixBack);
    program.drawElements(mode, o.getIndicesBuffer(this._screen), 0, o.items());
};

/**
 * Fills display textures.
 * @param color a color in [r, g, b, a]
 */
MajVj.frame.nicofarre3d.prototype._fill = function (color) {
    var c = color || this._api.color;
    this._drawProgram.setAttributeArray('aCoord', this._bufferICoord, 0, 3, 0);
    this._drawProgram.setUniformVector('uColor', c);
    this._drawProgram.setUniformMatrix('uPMatrix', this._iMatrix);
    this._drawProgram.setUniformMatrix('uMVMatrix', this._iMatrix);
    this._drawProgram.setUniformMatrix('uMatrix', this._iMatrix);
    this._fboRight.bind();
    this._drawProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    this._fboStage.bind();
    this._drawProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    this._fboLeft.bind();
    this._drawProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    this._fboBack.bind();
    this._drawProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};

/**
 * Creates a font context.
 * @param font font information for Tma3DScreen.prototype.createStringTexture()
 * @param text a string that contains characters
 */
MajVj.frame.nicofarre3d.prototype._createFont = function (font, text) {
    var result = {};
    // FIXME: Support surrogate code pairs
    for (var i = 0; i < text.length; ++i)
        result[text[i]] = this._screen.createStringTexture(text[i], font);
    return result;
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - signal -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.signal = function (options) {
    this._mv = options.mv;
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {
      color: options.color || [1.0, 0.0, 0.0, 1.0]
    };
    this._coord = options.coord || [0.0, 0.0, 0.001];
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.signal._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.signal._fragmentShader));
    this._coords = this._screen.createBuffer(this._coord);
};

// Shader programs.
MajVj.frame.signal._vertexShader = null;
MajVj.frame.signal._fragmentShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.signal.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'signal', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'signal', 'shaders.html', 'fragment')
        ]).then(function (results) {
            MajVj.frame.signal._vertexShader = results[0];
            MajVj.frame.signal._fragmentShader = results[1];
            resolve();
        }, function (error) { tma.log(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.signal.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.signal.prototype.draw = function (delta) {
    this._screen.setAlphaMode(true, this._screen.gl.ONE, this._screen.gl.ONE);
    this._program.setAttributeArray('aCoord', this._coords, 0, 3, 0);
    this._program.setUniformVector('uColor', this.properties.color);
    this._program.drawArrays(Tma3DScreen.MODE_POINTS, 0, 1);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - effect -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.effect = function (options) {
    this._screen = options.screen;
    this._mv = options.mv;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {};

    var create = function (type, args) {
        var frame = args;
        var opts = {};
        if (typeof args != 'string') {
            opts = args.options || {};
            frame = args.name;
        }
        opts.width = opts.width || this._width;
        opts.height = opts.height || this._height;
        opts.aspect = opts.aspect || this._aspect;
        opts.screen = this._screen;
        opts.mv = this._mv;
        return options.mv.create(type, frame, opts);
    }.bind(this);

    var i;
    this._frames = [];
    for (i = 0; i < options.frames.length; ++i)
        this._frames[i] = create('frame', options.frames[i]);
    this._effects = [];
    for (i = 0; i < options.effects.length; ++i)
        this._effects[i] = create('effect', options.effects[i]);

    this._fbo = [];
    var screen = this._screen;
    this._fbo[0] = screen.createFrameBuffer(this._width, this._height);
    if (options.effects.length > 1)
        this._fbo[1] = screen.createFrameBuffer(this._width, this._height);
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.effect.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.effect.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    var size = this._mv.size();
    this._width = size.width;
    this._height = size.height;
    var i;
    for (i = 0; i < this._fbo.length; ++i) {
        this._fbo[i] =
            this._screen.createFrameBuffer(this._width, this._height);
    }
    for (i = 0; i < this._frames.length; ++i)
        this._frames[i].onresize(aspect);
    for (i = 0; i < this._effects.length; ++i)
        this._effects[i].onresize(aspect);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.effect.prototype.draw = function (delta) {
    var fbo = this._fbo[0].bind();
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(false);
    this._screen.fillColor(0.0, 0.0, 0.0, 1.0);
    var i;
    for (i = 0; i < this._frames.length; ++i)
        this._frames[i].draw(delta);
    var last = this._effects.length - 1;
    for (i = 0; i <= last; ++i) {
        if (i == last)
            fbo.bind();
        else
            this._fbo[(i + 1) % 2].bind();
        this._screen.fillColor(0.0, 0.0, 0.0, 1.0);
        this._effects[i].draw(delta, this._fbo[i % 2].texture);
    }
    this._screen.popAlphaMode();
};

/**
 * Gets a frame plugin internally created
 * @return a frame plugin object
 */
MajVj.frame.effect.prototype.getFrame = function (i) {
    return this._frames[i];
};

/**
 * Gets a effect plugin internally created
 * @return a effect plugin object
 */
MajVj.frame.effect.prototype.getEffect = function (i) {
    return this._effects[i];
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - photoframe -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.photoframe = function(options) {
  this.properties = {};
  this._data = [];
  this._mv = options.mv;
  var data = options.data || [];
  for (var i = 0; i < data.length; ++i) {
    this._data[i] = {
      frame: this._mv.create(
          'frame', data[i].type, { url: data[i].url, rate: data[i].rate }),
      x: this._createAutomation(data[i].x, 0),
      y: this._createAutomation(data[i].y, 0),
      scale: this._createAutomation(data[i].scale, 1),
      volume: this._createAutomation(data[i].volume, 1)
    };
  }
};

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.photoframe.load = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.photoframe.prototype.onresize = function(aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.photoframe.prototype.draw = function(delta) {
  for (var i = 0; i < this._data.length; ++i) {
    var data = this._data[i];
    data.frame.properties.scroll[0] = data.x.generate(delta);
    data.frame.properties.scroll[1] = data.y.generate(delta);
    data.frame.properties.scale =  data.scale.generate(delta);
    data.frame.properties.volume = data.volume.generate(delta);
    if (data.frame.properties.volume)
      data.frame.draw(delta);
  }
};

MajVj.frame.photoframe.prototype._createAutomation =
    function(data, fallbackConstant) {
  if (!data)
    return { generate: function (delta) { return fallbackConstant; } };
  if (data[0].type != 'properties')
    return this._mv.create('misc', 'sequencer', { sequence: data });
  return {
    generate: (delta) => {
      return data[0].offset + this.properties[data[0].name] * data[0].scale;
    }
  };
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - rolline -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.rolline = function (options) {
    this._screen = options.screen;
    this._aspect = options.aspect;
    this.properties = { keymap: [] };
    var i;
    for (i = 0; i < 128; ++i)
        this.properties.keymap[i] = (Math.random() * 127) | 0;
    this._time = 0.0;

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.rolline._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.rolline._fragmentShader));
    var points = new Array(6 * 128);
    for (i = 0; i < points.length; ++i) points[i] = 0.0;
    this._lines = this._screen.createBuffer(points);
    this._lines.items = 128 * 2;
    var colors = new Array(6 * 128);
    for (i = 0; i < colors.length; ++i) colors[i] = 0.0;
    this._colors = this._screen.createBuffer(colors);

    this._pMatrix = mat4.identity(mat4.create());
    this.onresize(this._aspect);
};

// Shader programs.
MajVj.frame.rolline._vertexShader = null;
MajVj.frame.rolline._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.rolline.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'rolline', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'rolline', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.rolline._vertexShader = shaders[0];
            MajVj.frame.rolline._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('rolline.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.rolline.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(this._pMatrix, Math.PI / 4, this._aspect, 0.1, 1000.0);
    mat4.translate(this._pMatrix, this._pMatrix, [ 0.0, 0.0, -3.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.rolline.prototype.draw = function (delta) {
    this._time += delta;
    var t = this._time / 10000.0;
    var points = this._lines.buffer();
    var colors = this._colors.buffer();
    for (var i = 0; i < 128; ++i) {
        t += 0.02;
        var offset = i * 6;
        var r = t * 10;
        var x = Math.sin(t + 7 * Math.cos(t + Math.sin(t)));
        var y = Math.cos(t + 3 * Math.sin(Math.cos(t)));
        var dx = Math.cos(r);
        var dy = Math.sin(r);
        dx *= this.properties.keymap[i] / 32.0;
        dy *= this.properties.keymap[i] / 32.0;
        points[offset + 0] = x + dx;
        points[offset + 1] = y + dy;
        points[offset + 2] = 0.0;
        points[offset + 3] = x - dx;
        points[offset + 4] = y - dy;
        points[offset + 5] = 0.0;
        var rgb = TmaScreen.HSV2RGB((t + i) % 360, 1.0, 1.0);
        rgb.r /= 256.0;
        rgb.g /= 256.0;
        rgb.b /= 256.0;
        colors[offset + 0] = rgb.r;
        colors[offset + 1] = rgb.g;
        colors[offset + 2] = rgb.b;
        colors[offset + 3] = rgb.r;
        colors[offset + 4] = rgb.g;
        colors[offset + 5] = rgb.b;
    }
    this._lines.update();
    this._colors.update();
    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    this._program.setAttributeArray(
            'aVertexPosition', this._lines, 0, 3, 0);
    this._program.setAttributeArray(
            'aVertexColor', this._colors, 0, 3, 0);
    this._program.drawArrays(Tma3DScreen.MODE_LINES, 0, this._lines.items);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - astalight -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.astalight = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = { keymap: [], volume: 0.0 };
    for (var i = 0; i < 128; ++i)
        this.properties.keymap[i] = 0.0;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.astalight._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.astalight._fragmentShader));
    this._pMatrix = mat4.create();
    this._mvMatrix = mat4.create();
    this._rotate = 0.0;
    this._alpha = 1.0;
    var zoom = 4;
    var brightness = 1.0;
    if (options.brightness)
        brightness = options.brightness;
    if (options.zoom)
        zoom = options.zoom;
    if (options.image) {
        this._texture = this._screen.createTexture(
                this._screen.convertImage(options.image),
                true,
                Tma3DScreen.FILTER_LINEAR);
    } else {
        this._texture = this._screen.createStringTexture(
                String.fromCharCode(65290), {
                size: 300,
                name: 'Serif',
                foreground: 'rgba(255, 100, 200, 255)',
                background: 'rgba(0, 0, 0, 255)' }, {
                width: 256,
                height: 256 });
    }
    var data = MajVj.frame.astalight._createData(this._texture, zoom, brightness);
    this._vertices = this._screen.createBuffer(data.vertices);
    this._vertices.items = data.items;
    this._offsets = this._screen.createBuffer(data.offsets);
    this._colors = this._screen.createBuffer(data.colors);
    this._ps = new MajVj.frame.astalight.ps(this);

    this.onresize(this._aspect);
    mat4.identity(this._mvMatrix);
};

/**
 * Creates data
 * @param texture source texture object
 * @param zoom texture zoom
 */
MajVj.frame.astalight._createData = function (texture, zoom, brightness) {
    var bitmap = texture.image.data;
    var size = texture.image.width;
    var resolution = 64;
    var step = size / resolution;
    var d = resolution / 2;

    var data = [];
    for (var y = 0; y < resolution; ++y) {
        for (var x = 0; x < resolution; ++x) {
            var offset = (y * size + x) * step * 4;
            var r = bitmap[offset + 0] / 255 * brightness;
            var g = bitmap[offset + 1] / 255 * brightness;
            var b = bitmap[offset + 2] / 255 * brightness;
            if (r == 0 && g == 0 && b == 0)
                continue;
            data.push([(x - d) * zoom, (d - y) * zoom, r, g, b]);
        }
    }
    var length = data.length;
    var vertices = MajVj.frame.astalight._createVertices(length);
    var items = vertices.length / 3;
    var offsets = MajVj.frame.astalight._createOffsets(data);
    var colors = MajVj.frame.astalight._createColors(data);
    return {
        raw: data,
        vertices: vertices,
        items: items,
        offsets: offsets,
        colors: colors
    };
};

/**
 * Creates vertices data
 * @param squares number of squares
 * @return vertices data
 */
MajVj.frame.astalight._createVertices = function (squares) {
    var points = 6;
    var length = points * 3;
    var vertices = new Array(length * squares);
    var size = 2.0;
    for (var i = 0; i < squares; i++) {
        var offset = i * length;
        vertices[offset +  0] = -size;
        vertices[offset +  1] = -size;
        vertices[offset +  2] =  0.0;
        vertices[offset +  3] = -size;
        vertices[offset +  4] =  size;
        vertices[offset +  5] =  0.0;
        vertices[offset +  6] =  size;
        vertices[offset +  7] =  size;
        vertices[offset +  8] =  0.0;
        vertices[offset +  9] =  size;
        vertices[offset + 10] =  size;
        vertices[offset + 11] =  0.0;
        vertices[offset + 12] =  size;
        vertices[offset + 13] = -size;
        vertices[offset + 14] =  0.0;
        vertices[offset + 15] = -size;
        vertices[offset + 16] = -size;
        vertices[offset + 17] =  0.0;
    }
    return vertices;
};

/**
 * Creates offsets data
 * @param data created particle data.
 * @return offsets data
 */
MajVj.frame.astalight._createOffsets = function (data) {
    var points = 6;
    var length = data.length * 3 * points;
    var offsets = new Array(length);
    for (var i = 0; i < data.length; i++) {
        var point = data[i];
        var base = i * 3 * points;
        for (var j = 0; j < 3 * points; j += 3) {
            offsets[base + j + 0] = point[0];
            offsets[base + j + 1] = point[1];
            offsets[base + j + 2] = 0.0;
        }
    }
    return offsets;
};

/**
 * Creates colors data
 * @param data created particle data.
 * @return colors data
 */
MajVj.frame.astalight._createColors = function (data) {
    var points = 6;
    var length = data.length * 4 * points;
    var colors = new Array(length);
    for (var i = 0; i < data.length; i++) {
        var point = data[i];
        var base = i * 4 * points;
        for (var j = 0; j < 4 * points; j += 4) {
            colors[base + j + 0] = point[2];
            colors[base + j + 1] = point[3];
            colors[base + j + 2] = point[4];
            colors[base + j + 3] = 1.0;
        }
    }
    return colors;
};

// Shader programs.
MajVj.frame.astalight._vertexShader = null;
MajVj.frame.astalight._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.astalight.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'astalight', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'astalight', 'shaders.html', 'fragment'),
        ]).then(function (results) {
            MajVj.frame.astalight._vertexShader = results[0];
            MajVj.frame.astalight._fragmentShader = results[1];
            resolve();
        }, function (error) { reject(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.astalight.prototype.onresize = function (aspect) {
    mat4.perspective(this._pMatrix, Math.PI / 4, aspect, 0.1, 1000.0);
    mat4.translate(this._pMatrix, this._pMatrix, [ 0.0, 0.0, -200.0 ]);
    mat4.rotate(this._pMatrix, this._pMatrix, this._rotate, [ 0.1, 0.2, 0.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.astalight.prototype.draw = function (delta) {
    this._ps.update(delta);
    this._program.setUniformMatrix('uMVMatrix', this._mvMatrix);
    var rotate = 0.002 * delta;
    this._rotate += rotate;
    mat4.rotate(this._pMatrix, this._pMatrix, rotate, [ 0.1, 0.2, 0.0 ]);
    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    this._program.setUniformVector('uAlpha', [this._alpha]);
    this._program.setTexture('uTexture', this._texture);
    this._program.setAttributeArray(
            'aVertexPosition', this._vertices, 0, 3, 0);
    this._program.setAttributeArray('aVertexOffset', this._offsets, 0, 3, 0);
    this._program.setAttributeArray('aColor', this._colors, 0, 4, 0);
    this._program.drawArrays(
            Tma3DScreen.MODE_TRIANGLES, 0, this._vertices.items);
};

MajVj.frame.astalight.ps = function(parent) {
    // Function aliases for speed optimization.
    this._random = Math.random;
    this._PI = Math.PI;
    this._abs = Math.abs;
    this._sin = Math.sin;
    this._cos = Math.cos;
    this._pow = Math.pow;

    this._onCrash = false;

    this._parent = parent;
    this._mode = 0;
    var buffer = this._parent._offsets.buffer();
    this._length = buffer.length / 18;
    this._x = new Float32Array(this._length);
    this._y = new Float32Array(this._length);
    this._z = new Float32Array(this._length);
    this._bx = new Float32Array(this._length);
    this._by = new Float32Array(this._length);
    this._bz = new Float32Array(this._length);
    this._vx = new Float32Array(this._length);
    this._vy = new Float32Array(this._length);
    this._vz = new Float32Array(this._length);
    this._az = new Float32Array(this._length);
    this._gx = 0.0;
    this._gy = 0.0;
    this._gz = 0.0;
    this._rx = 0.0;
    this._ry = 0.0;
    for (var i = 0; i < this._length; ++i) {
        var offset = i * 18;
        this._x[i] = buffer[offset + 0];
        this._y[i] = buffer[offset + 1];
        this._z[i] = 0.0;
        this._bx[i] = buffer[offset + 0];
        this._by[i] = buffer[offset + 1];
        this._bz[i] = 0.0;
        this._vx[i] = 0.0;
        this._vy[i] = 0.0;
        this._vz[i] = 0.0;
        this._az[i] = 0.0;
    }
};

MajVj.frame.astalight.ps.prototype._crash = function (key) {
    this._mode = 0;
    for (var i = 0; i < this._length; ++i) {
        var v = (this._abs(this._bx[i]) + 32 - key) / 2;
        this._vx[i] = (this._random() - 0.5) * v;
        this._vy[i] = (this._random() - 0.5) * v;
        this._vz[i] = (this._random() - 0.5) * v * v;
    }
};

MajVj.frame.astalight.ps.prototype.update = function (delta) {
    var buffer = this._parent._offsets.buffer();
    var points = 6;
    var i;
    this._rx += 0.0002 * delta;
    this._ry += 0.0004 * delta;
    var radx = 2.0 * this._PI * this._rx / 360;
    var rady = 2.0 * this._PI * this._ry / 360;
    this._gx = this._sin(radx) * this._sin(rady);
    this._gy = this._cos(radx);
    this._gz = -this._sin(radx) * this._cos(rady);
    var fall = 0;

    var map = this._parent.properties.keymap;
    for (i = 0; i < this._length; ++i) {
        var key = this._abs(this._bx[i]) + 32;
        var val = map[key] +
                (map[key + 1] + map[key - 1]) * 0.9 +
                (map[key + 2] + map[key - 2]) * 0.8 +
                (map[key + 3] + map[key - 3]) * 0.6 +
                (map[key + 4] + map[key - 4]) * 0.3;
        this._az[i] = val / 128;
    }
    var onCrash = false;
    var crashKey = 0;
    var ons = 0;
    for (i = 0; i < 128; ++i) {
        if (map[i] > 110) {
            onCrash = true;
            crashKey = i;
        }
        fall += map[i];
    }
    if (onCrash && !this._onCrash)
        this._crash(crashKey);
    this._onCrash = onCrash;

    var t1 = this._pow(0.9, delta / 30);
    var t2 = 0.01 *  delta / 10;
    for (i = 0; i < this._length; ++i) {
        this._vz[i] += this._az[i];
        this._vx[i] *= t1;
        this._vy[i] *= t1;
        this._vz[i] *= t1;
        this._vx[i] += (this._bx[i] - this._x[i]) * t2;
        this._vy[i] += (this._by[i] - this._y[i]) * t2;
        this._vz[i] += (this._bz[i] - this._z[i]) * t2;
    }
    if (fall > 0) {
        var power = delta / 4096 * fall;
        var gx = this._gx * power;
        var gy = this._gy * power;
        var gz = this._gz * power;
        for (i = 0; i < this._length; ++i) {
            this._vx[i] += gx;
            this._vy[i] += gy;
            this._vz[i] += gz;
        }
    }
    var dst = 0;
    var zoom = 1.0 + this._parent.properties.volume;
    for (i = 0; i < this._length; ++i) {
        this._x[i] += this._vx[i];
        this._y[i] += this._vy[i];
        this._z[i] += this._vz[i];
        for (var point = 0; point < points; point++) {
            buffer[dst + 0] = this._x[i] * zoom;
            buffer[dst + 1] = this._y[i] * zoom;
            buffer[dst + 2] = this._z[i] * zoom;
            dst += 3;
        }
    }
    this._parent._offsets.update();
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - at -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.at = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {};

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.at._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.at._fragmentShader));
    this._sphere = TmaModelPrimitives.createSphere(
            MajVj.frame.at.resolution, TmaModelPrimitives.SPHERE_METHOD_EVEN);
    this._vertices = this._screen.createBuffer(this._sphere.getVertices());
    this._indices = this._screen.createElementBuffer(this._sphere.getIndices());
    this._program.setAttributeArray('aVertexPosition', this._vertices, 0, 3, 0);
    this._pMatrix = mat4.identity(mat4.create());
    this._mvMatrix = mat4.create();
    this._rotate = [0, 0, 0];
    this._translate = [0, 0, 0];

    var crlogo = (function() {
        var data = [
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0 ],  // oo********oo
            [ 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0 ],  // oo********oo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]   // oooooooooooo
        ];
        var logo = [];
        var ny = data.length;
        var nx = data[0].length;
        for (var y = 0; y < ny; ++y) {
            for (var x = 0; x < nx; ++x) {
                var color = (data[y][x] == 1) ? [0.75, 0.01, 0.00]
                                              : [0.10, 0.10, 0.25];
                logo.push([x - (nx - 1) / 2,
                           y - (ny - 1) / 2,
                           color[0] * 512,
                           color[1] * 512,
                           color[2] * 512]);
            }
        }
        return logo;
    })();
    var ablogo = (function() {
        var data = [
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],  // oo********oo
            [ 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 ],  // oo********oo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]   // oooooooooooo
        ];
        var logo = [];
        var ny = data.length;
        var nx = data[0].length;
        for (var y = 0; y < ny; ++y) {
            for (var x = 0; x < nx; ++x) {
                var color = (data[y][x] == 1) ? [0.75, 0.01, 0.00]
                                              : [0.10, 0.10, 0.25];
                logo.push([x - (nx - 1) / 2,
                           y - (ny - 1) / 2,
                           color[0] * 512,
                           color[1] * 512,
                           color[2] * 512]);
            }
        }
        return logo;
    })();
    this._logo = [];
    this._state = 0;
    for (var i = 0; i < crlogo.length; ++i) {
        this._logo[i] = {
            at: this,
            p: [ablogo[i][0] * 2, ablogo[i][1] * -2, 0, 0],
            h: [ablogo[i][0] * 2, ablogo[i][1] * -2, 0, 0],
            i: [ablogo[i][0] * 2,
                    -7 * Math.sin(ablogo[i][1] / 12 * Math.PI * 2),
                    -7 * Math.cos(ablogo[i][1] / 12 * Math.PI * 2), 0],
            v: [0, 0, 0],
            a: [0, 0, 0],
            cr: [crlogo[i][2] / 512, crlogo[i][3] / 512, crlogo[i][4] / 512],
            ab: [ablogo[i][2] / 512, ablogo[i][3] / 512, ablogo[i][4] / 512],
            c: [crlogo[i][2] / 512, crlogo[i][3] / 512, crlogo[i][4] / 512],
            m: 0,
            flip: false,
            update: function (delta) {
                if (this.at._state == 0) {
                    this.a = [(Math.random() - 0.5) * 0.5,
                              (Math.random() - 0.5) * 0.5,
                              (Math.random() - 0.5) * 0.5];
                    this.v = [this.a[0] * -30, this.a[1] * -30, this.a[2] * -30];
                    if (this.flip) {
                        this.c[0] = this.ab[0];
                        this.c[1] = this.ab[1];
                        this.c[2] = this.ab[2];
                    } else {
                        this.c[0] = this.cr[0];
                        this.c[1] = this.cr[1];
                        this.c[2] = this.cr[2];
                    }
                    this.flip = !this.flip;
                } else if (this.at._state == 1) {
                    var shrink = (this.p[0] - this.h[0]) * this.v[0] < 0;
                    this.a = [this.a[0] * 0.98, this.a[1] * 0.98, this.a[2] * 0.98];
                    this.v[0] += this.a[0];
                    this.v[1] += this.a[1];
                    this.v[2] += this.a[2];
                    this.p[0] += this.v[0];
                    this.p[1] += this.v[1];
                    this.p[2] += this.v[2];
                    if (shrink && (this.p[0] - this.h[0]) * this.v[0] > 0) {
                        this.a = [0, 0, 0];
                        this.v = [0, 0, 0];
                        this.p[0] = this.h[0];
                        this.p[1] = this.h[1];
                        this.p[2] = this.h[2];
                    }
                } else if (this.at._state == 5) {
                    this.m += 0.001 * delta;
                    if (this.m >= 1)
                        this.m = 1;
                    this.p[0] = (1 - this.m) * this.h[0] + this.m * this.i[0];
                    this.p[1] = (1 - this.m) * this.h[1] + this.m * this.i[1];
                    this.p[2] = (1 - this.m) * this.h[2] + this.m * this.i[2];
                } else if (this.at._state == 7) {
                    this.m -= 0.001 * delta;
                    if (this.m <= 0)
                        this.m = 0;
                    this.p[0] = (1 - this.m) * this.h[0] + this.m * this.i[0];
                    this.p[1] = (1 - this.m) * this.h[1] + this.m * this.i[1];
                    this.p[2] = (1 - this.m) * this.h[2] + this.m * this.i[2];
                }
            }
        };
    }
    this.onresize(this._aspect);
};

MajVj.frame.at.resolution = 3;
// Shader programs.
MajVj.frame.at._vertexShader = null;
MajVj.frame.at._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.at.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'at', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'at', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.at._vertexShader = shaders[0];
            MajVj.frame.at._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('at.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.at.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(this._pMatrix, Math.PI / 4, aspect, 0.1, 100.0);
    mat4.translate(this._pMatrix, this._pMatrix, [ 0.0, 0.0, -70.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.at.prototype.draw = function (delta) {
    this._program.setAttributeArray('aVertexPosition', this._vertices, 0, 3, 0);
    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    var nMatrix = mat3.create();
    var oMatrix = mat4.clone(this._mvMatrix);
    mat4.translate(oMatrix, oMatrix, this._translate);
    mat4.rotate(oMatrix, oMatrix, this._rotate[0], [1, 0, 0]);
    mat4.rotate(oMatrix, oMatrix, this._rotate[1], [0, 1, 0]);
    mat4.rotate(oMatrix, oMatrix, this._rotate[2], [0, 0, 1]);
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(false);
    for (var i = 0; i < this._logo.length; ++i) {
        this._logo[i].update(delta);
        var mvMatrix = mat4.clone(oMatrix);
        mat4.translate(mvMatrix, mvMatrix, this._logo[i].p);
        this._program.setUniformMatrix('uMVMatrix', mvMatrix);
        var nMatrix = mat3.create();
        mat3.normalFromMat4(nMatrix, mvMatrix);
        this._program.setUniformMatrix('uNMatrix', nMatrix);
        this._program.setUniformVector('uColor', this._logo[i].c);
        this._program.drawElements(Tma3DScreen.MODE_TRIANGLES,
                                   this._indices,
                                   0,
                                   this._sphere.items());
    }
    this._screen.popAlphaMode();
    if (this._state == 0) {
        this._rotate = [0, 0, 0];
        this._translate = [0, 0, 0];
        this._state = 1;
    } else if (this._state == 1) {
        for (i = 0; i < this._logo.length; ++i) {
            if (this._logo[i].p[0] != this._logo[i].h[0] ||
                    this._logo[i].p[1] != this._logo[i].h[1] ||
                    this._logo[i].p[2] != this._logo[i].h[2])
                return;
        }
        this._state = 2;
    } else if (this._state == 2) {
        this._rotate[0] += 0.004 * delta;
        this._translate[2] += 0.016 * delta;
        if (this._rotate[0] >= Math.PI * 3.5) {
            this._rotate[0] = Math.PI * 3.5;
            this._translate[2] = this._rotate[0] * 4;
            this._state = 3;
        }
        this._translate[1] = Math.sin(this._rotate[0]) * 4;
    } else if (this._state == 3) {
        this._rotate[2] += 0.0015 * delta;
        this._translate[1] -= 0.0015 * delta;
        this._translate[2] += 0.0015 * delta;
        if (this._rotate[2] >= Math.PI) {
            this._rotate[2] = Math.PI;
            this._translate[1] = Math.sin(Math.PI * 3.5) * 4 -this._rotate[2];
            this._translate[2] = Math.PI * 15;
            this._state = 4;
        }
    } else if (this._state == 4) {
        this._rotate[2] += 0.0015 * delta;
        this._translate[1] += 0.0015 * delta;
        this._translate[2] -= 0.0060 * delta;
        if (this._rotate[2] >= Math.PI * 2) {
            this._rotate[2] = Math.PI * 2;
            this._translate[1] = Math.sin(Math.PI * 3.5) * 4;
            this._translate[2] = Math.PI * 11;
            this._state = 5;
        }
    } else if (this._state == 5) {
        this._rotate[0] += 0.0015 * delta;
        this._rotate[2] += 0.0015 * delta;
        this._translate[1] += 0.0015 * delta;
        this._translate[2] -= 0.0060 * delta;
        if (this._rotate[0] >= Math.PI * 4) {
            this._rotate[0] = Math.PI * 4;
            this._rotate[2] = Math.PI * 2.5;
            this._translate[1] = Math.sin(Math.PI * 3.5) * 4 + Math.PI * 0.5;
            this._translate[2] = Math.PI * 9;
            this._state = 6;
        }
    } else if (this._state == 6) {
        this._rotate[0] += 0.0015 * delta;
        this._rotate[2] += 0.0015 * delta;
        if (this._rotate[2] >= Math.PI * 3.5) {
            this._rotate[0] = Math.PI * 5;
            this._state = 7;
        }
    } else if (this._state == 7) {
        this._rotate[0] += 0.0030 * delta;
        this._rotate[2] += 0.0015 * delta;
        this._translate[1] += 0.001 * delta;
        this._translate[2] -= 0.001 * delta;
        if (this._translate[1] >= 0)
            this._translate[1] = 0;
        if (this._translate[2] <= 0)
            this._translate[2] = 0;
        if (this._rotate[2] >= Math.PI * 5.0) {
            this._rotate[2] = Math.PI * 5.0;
            this._state = 0;
        }
    }
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - movie -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.movie = function(options) {
  this._screen = options.screen;
  this._width = options.width;
  this._height = options.height;
  this._aspect = options.aspect;
  this._mute = options.mute !== undefined ? options.mute : true;
  this._loop = options.loop !== undefined ? options.loop : true;
  this._rate = options.rate ? options.rate : 1.0;
  this._started = false;
  this.properties = {
    scroll: [0, 0],  // base point in the original image pixel range
    scale: 0.0,      // automatically adjusted if 0 is specified
    volume: 1.0
  };
  this._video = null;
  this._texture = null;
  this._zoom = 1.0;  // automatic adjust scale

  this._program = this._screen.createProgram(
    this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
      MajVj.frame.movie._vertexShader),
    this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
      MajVj.frame.movie._fragmentShader));
  this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0])
  if (options.url)
    this.play(options.url).then(function() {});
};

// Shader programs.
MajVj.frame.movie._vertexShader = null;
MajVj.frame.movie._fragmentShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.movie.load = function() {
  return new Promise(function(resolve, reject) {
    Promise.all([
      MajVj.loadShader('frame', 'movie', 'shaders.html', 'vertex'),
      MajVj.loadShader('frame', 'movie', 'shaders.html', 'fragment')
    ]).then(function(results) {
      MajVj.frame.movie._vertexShader = results[0];
      MajVj.frame.movie._fragmentShader = results[1];
      resolve();
    }, function(error) {
      tma.log(error);
    });
  });
};

/**
 * Starts playing a movie from a specified URL.
 * @param url a movie URL
 * @return a Promise object
 */
MajVj.frame.movie.prototype.play = function(url) {
  return new Promise(function(resolve, reject) {
    MajVj.loadMovieFrom(url).then(function(video) {
      this._video = video;
      tma.log('video: ' + video.videoWidth + 'x' + video.videoHeight);
      this._video.volume = this._mute ? 0 : 1;
      this._video.loop = this._loop;
      this._video.playbackRate = this._rate;

      // Calculate automatic adjust scale.
      var aspect = video.videoWidth / video.videoHeight;
      if (this._aspect > aspect)
        this._zoom = this._aspect / aspect;
      this._texture = this._screen.createTexture(
        video, true, Tma3DScreen.FILTER_LINEAR);
      resolve();
    }.bind(this), function(error) {
      tma.log(error);
    });
  }.bind(this));
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.movie.prototype.onresize = function(aspect) {
  this._aspect = aspect;
  var size = this._mv.size();
  this._width = size.width;
  this._height = size.height;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.movie.prototype.draw = function(delta) {
  if (!this._texture)
    return;
  if (!this._started && this._video.paused && this.properties.volume != 0) {
    this._video.play();
    this._started = true;
  } else if (!this._video.paused && this.properties.volume == 0) {
    this._video.pause();
  }
  this._texture.update(this._video);
  this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
  this._program.setUniformVector('uScale', this.properties.scale ? [
    this._video.videoWidth / this._width * this.properties.scale,
    this._video.videoHeight / this._height * this.properties.scale
  ] : [1, this._zoom]);
  this._program.setUniformVector('uOffset', [
    this.properties.scroll[0] / this._width,
    this.properties.scroll[1] / this._height
  ]);
  this._program.setUniformVector('uVolume', [this.properties.volume]);
  this._program.setTexture('uTexture', this._texture);
  this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - equalizer -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.equalizer = function (options) {
    this._laser = options.mv.create('frame', 'laser', {
            draw: this._draw.bind(this),
            width: options.width,
            height: options.height
    });
    this.properties = {
        fft: new Uint8Array(1024),
        low_color: [ 0.0, 0.0, 1.0, 0.5 ],
        high_color: [ 1.0, 0.0, 0.0, 0.5 ],
        weak_color: [ 0.0, 0.0, 0.0, 0.5 ],
        strong_color: [ 0.3, 0.3, 0.3, 0.5 ]
    };
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.equalizer.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.equalizer.prototype.onresize = function (aspect) {
    this._laser.onresize(aspect);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.equalizer.prototype.draw = function (delta) {
    this._laser.draw(delta);
};

MajVj.frame.equalizer.prototype._draw = function (api) {
    api.color = [ 0.1, 1.0, 0.1, 1.0 ];
    var n = 2;
    var prop = this.properties;
    for (var i = 0; i < 16; ++i) {
        var v = prop.fft[n - 1];
        var sx = i / 8.0 - 1.0 + 0.035;
        var ex = (i + 1) / 8.0 - 1.0 - 0.035;
        var r = i / 15;
        var rr = 1 - r;
        var color = [
            prop.low_color[0] * rr + prop.high_color[0] * r,
            prop.low_color[1] * rr + prop.high_color[1] * r,
            prop.low_color[2] * rr + prop.high_color[2] * r,
            prop.low_color[3] * rr + prop.high_color[3] * r
        ];
        for (var h = 0; h < 16; ++h) {
            r = h / 15;
            rr = 1 - r;
            api.color = [
                color[0] + prop.weak_color[0] * rr + prop.strong_color[0] * r,
                color[1] + prop.weak_color[1] * rr + prop.strong_color[1] * r,
                color[2] + prop.weak_color[2] * rr + prop.strong_color[2] * r,
                color[3] + prop.weak_color[3] * rr + prop.strong_color[3] * r
            ];
            var y = -0.9 + h * 0.1;
            if (v > (h * 16))
                api.line2d([sx, y], [ex, y], 0.45);
        }
        n += (n / 2)|0;
    }
};
/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - ledpanel -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.ledpanel = function(options) {
  var size = options.size || 128;
  this._columns = (options.width / size) | 0;
  this._rows = (options.height / size) | 0;
  this._effect = options.mv.create('effect', 'mask', { patch: 'led' });
  this._effect.properties.resolution = [ this._columns, this._rows ];

  this.properties = {
    image: options.screen.createImage(this._columns, this._rows),
    volume: 1.0
  }

  this._texture = options.screen.createTexture(
      this.properties.image, true, Tma3DScreen.FILTER_NEAREST);
};

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.ledpanel.load = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.ledpanel.prototype.onresize = function(aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.ledpanel.prototype.draw = function(delta) {
  this._texture.update();
  this._effect.properties.volume = this.properties.volume;
  this._effect.draw(delta, this._texture);
};
/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - color -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.color = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {
        r: (options.r === undefined) ? 1.0 : options.r,
        g: (options.g === undefined) ? 1.0 : options.g,
        b: (options.b === undefined) ? 1.0 : options.b
    };
};

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.color.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.color.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.color.prototype.draw = function (delta) {
    this._screen.fillColor(
            this.properties.r, this.properties.g, this.properties.b, 1.0);
};
/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - grid -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.grid = function (options) {
    this._screen = options.screen;
    this.onresize(options.aspect);
    this._api2d = options.mv.get2DInterface({ width: 1, height: 1 });
    this._api3d = options.mv.create('frame', 'api3d', {
            draw: this._draw.bind(this)
    });
    this.properties = {
        z: options.z,
        n: 8,
        orientation: [ 0, 0, -90 ],
        vr: false,
        parallax_overlap: 0.0,
        color: (options.color === undefined) ? [ 1.0, 1.0, 1.0, 1.0 ]
                                             : options.color,
        zoom: (options.zoom === undefined) ? 1.0 : options.zoom
    };
};

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.grid.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.grid.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    this._zoom = [ 1.0, 1.0 ];
    if (this._aspect > 1)
        this._zoom[1] = this._aspect;
    else
        this._zoom[0] /= this._aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.grid.prototype.draw = function (delta) {
    if (this.properties.z) {
        this._api3d.properties.orientation = this.properties.orientation;
        this._api3d.properties.vr = this.properties.vr;
        this._api3d.properties.parallax_overlap =
                this.properties.parallax_overlap;
        this._api3d.properties.parallax_distance =
                this.properties.parallax_distance;
        return this._api3d.draw(delta);
    }

    var c = this.properties.color;
    var n = this.properties.n - 1;
    var zoom = this.properties.zoom;
    
    this._api2d.stroke(c[0] * 255, c[1] * 255, c[2] * 255, c[3] * 255);
    this._api2d.strokeWeight(1);

    var linex = (1 - this._zoom[0] * zoom) / 2;
    var stepx = this._zoom[0] * zoom / n;
    for (var x = 0; x <= n; ++x) {
        this._api2d.line(linex, 0, linex, 1.0);
        linex += stepx;
    }
    var liney = (1 - this._zoom[1] * zoom) / 2;
    var stepy = this._zoom[1] * zoom / n;
    for (var y = 0; y <= n; ++y) {
        this._api2d.line(0, liney, 1.0, liney);
        liney += stepy;
    }
};

MajVj.frame.grid.prototype._draw = function (api) {
    api.color = this.properties.color;

    var n = this.properties.n - 1;
    var zoom = this.properties.zoom;

    var s = -1 * zoom;
    var e =  1 * zoom;
    var step = (e - s) / n;
    var linez = s;
    var x, y, z;
    for (var z = 0; z <= n; ++z) {
        var linex = s;
        for (var x = 0; x <= n; ++x) {
            api.drawLine([linex, s, linez], [linex, e, linez]);
            api.drawLine([linex, linez, s], [linex, linez, e]);
            linex += step;
        }
        var liney = s;
        for (var y = 0; y <= n; ++y) {
            api.drawLine([s, liney, linez], [e, liney, linez]);
            api.drawLine([linez, liney, s], [linez, liney, e]);
            liney += step;
        }
        linez += step;
    }
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nico_test -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.nico_test = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {};
    this._speed = 4;
    this._x = 0;
    this._y = 0;
    this._z = 0;
    this._ax = this._speed;
    this._ay = this._speed;
    this._az = this._speed;
    this._t = 0;

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nico_test._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nico_test._fragmentShader));
    this._coords = this._screen.createBuffer([
            // A (right): (40, 760) - (1520, 1040) / (1920, 1080)
            40 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            // B (stage): (40, 120) - (880, 400) / (1920, 1080)
            40 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // C (left): (40, 440) - (1520, 720) / (1920, 1080)
            40 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // D (back): (920, 120) - (1760, 400) / (1920, 1080)
            920 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            920 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // E (stage right): (1560, 760) - (1720, 1040) / (1920, 1080)
            1560 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            1560 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            // F (stage left): (1560, 440) - (1720, 720) / (1920, 1080)
            1560 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            1560 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // G (ceiling): (1760, 870) - (1858, 1040) / (1920, 1080)
            1760 / 1920 * 2 - 1, 870 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1858 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1858 / 1920 * 2 - 1, 870 / 1080 * 2 - 1]);
    this._texCoods = this._screen.createBuffer([
            // A (right)
            880, 20, 40,
            880, 300, 40,
            880, 300, 1520,
            880, 20, 1520,
            // B (stage)
            20, 20, 0,
            20, 300, 0,
            860, 300, 0,
            860, 20, 0,
            // C (left)
            0, 20, 1520,
            0, 300, 1520,
            0, 300, 40,
            0, 20, 40,
            // D (back)
            860, 20, 1560,
            860, 300, 1560,
            20, 300, 1560,
            20, 20, 1560,
            // E (stage right)
            700, 20, 200,
            700, 300, 200,
            860, 300, 200,
            860, 20, 200,
            // F (stage left)
            20, 20, 200,
            20, 300, 200,
            180, 300, 200,
            180, 20, 200,
            // G (ceiling)
            20, 320, 40,
            20, 320, 1520,
            860, 320, 1520,
            860, 320, 40]);
};

// Shader programs.
MajVj.frame.nico_test._vertexShader = null;
MajVj.frame.nico_test._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.nico_test.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'nico_test', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'nico_test', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.nico_test._vertexShader = shaders[0];
            MajVj.frame.nico_test._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('nico_test.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.nico_test.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.nico_test.prototype.draw = function (delta) {
    this._x += this._ax;
    if (this._x < 0)
        this._ax = this._speed;
    else if (this._x > 880)
        this._ax = -this._speed;
    this._y += this._ay;
    if (this._y < 0)
        this._ay = this._speed;
    else if (this._y > 320)
        this._ay = -this._speed;
    this._z += this._az;
    if (this._z < 0)
        this._az = this._speed;
    else if (this._z > 1480)
        this._az = -this._speed;
    this._t += delta;
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(true, this._screen.gl.SRC_ALPHA,
            this._screen.gl.ONE);
    this._screen.fillColor(0.0, 0.0, 0.0, 1.0);
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setAttributeArray('aTexCoord', this._texCoods, 0, 3, 0);
    this._program.setUniformVector('uX', [this._x]);
    this._program.setUniformVector('uY', [this._y]);
    this._program.setUniformVector('uZ', [this._z]);
    var uT = [Math.sin(this._t / 300) / 20,
              Math.sin(this._t / 500) / 30,
              Math.sin(this._t / 700) / 40 + 0.1]
    this._program.setUniformVector('uT', uT);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 4, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 8, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 12, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 16, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 20, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 24, 4);
    this._screen.popAlphaMode();
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - ab2 -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.ab2 = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {};

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.ab2._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.ab2._fragmentShader));
    this._sphere = TmaModelPrimitives.createSphere(
            MajVj.frame.ab2.resolution, TmaModelPrimitives.SPHERE_METHOD_EVEN);
    this._vertices = this._screen.createBuffer(this._sphere.getVertices());
    this._indices = this._screen.createElementBuffer(this._sphere.getIndices());
    this._program.setAttributeArray('aVertexPosition', this._vertices, 0, 3, 0);
    this._pMatrix = mat4.create();
    this._mvMatrix = mat4.identity(mat4.create());
    this._rotate = [0, 0, 0];
    this._translate = [0, 0, 0];

    var crlogo = [[-5,-5,255,255,255,255],[-4,-5,255,255,255,255],[-3,-5,255,255,255,255],[-2,-5,255,255,255,255],[-1,-5,255,255,255,255],[0,-5,255,255,255,255],[1,-5,255,255,255,255],[2,-5,255,255,255,255],[3,-5,255,255,255,255],[4,-5,255,255,255,255],[5,-5,255,255,255,255],[6,-5,255,255,255,255],[-5,-4,255,255,255,255],[-4,-4,255,255,255,255],[-3,-4,255,255,255,255],[-2,-4,255,255,255,255],[-1,-4,243,117,95,255],[0,-4,244,128,105,255],[1,-4,244,123,102,255],[2,-4,242,107,88,255],[3,-4,255,255,253,255],[4,-4,255,255,255,255],[5,-4,255,255,255,255],[6,-4,255,255,255,255],[-5,-3,255,255,255,255],[-4,-3,255,255,255,255],[-3,-3,237,239,238,255],[-2,-3,238,86,72,255],[-1,-3,238,95,79,255],[0,-3,240,99,82,255],[1,-3,239,98,81,255],[2,-3,240,90,75,255],[3,-3,235,77,65,255],[4,-3,238,237,243,255],[5,-3,255,255,255,255],[6,-3,255,255,255,255],[-5,-2,255,255,255,255],[-4,-2,254,254,254,255],[-3,-2,233,59,52,255],[-2,-2,233,64,57,255],[-1,-2,233,70,61,255],[0,-2,235,72,63,255],[1,-2,234,70,61,255],[2,-2,234,65,58,255],[3,-2,232,59,53,255],[4,-2,232,58,51,255],[5,-2,253,255,252,255],[6,-2,255,255,255,255],[-5,-1,255,255,255,255],[-4,-1,87,191,92,255],[-3,-1,92,193,91,255],[-2,-1,232,58,51,255],[-1,-1,241,249,251,255],[0,-1,131,182,225,255],[1,-1,132,183,226,255],[2,-1,244,254,255,255],[3,-1,253,217,1,255],[4,-1,253,217,1,255],[5,-1,251,215,5,255],[6,-1,255,255,255,255],[-5,0,255,255,255,255],[-4,0,89,191,91,255],[-3,0,91,193,91,255],[-2,0,209,45,36,255],[-1,0,87,156,211,255],[0,0,103,163,213,255],[1,0,105,165,215,255],[2,0,88,157,212,255],[3,0,253,217,1,255],[4,0,253,217,1,255],[5,0,250,213,0,255],[6,0,255,255,255,255],[-5,1,255,255,255,255],[-4,1,89,186,91,255],[-3,1,91,193,91,255],[-2,1,91,193,91,255],[-1,1,59,141,197,255],[0,1,67,148,204,255],[1,1,67,147,206,255],[2,1,60,142,200,255],[3,1,253,217,1,255],[4,1,253,217,1,255],[5,1,249,211,16,255],[6,1,255,255,255,255],[-5,2,255,255,255,255],[-4,2,89,175,88,255],[-3,2,90,192,92,255],[-2,2,91,193,91,255],[-1,2,213,226,217,255],[0,2,39,118,175,255],[1,2,39,122,176,255],[2,2,204,229,207,255],[3,2,253,217,1,255],[4,2,252,215,4,255],[5,2,243,198,34,255],[6,2,255,255,255,255],[-5,3,255,255,255,255],[-4,3,252,252,252,255],[-3,3,86,179,88,255],[-2,3,90,192,92,255],[-1,3,91,193,91,255],[0,3,91,193,91,255],[1,3,84,181,86,255],[2,3,252,217,1,255],[3,3,250,215,0,255],[4,3,244,203,27,255],[5,3,251,251,251,255],[6,3,255,255,255,255],[-5,4,255,255,255,255],[-4,4,255,255,255,255],[-3,4,223,223,223,255],[-2,4,85,175,87,255],[-1,4,89,184,90,255],[0,4,88,188,90,255],[1,4,249,211,12,255],[2,4,247,207,21,255],[3,4,239,195,36,255],[4,4,223,225,222,255],[5,4,255,255,255,255],[6,4,255,255,255,255],[-5,5,255,255,255,255],[-4,5,255,255,255,255],[-3,5,255,255,255,255],[-2,5,250,250,250,255],[-1,5,68,149,82,255],[0,5,72,158,87,255],[1,5,228,179,50,255],[2,5,220,169,52,255],[3,5,249,249,249,255],[4,5,255,255,255,255],[5,5,255,255,255,255],[6,5,255,255,255,255]];
    var ablogo = (function() {
        var data = [
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],  // oo********oo
            [ 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],  // oo********oo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]   // oooooooooooo
        ];
        var logo = [];
        var ny = data.length;
        var nx = data[0].length;
        for (var y = 0; y < ny; ++y) {
            for (var x = 0; x < nx; ++x) {
                var color = (data[y][x] == 1) ? [0.75, 0.01, 0.00]
                                              : [0.10, 0.10, 0.25];
                logo.push([x - (nx - 1) / 2,
                           y - (ny - 1) / 2,
                           color[0] * 512,
                           color[1] * 512,
                           color[2] * 512]);
            }
        }
        return logo;
    })();
    this._logo = [];
    this._state = 0;
    for (var i = 0; i < crlogo.length; ++i) {
        this._logo[i] = {
            ab2: this,
            p: [ablogo[i][0] * 2, ablogo[i][1] * -2, 0, 0],
            h: [ablogo[i][0] * 2, ablogo[i][1] * -2, 0, 0],
            i: [ablogo[i][0] * 2,
                    -7 * Math.sin(ablogo[i][1] / 12 * Math.PI * 2),
                    -7 * Math.cos(ablogo[i][1] / 12 * Math.PI * 2), 0],
            v: [0, 0, 0],
            a: [0, 0, 0],
            cr: [crlogo[i][2] / 512, crlogo[i][3] / 512, crlogo[i][4] / 512],
            ab: [ablogo[i][2] / 512, ablogo[i][3] / 512, ablogo[i][4] / 512],
            c: [crlogo[i][2] / 512, crlogo[i][3] / 512, crlogo[i][4] / 512],
            m: 0,
            flip: false,
            update: function (delta) {
                if (this.ab2._state == 0) {
                    this.a = [(Math.random() - 0.5) * 0.5,
                              (Math.random() - 0.5) * 0.5,
                              (Math.random() - 0.5) * 0.5];
                    this.v = [this.a[0] * -30, this.a[1] * -30, this.a[2] * -30];
                    if (this.flip) {
                        this.c[0] = this.ab[0];
                        this.c[1] = this.ab[1];
                        this.c[2] = this.ab[2];
                    } else {
                        this.c[0] = this.cr[0];
                        this.c[1] = this.cr[1];
                        this.c[2] = this.cr[2];
                    }
                    this.flip = !this.flip;
                } else if (this.ab2._state == 1) {
                    var shrink = (this.p[0] - this.h[0]) * this.v[0] < 0;
                    this.a = [this.a[0] * 0.98, this.a[1] * 0.98, this.a[2] * 0.98];
                    this.v[0] += this.a[0];
                    this.v[1] += this.a[1];
                    this.v[2] += this.a[2];
                    this.p[0] += this.v[0];
                    this.p[1] += this.v[1];
                    this.p[2] += this.v[2];
                    if (shrink && (this.p[0] - this.h[0]) * this.v[0] > 0) {
                        this.a = [0, 0, 0];
                        this.v = [0, 0, 0];
                        this.p[0] = this.h[0];
                        this.p[1] = this.h[1];
                        this.p[2] = this.h[2];
                    }
                } else if (this.ab2._state == 5) {
                    this.m += 0.001 * delta;
                    if (this.m >= 1)
                        this.m = 1;
                    this.p[0] = (1 - this.m) * this.h[0] + this.m * this.i[0];
                    this.p[1] = (1 - this.m) * this.h[1] + this.m * this.i[1];
                    this.p[2] = (1 - this.m) * this.h[2] + this.m * this.i[2];
                } else if (this.ab2._state == 7) {
                    this.m -= 0.001 * delta;
                    if (this.m <= 0)
                        this.m = 0;
                    this.p[0] = (1 - this.m) * this.h[0] + this.m * this.i[0];
                    this.p[1] = (1 - this.m) * this.h[1] + this.m * this.i[1];
                    this.p[2] = (1 - this.m) * this.h[2] + this.m * this.i[2];
                }
            }
        };
    }
    this.onresize(this._aspect);
};

MajVj.frame.ab2.resolution = 3;
// Shader programs.
MajVj.frame.ab2._vertexShader = null;
MajVj.frame.ab2._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.ab2.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'ab2', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'ab2', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.ab2._vertexShader = shaders[0];
            MajVj.frame.ab2._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('ab2.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.ab2.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(this._pMatrix, 45, aspect, 0.1, 100.0);
    mat4.translate(this._pMatrix, this._pMatrix, [ 0.0, 0.0, -70.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.ab2.prototype.draw = function (delta) {
    this._program.setAttributeArray('aVertexPosition', this._vertices, 0, 3, 0);
    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    var oMatrix = mat4.clone(this._mvMatrix);
    var nMatrix = mat3.create();
    mat4.translate(oMatrix, oMatrix, this._translate);
    mat4.rotate(oMatrix, oMatrix, this._rotate[0], [1, 0, 0]);
    mat4.rotate(oMatrix, oMatrix, this._rotate[1], [0, 1, 0]);
    mat4.rotate(oMatrix, oMatrix, this._rotate[2], [0, 0, 1]);
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(false);
    for (var i = 0; i < this._logo.length; ++i) {
        this._logo[i].update(delta);
        var mvMatrix = mat4.clone(oMatrix);
        mat4.translate(mvMatrix, mvMatrix, this._logo[i].p);
        this._program.setUniformMatrix('uMVMatrix', mvMatrix);
        mat3.normalFromMat4(nMatrix, mvMatrix);
        this._program.setUniformMatrix('uNMatrix', nMatrix);
        this._program.setUniformVector('uColor', this._logo[i].c);
        this._program.drawElements(Tma3DScreen.MODE_TRIANGLES,
                                   this._indices,
                                   0,
                                   this._sphere.items());
    }
    this._screen.popAlphaMode();
    if (this._state == 0) {
        this._rotate = [0, 0, 0];
        this._translate = [0, 0, 0];
        this._state = 1;
    } else if (this._state == 1) {
        for (i = 0; i < this._logo.length; ++i) {
            if (this._logo[i].p[0] != this._logo[i].h[0] ||
                    this._logo[i].p[1] != this._logo[i].h[1] ||
                    this._logo[i].p[2] != this._logo[i].h[2])
                return;
        }
        this._state = 2;
    } else if (this._state == 2) {
        this._rotate[0] += 0.004 * delta;
        this._translate[2] += 0.016 * delta;
        if (this._rotate[0] >= Math.PI * 3.5) {
            this._rotate[0] = Math.PI * 3.5;
            this._translate[2] = this._rotate[0] * 4;
            this._state = 3;
        }
        this._translate[1] = Math.sin(this._rotate[0]) * 4;
    } else if (this._state == 3) {
        this._rotate[2] += 0.0015 * delta;
        this._translate[1] -= 0.0015 * delta;
        this._translate[2] += 0.0015 * delta;
        if (this._rotate[2] >= Math.PI) {
            this._rotate[2] = Math.PI;
            this._translate[1] = Math.sin(Math.PI * 3.5) * 4 -this._rotate[2];
            this._translate[2] = Math.PI * 15;
            this._state = 4;
        }
    } else if (this._state == 4) {
        this._rotate[2] += 0.0015 * delta;
        this._translate[1] += 0.0015 * delta;
        this._translate[2] -= 0.0060 * delta;
        if (this._rotate[2] >= Math.PI * 2) {
            this._rotate[2] = Math.PI * 2;
            this._translate[1] = Math.sin(Math.PI * 3.5) * 4;
            this._translate[2] = Math.PI * 11;
            this._state = 5;
        }
    } else if (this._state == 5) {
        this._rotate[0] += 0.0015 * delta;
        this._rotate[2] += 0.0015 * delta;
        this._translate[1] += 0.0015 * delta;
        this._translate[2] -= 0.0060 * delta;
        if (this._rotate[0] >= Math.PI * 4) {
            this._rotate[0] = Math.PI * 4;
            this._rotate[2] = Math.PI * 2.5;
            this._translate[1] = Math.sin(Math.PI * 3.5) * 4 + Math.PI * 0.5;
            this._translate[2] = Math.PI * 9;
            this._state = 6;
        }
    } else if (this._state == 6) {
        this._rotate[0] += 0.0015 * delta;
        this._rotate[2] += 0.0015 * delta;
        if (this._rotate[2] >= Math.PI * 3.5) {
            this._rotate[0] = Math.PI * 5;
            this._state = 7;
        }
    } else if (this._state == 7) {
        this._rotate[0] += 0.0030 * delta;
        this._rotate[2] += 0.0015 * delta;
        this._translate[1] += 0.001 * delta;
        this._translate[2] -= 0.001 * delta;
        if (this._translate[1] >= 0)
            this._translate[1] = 0;
        if (this._translate[2] <= 0)
            this._translate[2] = 0;
        if (this._rotate[2] >= Math.PI * 5.0) {
            this._rotate[2] = Math.PI * 5.0;
            this._state = 0;
        }
    }
};
/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - flushpanel -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.flushpanel = function(options) {
  this.properties = {
    color: options.color || [0.3, 0.3, 0.3],
    units: options.units || [4, 1],
    speed: options.speed || 0.1,
    mode: options.mode || "l2r"
  };
  this._init(this.properties.units[0] * this.properties.units[1]);
  this._program = options.screen.createProgram(
      options.screen.compileShader(Tma3DScreen.VERTEX_SHADER,
          MajVj.frame.flushpanel._vertexShader),
      options.screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
          MajVj.frame.flushpanel._fragmentShader));
  this._coords = options.screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
};

// Shader programs.
MajVj.frame.flushpanel._vertexShader = null;
MajVj.frame.flushpanel._fragmentShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.flushpanel.load = function() {
  return new Promise(function(resolve, reject) {
    Promise.all([
      MajVj.loadShader('frame', 'flushpanel', 'shaders.html', 'vertex'),
      MajVj.loadShader('frame', 'flushpanel', 'shaders.html', 'fragment')
    ]).then(function (shaders) {
      MajVj.frame.flushpanel._vertexShader = shaders[0];
      MajVj.frame.flushpanel._fragmentShader = shaders[1];
      resolve();
    });
  });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.flushpanel.prototype.onresize = function(aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.flushpanel.prototype.draw = function(delta) {
  this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
  var color = [
      this.properties.color[0],
      this.properties.color[1],
      this.properties.color[2],
      1.0
  ];
  var nx = this.properties.units[0];
  var ny = this.properties.units[1];
  var n = nx * ny;
  if (this._units.length != n)
    this._init(n);
  var w = 1 / nx;
  var h = 1 / ny;
  var x = (1 - nx) * w;
  var y = (1 - ny) * h;
  var i = 0;
  var d = delta * this.properties.speed;
  for (var iy = 0; iy < ny; ++iy) {
    for (var ix = 0; ix < nx; ++ix) {
      var unit = this._units[i++];
      unit.t += unit.w * d;
      this._program.setUniformVector('uUnit', [w, h, x, y]);
      color[3] = (Math.sin(unit.t) + 1) / 2;
      this._program.setUniformVector('uColor', color);
      this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
      x += w * 2;
    }
    y += h * 2;
  }
};

MajVj.frame.flushpanel.prototype._init = function(n) {
  this._units = new Array(n);
  if (this.properties.mode == "random") {
    for (var i = 0; i < n; ++i)
      this._units[i] = { w: Math.random(), t: 0 };
  } else if (this.properties.mode == "r2l") {
    for (var i = 0; i < n; ++i)
      this._units[i] = { w: 0.1, t: Math.PI * 2 * i / n };
  } else if (this.properties.mode == "l2r") {
    for (var i = 0; i < n; ++i)
      this._units[i] = { w: 0.1, t: Math.PI * 2 * (n - i) / n };
  }
};/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - laser -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.laser = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._mv = options.mv;
    this._zoom = [1.0, 1.0, 1.0];
    this._zoomMatrix = mat3.create();
    this._draw = options.draw || function (api) {};

    this._api3d = this._mv.create('frame', 'api3d', {
        width: options.width,
        height: options.height,
        drawModeVertexShader: MajVj.frame.laser._vLine3dShader,
        drawModeFragmentShader: MajVj.frame.laser._fLine3dShader
    });
    this._api3d_handle = null;

    this.properties = {};
    this.properties.api3d = this._api3d.properties;

    this.resize(options.width, options.height);

    this._line2dProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.laser._vLine2dShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.laser._fLine2dShader));

    this._coords = this._screen.createBuffer([
        // X     Y     U     V ( = 0)
        -1.0, -1.0,  0.0,  // 0
        -1.0,  1.0,  0.0,  // 1
         0.0, -1.0,  0.0,  // 2
         0.0,  1.0,  0.0,  // 3
        -1.0, -1.0, -1.0,  // 4
        -1.0,  1.0, -1.0,  // 5
         1.0, -1.0,  1.0,  // 6
         1.0,  1.0,  1.0,  // 7
         0.0, -1.0,  0.0,  // 8
         0.0,  1.0,  0.0,  // 9
         1.0, -1.0,  0.0,  // 10
         1.0,  1.0,  0.0,  // 11
    ]);
    this._coords.dimension = 3;
    this._indices = this._screen.createElementBuffer([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
    ]);
    this._leftSquareIndicesOffset = 0;
    this._centerSquareIndicesOffset = 8;
    this._rightSquareIndicesOffset = 16;
    this._squareIndicesLength = 4;

    this._model = {
        _main: this,
        offset: this._leftSquareIndicesOffset,
        getDrawMode: function() { return Tma3DScreen.MODE_TRIANGLE_STRIP; },
        getTexture: function() { return null; },
        getVerticesBuffer: function(screen) { return this._main._coords; },
        getIndicesBuffer: function(screen) { return this._main._indices; },
        getIndicesOffset: function() { return this.offset; },
        getIndicesLength: function() { return this._main._squareIndicesLength; }
    };

    this._api = {
        line2d: this._line2d.bind(this),
        line3d: this._line3d.bind(this),
        toScreenX: this._toScreenX.bind(this),
        toScreenY: this._toScreenY.bind(this),
        color: [ 0.0, 0.0, 1.0, 1.0 ],
        screen: this._screen,
        delta: 0,
        properties: this.properties
    };
};

// Shader programs.
MajVj.frame.laser._vLine2dShader = null;
MajVj.frame.laser._fLine2dShader = null;
MajVj.frame.laser._vLine3dShader = null;
MajVj.frame.laser._fLine3dShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.laser.load = function () {
    return new Promise(function (resolve, reject) {
        var name = 'laser';
        var path = 'shaders.html';
        Promise.all([
                MajVj.loadShader('frame', name, path, 'v_line2d'),
                MajVj.loadShader('frame', name, path, 'f_line2d'),
                MajVj.loadShader('frame', name, path, 'v_line3d'),
                MajVj.loadShader('frame', name, path, 'f_line3d')
        ]).then(function (results) {
            MajVj.frame.laser._vLine2dShader = results[0];
            MajVj.frame.laser._fLine2dShader = results[1];
            MajVj.frame.laser._vLine3dShader = results[2];
            MajVj.frame.laser._fLine3dShader = results[3];
            resolve();
        }, function () { reject('laser.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.laser.prototype.onresize = function (aspect) {
    var size = this._mv.size();
    resize(size.width, size.height);
    this._api3d.onresize(this._aspect);
};

/**
 * Resizes screen.
 * @param width screen width in pixel
 * @param height screen height in pixel
 */
MajVj.frame.laser.prototype.resize = function (width, height) {
    this._aspect = width / height;
    this._zoom = [1.0, 1.0, 1.0];
    this._width = width;
    this._height = height;
    // Ajust to keep 1:1 aspect and to overfill the screen.
    if (this._aspect > 1.0)
        this._zoom[1] = this._aspect;
    else
        this._zoom[0] = 1 / this._aspect;
    mat3.identity(this._zoomMatrix);
    mat3.scale(this._zoomMatrix, this._zoomMatrix, this._zoom);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.laser.prototype.draw = function (delta) {
    this._api.delta = delta;
    this._api3d_handle = this._api3d.beginDraw();
    this._draw(this._api);
    this._api3d.endDraw();
};

/**
 * Draws a line.
 * @param src source position in [x, y] (0 <= x, y <= 1)
 * @param dst destination position in [x, y] (0 <= x, y <= 1)
 * @param width line width
 */
MajVj.frame.laser.prototype._line2d = function (src, dst, width) {
    var vector = vec2.create();
    vec2.subtract(vector, src, dst);
    var distance = vec2.length(vector);
    var position = vec2.create();
    vec2.lerp(position, src, dst, 0.5);

    this._line2dProgram.setAttributeArray(
        'aCoord', this._coords, 0, this._coords.dimension, 0);
    this._line2dProgram.setUniformMatrix('uZoomMatrix', this._zoomMatrix);
    this._line2dProgram.setUniformVector('uColor', this._api.color);
    this._line2dProgram.setUniformVector('uWidth', [width]);

    var matrix = mat2d.identity(mat2d.create());
    mat2d.translate(matrix, matrix, position);
    mat2d.rotate(matrix, matrix, Math.atan2(vector[1], vector[0]));
    mat2d.scale(matrix, matrix, [distance / 2, width / 2]);
    var matrix3 = mat3.fromMat2d(mat3.create(), matrix);
    this._line2dProgram.setUniformMatrix('uMatrix', matrix3);
    this._line2dProgram.drawElements(Tma3DScreen.MODE_TRIANGLE_STRIP,
                                     this._indices,
                                     this._centerSquareIndicesOffset,
                                     this._squareIndicesLength);
    mat2d.identity(matrix);
    mat2d.translate(matrix, matrix, dst);
    mat2d.rotate(matrix, matrix, Math.atan2(vector[1], vector[0]));
    mat2d.scale(matrix, matrix, [width / 2, width / 2]);
    mat3.fromMat2d(matrix3, matrix);
    this._line2dProgram.setUniformMatrix('uMatrix', matrix3);
    this._line2dProgram.drawElements(Tma3DScreen.MODE_TRIANGLE_STRIP,
                                     this._indices,
                                     this._leftSquareIndicesOffset,
                                     this._squareIndicesLength);

    mat2d.identity(matrix);
    mat2d.translate(matrix, matrix, src);
    mat2d.rotate(matrix, matrix, Math.atan2(vector[1], vector[0]));
    mat2d.scale(matrix, matrix, [width / 2, width / 2]);
    mat3.fromMat2d(matrix3, matrix);
    this._line2dProgram.setUniformMatrix('uMatrix', matrix3);
    this._line2dProgram.drawElements(Tma3DScreen.MODE_TRIANGLE_STRIP,
                                     this._indices,
                                     this._rightSquareIndicesOffset,
                                     this._squareIndicesLength);
};

/**
 * Draws a line to all displays.
 * @param src source position in [x, y] (0 <= x, y <= 1)
 * @param dst destination position in [x, y] (0 <= x, y <= 1)
 * @param width line width
 */
MajVj.frame.laser.prototype._line3d = function (src, dst, width) {
    this._api3d_handle.color = this._api.color;
    this._api3d_handle.drawModeShader.setUniformVector('uWidth', [width]);
    var hw = width / 2;
    var hv = [
        (dst[0] - src[0]) / 2,
        (dst[1] - src[1]) / 2,
        (dst[2] - src[2]) / 2
    ];
    var hyz2 = hv[1] * hv[1] + hv[2] * hv[2];
    var hd = Math.sqrt(hv[0] * hv[0] + hyz2);
    var hyz = Math.sqrt(hyz2);
    var rotate = [
        -Math.atan2(hv[1], hv[2]),
        Math.atan2(hv[0], hyz),
        0
    ];

    this._model.offset = this._centerSquareIndicesOffset;
    this._api3d_handle.drawPrimitive(
            this._model,
            hw, hw, hd,
            [ src[0] + hv[0], src[1] + hv[1], src[2] + hv[2] ],
            [rotate]);
    rotate[2] = Math.PI / 2;
    this._api3d_handle.drawPrimitive(
            this._model,
            hw, hw, hd,
            [ src[0] + hv[0], src[1] + hv[1], src[2] + hv[2] ],
            [rotate]);

    this._model.offset = this._leftSquareIndicesOffset;
    rotate[2] = 0;
    this._api3d_handle.drawPrimitive(
            this._model,
            hw, hw, hw,
            [ src[0], src[1], src[2] ],
            [rotate]);
    rotate[2] = Math.PI / 2;
    this._api3d_handle.drawPrimitive(
            this._model,
            hw, hw, hw,
            [ src[0], src[1], src[2] ],
            [rotate]);

    this._model.offset = this._rightSquareIndicesOffset;
    rotate[2] = 0;
    this._api3d_handle.drawPrimitive(
            this._model,
            hw, hw, hw,
            [ dst[0], dst[1], dst[2] ],
            [rotate]);
    rotate[2] = Math.PI / 2;
    this._api3d_handle.drawPrimitive(
            this._model,
            hw, hw, hw,
            [ dst[0], dst[1], dst[2] ],
            [rotate]);
};

/**
 * Convers an API X position in [-1, 1] to a screen X position in [0, width].
 * @param x an API X position in [-1, 1]
 * @return a screen X position in [0, width]
 */
MajVj.frame.laser.prototype._toScreenX = function (x) {
    return (this._width + x * this._width * this._zoom[0]) / 2;
};

/**
 * Convers an API Y position in [-1, 1] to a screen Y position in [0, width].
 * @param x an API Y position in [-1, 1]
 * @return a screen Y position in [0, width]
 */
MajVj.frame.laser.prototype._toScreenY = function (y) {
    return (this._height + y * this._height * this._zoom[1]) / 2;
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - spiline -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.spiline = function (options) {
    this._screen = options.screen;
    this._api = options.mv.get2DInterface();
    this.properties = {};
    this._s = 0.0;
    this._r = 1.0;

    this._grid =  { x: 8, y: 8 };
    this._rx = this._api.width / this._grid.x;
    this._ry = this._api.height / this._grid.y;
    this._bx = this._rx / 2;
    this._by = this._ry / 2;
    this._sx = this._rx;
    this._sy = this._ry;

    this._api.background(0, 255);
    this._api.fill(0, 0, 0, 10);
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.spiline.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.spiline.prototype.draw = function (delta) {
    var mouse = this._screen.mouse();
    var c = this._s;
    this._s += delta * mouse.x / this._api.width;
    var n = this._s;
    this._r -= (delta / 100 * mouse.y / this._api.height) % 1;
    if (this._r < 0)
        this._r += 1.0;
    this._api.stroke(0);
    this._api.rect(this._api.width / 2, this._api.height / 2,
                   this._api.width, this._api.height);
    this._api.stroke(30, 30, 255, 150);
    var cy = this._by;
    for (var iy = 0; iy < this._grid.y; ++iy) {
        var cx = this._bx;
        for (var ix = 0; ix < this._grid.x; ++ix) {
            var sx = cx + Math.cos(c) * this._rx;
            var sy = cy + Math.sin(c) * this._ry;
            var ex = cx + Math.cos(n) * this._rx;
            var ey = cy + Math.sin(n) * this._ry;
            this._api.line(sx, sy, ex, ey);
            cx += this._sx;
        }
        cy += this._sy;
    }
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - filter -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.filter = function (options) {
    this._mv = options.mv;
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {};
    this._color = options.color || [0.0, 0.0, 0.0, 1.0];
    this._zoom = (typeof options.zoom != 'undefined') ? options.zoom : 1.0;
    this._fade = (typeof options.fade != 'undefined') ? options.fade : 1.0;
    this._offset = options.offset || [0.0, 0.0];
    this._texture = null;
    this._colorProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.filter._vColorShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.filter._fColorShader));
    this._textureProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.filter._vTextureShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.filter._fTextureShader));
    this._coords = null;
    this._texCoords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
    this._blend_src = this._screen.gl.ZERO;
    this._blend_dst = this._screen.gl.ZERO;
    this._setFilterType(options.filter);
    if (options.texture)
        this.setTexture(options.texture);
    else
        this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
};

// Filter type.
MajVj.frame.filter.REVERSE = 0;     // 1 - DST
MajVj.frame.filter.SRC = 1;         // SRC
MajVj.frame.filter.ALPHA = 2;       // SRC * a + DST * (1 - a)
MajVj.frame.filter.ADD = 3;         // SRC + DST
MajVj.frame.filter.MUL = 4;         // SRC * DST

// Shader programs.
MajVj.frame.filter._vColorShader = null;
MajVj.frame.filter._fColorShader = null;
MajVj.frame.filter._vTextureShader = null;
MajVj.frame.filter._fTextureShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.filter.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'filter', 'shaders.html', 'vColor'),
            MajVj.loadShader('frame', 'filter', 'shaders.html', 'fColor'),
            MajVj.loadShader('frame', 'filter', 'shaders.html', 'vTexture'),
            MajVj.loadShader('frame', 'filter', 'shaders.html', 'fTexture')
        ]).then(function (results) {
            MajVj.frame.filter._vColorShader = results[0];
            MajVj.frame.filter._fColorShader = results[1];
            MajVj.frame.filter._vTextureShader = results[2];
            MajVj.frame.filter._fTextureShader = results[3];
            resolve();
        }, function (error) { tma.log(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.filter.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.filter.prototype.draw = function (delta) {
    this._screen.setAlphaMode(true, this._blend_src, this._blend_dst);
    if (this._texture) {
        this._textureProgram.setAttributeArray('aCoord', this._coords, 0, 2, 0);
        this._textureProgram.setAttributeArray(
                'aTexCoord', this._texCoords, 0, 2, 0);
        this._textureProgram.setTexture('uTexture', this._texture);
        this._textureProgram.setUniformVector('uFade', [this._fade]);
        this._textureProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    } else if (this._coords) {
        this._colorProgram.setAttributeArray('aCoord', this._coords, 0, 2, 0);
        this._colorProgram.setUniformVector('uColor', this._color);
        this._colorProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    }
};

/**
 * Sets a color.
 * @param color a color in [r, g, b, a]
 */
MajVj.frame.filter.prototype.setColor = function (color) {
    this._color = color;
};

/**
 * Sets a texture.
 * @param texture a URL to point a image data for textrue, or Image object
 */
MajVj.frame.filter.prototype.setTexture = function (texture) {
    if (typeof texture === 'object' &&
        texture.constructor.name === 'HTMLImageElement') {
        this._texture = this._screen.createTexture(
              texture, true, Tma3DScreen.FILTER_LINEAR);
        this._resetCoords();
    } else {
        MajVj.loadImageFrom(texture).then(function (image) {
            this._texture = this._screen.createTexture(
                    image, true, Tma3DScreen.FILTER_LINEAR);
            this._resetCoords();
        }.bind(this), function (e) { tma.log(e); });
    }
};

/**
 * Sets texture zoom ratio.
 * @param zoom zoom ratio
 */
MajVj.frame.filter.prototype.setZoom = function (zoom) {
    this._zoom = zoom;
    this._resetCoords();
};

/**
 * Sets texture offset.
 * @param offset texture offset ratio
 */
MajVj.frame.filter.prototype.setOffset = function (offset) {
    this._offset = offset;
    this._resetCoords();
};

/**
 * Sets fade level.
 * @param fade fade level
 * offset texture offset ratio
 */
MajVj.frame.filter.prototype.setFade = function (fade) {
    this._fade = fade;
};

/**
 * Resets coords.
 */
MajVj.frame.filter.prototype._resetCoords = function () {
    if (!this._texture)
        return;
    var aspect = this._texture.width / this._texture.height;
    var w = this._zoom;
    var h = this._zoom;
    if (this._aspect > aspect)
        w *= aspect / this._aspect;
    else
        h *= this._aspect / aspect;
    var x = this._offset[0] * this._zoom;
    var y = this._offset[1] * this._zoom;
    var coords = [-w + x, -h + y, -w + x, h + y, w + x, h + y, w + x, -h + y];
    if (!this._coords) {
        this._coords = this._screen.createBuffer(coords);
    } else {
        var buffer = this._coords.buffer();
        for (var i = 0; i < coords.length; ++i)
            buffer[i] = coords[i];
        this._coords.update();
    }
};

/**
 * Sets a filter type.
 */
MajVj.frame.filter.prototype._setFilterType = function (type) {
    if (!type)
        type = MajVj.frame.filter.REVERSE;
    var gl = this._screen.gl;
    switch (type) {
        case MajVj.frame.filter.REVERSE:
            this._blend_src = gl.ZERO;
            this._blend_dst = gl.ONE_MINUS_DST_COLOR;
            break;
        case MajVj.frame.filter.SRC:
            this._blend_src = gl.ONE;
            this._blend_dst = gl.ZERO;
            break;
        case MajVj.frame.filter.ALPHA:
            this._blend_src = gl.SRC_ALPHA;
            this._blend_dst = gl.ONE_MINUS_SRC_ALPHA;
            break;
        case MajVj.frame.filter.ADD:
            this._blend_src = gl.ONE;
            this._blend_dst = gl.ONE;
            break;
        case MajVj.frame.filter.MUL:
            this._blend_src = gl.DST_COLOR;
            this._blend_dst = gl.ZERO;
            break;
    }
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - api3d -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.api3d = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._noclear = options.noclear || false;
    this.properties = {
        vr: false,
        parallax_overlap: 0.0,
        parallax_distance: 100,
        orientation: [ 0.0, 0.0, -90.0 ],
        position: [ 0.0, 0.0, 0.0 ],
        rotation: [ 0.0, 0.0, 0.0 ],
        use_orientation: true,
        use_rotation: false
    };
    this.onresize(options.aspect);

    this._drawProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    options.drawModeVertexShader ||
                    MajVj.frame.api3d._vDrawShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    options.drawModeFragmentShader ||
                    MajVj.frame.api3d._fDrawShader));
    this._textureProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    options.textureModeVertexShader ||
                    MajVj.frame.api3d._vTextureShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    options.textureModeFragmentShader ||
                    MajVj.frame.api3d._fTextureShader));
    this._pointProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    options.pointModeVertexShader ||
                    MajVj.frame.api3d._vPointShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    options.pointModeFragmentShader ||
                    MajVj.frame.api3d._fPointShader));

    this._api = {
      clear: this._clear.bind(this),
      color: [1.0, 1.0, 1.0, 1.0],
      createFont: this._createFont.bind(this),
      createTexture: this._screen.createTexture,
      delta: 0.0,
      drawBox: this._drawBox.bind(this),
      drawCharacter: this._drawCharacter.bind(this),
      drawCube: this._drawCube.bind(this),
      drawLine: this._drawLine.bind(this),
      drawPrimitive: this._drawPrimitive.bind(this),
      fill: this._fill.bind(this),
      gl: this._screen.gl,
      screen: this._screen,
      setAlphaMode: this._screen.setAlphaMode,
      drawModeShader: this._drawProgram,
      textureModeShader: this._textureProgram,
      pointModeShader: this._pointProgram,
      vr: false,
      properties: this.properties
    };

    this._pMatrix = mat4.identity(mat4.create());
    this._mvMatrixL = mat4.identity(mat4.create());
    this._mvMatrixR = mat4.identity(mat4.create());
    this._iMatrix = mat4.identity(mat4.create());
    this._matrix = mat4.create();

    this._buffer2 = this._screen.createBuffer(new Array(2 * 3));
    this._bufferICoord = this._screen.createBuffer(
            [-1, -1, 1, -1, 1, 1, 1, 1, 1, 1, -1, 1]);
    this._box = TmaModelPrimitives.createBox();
    this._cube = TmaModelPrimitives.createCube();

    var opt = options.options || {};
    opt.screen = this._screen;
    opt.api = this._api;
    opt.properties = this.properties;
    this._module = options.module ? new options.module(opt) : {
        draw: options.draw || function (api) {},
        clear: options.clear || function (api) {}
    };
};

// Shader programs.
MajVj.frame.api3d._vDrawShader = null;
MajVj.frame.api3d._fDrawShader = null;
MajVj.frame.api3d._vTextureShader = null;
MajVj.frame.api3d._fTextureShader = null;
MajVj.frame.api3d._vPointShader = null;
MajVj.frame.api3d._fPointShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.api3d.load = function () {
    return new Promise(function (resolve, reject) {
        var name = 'api3d';
        var path = 'shaders.html';
        Promise.all([
                MajVj.loadShader('frame', name, path, 'v_draw'),
                MajVj.loadShader('frame', name, path, 'f_draw'),
                MajVj.loadShader('frame', name, path, 'v_texture'),
                MajVj.loadShader('frame', name, path, 'f_texture'),
                MajVj.loadShader('frame', name, path, 'v_point'),
                MajVj.loadShader('frame', name, path, 'f_point'),
        ]).then(function (results) {
            MajVj.frame.api3d._vDrawShader = results[0];
            MajVj.frame.api3d._fDrawShader = results[1];
            MajVj.frame.api3d._vTextureShader = results[2];
            MajVj.frame.api3d._fTextureShader = results[3];
            MajVj.frame.api3d._vPointShader = results[4];
            MajVj.frame.api3d._fPointShader = results[5];
            resolve();
        }, function () { reject('api3d.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.api3d.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.api3d.prototype.draw = function (delta) {
    var api = this.beginDraw(delta);
    if (!this._noclear)
      this._module.clear(api);
    this._module.draw(api);
    this.endDraw();
};

/**
 * Sets up to call APIs and returns an API handle.
 * @param delta delta time from the last rendering
 * @return an API handle
 */
MajVj.frame.api3d.prototype.beginDraw = function (delta) {
    this._screen.pushAlphaMode();

    var aspect = this._aspect;

    var rx, ry, rz;
    if (this.properties.use_rotation) {
        var rotation = this.properties.rotation;
        rx = rotation[0];
        ry = rotation[1];
        rz = rotation[2];
    } else if (this.properties.use_orientation) {
        // TODO: Something is wrong on looking at sides.
        var orientation = this.properties.orientation;
        rx = (90 + orientation[2]) / 360 * Math.PI * 2;
        ry = -orientation[0] / 360 * Math.PI * 2;
        rz = orientation[1] / 360 * Math.PI * 2;
    }
    mat4.identity(this._mvMatrixL);
    mat4.rotateZ(this._mvMatrixL, this._mvMatrixL, rz);
    mat4.rotateY(this._mvMatrixL, this._mvMatrixL, ry);
    mat4.rotateX(this._mvMatrixL, this._mvMatrixL, rx);

    this._api.vr = this.properties.vr;

    if (this._api.vr) {
        // TODO: Parallax calculation is also wrong.
        aspect *= (1 + this.properties.parallax_overlap) / 2;
        var distance = this.properties.parallax_distance;
        mat4.translate(this._mvMatrixR, this._mvMatrixL, [-distance, 0, 0]);
        mat4.translate(this._mvMatrixL, this._mvMatrixL, [distance, 0, 0]);
    }
    mat4.perspective(this._pMatrix, Math.PI / 3, aspect, 0.1, 10000.0);
    this._viewport(this._api.vr ? 1 : 0);

    this._api.delta = delta;
    return this._api;
};

/**
 * Cleans up to call APIs. Should be called for each beginDraw().
 */
MajVj.frame.api3d.prototype.endDraw = function () {
    this._screen.popAlphaMode();
};

/**
 * Sets viewport.
 * @param mode 0: normal, 1: left, 2: right
 */
MajVj.frame.api3d.prototype._viewport = function (view) {
    var c = this._width / 2;
    var d = c * this.properties.parallax_overlap;
    var x = view == 2 ? (c - d) : 0;
    var w = view == 0 ? this._width : (c + d);
    this._screen.gl.viewport(x, 0, w, this._height);
};

/**
 * Clears the display.
 * @param flag flag, e.g., gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT
 */
MajVj.frame.api3d.prototype._clear = function (flag) {
    this._screen.gl.clearColor(this._api.color[0], this._api.color[1],
                               this._api.color[2], this._api.color[3]);
    this._screen.gl.clear(flag);
    if (this._api.vr) {
        this._viewport(2);
        this._screen.gl.clear(flag);
        this._viewport(1);
    }
};

/**
 * Draws a box.
 * @param w width
 * @param h height
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 * @param texture texture (optional)
 */
MajVj.frame.api3d.prototype._drawBox = function (w, h, p, r, texture) {
    this._box.setTexture(texture);
    return this._drawPrimitive(this._box, w, h, 1.0, p, r);
};

/**
 * Draws a character.
 * @param font a font set that is created by createFont API
 * @param c a character to show
 * @param w width scale (actual size depends on font size)
 * @param h height scale (actual size depends on font size)
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 */
MajVj.frame.api3d.prototype._drawCharacter =
        function (font, c, w, h, p, r) {
    var texture = font[c];
    this._box.setTexture(texture);
    var width = texture.width * w;
    var height = texture.height * h;
    return this._drawPrimitive(this._box, width, height, 1.0, p, r);
};

/**
 * Draws a cube.
 * @param w width
 * @param h height
 * @param d depth
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 */
MajVj.frame.api3d.prototype._drawCube = function (w, h, d, p, r) {
    return this._drawPrimitive(this._cube, w, h, d, p, r);
};

/**
 * Draws a line.
 * @param src source position in [x, y, z]
 * @param dst destination position in [x, y, z]
 */
MajVj.frame.api3d.prototype._drawLine = function (src, dst) {
    var buffer = this._buffer2.buffer();
    buffer[0] = src[0] - this.properties.position[0];
    buffer[1] = src[1] - this.properties.position[1];
    buffer[2] = src[2] - this.properties.position[2];
    buffer[3] = dst[0] - this.properties.position[0];
    buffer[4] = dst[1] - this.properties.position[1];
    buffer[5] = dst[2] - this.properties.position[2];
    this._buffer2.update();
    this._drawProgram.setAttributeArray('aCoord', this._buffer2, 0, 3, 0);
    this._drawProgram.setUniformVector('uColor', this._api.color);
    this._drawProgram.setUniformMatrix('uMatrix', this._iMatrix);

    this._drawProgram.setUniformMatrix('uPMatrix', this._pMatrix);
    this._drawProgram.setUniformMatrix('uMVMatrix', this._mvMatrixL);
    this._drawProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);

    if (this._api.vr) {
        this._viewport(2);
        this._drawProgram.setUniformMatrix('uMVMatrix', this._mvMatrixR);
        this._drawProgram.drawArrays(Tma3DScreen.MODE_LINES, 0, 2);
        this._viewport(1);
    }
};

/**
 * Draws a primitive.
 * @param o primitive
 * @param w width
 * @param h height
 * @param d depth
 * @param p position in [x, y, z]
 * @param r rotations in Array of [z, y, z] in radian (optional)
 * @param v volume (optional)
 */
MajVj.frame.api3d.prototype._drawPrimitive = function (o, w, h, d, p, r, v) {
    var texture = o.getTexture();
    var mode = o.getDrawMode();
    var point = mode == Tma3DScreen.MODE_POINTS;
    var program = texture ? this._textureProgram :
                  point ? this._pointProgram : this._drawProgram;
    program.setAttributeArray(
            'aCoord', o.getVerticesBuffer(this._screen), 0, 3, 0);
    if (texture) {
        program.setAttributeArray(
               'aTexCoord', o.getCoordsBuffer(this._screen), 0, 2, 0);
        program.setTexture('uTexture', texture);
        program.setUniformVector('uVolume', [v === undefined ? 1.0 : v]);
    } else if (point) {
        program.setUniformVector('uSize', [(w + h + d) / 3]);
        program.setAttributeArray(
                'aColor', o.getColorsBuffer(this._screen), 0, 4, 0);
    } else {
        program.setUniformVector('uColor', this._api.color);
    }

    var rp = [
        p[0] - this.properties.position[0],
        p[1] - this.properties.position[1],
        p[2] - this.properties.position[2]
    ];
    mat4.translate(this._matrix, this._iMatrix, rp);
    if (r) {
        for (var i = r.length - 1; i >= 0; --i) {
            var rotate = r[i];
            mat4.rotateX(this._matrix, this._matrix, rotate[0]);
            mat4.rotateY(this._matrix, this._matrix, rotate[1]);
            mat4.rotateZ(this._matrix, this._matrix, rotate[2]);
        }
    }
    mat4.scale(this._matrix, this._matrix, [w, h, d]);
    program.setUniformMatrix('uMatrix', this._matrix);

    program.setUniformMatrix('uPMatrix', this._pMatrix);
    program.setUniformMatrix('uMVMatrix', this._mvMatrixL);
    if (mode != Tma3DScreen.MODE_LINE_TRIANGLES) {
        program.drawElements(
                mode, o.getIndicesBuffer(this._screen), o.getIndicesOffset(),
                o.getIndicesLength());
    } else {
        for (var i = o.getIndicesOffset(); i < o.getIndicesLength(); i += 3) {
            program.drawElements(
                    Tma3DScreen.MODE_LINE_LOOP,
                    o.getIndicesBuffer(this._screen), i * 2, 3);
        }
    }
    if (this._api.vr) {
        this._viewport(2);
        program.setUniformMatrix('uMVMatrix', this._mvMatrixR);
        if (mode != Tma3DScreen.MODE_LINE_TRIANGLES) {
            program.drawElements(
                    mode, o.getIndicesBuffer(this._screen),
                    o.getIndicesOffset(), o.getIndicesLength());
        } else {
            for (var i = o.getIndicesOffset(); i < o.getIndicesLength();
                    i += 3) {
                program.drawElements(
                        Tma3DScreen.MODE_LINE_LOOP,
                        o.getIndicesBuffer(this._screen), i * 2, 3);
            }
        }
        this._viewport(1);
    }
};

/**
 * Fills display textures.
 * @param color a color in [r, g, b, a]
 */
MajVj.frame.api3d.prototype._fill = function (color) {
    var c = color || this._api.color;
    this._drawProgram.setAttributeArray('aCoord', this._bufferICoord, 0, 3, 0);
    this._drawProgram.setUniformVector('uColor', c);
    this._drawProgram.setUniformMatrix('uPMatrix', this._iMatrix);
    this._drawProgram.setUniformMatrix('uMVMatrix', this._iMatrix);
    this._drawProgram.setUniformMatrix('uMatrix', this._iMatrix);
    this._drawProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    if (this._api.vr) {
        this._viewport(2);
        this._drawProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
        this._viewport(1);
    }
};

/**
 * Creates a font context.
 * @param font font information for Tma3DScreen.prototype.createStringTexture()
 * @param text a string that contains characters
 */
MajVj.frame.api3d.prototype._createFont = function (font, text) {
    var result = {};
    // FIXME: Support surrogate code pairs
    for (var i = 0; i < text.length; ++i)
        result[text[i]] = this._screen.createStringTexture(text[i], font);
    return result;
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - image -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.image = function(options) {
  this._screen = options.screen;
  this._mv = options.mv;
  this._width = options.width;
  this._height = options.height;
  this._keepAspect = !(options.keepAspect == false);
  this.properties = {
    scroll: [0, 0],  // base point in the original image pixel range
    scale: 1.0,
    volume: 1.0
  };
  this._texture = null;

  this._program = this._screen.createProgram(
    this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
      MajVj.frame.image._vertexShader),
    this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
      MajVj.frame.image._fragmentShader));
  this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0])
  if (options.url) {
    MajVj.loadImageFrom(options.url).then(image => {
      this._texture = this._screen.createTexture(image, true);
    });
  } else if (options.image) {
    this._texture = this._screen.createTexture(options.image, true);
  }
};

// Shader programs.
MajVj.frame.image._vertexShader = null;
MajVj.frame.image._fragmentShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.image.load = function() {
  return new Promise(function(resolve, reject) {
    Promise.all([
      MajVj.loadShader('frame', 'image', 'shaders.html', 'vertex'),
      MajVj.loadShader('frame', 'image', 'shaders.html', 'fragment')
    ]).then(function(results) {
      MajVj.frame.image._vertexShader = results[0];
      MajVj.frame.image._fragmentShader = results[1];
      resolve();
    }, function(error) {
      tma.log(error);
    });
  });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.image.prototype.onresize = function(aspect) {
  var size = this._mv.size();
  this._width = size.width;
  this._height = size.height;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.image.prototype.draw = function(delta) {
  if (!this._texture)
    return;
  this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
  this._program.setUniformVector('uScale', this._keepAspect ? [
    this._texture.width / this._width * this.properties.scale,
    this._texture.height / this._height * this.properties.scale
  ] : [this.properties.scale, this.properties.scale]);
  this._program.setUniformVector('uOffset', [
    this.properties.scroll[0] / this._width,
    this.properties.scroll[1] / this._height
  ]);
  this._program.setUniformVector('uVolume', [this.properties.volume]);
  this._program.setTexture('uTexture', this._texture);
  this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - wired -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.wired = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = { slider: 0.0 };
    this._rotate = 0.0;

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.wired._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.wired._fragmentShader));
    this._lines = this._screen.createBuffer(function () {
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
    this.onresize(this._aspect);
};

// Shader programs.
MajVj.frame.wired._vertexShader = null;
MajVj.frame.wired._fragmentShader = null;

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
    mat4.perspective(this._pMatrix, 45, aspect, 0.1, 1000.0);
    mat4.translate(this._pMatrix, this._pMatrix, [ 0.0, 0.0, -250.0 ]);
    mat4.rotate(this._pMatrix, this._pMatrix, this._rotate, [ 0.1, 0.2, 0.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.wired.prototype.draw = function (delta) {
    var rotate = 0.002 * delta * (0.5 + this.properties.slider * 1.5);
    this._rotate += rotate;
    mat4.rotate(this._pMatrix, this._pMatrix, rotate, [ 0.1, 0.2, 0.0 ]);
    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    this._program.setAttributeArray(
            'aVertexPosition', this._lines, 0, 3, 0);
    this._program.drawArrays(Tma3DScreen.MODE_LINES, 0, this._lines.items);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - specticle -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.specticle = function (options) {
    this._mv = options.mv;
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {
      fftDb: new Float32Array(1024),
      color: options.color || [0.7, 0.2, 0.5, 1.0]
    };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.specticle._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.specticle._fragmentShader));
    this._matrix = mat4.identity(mat4.create());
    this.onresize(this._aspect);
    this._t = 0.0;
    this._n = 500;
    this._coords = this._screen.createBuffer(new Array(this._n * 3));
    this._dh = new Array(this._n);
    this._dv = new Array(this._n);
    this._r = new Array(this._n);
    this._sv = new Array(this._n);
    this._sh = new Array(this._n);
    var random = options.random || 1.0;
    for (var i = 0; i < this._n; ++i) {
        this._dh[i] = Math.random() * Math.PI * 2;
        this._dv[i] = Math.random() * Math.PI * 2;
        this._r[i] = Math.random() * random * 6 + (3 - random);
        this._sv[i] = Math.random() * 10 + 10;
        this._sh[i] = Math.random() * 20 + 20;
    }
};

// Shader programs.
MajVj.frame.specticle._vertexShader = null;
MajVj.frame.specticle._fragmentShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.specticle.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'specticle', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'specticle', 'shaders.html', 'fragment')
        ]).then(function (results) {
            MajVj.frame.specticle._vertexShader = results[0];
            MajVj.frame.specticle._fragmentShader = results[1];
            resolve();
        }, function (error) { tma.log(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.specticle.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(this._matrix, Math.PI / 4, aspect, 0.1, 100.0);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.specticle.prototype.draw = function (delta) {
    this._t += delta;
    var t = this._t / 10000;
    var buffer = this._coords.buffer();
    var useLength = this.properties.fftDb.length / 2 - 128;
    for (var i = 0; i < this._n; ++i) {
        var y = Math.sin(t * this._sv[i] + this._dv[i]) * 10;
        var r = 1.0;
        var n = 0 | (useLength * (y + 10) / 20);
        var d = 80.0 + this.properties.fftDb[128 + n];
        if (d < 0)
            d = 0;
        r = d / 20;
        buffer[i * 3 + 0] =
            Math.cos(t * this._sh[i] + this._dh[i]) * this._r[i] * r;
        buffer[i * 3 + 1] = y;
        buffer[i * 3 + 2] =
            Math.sin(t * this._sh[i] + this._dh[i]) * this._r[i] * r - 40;
    }
    this._coords.update();
    this._screen.setAlphaMode(true, this._screen.gl.ONE, this._screen.gl.ONE);
    this._program.setAttributeArray('aCoord', this._coords, 0, 3, 0);
    this._program.setUniformMatrix('uMatrix', this._matrix);
    this._program.setUniformVector('uColor', this.properties.color);
    this._program.drawArrays(Tma3DScreen.MODE_POINTS, 0, this._n);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - morphere -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.morphere = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = { volume: 1.0 };

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.morphere._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.morphere._fragmentShader));
    this._sphere = TmaModelPrimitives.createSphere(
            MajVj.frame.morphere.resolution,
            TmaModelPrimitives.SPHERE_METHOD_EVEN);
    this._sphere.scale(10);
    this._pMatrix = mat4.identity(mat4.create());
    this._color = [0.1, 0.1, 0.4];
    this._vertices = this._sphere.getVertices().length;
    this._b = new Array(this._vertices);
    this._v = new Array(this._vertices);
    this._r = new Array(this._vertices);
    this._t = new Array(this._vertices);
    for (var i = 0; i < this._vertices; ++i) {
        this._b[i] = this._sphere.getVertices()[i];
        this._v[i] = Math.random();
        this._r[i] = Math.random() * 5;
        this._t[i] = Math.random() * Math.PI * 2;
    }

    this.onresize(this._aspect);
};

MajVj.frame.morphere.resolution = 4;

// Shader programs.
MajVj.frame.morphere._vertexShader = null;
MajVj.frame.morphere._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.morphere.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'morphere', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'morphere', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.morphere._vertexShader = shaders[0];
            MajVj.frame.morphere._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('morphere.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.morphere.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(this._pMatrix, Math.PI / 4, aspect, 0.1, 100.0);
    mat4.translate(this._pMatrix, this._pMatrix, [ 0.0, 0.0, -70.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.morphere.prototype.draw = function (delta) {
    var buffer = this._sphere.getVerticesBuffer(this._screen);
    var vertices = buffer.buffer();
    var sin = Math.sin;
    var d = delta / 100;
    for (var i = 0; i < this._vertices; ++i) {
        this._t[i] += this._v[i] * d;
        vertices[i] = this._b[i] + sin(this._t[i]) * this._r[i];
    }
    buffer.update();
    var size = 2.0 * this.properties.volume;
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(false);
    var matrix = mat4.create();
    mat4.scale(matrix, this._pMatrix, [size, size, size]);
    this._program.setAttributeArray('aVertexPosition', buffer, 0, 3, 0);
    this._program.setUniformMatrix('uPMatrix', matrix);
    this._program.setUniformVector('uColor', this._color);
    this._program.drawElements(Tma3DScreen.MODE_TRIANGLES,
                               this._sphere.getIndicesBuffer(this._screen),
                               0,
                               this._sphere.items());
    this._screen.popAlphaMode();
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.nicofarre = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {};

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre._fragmentShader));
    this._coords = this._screen.createBuffer([
            // A (right): (40, 760) - (1520, 1040) / (1920, 1080)
            40 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            // B (stage): (40, 120) - (880, 400) / (1920, 1080)
            40 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // C (left): (40, 440) - (1520, 720) / (1920, 1080)
            40 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // D (back): (920, 120) - (1760, 400) / (1920, 1080)
            920 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            920 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // E (stage right): (1560, 760) - (1720, 1040) / (1920, 1080)
            1560 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            1560 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            // F (stage left): (1560, 440) - (1720, 720) / (1920, 1080)
            1560 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            1560 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // G (ceiling): (1760, 870) - (1858, 1040) / (1920, 1080)
            1760 / 1920 * 2 - 1, 870 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1858 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1858 / 1920 * 2 - 1, 870 / 1080 * 2 - 1,
            // LEFT_STAGE_RIGHT - C
            40 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // LEFT_STAGE_RIGHT - B
            40 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // LEFT_STAGE_RIGHT - A
            40 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            // WHOLE WALLS - D
            920 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            920 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // WHOLE WALLS - C
            40 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // WHOLE WALLS - B
            40 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // WHOLE WALLS - A
            40 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 760 / 1080 * 2 - 1]);
    this._texCoods = this._screen.createBuffer([
            0, 0, 0, 1, 1, 1, 1, 0,  // A
            0, 0, 0, 1, 1, 1, 1, 0,  // B
            0, 0, 0, 1, 1, 1, 1, 0,  // C
            0, 0, 0, 1, 1, 1, 1, 0,  // D
            0, 0, 0, 1, 1, 1, 1, 0,  // E
            0, 0, 0, 1, 1, 1, 1, 0,  // F
            0, 0, 0, 1, 1, 1, 1, 0,  // G
            // LEFT_STAGE_RIGHT - C, B, A
            0, 0, 0, 1, 1480 / 3800, 1, 1480 / 3800, 0,
            1480 / 3800, 0, 1480 / 3800, 1, 2320 / 3800, 1, 2320 / 3800, 0,
            2320 / 3800, 0, 2320 / 3800, 1, 3800 / 3800, 1, 3800 / 3800, 0,
            // WHOLE WALLS - D, C, B, A
            4220 / 4640, 0, 4220 / 4640, 1, 5060 / 4640, 1, 5060 / 4640, 0,
            420 / 4640, 0, 420 / 4640, 1, 1900 / 4640, 1, 1900 / 4640, 0,
            1900 / 4640, 0, 1900 / 4640, 1, 2740 / 4640, 1, 2740 / 4640, 0,
            2740 / 4640, 0, 2740 / 4640, 1, 4220 / 4640, 1, 4220 / 4640, 0,
            ]);
    var size = [
            [1480, 280],  // A
            [840, 280],   // B
            [1480, 280],  // C
            [840, 280],   // D
            [160, 280],   // E
            [160, 280],   // F
            [98, 170],    // G
            // LEFT_STAGE_RIGHT - C, B, A
            [3800, 280], [], [],
            // WHOLE WALLS - D, (C, B, A)
            [4640, 280], [], [], []];
    this._led = options.led;
    this._mirror = options.mirror;
    if (this._mirror === undefined)
        this._mirror = MajVj.frame.nicofarre.MIRROR_OFF;
    var w = size[this._led[0]][0] * this._width / 1920;
    var h = size[this._led[0]][1] * this._height / 1080;
    this._fbo = this._screen.createFrameBuffer(w, h);
    this._frames = [];
    for (var i = 0; i < options.frames.length; ++i) {
        var frame = options.frames[i];
        var flags = {};
        if (typeof frame != 'string') {
            flags = frame.options || {};
            frame = frame.name;
        }
        flags.width = flags.width || w;
        flags.height = flags.height || h;
        flags.aspect = flags.aspect || w / h;
        this._frames[i] = options.mv.create('frame', frame, flags);
    }
};

// Const values to specify the showing LED screen.
MajVj.frame.nicofarre.LED_A = [0];
MajVj.frame.nicofarre.LED_B = [1];
MajVj.frame.nicofarre.LED_C = [2];
MajVj.frame.nicofarre.LED_D = [3];
MajVj.frame.nicofarre.LED_E = [4];
MajVj.frame.nicofarre.LED_F = [5];
MajVj.frame.nicofarre.LED_G = [6];
MajVj.frame.nicofarre.LED_WALL_RIGHT = [0];
MajVj.frame.nicofarre.LED_STAGE = [1];
MajVj.frame.nicofarre.LED_WALL_LEFT = [2];
MajVj.frame.nicofarre.LED_BACK = [3];
MajVj.frame.nicofarre.LED_FRONT_RIGHT = [4];
MajVj.frame.nicofarre.LED_FRONT_LEFT = [5];
MajVj.frame.nicofarre.LED_CEILING = [6];
MajVj.frame.nicofarre.LED_FRONT_BOTH = [4, 5];
MajVj.frame.nicofarre.LED_WALL_BOTH = [0, 2];
MajVj.frame.nicofarre.LED_STAGE_AND_BACK = [1, 3];
MajVj.frame.nicofarre.LED_LEFT_STAGE_RIGHT = [7, 8, 9];
MajVj.frame.nicofarre.LED_WHOLE_WALLS = [10, 11, 12, 13];

// Const values to specify mirroing mode.
MajVj.frame.nicofarre.MIRROR_OFF = -1;
MajVj.frame.nicofarre.MIRROR_ON_RIGHT = 0;
MajVj.frame.nicofarre.MIRROR_ON_LEFT = 1;

// Shader programs.
MajVj.frame.nicofarre._vertexShader = null;
MajVj.frame.nicofarre._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.nicofarre.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'nicofarre', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'nicofarre', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.nicofarre._vertexShader = shaders[0];
            MajVj.frame.nicofarre._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('nicofarre.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.nicofarre.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.nicofarre.prototype.draw = function (delta) {
    var fbo = this._fbo.bind();
    var i;
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(true, this._screen.gl.ONE, this._screen.gl.ONE);
    this._screen.fillColor(0.0, 0.0, 0.0, 1.0);
    for (i = 0; i < this._frames.length; ++i)
        this._frames[i].draw(delta);
    this._screen.popAlphaMode();
    fbo.bind();
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setAttributeArray('aTexCoord', this._texCoods, 0, 2, 0);
    this._program.setTexture('uTexture', this._fbo.texture);
    for (i = 0; i < this._led.length; ++i) {
        var offset = this._led[i] * 4;
        var mirror = (i == this._mirror) ? 1 : 0;
        this._program.setUniformVector('uMirror', [mirror]);
        this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, offset, 4);
    }
};

/**
 * Gets a frame plugin internally created
 * @return a frame plugin object
 */
MajVj.frame.nicofarre.prototype.getFrame = function (i) {
    return this._frames[i];
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - light -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.light = function (options) {
    this._screen = options.screen;
    this.properties = {
        color: options.color || [ 0.0, 0.0, 0.03, 1.0 ],
        coord: options.coord || [ 0.0, -1.2 ],
        scale: options.scale || [ 1.0, 5.0 ]
    };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.light._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.light._fragmentShader));
    this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
};

// Shader programs.
MajVj.frame.light._vertexShader = null;
MajVj.frame.light._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.frame.light.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'light', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'light', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.light._vertexShader = shaders[0];
            MajVj.frame.light._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('light.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.light.prototype.onresize = function (aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.light.prototype.draw = function (delta) {
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setUniformVector('uColor', this.properties.color);
    this._program.setUniformVector('uCoord', this.properties.coord);
    this._program.setUniformVector('uScale', this.properties.scale);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - snow -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.snow = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = { slider: 1.0 };
    this._ps = new TmaParticle.Container(MajVj.frame.snow.ps);
    this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.snow._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.snow._fragmentShader));
    this._image = this._screen.createImage(this._width, this._height);
    this._data = this._image.data;
    this._texture = this._screen.createTexture(
            this._image, true, Tma3DScreen.FILTER_LINEAR);
    this.onresize(this._aspect);
};

// Shader programs.
MajVj.frame.snow._vertexShader = null;
MajVj.frame.snow._fragmentShader = null;


/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.snow.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'snow', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'snow', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.snow._vertexShader = shaders[0];
            MajVj.frame.snow._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('snow.load failed'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.snow.prototype.onresize = function (aspect) {
    // Do smoething to support dynamic screen size update.
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.snow.prototype.draw = function (delta) {
    var volume = this.properties.slider;
    if (volume == 0.0)
        return;

    var i;
    var n = delta|0;
    if (n > 20)
        n = 20;
    for (i = 0; i < n; ++i) {
        var x = Math.random() * this._width;
        var vx = (Math.random() - 0.5) * 0.1;
        var vy = Math.random() + 0.5;
        this._ps.add(x, vx, vy, this._image, this._width, this._height);
    }
    var size = this._width * this._height * 4;
    for (i = 0; i < size; ++i)
        this._data[i] = 0;
    this._ps.update();
    this._texture.update(this._image);
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', this._texture);
    this._program.setUniformVector('uVolume', [volume]);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};

/**
 * snow.ps prototype.
 */
MajVj.frame.snow.ps = function () {
    TmaParticle.apply(this, arguments);
};
MajVj.frame.snow.ps.prototype = new TmaParticle(null, 0);
MajVj.frame.snow.ps.prototype.constructor = MajVj.frame.snow.ps;

MajVj.frame.snow.ps.GRAVITY = 1 / 1000;

/**
 * Initializes a object. This function is used to initialize a particle object
 * instead of constructor in order to reuse existing objects.
 * @param x initial x position
 * @param vx initial x verlocity
 * @param vy initial y verlocity
 * @param image image object to draw
 * @param width offscreen width
 * @param height offscreen height
 */
MajVj.frame.snow.ps.prototype.initialize =
        function (x, vx, vy, image, width, height) {
    this.y = 0;
    this.x = x;
    this.vx = vx;
    this.vy = vy;
    this.image = image;
    this.width = width;
    this.height = height;
};

/**
 * Update a particle.
 */
MajVj.frame.snow.ps.prototype.update = function () {
    this.vy += MajVj.frame.snow.ps.GRAVITY;
    this.vy *= 0.999;
    this.y += this.vy;
    if (this.y >= this.height)
        return false;
    this.x += this.vx;
    if (this.x < 0 || this.x >= this.width)
        return false;
    this.image.setPixel(this.x|0, this.y|0, 0xff, 0xff, 0xff, 0xff);
    return true;
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - shadertoy -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.shadertoy = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = {
        volume: 0.0,
        wave: new Float32Array(2048),
        fft: new Uint8Array(1024),
        fftDb: new Float32Array(1024)
    };
    this._textures = options.textures;
    this._time = 0.0;
    this._program = null;
    if (options.shader)
        this.setShader(options.shader, options.gl2);
    this._copy = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.shadertoy._vertexShader1),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.shadertoy._fragmentShader));
    this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
    var waveTableWidth = this.properties.wave.length;
    var textureHeight = 2;
    this._waveData = new Uint8Array(waveTableWidth * textureHeight * 4);
    this._waveTexture = this._screen.createDataTexture(
            this._waveData, waveTableWidth, textureHeight, true);
    this._mouse = { x: 0.0, y: 0.0, cx: 0.0, cy: 0.0 };
    this._updateMouse = options.updateMouse !== false;
    this._fbo = [
            this._screen.createFrameBuffer(this._width, this._height),
            this._screen.createFrameBuffer(this._width, this._height)
    ];
};

// Shader programs.
MajVj.frame.shadertoy._vertexShader1 = null;
MajVj.frame.shadertoy._vertexShader2 = null;
MajVj.frame.shadertoy._fragmentShader = null;
MajVj.frame.shadertoy._shadertoyHeader = null;
MajVj.frame.shadertoy._shadertoyFooter1 = null;
MajVj.frame.shadertoy._shadertoyFooter2 = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.shadertoy.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'shadertoy', 'shaders.html', 'vertex1'),
            MajVj.loadShader('frame', 'shadertoy', 'shaders.html', 'vertex2'),
            MajVj.loadShader('frame', 'shadertoy', 'shaders.html', 'fragment'),
            MajVj.loadShader(
                'frame', 'shadertoy', 'shaders.html', 'fragment_head'),
            MajVj.loadShader(
                'frame', 'shadertoy', 'shaders.html', 'fragment_foot1'),
            MajVj.loadShader(
                'frame', 'shadertoy', 'shaders.html', 'fragment_foot2')
        ]).then(function (results) {
            MajVj.frame.shadertoy._vertexShader1 = results[0];
            MajVj.frame.shadertoy._vertexShader2 = results[1];
            MajVj.frame.shadertoy._fragmentShader = results[2];
            MajVj.frame.shadertoy._shadertoyHeader = results[3];
            MajVj.frame.shadertoy._shadertoyFooter1 = results[4];
            MajVj.frame.shadertoy._shadertoyFooter2 = results[5];
            resolve();
        }, function (error) { tma.log(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 * @param size offscreen size { width, height }
 */
MajVj.frame.shadertoy.prototype.onresize = function (aspect, size) {
    this._aspect = aspect;
    this._width = size ? size.width : this._screen.canvas.width;
    this._height = size ? size.height : this._screen.canvas.height;
    this._fbo = [
            this._screen.createFrameBuffer(this._width, this._height),
            this._screen.createFrameBuffer(this._width, this._height)
    ];
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.shadertoy.prototype.draw = function (delta) {
    var lastFbo = this._fbo[0];
    var currentFbo = this._fbo[1];
    this._fbo = [currentFbo, lastFbo];
    var fbo = currentFbo.bind();
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(false);
    this._screen.fillColor(0.0, 0.0, 0.0, 1.0);
    this._screen.setAlphaMode(true, this._screen.gl.ONE, this._screen.gl.ONE);

    var ratio = this.properties.fft.length / this.properties.wave.length;
    var width = this.properties.wave.length;
    var fftOffset = width * 4;
    for (var x = 0; x < width; ++x) {
      let offset = x * 4;
      this._waveData[offset] = (this.properties.wave[x] * 127 + 128)|0;
      this._waveData[offset + 3] = this._waveData[offset];
      offset += fftOffset;
      this._waveData[offset] = this.properties.fft[(x * ratio)|0];
      this._waveData[offset + 3] = this._waveData[offset];
    }
    this._waveTexture.update(this._waveData);

    // Set shadertoy compatible uniforms.
    this._time += delta / 1000.0;
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setUniformVector(
        'iResolution', [this._width, this._height, 1.0]);
    this._program.setUniformVector('iGlobalTime', [this._time]);
    this._program.setUniformVector('iTime', [this._time]);
    this._program.setUniformVector('iTimeDelta', [delta / 1000.0]);
    this._program.setUniformVector(
        'iChannelTime', [this._time, this._time, this._time, this._time]);
    var mouse = this._screen.mouse();
    if (this._updateMouse && mouse.over) {
        var click = mouse.click.on ? 1.0 : -1.0;
        this._mouse = {
            x: (mouse.x / mouse.width) * this._width,
            y: (1.0 - mouse.y / mouse.height) * this._height,
            cx: click * mouse.click.x / mouse.width * this._width,
            cy: click * (1.0 - mouse.click.y / mouse.height) * this._height
        };
    }
    this._program.setUniformVector(
        'iMouse',
        [this._mouse.x, this._mouse.y, this._mouse.cx, this._mouse.cy]);
    if (this._textures) {
        for (var i = 0; i < 3; ++i) {
            if (!this._textures[i])
                continue;
            if (this._textures[i] == 'audio') {
                this._program.setTexture('iChannel' + i, this._waveTexture);
                this._program.setUniformVector(
                        'iChannelResolution[' + i + ']',
                        [this.properties.wave.length, 2.0, 1.0]);
            } else if (this._textures[i] == 'previous-frame') {
                this._program.setTexture('iChannel' + i, lastFbo.texture);
                this._program.setUniformVector(
                        'iChannelResolution[' + i + ']',
                        [this._width, this._height, 1.0]);
            }
        }
    }
    this._program.setUniformVector('iDate', [Date.now()]);

    // Set shadertone compatible uniforms.
    this._program.setUniformVector(
        'iOvertoneVolume', [this.properties.volume]);

    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);

    fbo.bind();
    this._screen.setAlphaMode(true, this._screen.gl.ONE, this._screen.gl.ZERO);
    this._screen.fillColor(0.0, 0.0, 0.0, 1.0);

    this._copy.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._copy.setTexture('uTexture', currentFbo.texture);
    this._copy.setUniformVector('uWidth', [this._width]);
    this._copy.setUniformVector('uHeight', [this._height]);
    this._copy.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);

    this._screen.popAlphaMode();
};

/**
 * Sets a fragment shader.
 * @param shader a fragment shader
 */
MajVj.frame.shadertoy.prototype.setShader = function (shader, gl2) {
    const ver = gl2 ? '#version 300 es\n#define texture2D texture\n' : '';
    const frag_foot =
            gl2 ? MajVj.frame.shadertoy._shadertoyFooter2
                : MajVj.frame.shadertoy._shadertoyFooter1;
    const fs = this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
            ver + MajVj.frame.shadertoy._shadertoyHeader + shader + frag_foot);
    const vs = this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
            gl2 ? MajVj.frame.shadertoy._vertexShader2
                : MajVj.frame.shadertoy._vertexShader1);
    this._program = this._screen.createProgram(vs, fs);
};
/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - textroll -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.textroll = function(options) {
  this._api3d = options.mv.create('frame', 'api3d', {
    draw: this._draw.bind(this)
  });
  this.properties = {
    rotate: 0,
    speed: options.speed !== undefined ? options.speed : Math.PI / 100000
  };
  this._box = TmaModelPrimitives.createBox();
  this._data = [];
  this._position = options.position || [ 0, 0, 0 ];
  this._initial_position =
      [ this._position[0], this._position[1], this._position[2] ];
  this._scale = options.scale !== undefined ? options.scale : 1;
  this._rotateBase = options.rotate || 0;
  this._camera = options.camera;
  this._type = options.type;  // "roll" (default), "zoom", "starwars"

  var height = 0;
  var width = 0;
  var i;
  for (i = 0; i < options.texts.length; ++i) {
    var input = options.texts[i];
    var style = options.styles[input.style];
    var texture = options.screen.createStringTexture(input.text, {
      name: style.name,
      size: style.size,
      weight: style.weight,
      fill: style.fill,
      stroke: style.stroke,
      foreground: style.fg,
      background: 'rgba(0, 0, 0, 0)'
    });
    var linespace = texture.height * (style.linespace || 1);
    this._data.push({
      texture: texture,
      linespace: linespace,
      alignment: style.alignment,
      direction: style.direction || 1
    });
    height += linespace;
    if (width < texture.width)
      width = texture.width;
  }
  var base = +height / 2;
  for (i = 0; i < options.texts.length; ++i) {
    var data = this._data[i];
    var h = data.linespace;
    data.y = base - h / 2;
    base -= h;
    if (!data.alignment || data.alignment == 'center')
      data.x = 0;
    else if (data.alignment == 'left')
      data.x = (data.texture.width - width) / 2;
    else if (data.alignment == 'right')
      data.x = (width - data.texture.width) / 2;
  }
};

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.textroll.load = function () {
  return new Promise(function(resolve, reject) {
    resolve();
  });
};

/**
 * Rewinds to the first frame.
 */
MajVj.frame.textroll.prototype.rewind = function () {
  this.properties.rotate = 0;
  this._position[0] = this._initial_position[0];
  this._position[1] = this._initial_position[1];
  this._position[2] = this._initial_position[2];
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.textroll.prototype.onresize = function(aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.textroll.prototype.draw = function(delta) {
  if (this._camera) {
    this._api3d.properties.position = this._camera.position();
    this._api3d.properties.orientation = this._camera.orientation();
  }
  return this._api3d.draw(delta);
};

MajVj.frame.textroll.prototype._draw = function(api) {
  if (!this._type || this._type == "roll")
    this._drawRoll(api);
  else if (this._type == "zoom")
    this._drawZoom(api);
  else if (this._type == "starwars")
    this._drawStarwars(api);
};

MajVj.frame.textroll.prototype._drawRoll = function(api) {
  var s = this._scale;
  var b = this._position;
  var rb = this._rotateBase;
  var r = this.properties.rotate;
  this.properties.rotate += this.properties.speed * api.delta;
  for (var i = 0; i < this._data.length; ++i) {
    var data = this._data[i];
    var texture = data.texture;
    this._box.setTexture(texture);
    var p = [ data.x * s + b[0], data.y * s + b[1], b[2] ];
    var rotate = [ [ 0, rb + r * data.direction, 0 ] ];
    api.drawPrimitive(
        this._box, texture.width * s, texture.height * s, 1, p, rotate);
  }
};

MajVj.frame.textroll.prototype._drawZoom = function(api) {
  var s = this._scale;
  var b = this._position;
  this._position[2] += this.properties.speed * api.delta;
  for (var i = 0; i < this._data.length; ++i) {
    var data = this._data[i];
    var texture = data.texture;
    this._box.setTexture(texture);
    var p = [ data.x * s + b[0], data.y * s + b[1], b[2] ];
    api.drawPrimitive(
        this._box, texture.width * s, texture.height * s, 1, p);
  }
};

MajVj.frame.textroll.prototype._drawStarwars = function(api) {
  var s = this._scale;
  var b = this._position;
  var theta = Math.PI / 4;
  var r = [-theta, 0, 0];
  this._position[1] += this.properties.speed * api.delta;
  for (var i = 0; i < this._data.length; ++i) {
    var data = this._data[i];
    var texture = data.texture;
    this._box.setTexture(texture);
    var y = data.y * s + b[1];
    var p = [ data.x * s + b[0], y * Math.cos(theta), b[2] - y * Math.sin(theta) ];
    api.drawPrimitive(
        this._box, texture.width * s, texture.height * s, 1, p, [r]);
  }
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d - harrier module
 */
MajVj.frame.nicofarre3d.modules.harrier = function (options) {
  this.properties = options.properties;
  this.properties.harrier = 0.0;
  this.properties.scale = options.scale || 1.0;
  this._zspeed = options.zspeed || 10.0;
  this._xspeed = options.xspeed || 0.00;
  this._zinterval = options.zinterval || 50.0;
  this._xinterval = options.xinterval || 0.0;
  this._alpha = options.alpha || 0.1;
  this._color = options.color || [0.4, 0.4, 0.6];
  this._ceil = options.ceil || true;
  this._t = 0.0;
};

/**
 * Clears screen.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.harrier.prototype.clear = function (api) {
  api.setAlphaMode(true, api.gl.DST_COLOR, api.gl.ZERO);
  api.fill([this._alpha, this._alpha, this._alpha, 1.0]);
};

/**
 * Draws.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.harrier.prototype.draw = function (api) {
  this._t += api.delta;
  api.setAlphaMode(true, api.gl.ONE, api.gl.ONE);
  api.color = [1.0, 1.0, 1.0, 1.0];
  var s = 100000 * this.properties.scale;
  var d = 10000 * this.properties.scale;
  var l = 1000000 * this.properties.scale;
  var c = 0;
  var t = this._t / 1000 * this._zspeed;
  var y = 5000 * (1 + this.properties.harrier * 10) * this.properties.scale;
  for (var z = -s; z < s; z += d) {
    c = (1.0 + Math.sin(t + z / s * this._zinterval)) / 2.0;
    api.color =
        [this._color[0] * c, this._color[1] * c, this._color[2] * c, 1.0];
    api.drawLine([-l, -y, z], [l, -y, z]);
    if (this._ceil)
      api.drawLine([-l, y, z], [l, y, z]);
  }
  t = this._t / 1000 * this._xspeed;
  for (var x = -s; x < s; x += d) {
    c = (1.0 + Math.sin(t)) / 2.0;
    c = (1.0 + Math.sin(t + x / s * this._xinterval)) / 2.0;
    api.color =
        [this._color[0] * c, this._color[1] * c, this._color[2] * c, 1.0];
    api.drawLine([x, -y, -l], [x, -y, l]);
    if (this._ceil)
      api.drawLine([x, y, -l], [x, y, l]);
  }
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d - train module
 *  @param options options
 */
MajVj.frame.nicofarre3d.modules.train = function (options) {
    this._container = new TmaParticle.Container(
            MajVj.frame.nicofarre3d.modules.train.Particle);
    this._period = options.period || 500;
    this.properties = options.properties;
    this.properties.train = [ 0.0, 0.0 ];
    this._tick = 0;
    this._nextTime = 0;
    this._frontRails = [];
    this._backRails = [];
    this._houseR = 0;
    this._houseL = 0;
    this._offset = 0;
    this._r = 0.0;
    this._fly = 0.0;
    for (var i = 0; i < 30; ++i) {
        this._frontRails.push(this._newRail());
        this._backRails.push(this._newRail());
    }
    this._box = TmaModelPrimitives.createCube();
    this._box.setDrawMode(Tma3DScreen.MODE_LINE_LOOP);
};

/**
 * Clears.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.train.prototype.clear = function (api) {
    api.clear(api.gl.DEPTH_BUFFER_BIT);
    api.setAlphaMode(true, api.gl.ONE, api.gl.SRC_ALPHA);
    api.fill([0.0, 0.0, 0.0, 0.7]);
};

/**
 * Draws.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.train.prototype.draw = function (api) {
    this._r = this.properties.train[0] - 0.5;
    this._fly = 10000 * this.properties.train[1];
    api.setAlphaMode(true, api.gl.ONE, api.gl.ONE);

    this._tick += api.delta;
    while (this._tick >= this._nextTime) {
        this._update();
        this._nextTime += this._period;
    }

    var color = [0.1, 0.1, 0.1, 1.0];
    api.color = color;
    var z = -1000 + this._offset;
    var x = 0.0;
    var r = 0.0;
    for (var i = 0; i < this._frontRails.length; ++i) {
        var rail = this._frontRails[i];
        api.drawBox(500, 200, [x, -500.0 - this._fly, z],
                [[-Math.PI / 2.0, r, 0.0]]);
        var xdiff = 250.0 * Math.cos(r);
        var zdiff = 250.0 * Math.sin(r);
        api.drawBox(800, 10, [x + xdiff, -450.0 - this._fly, z - zdiff],
                [[-Math.PI / 2.0, r, Math.PI / 2.0 - r]]);
        api.drawBox(800, 10, [x - xdiff, -450.0 - this._fly, z + zdiff],
                [[-Math.PI / 2.0, r, Math.PI / 2.0 - r]]);
        if (rail.houseR) {
            api.color = rail.houseRC;
            api.drawPrimitive(this._box,
                    2000, rail.houseRH, rail.houseR,
                    [x + xdiff * 20, -500.0 - this._fly, z - zdiff * 20],
                    [[0, -r, 0]]);
            api.color = color;

        }
        if (rail.houseL) {
            api.color = rail.houseLC;
            api.drawPrimitive(this._box,
                    2000, rail.houseLH, rail.houseL,
                    [x - xdiff * 20, -500.0 - this._fly, z + zdiff * 20],
                    [[0, -r, 0]]);
            api.color = color;
        }
        z -= 1000 * Math.cos(r);
        x += 1000 * Math.sin(r);
        r += rail.r;
    }
    z = 0 + this._offset;
    x = 0.0;
    r = 0.0;
    for (i = this._backRails.length - 1; i >= 0; --i) {
        var rail = this._backRails[i];
        api.drawBox(500, 200, [x, -500.0 - this._fly, z],
                [[-Math.PI / 2.0, r, 0.0]]);
        var xdiff = 250.0 * Math.cos(r);
        var zdiff = 250.0 * Math.sin(r);
        api.drawBox(800, 10, [x + xdiff, -450.0 - this._fly, z - zdiff],
                [[-Math.PI / 2.0, r, Math.PI / 2.0 - r]]);
        api.drawBox(800, 10, [x - xdiff, -450.0 - this._fly, z + zdiff],
                [[-Math.PI / 2.0, r, Math.PI / 2.0 - r]]);
        if (rail.houseR) {
            api.color = rail.houseRC;
            api.drawPrimitive(this._box,
                    2000, rail.houseRH, rail.houseR,
                    [x + xdiff * 20, -500.0 - this._fly, z - zdiff * 20],
                    [[0, -r, 0]]);
            api.color = color;

        }
        if (rail.houseL) {
            api.color = rail.houseLC;
            api.drawPrimitive(this._box,
                    2000, rail.houseLH, rail.houseL,
                    [x - xdiff * 20, -500.0 - this._fly, z + zdiff * 20],
                    [[0, -r, 0]]);
            api.color = color;
        }
        z += 1000 * Math.cos(r);
        x -= 1000 * Math.sin(r);
        r -= rail.r;
    }
};

MajVj.frame.nicofarre3d.modules.train.prototype._newRail = function () {
    var houseR = 0;
    var houseRH = 0;
    if (this._houseR == 0) {
        this._houseR = 2 + (Math.random() * 3)|0;
        houseR = this._houseR * 1000;
        houseRH = Math.random() * 5000;
    } else {
        this._houseR--;
    }
    var houseL = 0;
    var houseLH = 0;
    if (this._houseL == 0) {
        this._houseL = 2 + (Math.random() * 3)|0;
        houseL = this._houseL * 1000;
        houseLH = Math.random() * 5000;
    } else {
        this._houseL--;
    }
    return {
        r: this._r,
        houseR: houseR,
        houseRH: houseRH,
        houseRC: [0.02 + Math.random() / 256,
                  0.02 + Math.random() / 256,
                  0.02 + Math.random() / 256, 1.0],
        houseL: houseL,
        houseLH: houseLH,
        houseLC: [0.02 + Math.random() / 256,
                  0.02 + Math.random() / 256,
                  0.02 + Math.random() / 256, 1.0]
    };
};

MajVj.frame.nicofarre3d.modules.train.prototype._update = function () {
    this._offset += 250;
    if (this._offset == 1000) {
        this._offset = 0;
        this._backRails.shift();
        this._backRails.push(this._frontRails.shift());
        this._frontRails.push(this._newRail());
    }
};

/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d - lines module
 */
MajVj.frame.nicofarre3d.modules.lines = function (options) {
  this._rate = options.rate || 0.95;
  this._lines = options.lines || 256;
};

/**
 * Clears screen.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.lines.prototype.clear = function (api) {
  api.setAlphaMode(true, api.gl.DST_COLOR, api.gl.ZERO);
  api.fill([this._rate, this._rate, this._rate, 1.0]);
};

/**
 * Draws.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.lines.prototype.draw = function (api) {
  api.setAlphaMode(true, api.gl.ONE, api.gl.ONE);
  for (var i = 0; i < this._lines; ++i) {
    api.color = [Math.random(), Math.random(), Math.random(), Math.random()];
    api.drawLine([this._p(), this._p(), this._p()],
                 [this._p(), this._p(), this._p()]);
  }
};

MajVj.frame.nicofarre3d.modules.lines.prototype._p = function (api) {
  return (Math.random() - 0.5) * 10000;
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d - waypoints module
 */
MajVj.frame.nicofarre3d.modules.waypoints = function (options) {
    this._container = new TmaParticle.Container(
            MajVj.frame.nicofarre3d.modules.waypoints.Particle);
    this._waypoints = [];
    this._size = options.size || 4096;
    this._height = options.height || 2048;
    this._gravity = options.gravity / 1000 || 0.002;
    this._h = 0;
    this._lastParticles = 0;
    this._maxParticles = options.particles || 10000;
    this._range = options.range || 100000;
    this._emit = options.emit || 4;
    var waypoints = options.waypoints || 32;
    var wayspeed = options.wayspeed || 10;
    for (var points = 0; points < waypoints; ++points) {
        this._waypoints.push({
            x: (Math.random() - 0.5) * 2.0 * this._size,
            y: (Math.random() - 0.5) * 2.0 * this._height,
            z: (Math.random() - 0.5) * 2.0 * this._size,
            vx: (Math.random() * 2 - 1) * wayspeed,
            vy: (Math.random() * 2 - 1) * wayspeed,
            vz: (Math.random() * 2 - 1) * wayspeed
        });
    }
    this._waypoints.push({ x: 0.0, y: 0.0, z: 0.0, vx: 0.0, vy: 0.0, vz: 0.0 });
    this._model = TmaModelPrimitives.createPoints(
            new Array(this._maxParticles * 3));
};

/**
 * Particle prototype
 *
 * This prototype controls a particle.
 */
MajVj.frame.nicofarre3d.modules.waypoints.Particle = function () {
    TmaParticle.apply(this, arguments);
};

// Inherits TmaParticle.
MajVj.frame.nicofarre3d.modules.waypoints.Particle.prototype =
        new TmaParticle(null, 0);
MajVj.frame.nicofarre3d.modules.waypoints.Particle.prototype.constructor =
        MajVj.frame.nicofarre3d.modules.waypoints.Particle;

/**
 *
 */
MajVj.frame.nicofarre3d.modules.waypoints.Particle.prototype.initialize =
        function (h, waypoints, size, gravity, range) {
    this.x = Math.random() * 1000;
    this.y = Math.random() * 1000;
    this.z = Math.random() * 1000;
    this.ox = this.x;
    this.oy = this.y;
    this.oz = this.z;
    var color = TmaScreen.HSV2RGB(h, 1 - Math.random() / 4, Math.random() / 2);
    this.color = [color.r / 255, color.g / 255, color.b / 255, 1.0];
    this.target = 0;
    this.waypoints = waypoints;
    this.size = size;
    this.gravity = gravity;
    this.range = range;
};

/**
 *
 */
MajVj.frame.nicofarre3d.modules.waypoints.Particle.prototype.update =
        function (delta) {
    var waypoint = this.waypoints[this.target];
    var dx = waypoint.x - this.x;
    var dy = waypoint.y - this.y;
    var dz = waypoint.z - this.z;
    if (dx * dx + dy * dy + dz * dz < this.range) {
        this.target++;
        if (this.target == this.waypoints.length)
            return false;
        this.vx += Math.random() * 2 - 1;
        this.vy += Math.random() * 2 - 1;
        this.vz += Math.random() * 2 - 1;
    }
    this.vx += dx * this.gravity;
    this.vy += dy * this.gravity;
    this.vz += dz * this.gravity;
    this.vx *= 0.97;
    this.vy *= 0.97;
    this.vz *= 0.97;
    this.ox = this.x;
    this.oy = this.y;
    this.oz = this.z;
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;
    return true;
};

/**
 * Clears screen.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.waypoints.prototype.clear = function (api) {
  //api.color = [0.0, 0.0, 0.0, 1.0];
  //api.clear(api.gl.COLOR_BUFFER_BIT | api.gl.DEPTH_BUFFER_BIT);
  api.clear(api.gl.DEPTH_BUFFER_BIT);
  api.setAlphaMode(true, api.gl.ONE, api.gl.SRC_ALPHA);
  api.fill([0.0, 0.0, 0.0, 0.8]);
};

/**
 * Draws.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.waypoints.prototype.draw = function (api) {
    api.setAlphaMode(true, api.gl.ONE, api.gl.ONE);

    // Update waypoints.
    var size = this._size;
    var ysize = this._height;
    var m = api.delta / 16;
    for (var point = 0; point < this._waypoints.length; ++point) {
        var waypoint = this._waypoints[point];
        waypoint.x += waypoint.vx * m;
        waypoint.y += waypoint.vy * m;
        waypoint.z += waypoint.vz * m;
        if ((waypoint.x > size && waypoint.vx > 0) ||
                (waypoint.x < -size && waypoint.vx < 0))
            waypoint.vx = -waypoint.vx;
        if ((waypoint.y > ysize && waypoint.vy > 0) ||
                (waypoint.y < -ysize && waypoint.vy < 0))
            waypoint.vy = -waypoint.vy;
        if ((waypoint.z > size && waypoint.vz > 0) ||
                (waypoint.z < -size && waypoint.vz < 0))
            waypoint.vz = -waypoint.vz;
    }

    // Update particles.
    var emit = Math.min(
        this._emit, this._maxParticles - this._container.length);
    if (api.delta == 0)
      emit = 0;
    for (var i = 0; i < emit; ++i) {
        this._container.add(this._h, this._waypoints, this._size,
                            this._gravity, this._range);
    }
    this._h = (this._h + 1) % 360;
    if (api.delta != 0)
      this._container.update();

    var n = Math.min(this._maxParticles, this._container.length);
    var vertices = this._model.getVerticesBuffer(api.screen);
    var vbuffer = vertices.buffer();
    var colors = this._model.getColorsBuffer(api.screen);
    var cbuffer = colors.buffer();
    for (i = 0; i < n; ++i) {
        var particle = this._container.at(i);
        vbuffer[i * 3 + 0] = particle.x;
        vbuffer[i * 3 + 1] = particle.y;
        vbuffer[i * 3 + 2] = particle.z;
        cbuffer[i * 4 + 0] = particle.color[0];
        cbuffer[i * 4 + 1] = particle.color[1];
        cbuffer[i * 4 + 2] = particle.color[2];
        cbuffer[i * 4 + 3] = particle.color[3];
    }
    for (; i < this._lastParticles; ++i) {
        vbuffer[i * 3 + 0] = 0.0;
        vbuffer[i * 3 + 1] = 0.0;
        vbuffer[i * 3 + 2] = 0.0;
        cbuffer[i * 4 + 0] = 0.0;
        cbuffer[i * 4 + 1] = 0.0;
        cbuffer[i * 4 + 2] = 0.0;
        cbuffer[i * 4 + 3] = 0.0;
    }
    this._lastParticles = this._container.length;
    vertices.update();
    colors.update();
    api.drawPrimitive(this._model, 1.0, 1.0, 1.0, [0.0, 0.0, 0.0]);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d - cube module
 */
MajVj.frame.nicofarre3d.modules.cube = function () {
    this._n = 256;
    this._objects = new Array(this._n);
    for (var i = 0; i < this._n; ++i) {
        this._objects[i] = new MajVj.frame.nicofarre3d.modules.cube.object(
            (Math.random() - 0.5) * 20000);
    }
    this._cube = TmaModelPrimitives.createCube();
    this._cube.setDrawMode(Tma3DScreen.MODE_LINE_LOOP);
};

/**
 * object prototype
 *
 * This prototype represents a cube.
 * @param z an initial z position
 */
MajVj.frame.nicofarre3d.modules.cube.object = function (z) {
    this._init(z);
};

/**
 * Initialize a cube.
 * @param z an initial z position
 */
MajVj.frame.nicofarre3d.modules.cube.object.prototype._init = function (z) {
    this._position = [
        (Math.random() - 0.5) * 10000.0,
        (Math.random() - 0.5) * 1000.0,
        z];
    this._size = 100.0;  // Math.random() * 100.0;

    var r = Math.random();
    var g = Math.random();
    var b = Math.random();
    var avg = (r + g + b) / 3.0;
    r = (r + avg) / 2.0;
    g = (r + avg) / 2.0;
    b = (r + avg) / 2.0;
    this._color = [r, g, b, 1.0];
    this._rotate = Math.random() * Math.PI * 2.0;
};

/**
 * Draws a cube
 * @param api nicofarre3d interfaces
 * @param cube a cube primitive object
 * @param rotate rotation speed
 * @param speed approaching speed
 */
MajVj.frame.nicofarre3d.modules.cube.object.prototype.draw =
        function (api, cube, rotate, speed) {
    api.color = this._color;
    var s = this._size;
    api.drawPrimitive(cube, s, s, s, this._position, [[this._rotate, 0.0, 0.0]]);
    this._rotate += rotate;
    this._position[2] += speed;
    if (this._position[2] > 10000)
        this._init(this._position[2] - 20000);
};

/**
 * Clears screen.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.cube.prototype.clear = function (api) {
    api.color = [0.0, 0.0, 0.0, 1.0];
    api.clear(api.gl.COLOR_BUFFER_BIT | api.gl.DEPTH_BUFFER_BIT);
};

/**
 * Draws.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.cube.prototype.draw = function (api) {
    api.color = [0.0, 0.0, 0.0, 1.0];
    api.setAlphaMode(false);
    var speed = api.delta * 2.0;
    var rotate = speed / 1000.0;
    for (var i = 0; i < this._n; ++i)
        this._objects[i].draw(api, this._cube, rotate, speed);
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d - roll module
 */
MajVj.frame.nicofarre3d.modules.roll = function (options) {
  this._api = options.api;

  var font = options.font || {
    size: 90,
    name: 'Sans',
    foreground: 'rgba(19, 76, 51, 255)',
    background: 'rgba(0, 0, 0, 255'
  };
  var headFont = options.headFont || font;
  var script = options.script || [
    { head: true, text: 'Powered by' },
    { text: 'Takashi Toyoshima' }
  ];
  this._headScale = options.headScale || 1.2;
  this._ghost = (typeof options.ghost != 'undefined') ? options.ghost : 0.8;

  var texts = [];
  var heads = [];
  for (var i = 0; i < script.length; ++i) {
    if (script[i].head)
      heads.push(script[i].text);
    else
      texts.push(script[i].text);
  }
  this._normFont = this._api.createFont(font, texts.join(''));
  this._headFont = this._api.createFont(headFont || font, heads.join(''));

  this._sequencer = new TmaSequencer();
  var delay = options.delay || 0;
  var t = delay * 1000;
  for (i = 0; i < script.length; ++i) {
    this._sequencer.register(t, this._createTextLineTask(script[i]));
    t += 3000;
  }

  this._sequencer.start();
}

/**
 * Clears screen.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.roll.prototype.clear = function (api) {
  var rate = this._ghost;
  api.setAlphaMode(true, api.gl.DST_COLOR, api.gl.ZERO);
  api.fill([rate, rate, rate, 1.0]);
};

/**
 * Draws.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.roll.prototype.draw = function (api) {
  api.setAlphaMode(true, api.gl.ONE, api.gl.ONE);
  this._sequencer.run(api.delta);
};

MajVj.frame.nicofarre3d.modules.roll.prototype._createTextLineTask =
    function (script) {
  var task = new TmaSequencer.ParallelTask();
  var width = 0;
  var text = script.text;
  var font = script.head ? this._headFont : this._normFont;
  var scale = script.head ? this._headScale : 1.0;
  for (var i = 0; i < text.length; ++i)
    width += font[text[i]].width * scale;
  var x = -width / 2;
  for (i = 0; i < text.length; ++i) {
    var size = font[text[i]].width * scale;
    task.append(new MajVj.frame.nicofarre3d.modules.roll.Cell(
        this._api, font, text[i], x + size / 2, scale, 100 * i));
    x += size;
  }
  return task;
};

MajVj.frame.nicofarre3d.modules.roll.Cell =
    function (api, font, c, x, scale, delay) {
  this._api = api;
  this._font = font;
  this._scale = scale;
  this._sx = (Math.random() - 0.5) * 10000;
  this._sy = (Math.random() - 0.5) * 3000;
  this._sz = Math.random() * 5000;
  this._dx = x;
  this._dy = -50;
  this._dz = -1000;
  this._rx = x;
  this._ry = 0;
  this._rz = -2000;
  this._vy = +0.5;
  this._vz = -1;
  this._c = c;
  this._time = 0;
  this._appearDuration = 1000;
  this._stopDuration = 3000;
  this._wipeoutDuration = 100;
  this._wipeDuration = 1000;
  this._wipeinDuration = 100;
  this._rollDuration = 10000;
  this.SerialTask();
  this.append(new TmaSequencer.Task(delay));
  this.append(new TmaSequencer.Task(0, this._reset.bind(this)));
  this.append(new TmaSequencer.Task(
      this._appearDuration, this._appear.bind(this)));
  this.append(new TmaSequencer.Task(0, this._reset.bind(this)));
  this.append(new TmaSequencer.Task(0, this._reset.bind(this)));
  this.append(new TmaSequencer.Task(
      this._stopDuration - delay, this._stop.bind(this)));
  this.append(new TmaSequencer.Task(0, this._reset.bind(this)));
  this.append(new TmaSequencer.Task(
      this._wipeoutDuration, this._wipeout.bind(this)));
  this.append(new TmaSequencer.Task(0, this._reset.bind(this)));
  this.append(new TmaSequencer.Task(this._wipeDuration));
  this.append(new TmaSequencer.Task(0, this._reset.bind(this)));
  this.append(new TmaSequencer.Task(
      this._wipeinDuration, this._wipein.bind(this)));
  this.append(new TmaSequencer.Task(0, this._reset.bind(this)));
  this.append(new TmaSequencer.Task(
      this._rollDuration, this._roll.bind(this)));
};

MajVj.frame.nicofarre3d.modules.roll.Cell.prototype =
    new TmaSequencer.SerialTask;
MajVj.frame.nicofarre3d.modules.roll.Cell.prototype.SerialTask =
    TmaSequencer.SerialTask;
MajVj.frame.nicofarre3d.modules.roll.Cell.prototype.constructor =
    MajVj.frame.nicofarre3d.modules.roll.Cell;

MajVj.frame.nicofarre3d.modules.roll.Cell.prototype._reset =
    function (delta, time) {
  this._time = time;
};

MajVj.frame.nicofarre3d.modules.roll.Cell.prototype._appear =
    function (delta, time) {
  var rate = (time - this._time) / this._appearDuration;
  var irate = 1 - rate;
  var p = [this._sx * irate + this._dx * rate,
           this._sy * irate + this._dy * rate,
           this._sz * irate + this._dz * rate];
  this._api.drawCharacter(this._font, this._c, this._scale, this._scale, p);
};

MajVj.frame.nicofarre3d.modules.roll.Cell.prototype._stop =
    function (delta, time) {
  this._api.drawCharacter(
      this._font, this._c, this._scale, this._scale,
      [this._dx, this._dy, this._dz]);
};

MajVj.frame.nicofarre3d.modules.roll.Cell.prototype._wipeout =
    function (delta, time) {
  var rate = (time - this._time) / this._wipeoutDuration;
  var irate = 1 - rate;
  this._api.drawCharacter(
      this._font, this._c, this._scale * (1 + rate * 2.5), this._scale * irate,
      [this._dx * (1 + rate * 5), this._dy, this._dz]);
};

MajVj.frame.nicofarre3d.modules.roll.Cell.prototype._wipein =
    function (delta, time) {
  var rate = (time - this._time) / this._wipeinDuration;
  var irate = 1 - rate;
  this._api.drawCharacter(
      this._font, this._c, this._scale * (1 + irate * 2.5), this._scale * irate,
      [this._rx * (1 + irate * 5), this._ry, this._rz],
      [-Math.PI / 3, 0, 0]);
  this._ry += this._vy * delta / 20;
  this._rz += this._vz * delta / 20;
};

MajVj.frame.nicofarre3d.modules.roll.Cell.prototype._roll =
    function (delta, time) {
  this._api.drawCharacter(
      this._font, this._c, this._scale, this._scale,
      [this._rx, this._ry, this._rz],
      [-Math.PI / 4, 0, 0]);
  this._ry += this._vy * delta / 20;
  this._rz += this._vz * delta / 20;
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d - beams module
 *  @param options options
 */
MajVj.frame.nicofarre3d.modules.beams = function (options) {
    this._container = new TmaParticle.Container(
            MajVj.frame.nicofarre3d.modules.beams.Particle);
    this._period = options.period || 1000;
    this._unit = options.unit || 20;
    this._dir = options.dir || MajVj.frame.nicofarre3d.modules.beams.DIR_ALL;
    this._tick = 0;
    this._nextTime = 0;
    this._beams = [];
    this._size = 8192 * 2;
    this._speed = options.speed || this._size / 200;
    this._maxParticles = 10000;
    this._lastParticles = 0;
    this._model = TmaModelPrimitives.createPoints(
            new Array(this._maxParticles * 3));
};

/**
 * Particle prototype
 *
 * This prototype controls a particle.
 */
MajVj.frame.nicofarre3d.modules.beams.Particle = function () {
    TmaParticle.apply(this, arguments);
};

// Inherits TmaParticle.
MajVj.frame.nicofarre3d.modules.beams.Particle.prototype =
        new TmaParticle(null, 0);
MajVj.frame.nicofarre3d.modules.beams.Particle.prototype.constructor =
        MajVj.frame.nicofarre3d.modules.beams.Particle;

MajVj.frame.nicofarre3d.modules.beams.DIR_ALL = [0, 1, 2, 3];
MajVj.frame.nicofarre3d.modules.beams.DIR_Z = [0, 1];
MajVj.frame.nicofarre3d.modules.beams.DIR_F2B = [0];
MajVj.frame.nicofarre3d.modules.beams.DIR_B2F = [1];
MajVj.frame.nicofarre3d.modules.beams.DIR_X = [2, 3];
MajVj.frame.nicofarre3d.modules.beams.DIR_L2R = [2];
MajVj.frame.nicofarre3d.modules.beams.DIR_R2L = [3];

/**
 *
 */
MajVj.frame.nicofarre3d.modules.beams.Particle.prototype.initialize =
        function (size, speed, dir) {
    var pattern = (0|(dir.length * Math.random())) % dir.length;
    switch (dir[pattern]) {
      case 0:
        this.x = (Math.random() - 0.5) * size;
        this.y = (Math.random() - 0.5) * size / 10;
        this.z = -size;
        this.vx = 0;
        this.vy = 0;
        this.vz = speed;
        break;
      case 1:
        this.x = (Math.random() - 0.5) * size;
        this.y = (Math.random() - 0.5) * size / 10;
        this.z = size;
        this.vx = 0;
        this.vy = 0;
        this.vz = -speed;
        break;
      case 2:
        this.x = -size;
        this.y = (Math.random() - 0.5) * size / 10;
        this.z = (Math.random() - 0.5) * size;
        this.vx = speed;
        this.vy = 0;
        this.vz = 0;
        break;
      case 3:
        this.x = size;
        this.y = (Math.random() - 0.5) * size / 10;
        this.z = (Math.random() - 0.5) * size;
        this.vx = -speed;
        this.vy = 0;
        this.vz = 0;
        break;
    }
    this.x -= (this.x % 1000);
    this.y -= (this.x % 1000);
    this.z -= (this.x % 1000);
    this.color = [Math.random(), Math.random(), Math.random(), 1.0];
    this.size = size;
};

/**
 *
 */
MajVj.frame.nicofarre3d.modules.beams.Particle.prototype.update =
        function (delta) {
    var step = delta / 17;
    this.x += this.vx * step;
    this.y += this.vy * step;
    this.z += this.vz * step;
    var ysize = this.size / 10;
    if ((this.x > this.size && this.vx > 0) ||
            (this.x < -this.size && this.vx < 0))
        return false;
    if ((this.y > ysize && this.vy > 0) ||
            (this.y < -ysize && this.vy < 0))
        return false;
    if ((this.z > this.size && this.vz > 0) ||
            (this.z < -this.size && this.vz < 0))
        return false;
    return true;
};

/**
 * Clears screen.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.beams.prototype.clear = function (api) {
    api.clear(api.gl.DEPTH_BUFFER_BIT);
    api.setAlphaMode(true, api.gl.ONE, api.gl.SRC_ALPHA);
    api.fill([0.0, 0.0, 0.0, 0.92]);
};

/**
 * Draws.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.beams.prototype.draw = function (api) {
    // Update beams.
    var size = this._size;
    var ysize = size / 10.0;

    // Update particles.
    this._tick += api.delta;
    while (this._tick > this._nextTime) {
        this._nextTime += this._period;
        var emit = Math.min(
                this._unit, this._maxParticles - this._container.length);
        for (var i = 0; i < emit; ++i)
            this._container.add(this._size, this._speed, this._dir);
    }
    this._container.update(api.delta);

    var n = Math.min(this._maxParticles, this._container.length);
    var vertices = this._model.getVerticesBuffer(api.screen);
    var vbuffer = vertices.buffer();
    var colors = this._model.getColorsBuffer(api.screen);
    var cbuffer = colors.buffer();
    for (i = 0; i < n; ++i) {
        var particle = this._container.at(i);
        vbuffer[i * 3 + 0] = particle.x;
        vbuffer[i * 3 + 1] = particle.y;
        vbuffer[i * 3 + 2] = particle.z;
        cbuffer[i * 4 + 0] = particle.color[0];
        cbuffer[i * 4 + 1] = particle.color[1];
        cbuffer[i * 4 + 2] = particle.color[2];
        cbuffer[i * 4 + 3] = particle.color[3];
    }
    for (; i < this._lastParticles; ++i) {
        vbuffer[i * 3 + 0] = 0.0;
        vbuffer[i * 3 + 1] = 0.0;
        vbuffer[i * 3 + 2] = 0.0;
        cbuffer[i * 4 + 0] = 0.0;
        cbuffer[i * 4 + 1] = 0.0;
        cbuffer[i * 4 + 2] = 0.0;
        cbuffer[i * 4 + 3] = 0.0;
    }
    this._lastParticles = this._container.length;
    vertices.update();
    colors.update();
    api.drawPrimitive(this._model, 1.0, 1.0, 1.0, [0.0, 0.0, 0.0]);
};
    this.majvj = _majvj;
    this.tma = tma;
    this.create = function (width, height, fullscreen, parent) {
      return new MajVj(width, height, fullscreen, parent);
    };

    var _loadedPlugin = {};
    this.loadPlugin = function (type, name) {
      return new Promise(function (resolve, reject) {
        if (!MajVj[type])
          return reject('unknown plugin type: ' + type);
        if (!MajVj[type][name])
          return reject('unknown plugin: ' + type + '/' + name);
        if (_loadedPlugin[type] && _loadedPlugin[type][name])
          return resolve(MajVj[type][name]);
        if (!_loadedPlugin[type])
          _loadedPlugin[type] = {};
        if (!MajVj[type][name].load) {
          _loadedPlugin[type][name] = MajVj[type][name];
          resolve(MajVj[type][name]);
        }
        MajVj[type][name].load().then(function () {
          _loadedPlugin[type][name] = MajVj[type][name];
          resolve(MajVj[type][name]);
        }, tma.ecb);
      });
    };
    this.loadAllPlugins = function (base) {
      if (base)
        tma.base = base;
      var effects = Object.keys(MajVj.effect).map(function (name) {
        return this.loadPlugin('effect', name);
      }.bind(this));
      var frames = Object.keys(MajVj.frame).map(function (name) {
        return this.loadPlugin('frame', name);
      }.bind(this));
      return Promise.all(effects.concat(frames));
    };
    this.setBase = function (base) {
      tma.base = base;
    };

    if (this.name) {
      this.setBase(this.base);
      if (0 == this.width)
        this.width = 240;
      if (0 == this.height)
        this.height = 135;
      var main = function () {
        var vj = this.create(this.width, this.height, false, this.$.main);
        var frame = vj.create(this.type, this.name);
        vj.run(function (delta) {
          vj.screen().fillColor(0, 0, 0, 1);
          try {
            frame.draw(delta);
          } catch (e) { tma.error(e.stack); }
        });
      }.bind(this);
      if (this.type == 'scene') {
        this.loadAllPlugins().then(function () {
          this.loadPlugin(this.type, this.name).then(main, tma.ecb);
        }.bind(this), tma.ecb);
      } else {
        this.loadPlugin(this.type, this.name).then(main, tma.ecb);
      }
    }
  }
});
