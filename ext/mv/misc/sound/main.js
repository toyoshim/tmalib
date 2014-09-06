/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - sound -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.sound = function (options) {
    this._channel = options.channel || 1;
    if (!MajVj.misc.sound._context)
        MajVj.misc.sound._context = new AudioContext();
    this._audio = MajVj.misc.sound._context;
    this._gain = new Array(this._channel);
    for (var ch = 0; ch < this._channel; ++ch)
        this._gain[ch] = this._audio.createGain();
    this._splitter = this._audio.createChannelSplitter(2);
    this._analyser = this._audio.createAnalyser();
    this._leftAnalyser = this._audio.createAnalyser();
    this._rightAnalyser = this._audio.createAnalyser();
    this._delay = this._audio.createDelay();
    if (options.delay)
        this._delay.delayTime.value = options.delay;
    this._buffer = new Array(this._channel);
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
        resolve();
    });
};

// AudioContext shared in all instances.
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
 * @param channel a channel to play (optional: 0)
 * @return true if succeeded
 */
MajVj.misc.sound.prototype.play = function (data, channel) {
    if (!this._data && !data)
        return false;
    var ch = channel || 0;
    if (ch >= this._channel)
        return false;
    this.stop(ch);
    this._buffer[ch] = this._audio.createBufferSource();
    this._buffer[ch].buffer = data || this._data;
    this._buffer[ch].connect(this._gain[ch]);
    this._gain[ch].connect(this._analyser);
    this._gain[ch].connect(this._delay);
    this._gain[ch].connect(this._splitter);
    if (this._playing == 0) {
        this._splitter.connect(this._leftAnalyser, 0);
        this._splitter.connect(this._rightAnalyser, 1);
        this._delay.connect(this._audio.destination);
    }
    this._buffer[ch].start(0);
    this._playing++;
    return true;
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
    this._buffer[ch].stop();
    this._buffer[ch].disconnect();
    this._gain[ch].disconnect();
    this._buffer[ch] = null;
    this._playing--;
    if (this._playing == 0) {
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

