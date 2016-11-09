/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - photoframe -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.photoframe = function(options) {
  this.properties = {};
  this._data = [];
  this._mv = options.mv;
  var data = options.data || [];
  for (var i = 0; i < data.length; ++i) {
    this._data[i] = {
      frame: this._mv.create(
          'frame', data[i].type, { url: data[i].url, rate: data[i].rate }),
      x: this._createAutomation(data[i].x, 0),
      y: this._createAutomation(data[i].y, 0),
      scale: this._createAutomation(data[i].scale, 1),
      volume: this._createAutomation(data[i].volume, 1)
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
    data.frame.properties.scroll[0] = data.x.generate(delta);
    data.frame.properties.scroll[1] = data.y.generate(delta);
    data.frame.properties.scale =  data.scale.generate(delta);
    data.frame.properties.volume = data.volume.generate(delta);
    if (data.frame.properties.volume)
      data.frame.draw(delta);
  }
};

MajVj.frame.photoframe.prototype._createAutomation =
    function(data, fallbackConstant) {
  if (!data)
    return { generate: function (delta) { return fallbackConstant; } };
  if (data[0].type != 'properties')
    return this._mv.create('misc', 'sequencer', { sequence: data });
  return {
    generate: (delta) => {
      return data[0].offset + this.properties[data[0].name] * data[0].scale;
    }
  };
};
