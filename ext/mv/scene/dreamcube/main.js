/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - dreamcube -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.dreamcube = function (options) {
  this._mv = options.mv;
  this.properties = {};

  var nico3d = { name: 'nicofarre3d', options: { module: 'cube' } };
  this._frame = this._mv.create('frame', 'effect', {
      frames: [nico3d],
      effects: ['glow']});
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.dreamcube.prototype.draw = function (delta) {
  this._frame.draw(delta);
};
