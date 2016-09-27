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
