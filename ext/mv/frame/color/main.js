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
    this._controller = options.controller;
    this._r = options.r || 1.0;
    this._g = options.g || 1.0;
    this._b = options.b || 1.0;
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
    this._screen.fillColor(this._r, this._g, this._b, 1.0);
};

/**
 * Sets a controller.
 */
MajVj.frame.color.prototype.setController = function (controller) {
    this._controller = controller;
};
