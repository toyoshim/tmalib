/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - waypoints -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.waypoints = function (options) {
  this._mv = options.mv;
  this.properties = {
    tuning: 0.0,
    rgb: 0.01
  };
  var nico3d = { name: 'nicofarre3d', options: {
    modules: [ {
      name: 'waypoints',
      options: {
        size: 8192,
        particles: 300,
        wayspeed: 50,
        gravity: 1000,
        emit: 1
      }
    } ]
  } };
  var tuning = { name: 'tuning' };
  var rgb = { name: 'rgb' };
  this._frame = this._mv.create('frame', 'effect', {
      frames: [nico3d],
      effects: [tuning, rgb]
  });
  this._frame.getEffect(0).properties.volume = this.properties.tuning;
  this._frame.getEffect(1).properties.volume = this.properties.rgb;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.waypoints.prototype.draw = function (delta) {
  this._frame.getEffect(0).properties.volume = this.properties.tuning;
  this._frame.getEffect(1).properties.volume = this.properties.rgb;
  this._frame.draw(delta);
};
