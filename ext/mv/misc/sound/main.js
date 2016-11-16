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
    this._analyserGain = this._audio.createGain();
    this._analyser = this._audio.createAnalyser();
    this._leftAnalyser = this._audio.createAnalyser();
    this._rightAnalyser = this._audio.createAnalyser();
    var fftSize = 2048;
    this._analyser.fftSize = fftSize;
    this._leftAnalyser.fftSize = fftSize;
    this._rightAnalyser.fftSize = fftSize;
    this._delay = this._audio.createDelay();
    if (options.delay)
        this._delay.delayTime.value = options.delay;
    this._buffer = new Array(this._channel);
    this._data = null;
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
        if (!MajVj.misc.sound.useMicrophone) {
            resolve();
            return;
        }

        navigator.mediaDevices.getUserMedia({audio: true}).then(function (a) {
            MajVj.misc.sound._microphone = a;
            resolve();
        }.bind(this), function (e) {
            tma.warn('microphone is not available. continue...');
            resolve();
        });
    });
};

// AudioContext shared in all instances.
MajVj.misc.sound.useMicrophone =
        MajVj.getSetting('misc', 'sound', 'useMicrophone', false);
MajVj.misc.sound._microphone = null;
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
    this._data = null;
    return new Promise(function (resolve, reject) {
        var promise = tma.fetch(url);
        promise.then(function (data) {
            this._audio.decodeAudioData(data, function (buffer) {
                this._data = buffer;
                if (this._play)
                    this.play();
                resolve(buffer);
            }.bind(this), function (e) { tma.log(e); });
        }.bind(this), reject);
    }.bind(this));
};

/**
 * Plays.
 * @param data an AudioBuffer object (optional: fetched data is used by default)
 * @param channel a channel to play (optional: 0)
 * @param offset in sec (optional: 0)
 * @return true if succeeded
 */
MajVj.misc.sound.prototype.play = function (data, channel, offset) {
    if (!this._data && !data)
        return false;
    var ch = channel || 0;
    if (ch >= this._channel)
        return false;
    this.stop(ch);
    this._buffer[ch] = this._audio.createBufferSource();
    this._buffer[ch].buffer = data || this._data;
    this._connect(ch, true, offset);
    return true;
};

/**
 * Capture from microphone.
 * @param chananel a channel for using a capture (optional: 0)
 * @return true if succeeded
 */
MajVj.misc.sound.prototype.capture = function (channel) {
    var ch = channel || 0;
    if (ch >= this._channel)
        return false;
    this.stop(ch);
    this._buffer[ch] =
            this._audio.createMediaStreamSource(MajVj.misc.sound._microphone);
    this._connect(ch, false);
    return true;
};

/**
 * Connects nodes for play or record.
 * (Restriction: on using multiple channels, audio destination will be
 * connected if one or more channels are used for audio playback)
 * @aram channel a channel to connect
 * @param play a flag to connect to the audio destination
 * @param offset in sec (optional: 0)
 */
MajVj.misc.sound.prototype._connect = function (ch, play, offset) {
    // buffer* +=> gain*        ==> delay    --> destination
    //         +=> analyserGain +-> analyser
    //                          +-> splitter +-> leftAnalyser
    //                                       +-> rightAnalyser
    this._buffer[ch].connect(this._gain[ch]);
    this._gain[ch].connect(this._delay);
    this._buffer[ch].connect(this._analyserGain);
    if (this._playing == 0) {
        this._analyserGain.connect(this._analyser);
        this._analyserGain.connect(this._splitter);
        this._splitter.connect(this._leftAnalyser, 0);
        this._splitter.connect(this._rightAnalyser, 1);
        if (play)
            this._delay.connect(this._audio.destination);
    }
    if (play)
        this._buffer[ch].start(0, offset || 0);
    this._playing++;
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
    if (this._buffer[ch].stop)
      this._buffer[ch].stop();
    this._buffer[ch].disconnect();
    this._gain[ch].disconnect();
    this._buffer[ch] = null;
    this._data = null;
    this._playing--;
    if (this._playing == 0) {
        this._analyserGain.disconnect();
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
 * Sets analyser gain.
 * @param gain a gain to set in float from 0.0 to 1.0
 */
MajVj.misc.sound.prototype.setAnalyserGain = function (gain) {
    this._analyserGain.gain.value = gain;
};

/**
 * Sets sound delay.
 * @param delay a delay time in second.
 */
MajVj.misc.sound.prototype.setDelay = function (delay) {
    this._delay.delayTime.value = delay;
};

/**
 * Sets playback rate.
 * @param rate playback rate
 * @param channel a channel to set (optional: 0)
 */
MajVj.misc.sound.prototype.setPlaybackRate = function (rate, channel) {
    var ch = channel || 0;
    if (ch > this._channel || !this._buffer[ch])
        return;
    this._buffer[ch].playbackRate.value = rate;
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
    return this._analyser.frequencyBinCount;
};

/**
 * Normalizes a FFT result.
 * @param data a float value from -30 to -100 in dB
 * @return a float value almost from 0.0 to 1.0
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

/**
 * Gets time domain wave table count.
 * @return a time domain wave table length
 */
MajVj.misc.sound.prototype.getWaveTableCount = function () {
    return this._analyser.fftSize;
};

/**
 * Gets FFT results in Float32Array.
 * @param laft an Float32Array to receive a result for left channel, or merged
 * @param right an Float32Array to receive a result for right channel (optional)
 */
MajVj.misc.sound.prototype.getFloatWaveTable = function (left, right) {
    if (!right) {
        this._analyser.getFloatTimeDomainData(left);
    } else {
        this._leftAnalyser.getFloatTimeDomainData(left);
        this._rightAnalyser.getFloatTimeDomainData(right);
    }
};

/**
 * Checks if any channel plays.
 * @return true if plays
 */
MajVj.misc.sound.prototype.isPlaying = function () {
  return this._playing != 0;
};

/**
 * Checks if any playable data is ready.
 * @return true if it can play
 */
MajVj.misc.sound.prototype.isReady = function () {
  return this._data != null;
};
