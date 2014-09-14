/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - lines -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.lines = function (options) {
  this._mv = options.mv;
  this._controller = options.controller;

  this._frame = this._mv.create('frame', 'nicofarre3d', {
      draw: MajVj.scene.lines.draw3d.bind(this) });
};

/**
 * Get a random value for a position.
 * @return a random value from -50000 to 50000.
 */
MajVj.scene.lines._getRandomPosition = function () {
  return (Math.random() - 0.5) * 100000;
};

/**
 * A callback to draws a frame by using nicofarre3d API.
 * @param api nicofarre3d interfaces
 */
MajVj.scene.lines.draw3d = function (api) {
  var p = MajVj.scene.lines._getRandomPosition;
  api.setAlphaMode(true, api.gl.DST_COLOR, api.gl.ZERO);
  var rate = 0.95 + 0.049 * this._controller.volume[1];
  api.fill([rate, rate, rate, 1.0]);
  api.setAlphaMode(true, api.gl.ONE, api.gl.ONE);
  for (var i = 0; i < 128; ++i) {
    api.color = [Math.random(), Math.random(), Math.random(), Math.random()];
    api.drawLine([p(), p(), p()], [p(), p(), p()]);
  }
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.lines.prototype.draw = function (delta) {
  this._frame.draw(delta);
};
