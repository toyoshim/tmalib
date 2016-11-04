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
        this._frame = this._mv.create(this._type, this._name);
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
