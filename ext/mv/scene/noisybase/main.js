/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - noisybase -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.noisybase = function (options) {
  this._mv = options.mv;
  this.properties = {
    slitter: 0.0,
    rgb: 0.0,
    color: 0.0,
    multi: 0.0,
    tube: 0.0,
    film: 0.0,
    noise1: 0.0,
    noise2: 0.0,
  };
	this._fbo = this._mv.screen().createFrameBuffer();
	this._frame = this._mv.create('frame', 'sandbox', { id: '14373.1' });
	this._effect = this._mv.create('effect', 'noise', {
	    enable: [
	      'scanline', 'raster', 'color', 'noise', 'slitscan', 'adjust',
	      'tube', 'film'
	    ]
	});
	this._effect.properties.noise_level[2] = 0;
	this._effect.properties.raster_level = 0;
	this._effect.properties.scanline_velocity = 0;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.noisybase.prototype.draw = function (delta) {
  var screen = this._fbo.bind();
	this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
	this._frame.draw(delta);
	screen.bind();
	this._mv.screen().fillColor(0.0, 0.0, 0.0, 1.0);
	var rgb = this.properties.rgb / 1000;
	this._effect.properties.color_shift[0] = -rgb;
	this._effect.properties.color_shift[2] = rgb;
	var c = 1 - this.properties.color / 127;
	this._effect.properties.color_level = [c, c, c];
	this._effect.properties.noise_level[0] = this.properties.noise1 / 128;
	this._effect.properties.noise_level[1] = this.properties.noise2 / 63;
	this._effect.properties.slitscan_size = 1 + this.properties.slitter;
	this._effect.properties.tube_adjust[0] = 1 - this.properties.tube / 127;
	this._effect.properties.tube_adjust[1] = 16 + this.properties.tube / 4;
	this._effect.properties.film_lines = (this.properties.film / 25) | 0;
	this._effect.properties.film_flash = this.properties.film / 96;
	var multi = 1 + (this.properties.multi / 16) | 0;
	this._effect.properties.adjust_repeat[0] = multi;
	this._effect.properties.adjust_repeat[1] = multi;
	this._effect.draw(delta, this._fbo.texture);
};
