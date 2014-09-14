/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - computerbrain -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.computerbrain = function (options) {
  this._mv = options.mv;
  this._controller = options.controller;

  this._stage = this._mv.create('frame', 'nicofarre', {
      led: MajVj.frame.nicofarre.LED_STAGE_AND_BACK,
      mirror: MajVj.frame.nicofarre.MIRROR_ON_LEFT,
      frames: [
          { name: 'sandbox', options: { id: '18922.0' } }
      ]});
  this._wall = this._mv.create('frame', 'nicofarre', {
      led: MajVj.frame.nicofarre.LED_WALL_BOTH,
      mirror: MajVj.frame.nicofarre.MIRROR_ON_RIGHT,
      frames: [
          { name: 'sandbox', options: { id: '18918.0' } }
      ]});
  this._side = this._mv.create('frame', 'nicofarre', {
      led: MajVj.frame.nicofarre.LED_FRONT_BOTH,
      mirror: MajVj.frame.nicofarre.MIRROR_ON_RIGHT,
      frames: [
          { name: 'sandbox', options: { id: '18451.0' } }
      ]});
  this._ceil = this._mv.create('frame', 'nicofarre', {
      led: MajVj.frame.nicofarre.LED_CEILING,
      frames: [
          { name: 'sandbox', options: { id: '18568.0' } }
      ]});
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.computerbrain.prototype.draw = function (delta) {
  this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
  this._stage.draw(delta);
  this._wall.draw(delta);
  this._side.draw(delta);
  this._ceil.draw(delta);
};
