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
