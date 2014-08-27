/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - wired -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.sound = function (options) {
    if (!MajVj.misc.sound._context)
        MajVj.misc.sound._context = new AudioContext();
    this._audio = MajVj.misc.sound._context;
    this._play = false;
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
    }, function (error) { reject(error); });
};

MajVj.misc.sound._context = null;


/**
 * Loads a sound data.
 * @param url url from where a sound data will be loaded
 * @param play automatically once the data is ready
 */
MajVj.misc.sound.prototype.fetch = function (url, play) {
    this._play = play;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
        if (!xhr.response)
            return;
        this._audio.decodeAudioData(xhr.response, function (buffer) {
            this._data = buffer;
            if (this._play)
                this.play();
        }.bind(this), function (e) { console.log(e); });
    }.bind(this);
    xhr.send();
};


/**
 * Plays.
 * @return true if succeeded
 */
MajVj.misc.sound.prototype.play = function () {
    if (!this._data)
        return false;
    this._buffer = this._audio.createBufferSource();
    this._buffer.buffer = this._data;
    // this._buffer.onended
    this._buffer.connect(this._audio.destination);
    this._buffer.start(0);
    return true;
};

/**
 * Stops.
 */
MajVj.misc.sound.prototype.stop = function () {
    this._buffer.stop();
};
