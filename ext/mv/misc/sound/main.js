/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - sound -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.sound = function (options) {
    if (!MajVj.misc.sound._context)
        MajVj.misc.sound._context = new AudioContext();
    this._audio = MajVj.misc.sound._context;
    this._gain = this._audio.createGain();
    this._data = null;
    if (options.url)
        this.fetch(options.url, options.play);
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.sound.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

MajVj.misc.sound._context = null;


/**
 * Loads a sound data.
 * @param url url from where a sound data will be loaded
 * @param play automatically once the data is ready
 * @return a Promise object
 */
MajVj.misc.sound.prototype.fetch = function (url, play) {
    this._play = play;
    return new Promise(function (resolve, reject) {
        var promise = tma.fetch(url);
        promise.then(function (data) {
            this._audio.decodeAudioData(data, function (buffer) {
                this._data = buffer;
                if (this._play)
                    this.play();
                resolve(buffer);
            }.bind(this), function (e) { console.log(e); });
        }.bind(this), reject);
    }.bind(this));
};


/**
 * Plays.
 * @param data an AudioBuffer object (optional: fetched data is used by default)
 * @return true if succeeded
 */
MajVj.misc.sound.prototype.play = function (data) {
    if (!this._data && !data)
        return false;
    this.stop();
    this._buffer = this._audio.createBufferSource();
    this._buffer.buffer = data || this._data;
    this._buffer.connect(this._gain);
    this._gain.connect(this._audio.destination);
    this._buffer.start(0);
    return true;
};

/**
 * Stops.
 */
MajVj.misc.sound.prototype.stop = function () {
    if (!this._buffer)
        return;
    this._buffer.stop();
    this._gain.disconnect();
    this._buffer.disconnect();
    this._buffer = null;
};

/**
 * Sets sound gain.
 * @param gain a gain to set in float from 0.0 to 1.0
 */
MajVj.misc.sound.prototype.setGain = function (gain) {
    this._gain.gain.value = gain;
};

