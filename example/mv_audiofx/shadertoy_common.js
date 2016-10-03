ShadertoyCommon = function () {
    this.mv = new MajVj();
    this.sound = null;
};

ShadertoyCommon.prototype.init = function (sound) {
    return new Promise((resolve, reject) => {
        Promise.all([
            MajVj.loadPlugin('frame', 'shadertoy'),
            MajVj.loadPlugin('misc', 'sound')
        ]).then(() => {
            if (sound) {
                this.sound = this.mv.create('misc', 'sound');
                this.sound.fetch('../data/sample.mp3', true);
            }
            resolve();
        });
    });
};

ShadertoyCommon.prototype.prop = function () {
    return {
        volume: 0.0,
        wave: new Float32Array(2048),
        fft: new Uint8Array(1024)
    };
};

ShadertoyCommon.prototype.run = function (shadertoy) {
    if (!this.sound)
        return;
    this.sound.getFloatWaveTable(shadertoy.properties.wave);
    this.sound.getByteFrequencyData(shadertoy.properties.fft);
    var rms = 0.0;
    var wave = shadertoy.properties.wave;
    for (var i = 0; i < wave.length; ++i) {
      var data = wave[i];
      rms += data * data;
    }
    rms = Math.sqrt(rms / wave.length);
    shadertoy.properties.volume = rms;
};
