/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - photoframe -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.photoframe = function(options) {
  this.properties = {};
  this._data = [];
  var mv = options.mv;
  var data = options.data || [];
  for (var i = 0; i < data.length; ++i) {
    this._data[i] = {
      frame: mv.create(
          'frame', data[i].type, { url: data[i].url, rate: data[i].rate }),
      x: data[i].x ?
          mv.create('misc', 'sequencer', { sequence: data[i].x }) : null,
      y: data[i].y ?
          mv.create('misc', 'sequencer', { sequence: data[i].y }) : null,
      scale: data[i].scale ?
          mv.create('misc', 'sequencer', { sequence: data[i].scale }) : null,
      volume: data[i].volume ?
          mv.create('misc', 'sequencer', { sequence: data[i].volume }) : null
    };
  }
};

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.photoframe.load = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.photoframe.prototype.onresize = function(aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.photoframe.prototype.draw = function(delta) {
  for (var i = 0; i < this._data.length; ++i) {
    var data = this._data[i];
    data.frame.properties.scroll[0] =
        data.x ? data.x.generate(delta) : 0;
    data.frame.properties.scroll[1] =
        data.y ? data.y.generate(delta) : 0;
    data.frame.properties.scale =
        data.scale ? data.scale.generate(delta) : 1;
    data.frame.properties.volume =
        data.volume ? data.volume.generate(delta) : 1;
    if (data.frame.properties.volume)
      data.frame.draw(delta);
  }
};
