/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d - harrier module
 */
MajVj.frame.nicofarre3d.modules.harrier = function (options) {
  this._zspeed = options.zspeed || 10.0;
  this._xspeed = options.xspeed || 0.00;
  this._zinterval = options.zinterval || 50.0;
  this._xinterval = options.xinterval || 0.0;
  this._alpha = options.alpha || 0.1;
  this._color = options.color || [0.4, 0.4, 0.6];
  this._t = 0.0;
};

/**
 * Clears screen.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.harrier.prototype.clear = function (api) {
  api.setAlphaMode(true, api.gl.DST_COLOR, api.gl.ZERO);
  api.fill([this._alpha, this._alpha, this._alpha, 1.0]);
};

/**
 * Draws.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.harrier.prototype.draw = function (api) {
  this._t += api.delta;
  api.setAlphaMode(true, api.gl.ONE, api.gl.ONE);
  api.color = [1.0, 1.0, 1.0, 1.0];
  var s = 100000;
  var l = 1000000;
  var c = 0;
  var t = this._t / 1000 * this._zspeed;
  for (var z = -s; z < s; z += 10000) {
    c = (1.0 + Math.sin(t + z / s * this._zinterval)) / 2.0;
    api.color =
        [this._color[0] * c, this._color[1] * c, this._color[2] * c, 1.0];
    api.drawLine([-l, -5000, z], [l, -5000, z]);
  }
  t = this._t / 1000 * this._xspeed;
  for (var x = -s; x < s; x += 10000) {
    c = (1.0 + Math.sin(t)) / 2.0;
    c = (1.0 + Math.sin(t + x / s * this._xinterval)) / 2.0;
    api.color =
        [this._color[0] * c, this._color[1] * c, this._color[2] * c, 1.0];
    api.drawLine([x, -5000, -l], [x, -5000, l]);
  }
};
