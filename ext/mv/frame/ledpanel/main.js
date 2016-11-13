/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - ledpanel -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.ledpanel = function(options) {
  var size = options.size || 128;
  this._columns = (options.width / size) | 0;
  this._rows = (options.height / size) | 0;
  this._effect = options.mv.create('effect', 'mask', { patch: 'led' });
  this._effect.properties.resolution = [ this._columns, this._rows ];

  this.properties = {
    image: options.screen.createImage(this._columns, this._rows),
    volume: 1.0
  }

  this._texture = options.screen.createTexture(
      this.properties.image, true, Tma3DScreen.FILTER_NEAREST);
};

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.ledpanel.load = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.ledpanel.prototype.onresize = function(aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.ledpanel.prototype.draw = function(delta) {
  this._texture.update();
  this._effect.properties.volume = this.properties.volume;
  this._effect.draw(delta, this._texture);
};
