/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - perfume1mm -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.perfume1mm = function (options) {
  this._mv = options.mv;
  this.properties = {
    fftDb: new Float32Array(1024)
  };
  this._sound = options.sound;

  this._skip = 0;
  //this._skip = (2300 + 2184 * 25) / 1000;  // A
  //this._skip = (2300 + 2184 * 33) / 1000;  // B
  //this._skip = (2300 + 2184 * 41) / 1000;  // C
  //this._skip = (2300 + 2184 * 57) / 1000;  // I
  //this._skip = (2300 + 2184 * 65) / 1000;  // A
  //this._skip = (2300 + 2184 * 73) / 1000;  // B
  //this._skip = (2300 + 2184 * 81) / 1000;  // C
  //this._skip = (2300 + 2184 * 97) / 1000;  // I1
  //this._skip = (2300 + 2184 * 105) / 1000;  // I2

  // Setup frames.
  this._signalL = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_FRONT_LEFT,
    frames: [ { name: 'signal', options: {
      coord: [0.0, 0.2, 0.007],
      color: [0.0, 0.0, 0.0, 0.0]
    } } ]
  });
  this._signalR = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_FRONT_RIGHT,
    frames: [ { name: 'signal', options: {
      coord: [0.0, 0.2, 0.007],
      color: [0.0, 0.0, 0.0, 0.0]
    } } ]
  });
  this._signalOn = true;
  this._signalC = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_CEILING,
    frames: [ { name: 'signal', options: {
      coord: [0.0, 0.2, 0.007],
      color: [0.0, 0.0, 0.0, 0.0]
    } } ]
  });
  this._signalCeilingOn = false;

  this._beams = this._mv.create('frame', 'nicofarre3d', {
    modules: [ {
      name: 'beams',
      options: { period: 1092, unit: 10 }
    }, {
      name: 'harrier',
      options: { color: [0.1, 0.1, 0.2] }
    } ]
  });
  this._propHarrier = this._beams.properties;
  this._propHarrier.harrier = 0.0;
  this._beamsOn = false;
  this._screw = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_LEFT_STAGE_RIGHT,
    frames: [ { name: 'sandbox', options: { id: '19624.0' } } ]
  });
  this._screwOn = false;
  this._tunnel = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_LEFT_STAGE_RIGHT,
    frames: [ { name: 'sandbox', options: {
       shader: MajVj.scene.perfume1mm._shader19528 } } ]
  });
  this._tunnelOn = false;
  this._specticle = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_FRONT_BOTH,
    mirror: MajVj.frame.nicofarre.MIRROR_ON_RIGHT,
    frames: [ { name: 'specticle', options: {
      color: [0.7, 0.2, 0.5, 1.0],
      controller: this._fftController
    } } ]
  });
  this._specticleOn = false;
  this._wired = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_FRONT_BOTH,
    mirror: MajVj.frame.nicofarre.MIRROR_ON_RIGHT,
    frames: [ {
      name: 'effect',
      options: {
        frames: ['wired'],
        effects: [ { name: 'glow' } ]
      }
    } ]
  });
  var propGlow = this._wired.getFrame(0).getEffect(0).properties;
  propGlow.volume = 1.0;
  propGlow.t = 0.0;
  this._wiredOn = false;
  this._train  = this._mv.create('frame', 'effect', {
    frames: [ {
      name: 'nicofarre3d',
      options: {
        draw: this._drawMoon.bind(this),
        modules: [ {
          name: 'train',
          options: { period: 1092 / 4 }
        }, {
          name: 'beams',
          options: {
            period: 500, //1092 * 4,
            unit: 1, //5,
            speed: 200,
            dir: MajVj.frame.nicofarre3d.modules.beams.DIR_B2F
          }
        }, {
          name: 'lines',
          options: { lines: 1 }
        } ]
      }
    } ],
    effects: [ {
      name: 'glow',
      options: { controller: this._glowController }
    } ]
  });
  this._propTrain = this._train.getFrame(0).properties;
  this._propTrain.train[0] = 5.0;
  this._propTrain.train[1] = 0.0;
  propGlow = this._train.getEffect(0).properties;
  propGlow.volume = 1.0;
  propGlow.t = 0.0;
  this._trainOn = false;
  this._ceil = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_CEILING,
    frames: [ { name: 'sandbox', options: { id: '18357.1' } } ]
  });
  this._ceilOn = false;
  this._flare = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_CEILING,
    frames: [ { name: 'sandbox', options: { id: '1674.0' } } ]
  });
  this._flareOn = false;
  this._poles = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_FRONT_BOTH,
    mirror: MajVj.frame.nicofarre.MIRROR_ON_RIGHT,
    frames: [ { name: 'sandbox', options: { id: '19698.3' } } ]
  });
  this._polesOn = false;

  this._moon = TmaModelPrimitives.createSphere(
      3, TmaModelPrimitives.SPHERE_METHOD_EVEN);
  if (MajVj.scene.perfume1mm._moon) {
    var moon = this._mv.screen().convertImage(MajVj.scene.perfume1mm._moon);
    for (var i = 0; i < moon.width * moon.height * 4; ++i)
      moon.data[i] /= 8;
    this._moon.setTexture(this._mv.screen().createTexture(
        moon, true, Tma3DScreen.FILTER_LINEAR));
  }

  // Setup sequencers.
  this._sequencer = new TmaSequencer();
  var serial = new TmaSequencer.SerialTask();
  this._sequencer.register(2000, serial);

  serial.append(new TmaSequencer.Task(300, function () {
    var skip = this._skip;
    if (skip)
      skip -= 2.3;
    if (this._sound)
      this._sound.play(MajVj.scene.perfume1mm._sound, 2, skip);
  }.bind(this)));

  var parallel = new TmaSequencer.ParallelTask();
  parallel.append(new TmaSequencer.Task(
      TmaSequencer.Task.INFINITE, this._signalTask.bind(this)));
  serial.append(parallel);

  var part = new TmaSequencer.SerialTask();
  parallel.append(part);
  part.append(new TmaSequencer.Task(2184));  // Drums
  part.append(new TmaSequencer.Task(0, function () {
    this._beamsOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // Intro
  part.append(new TmaSequencer.Task(0, function () {
    this._specticleOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // Intro + Bass
  part.append(new TmaSequencer.Task(0, function () {
    this._ceilOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // Intro + Melody
  part.append(new TmaSequencer.Task(0, function () {
    // A
    this._specticleOn = false;
    this._signalOn = false;
    this._beamsOn = false;
    this._screwOn = true;
    this._polesOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // A
  part.append(new TmaSequencer.Task(0, function () {
    // B
    this._screwOn = false;
    this._polesOn = false;
    this._ceilOn = false;
    this._wiredOn = true;
    this._tunnelOn = true;
    this._flareOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // B
  part.append(new TmaSequencer.Task(0, function () {
    // C
    this._flareOn = false;
    this._tunnelOn = false;
    this._screwOn = false;
    this._wiredOn = false;
    this._trainOn = true;
    this._signalOn = true;
    this._signalCeilingOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 16));  // C
  part.append(new TmaSequencer.Task(0, function () {
    // I
    this._signalCeilingOn = false;
    this._trainOn = false;
    this._screwOn = false;
    this._beamsOn = true;
    this._ceilOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // I
  part.append(new TmaSequencer.Task(0, function () {
    // A
    this._specticleOn = false;
    this._signalOn = false;
    this._beamsOn = false;
    this._screwOn = true;
    this._polesOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // A
  part.append(new TmaSequencer.Task(0, function () {
    // B
    this._screwOn = false;
    this._polesOn = false;
    this._wiredOn = true;
    this._tunnelOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // B
  part.append(new TmaSequencer.Task(0, function () {
    // C1
    this._tunnelOn = false;
    this._ceilOn = false;
    this._screwOn = false;
    this._wiredOn = false;
    this._trainOn = true;
    this._signalOn = true;
    this._signalCeilingOn = true;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // C1
  part.append(new TmaSequencer.Task(0, function () {
    // C2
    this._propTrain.train[0]  = 0.506;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // C2
  part.append(new TmaSequencer.Task(0, function () {
    // I1
    this._propTrain.train[0] = 0.50;
  }.bind(this)));
  part.append(new TmaSequencer.Task(2184 * 8));  // I1
  var flyTask = new TmaSequencer.ParallelTask();
  flyTask.append(new TmaSequencer.Task(2184 * 16, this._flyTask.bind(this)));
  part.append(flyTask);  // I2

  this._sequencer.run(this._skip * 1000);
};

// Resources.
MajVj.scene.perfume1mm._sound = null;
MajVj.scene.perfume1mm._moon = null;

MajVj.scene.perfume1mm._shader19528 = ' \
precision mediump float; \
uniform float time; \
uniform vec2 resolution; \
float distance1(vec2 p1, vec2 p2){ \
        return max(abs((p2-p1).x),abs((p2-p1).y)); \
} \
void main(void) { \
        vec2 p = gl_FragCoord.xy/resolution.xx*2.-vec2(1.0,0.1); \
        gl_FragColor = distance1(p,vec2(0.0))*vec4(vec3((mod(.3/distance1(p,vec2(.0))+time*.1,.1)>cos(time+p.x)*0.05+0.05)^^(mod(atan(p.y,p.x)*7./22.+time*.1,.1)>sin(time+p.y)*0.05+0.05)),1.)*.4; \
}';

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.scene.perfume1mm.load = function () {
  return new Promise(function (resolve, reject) {
    /*
    Promise.all([
      sound.fetch('songs/1mm.mp3'),
      MajVj.loadImageFrom('images/moon.png')
    ]).then(function (resources) {
      scene.perfume1mm._sound = resources[0];
      scene.perfume1mm._moon = resources[1];
      resolve();
    }, function () { reject('scene.perfume1mm.load fails'); });
    */
    resolve();
  });
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.perfume1mm.prototype.draw = function (delta) {
  var fft = 0;
  if (this._sound) {
    var fftCount = this.properties.fftDb.length;
    this._sound.normalizeFrequencyData(
        this.properties.fftDb[(fftCount / 10)|0]);
  }
  this._propHarrier.harrier = fft / 10.0;
  this._sequencer.run(delta);
  var screen = this._mv.screen();
  screen.setAlphaMode(false);
  screen.fillColor(0.0, 0.0, 0.0, 1.0);
  screen.setAlphaMode(true, screen.gl.ONE, screen.gl.ONE);
  if (this._screwOn)
    this._screw.draw(delta);
  if (this._tunnelOn)
    this._tunnel.draw(delta);
  if (this._trainOn)
    this._train.draw(delta);
  if (this._signalOn) {
    this._signalL.draw(delta);
    this._signalR.draw(delta);
  }
  if (this._specticleOn)
    this._specticle.draw(delta);
  if (this._wiredOn)
    this._wired.draw(delta);
  if (this._polesOn)
    this._poles.draw(delta);
  if (this._beamsOn)
    this._beams.draw(delta);
  if (this._ceilOn)
    this._ceil.draw(delta);
  if (this._flareOn)
    this._flare.draw(delta);
  if (this._signalCeilingOn)
    this._signalC.draw(delta);
};

MajVj.scene.perfume1mm.prototype._signalTask = function (delta, time) {
  var t = time / 173.7;
  var s = Math.sin(t);
  var l = (s < 0) ? 0 : s;
  var r = (s < 0) ? -s : 0;
  var lgb = l / 4.0;
  var rgb = r / 4.0;
  this._signalL.getFrame(0).setColor([l, lgb, lgb, 1.0]);
  this._signalR.getFrame(0).setColor([r, rgb, rgb, 1.0]);
  this._signalC.getFrame(0).setColor([l + r, lgb + rgb, lgb + rgb, 1.0]);
};

MajVj.scene.perfume1mm.prototype._flyTask = function (delta, time) {
  this._propTrain.train[1] = time / 15000;
};

MajVj.scene.perfume1mm.prototype._drawMoon = function (api) {
  api.setAlphaMode(false);
  var r = this._propTrain.train[1];
  var y = (1 - r) * 3000;
  var z = -5000 + 2000 * r;
  api.drawPrimitive(this._moon, 1000, 1000, 1000,
                    [0, y, z],
                    [0, Math.PI / 2, 0]);
};

