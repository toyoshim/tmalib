/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - waypoints -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.waypoints = function (options) {
  this._mv = options.mv;
  this._controller = options.controller;

  this._tuningController = { volume: [0.0] };
  this._rgbController = { volume: [0.01] };

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
  var tuning = {
    name: 'tuning',
    options: { controller: this._tuningController }
  };
  var rgb = {
    name: 'rgb',
    options: { controller: this._rgbController }
  };
  this._frame = this._mv.create('frame', 'effect', {
      frames: [nico3d],
      effects: [tuning, rgb]
  });
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.waypoints.prototype.draw = function (delta) {
  this._tuningController.volume[0] = this._controller.volume[2];
  this._rgbController.volume[0] = this._controller.volume[3];
  this._frame.draw(delta);
};
