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
    this._analyser = this._audio.createAnalyser();
    this._delay = this._audio.createDelay();
    if (options.delay)
        this._delay.delayTime.value = options.delay;
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
    this._gain.connect(this._analyser);
    this._gain.connect(this._delay);
    this._delay.connect(this._audio.destination);
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
    this._delay.disconnect();
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

/**
 * Sets sound delay.
 * @param delay a delay time in second.
 */
MajVj.misc.sound.prototype.setDelay = function (delay) {
    this._delay.delayTime.value = delay;
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
    return this._analyser.frequencyBinCount / 2;
};

/**
 * Normalizes a FFT result.
 * @param data a float value from -30 to -100 in dB
 * @return a float value almost from 0.0 to 0.1
 */
MajVj.misc.sound.prototype.normalizeFrequencyData = function (data) {
    var a = this._analyser;
    return (data - a.minDecibels) / (a.maxDecibels - a.minDecibels);
};

/**
 * Gets FFT results in Uint8Array.
 * @param array an Uint8Array to receive a result
 */
MajVj.misc.sound.prototype.getByteFrequencyData = function (array) {
    this._analyser.getByteFrequencyData(array);
};

/**
 * Gets FFT results in Float32Array.
 * @param array an Float32Array to receive a result
 */
MajVj.misc.sound.prototype.getFloatFrequencyData = function (array) {
    this._analyser.getFloatFrequencyData(array);
};

