/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - miku -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.miku = function (options) {
  this._mv = options.mv;
  this.properties = {
    // 0 - 1
    volume: 0.0,
    glow: 0,
    rgb: 0,
    fftDb: null
  };

  var N = MajVj.frame.nicofarre;
  this._stageMixer = this._createFrame(N.LED_STAGE_AND_BACK, 'effect', {
    frames: [ {
      name: 'mixer',
      options: {
        channel: 2
      }
    } ],
    effects: [
      { name: 'glow' },
      { name: 'rgb' }
    ]
  });
  this._stageMixer.getFrame(0).getEffect(1).properties.volume = 0.02;
  this._mixer = this._stageMixer.getFrame(0).getFrame(0);
  this._front = this._createSandboxFrame(N.LED_FRONT_BOTH, '18794.0');
  this._fft = this._createFrame(N.LED_FRONT_BOTH, 'specticle', {
    color: [0.1, 0.5, 0.1, 1.0]
  });
  this.properties.fftDb = this._fft.getFrame(0).properties.fftDb;
  this._ceil = this._createSandboxFrame(N.LED_CEILING, '18981.0');

  this._wallBall = this._createSandboxFrame(N.LED_WALL_BOTH, '18451.0');
  this._wallWave = this._createSandboxFrame(N.LED_WALL_BOTH, '18873.0');
  this._wallPulse = this._createSandboxFrame(N.LED_WALL_BOTH, '19136.0');

  this._stageNeon = this._createStageFrame('19291.0');
  this._stageWarp = this._createStageFrame('19512.0');
  this._stageTunnel = this._createStageFrame('19150.0');
  this._stageGate = this._createStageFrame('17945.0');

  this._stageCube = this._createStageFrame('18602.4t');
  this._stageLight = this._createStageFrame('18770.0');
  this._stageHill = this._createStageFrame('18760.0');
};

/**
 * Creates a stage frame.
 * @param name a frame name
 * @param options options
 * @return a frame object
 */
MajVj.scene.miku.prototype._createStageFrame = function (id) {
  return this._mv.create('frame', 'sandbox', {
    id: id,
    width: 840,
    height: 280,
    aspect: 840 / 280});
};


/**
 * Creates a sandbox frame with nicofarre layouter.
 * @param led which led should be used
 * @param name a frame name
 * @param options options
 * @return a frame object
 */
MajVj.scene.miku.prototype._createFrame = function (led, name, options) {
  return this._mv.create('frame', 'nicofarre', {
    led: led,
    mirror: MajVj.frame.nicofarre.MIRROR_ON_LEFT,
    frames: [ { name: name, options: options } ]
  });
};


/**
 * Creates a sandbox frame with nicofarre layouter.
 * @param led which led should be used
 * @param id shader id
 * @return a frame object
 */
MajVj.scene.miku.prototype._createSandboxFrame = function (led, id) {
  return this._createFrame(led, 'sandbox', { id: id });
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.miku.prototype.draw = function (delta) {
  this._stageMixer.getFrame(0).getEffect(0).properties.t =
      this.properties.glow;
  this._stageMixer.getFrame(0).getEffect(1).properties.volume =
      this.properties.rgb;

  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  this._front.draw(delta);
  var gl = this._mv.screen().gl;
  this._mv.screen().setAlphaMode(true, gl.ONE, gl.ONE);
  this._fft.draw(delta);
  this._ceil.draw(delta);
  this._wallPulse.draw(delta);

  var screen = this._mixer.bind(0);
  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  this._mv.screen().setAlphaMode(true, gl.ONE, gl.ONE);
  var mixer = this._mixer.properties;
  var volume = this.properties.volume;
  if (volume == 0.0) {
    mixer.volume[0] = 0.0;
  } else if (volume < 0.1) {
    this._stageNeon.draw(delta);
    mixer.volume[0] = volume * 10.0;
  } else if (volume < 0.2) {
    this._stageNeon.draw(delta);
    mixer.volume[0] = (0.2 - volume) * 10.0;
  } else if (volume < 0.3) {
    this._stageWarp.draw(delta);
    mixer.volume[0] = (volume - 0.2) * 10.0;
  } else if (volume < 0.4) {
    this._stageWarp.draw(delta);
    mixer.volume[0] = (0.4 - volume) * 10.0;
  } else if (volume < 0.5) {
    this._stageTunnel.draw(delta);
    mixer.volume[0] = (volume - 0.4) * 10.0;
  } else if (volume < 0.6) {
    this._stageTunnel.draw(delta);
    mixer.volume[0] = (0.6 - volume) * 10.0;
  } else if (volume < 0.7) {
    this._stageGate.draw(delta);
    mixer.volume[0] = (volume - 0.6) * 10.0;
  } else if (volume < 0.8) {
    this._stageGate.draw(delta);
    mixer.volume[0] = (0.8 - volume) * 10.0;
  }
  this._mixer.bind(1);
  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  this._mv.screen().setAlphaMode(true, gl.ONE, gl.ONE);
  if (volume < 0.1) {
    mixer.volume[1] = 0.0;
  } else if (volume < 0.2) {
    this._stageCube.draw(delta);
    mixer.volume[1] = (volume - 0.1) * 10.0;
  } else if (volume < 0.3) {
    this._stageCube.draw(delta);
    mixer.volume[1] = (0.3 - volume) * 10.0;
  } else if (volume < 0.4) {
    this._stageLight.draw(delta);
    mixer.volume[1] = (volume - 0.3) * 10.0;
  } else if (volume < 0.5) {
    this._stageLight.draw(delta);
    mixer.volume[1] = (0.5 - volume) * 10.0;
  } else if (volume < 0.6) {
    this._stageHill.draw(delta);
    mixer.volume[1] = (volume - 0.5) * 10.0;
  } else if (volume < 0.7) {
    this._stageHill.draw(delta);
    mixer.volume[1] = (0.7 - volume) * 10.0;
  }
  screen.bind();
  this._mv.screen().setAlphaMode(
      true, this._mv.screen().gl.ONE, this._mv.screen().gl.ONE);
  this._stageMixer.draw(delta);
};
