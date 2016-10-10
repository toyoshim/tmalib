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
    this._properties = {
        scanline: true,
        scanline_frequency: this._height / 4,
        scanline_velocity: 0.5,
        analog: true,
        analog_frequency: 8,
        analog_speed: 0.0001,
        analog_color_distribution: [ 0.5, 0.7, 0.3 ],
        raster: true,
        raster_velocity: 7,
    };
    this.properties = {
        scanline: this._properties.scanline,
        scanline_frequency: this._properties.scanline_frequency,
        scanline_velocity: this._properties.scanline_velocity,
        analog: this._properties.analog,
        analog_frequency: this._properties.analog_frequency,
        analog_speed: this._properties.analog_speed,
        analog_color_distribution: this._properties.analog_color_distribution,
        raster: this._properties.raster,
        raster_velocity: this._properties.raster_velocity
        
    };

    this._noise = this._mv.create('misc', 'perlin');
    this._delta = 0;

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.noise._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.noise._fragmentShader));
    this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);

    this._lineImage = this._screen.createImage(1, this._height);
    this._updateLineImage();
    this._lineTexture = this._screen.createTexture(
            this._lineImage, false, Tma3DScreen.FILTER_LINEAR);

};

// Shader programs.
MajVj.effect.noise._vertexShader = null;
MajVj.effect.noise._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.noise.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'noise', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'noise', 'shaders.html', 'fragment')
        ]).then(function (data) {
            MajVj.effect.noise._vertexShader = data[0];
            MajVj.effect.noise._fragmentShader = data[1];
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

    if (this.properties.scanline != this._properties.scanline ||
            this.properties.scanline_frequency !=
                    this._properties.scanline_frequency ||
            this.properties.analog) {
        this._updateLineImage();
        this._lineTexture.update(this._lineImage);
    }
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', texture);
    this._program.setTexture('uLineTexture', this._lineTexture);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
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
    var rasterTime = this._delta * 0.005;
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
            a = (((n2 > 0.6) ? (1 + n1) : 0) + (1 + n2) * 0.1) * rasterVelocity;
        }
        this._lineImage.setPixel(0, y, r|0, g|0, b|0, a|0);
    }
};
