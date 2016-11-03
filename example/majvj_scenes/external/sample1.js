/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - external plugin - sample1 -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.external.sample1 = function (options) {
  this._mv = options.mv;
  this.properties = {};
  this._frame = this._mv.create('frame', 'wired');
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.external.sample1.prototype.draw = function (delta) {
  this._mv.screen().fillColor(0, 0, 0, 1);
  this._frame.draw(delta);
};
