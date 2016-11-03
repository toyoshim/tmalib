/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - saiyaan -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.saiyaan = function (options) {
  this._mv = options.mv;
  this.properties = {
    volume: 0.0,
    rap: 0.0,
    fftDb: null
  };

  this._mixer = this._mv.create('frame', 'mixer', { channel: 3 });

  this._waypoints = this._mv.create('frame', 'nicofarre3d', {
    modules: [ {
      name: 'waypoints',
      options: { particles: 5000 }
    } ]
  });
  this._mirage = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_LEFT_STAGE_RIGHT,
    frames: [ { name: 'sandbox', options: { id: '19454.0' } } ]
  });
  this._spark = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_STAGE_AND_BACK,
    mirror: MajVj.frame.nicofarre.MIRROR_ON_RIGHT,
    frames: [ { name: 'sandbox', options: { id: '14282.0' } } ]
  });
  this._city = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_STAGE,
    frames: [ { name: 'sandbox', options: { id: '18922.0' } } ]
  });
  this._tunnel = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_STAGE,
    frames: [ { name: 'sandbox', options: { id: '14373.1' } } ]
  });
  this._ceil = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_CEILING,
    frames: [ { name: 'sandbox', options: { id: '18794.0' } } ]
  });
  this._front = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_FRONT_BOTH,
    mirror: MajVj.frame.nicofarre.MIRROR_ON_RIGHT,
    frames: [ {
      name: 'effect',
      options: {
        frames: ['wired', { name: 'morphere' } ],
        effects: [ { name: 'tuning' } ]
      }
    } ]
  });
  this._prop_fft = this._front.getFrame(0).getFrame(1).properties;
  this._prop_fft.volume = 0.0;
  this._prop_tuning = this._front.getFrame(0).getEffect(0).properties;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.saiyaan.prototype.draw = function (delta) {
  var fft = this.properties.fftDb;
  if (fft) {
    var fftUnit = (fft.length / 4) | 0;
    this._prop_fft.volume = fft[fftUnit * 3] / 512;
    var tuning = 0;
    if (fft[fftUnit] > 240)
      tuning = (fft[fftUnit] - 240) / 16;
    this._prop_tuning.volume = tuning;
  }

  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  this._mirage.draw(delta);
  this._ceil.draw(delta);
  this._front.draw(delta);

  var screen = this._mixer.bind(0);
  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  var volume = this.properties.volume;
  if (volume < 0.1) {
    //this._waypoints.draw(delta);
    this._mixer.properties.volume[0] = volume * 10.0;
  } else if (volume < 0.2) {
    //this._waypoints.draw(delta);
    this._mixer.properties.volume[0] = (0.2 - volume) * 10.0;
  } else if (volume < 0.3) {
    this._tunnel.draw(delta);
    this._mixer.properties.volume[0] = (volume - 0.2) * 10.0;
  } else if (volume < 0.4) {
    this._tunnel.draw(delta);
    this._mixer.properties.volume[0] = (0.4 - volume) * 10.0;
  } else if (volume < 0.5) {
    this._city.draw(delta);
    this._mixer.properties.volume[0] = (volume - 0.4) * 10.0;
  } else if (volume < 0.6) {
    this._city.draw(delta);
    this._mixer.properties.volume[0] = (0.6 - volume) * 10.0;
  }
  this._mixer.bind(1);
  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  if (volume < 0.1) {
    this._mixer.properties.volume[1] = 0.0;
  } else if (volume < 0.2) {
    this._city.draw(delta);
    this._mixer.properties.volume[1] = (volume - 0.1) * 10.0;
  } else if (volume < 0.3) {
    this._city.draw(delta);
    this._mixer.properties.volume[1] = (0.3 - volume) * 10.0;
  } else if (volume < 0.4) {
    //this._waypoints.draw(delta);
    this._mixer.properties.volume[1] = (volume - 0.3) * 10.0;
  } else if (volume < 0.5) {
    //this._waypoints.draw(delta);
    this._mixer.properties.volume[1] = (0.5 - volume) * 10.0;
  } else if (volume < 0.6) {
    this._tunnel.draw(delta);
    this._mixer.properties.volume[1] = (volume - 0.5) * 10.0;
  } else if (volume < 0.7) {
    this._tunnel.draw(delta);
    this._mixer.properties.volume[1] = (0.7 - volume) * 10.0;
  }
  this._mixer.properties.volume[2] = this.properties.rap;
  if (this.properties.rap != 0.0) {
    this._mixer.bind(2);
    this._mv.screen().setAlphaMode(false);
    this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
    this._spark.draw(delta);
  }
  screen.bind();
  this._mv.screen().setAlphaMode(
      true, this._mv.screen().gl.ONE, this._mv.screen().gl.ONE);
  this._mixer.draw(delta);
};
