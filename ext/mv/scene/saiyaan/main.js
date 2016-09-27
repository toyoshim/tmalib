/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - saiyaan -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.saiyaan = function (options) {
  this._mv = options.mv;
  // TODO: Fix to use properties.
  this._controller = options.controller;
  this._fftController = { volume: [0.0] };
  this._mixerController = { volume: [0.0, 0.0, 0.0] };
  this._tuningController = { volume: [0.0] };

  this._mixer = this._mv.create('frame', 'mixer', {
    channel: 3,
    controller: this._mixerController
  });

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
        frames: ['wired', {
           name: 'morphere',
           options: { controller: this._fftController }
        } ],
        effects: [ {
          name: 'tuning',
          options: { controller: this._tuningController }
        } ]
      }
    } ]
  });
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.saiyaan.prototype.draw = function (delta) {
  var fft = this._controller.sound.fftDb;
  var fftUnit = (fft.length / 4) | 0;
  this._fftController.volume[0] = fft[fftUnit * 3] / 512;
  var tuning = 0;
  if (fft[fftUnit] > 240)
    tuning = (fft[fftUnit] - 240) / 16;
  this._tuningController.volume[1] = tuning;

  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  this._mirage.draw(delta);
  this._ceil.draw(delta);
  this._front.draw(delta);

  var screen = this._mixer.bind(0);
  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  if (this._controller.volume[2] < 0.1) {
    //this._waypoints.draw(delta);
    this._mixerController.volume[0] = this._controller.volume[2] * 10.0;
  } else if (this._controller.volume[2] < 0.2) {
    //this._waypoints.draw(delta);
    this._mixerController.volume[0] = (0.2 - this._controller.volume[2]) * 10.0;
  } else if (this._controller.volume[2] < 0.3) {
    this._tunnel.draw(delta);
    this._mixerController.volume[0] = (this._controller.volume[2] - 0.2) * 10.0;
  } else if (this._controller.volume[2] < 0.4) {
    this._tunnel.draw(delta);
    this._mixerController.volume[0] = (0.4 - this._controller.volume[2]) * 10.0;
  } else if (this._controller.volume[2] < 0.5) {
    this._city.draw(delta);
    this._mixerController.volume[0] = (this._controller.volume[2] - 0.4) * 10.0;
  } else if (this._controller.volume[2] < 0.6) {
    this._city.draw(delta);
    this._mixerController.volume[0] = (0.6 - this._controller.volume[2]) * 10.0;
  }
  this._mixer.bind(1);
  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  if (this._controller.volume[2] < 0.1) {
    this._mixerController.volume[1] = 0.0;
  } else if (this._controller.volume[2] < 0.2) {
    this._city.draw(delta);
    this._mixerController.volume[1] = (this._controller.volume[2] - 0.1) * 10.0;
  } else if (this._controller.volume[2] < 0.3) {
    this._city.draw(delta);
    this._mixerController.volume[1] = (0.3 - this._controller.volume[2]) * 10.0;
  } else if (this._controller.volume[2] < 0.4) {
    //this._waypoints.draw(delta);
    this._mixerController.volume[1] = (this._controller.volume[2] - 0.3) * 10.0;
  } else if (this._controller.volume[2] < 0.5) {
    //this._waypoints.draw(delta);
    this._mixerController.volume[1] = (0.5 - this._controller.volume[2]) * 10.0;
  } else if (this._controller.volume[2] < 0.6) {
    this._tunnel.draw(delta);
    this._mixerController.volume[1] = (this._controller.volume[2] - 0.5) * 10.0;
  } else if (this._controller.volume[2] < 0.7) {
    this._tunnel.draw(delta);
    this._mixerController.volume[1] = (0.7 - this._controller.volume[2]) * 10.0;
  }
  if (this._controller.volume[3] != 0.0) {
    this._mixer.bind(2);
    this._mv.screen().setAlphaMode(false);
    this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
    this._mixerController.volume[2] = this._controller.volume[3];
    this._spark.draw(delta);
  }
  screen.bind();
  this._mv.screen().setAlphaMode(
      true, this._mv.screen().gl.ONE, this._mv.screen().gl.ONE);
  this._mixer.draw(delta);
};
