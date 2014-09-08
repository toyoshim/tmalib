/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d - lines module
 */
MajVj.frame.nicofarre3d.modules.lines = function (options) {
  this._rate = options.rate || 0.95;
  this._lines = options.lines || 256;
};

/**
 * Clears screen.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.lines.prototype.clear = function (api) {
  api.setAlphaMode(true, api.gl.DST_COLOR, api.gl.ZERO);
  api.fill([this._rate, this._rate, this._rate, 1.0]);
};

/**
 * Draws.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.lines.prototype.draw = function (api) {
  api.setAlphaMode(true, api.gl.ONE, api.gl.ONE);
  for (var i = 0; i < this._lines; ++i) {
    api.color = [Math.random(), Math.random(), Math.random(), Math.random()];
    api.drawLine([this._p(), this._p(), this._p()],
                 [this._p(), this._p(), this._p()]);
  }
};

MajVj.frame.nicofarre3d.modules.lines.prototype._p = function (api) {
  return (Math.random() - 0.5) * 10000;
};
