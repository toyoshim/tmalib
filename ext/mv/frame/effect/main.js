/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - effect -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.effect = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;

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
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.effect.prototype.setController = function (controller) {
    this._controller = controller;
};

/**
 * Gets a frame plugin internally created
 * @return a frame plugin object
 */
MajVj.frame.effect.prototype.getFrame = function (i) {
    return this._frames[i];
};
