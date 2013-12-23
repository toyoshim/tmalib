/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - snow -
 * @param screen Tma3DScreen object
 * @param width offscreen width
 * @param height offscreen height
 * @param aspect screen aspect ratio (screen height / screen width)
 */
MajVj.frame.snow = function (screen, width, height, aspect) {
    this._screen = screen;
    this._width = width;
    this._height = height;
    this._aspect = aspect;
    this._controller = null;
    this._ps = new TmaParticle.Container(MajVj.frame.snow.ps);
    this._coords = screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
    this._program = screen.createProgram(
            screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.snow._vertexShader),
            screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.snow._fragmentShader));
    this._image = screen.createImage(512, 512);
    this._data = this._image.data;
    this._texture =screen.createTexture(
            this._image, true, Tma3DScreen.FILTER_LINEAR);
    this.onresize(aspect);
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
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.snow.prototype.draw = function (delta) {
    var volume = 1.0;
    if (this._controller) {
        volume = this._controller.slider;
        if (volume == 0.0)
            return;
    }
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
    var size = 512 * 512 * 4;
    for (i = 0; i < size; ++i)
        this._data[i] = 0;
    this._ps.update();
    this._texture.update(this._image);
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setTexture('uTexture', this._texture);
    this._program.setUniformVector('uVolume', [volume]);
    this._program.setUniformVector('uAspect', [this._aspect]);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};

/**
 * Sets a controller.
 */
MajVj.frame.snow.prototype.setController = function (controller) {
    this._controller = controller;
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
