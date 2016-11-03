/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - noop -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.roll = function (options) {
  this._mv = options.mv;
  this.properties = {
    fftDb: new Float32Array(1024)
  }

  this._front = this._mv.create('frame', 'nicofarre', {
    led: MajVj.frame.nicofarre.LED_FRONT_BOTH,
    frames: [ {
      name: 'specticle',
      options: {
        random: 0.3,
        color: [0.1, 0.1, 0.3, 1.0]
      }
    } ]
  });
  this._front.getFrame(0).properties.fftDb = this.properties.fftDb;
  this._frame = this._mv.create('frame', 'nicofarre3d', {
      modules: [ {
        name: 'waypoints',
        options: {
          size: 8192,
          height: 4096,
          particles: 1000,
          waypoints: 16,
          wayspeed: 70,
          gravity: 10,
          range: 1000000,
          emit: 1
        }
      }, {
        name: 'roll',
        options: {
          script: options.script || MajVj.scene.roll._script,
          delay: 0,
          font: {
            size: 70,
            name: 'Sans',
            foreground: 'rgba(76, 38, 51, 200)',
            background: 'rgba(0, 0, 0, 255)'
          },
          headFont: {
            size: 90,
            name: 'Sans',
            foreground: 'rgba(76, 51, 76, 200)',
            background: 'rgba(0, 0, 0, 255)'
          }
        }
      } ]
  });
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.roll.prototype.draw = function (delta) {
  this._mv.screen().setAlphaMode(false);
  this._frame.draw(delta);
  this._front.draw(delta);
};

MajVj.scene.roll._script = [
  { head: true, text: 'End Roll' },
  { text: 'This is a sample script' },
  { text: '' },
  { text: 'by toyoshim' }
];
