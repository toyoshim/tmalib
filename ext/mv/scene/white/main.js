/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - white -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.white = function (options) {
  this._mv = options.mv;
  this.properties = {};
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.white.prototype.draw = function (delta) {
  this._mv.screen().pushAlphaMode();
  this._mv.screen().setAlphaMode(false);
  this._mv.screen().fillColor(1.0, 1.0, 1.0, 1.0);
  this._mv.screen().popAlphaMode();
};
