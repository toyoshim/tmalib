/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - image -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.image = function(options) {
  this._screen = options.screen;
  this._mv = options.mv;
  this._width = options.width;
  this._height = options.height;
  this.properties = {
    scroll: [0, 0],  // base point in the original image pixel range
    scale: 1.0,
    volume: 1.0
  };
  this._texture = null;

  this._program = this._screen.createProgram(
    this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
      MajVj.frame.image._vertexShader),
    this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
      MajVj.frame.image._fragmentShader));
  this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0])
  if (options.url) {
    MajVj.loadImageFrom(options.url).then(image => {
      this._texture = this._screen.createTexture(image, true);
    });
  } else if (options.image) {
    this._texture = this._screen.createTexture(options.image, true);
  }
};

// Shader programs.
MajVj.frame.image._vertexShader = null;
MajVj.frame.image._fragmentShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.image.load = function() {
  return new Promise(function(resolve, reject) {
    Promise.all([
      MajVj.loadShader('frame', 'image', 'shaders.html', 'vertex'),
      MajVj.loadShader('frame', 'image', 'shaders.html', 'fragment')
    ]).then(function(results) {
      MajVj.frame.image._vertexShader = results[0];
      MajVj.frame.image._fragmentShader = results[1];
      resolve();
    }, function(error) {
      tma.log(error);
    });
  });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.image.prototype.onresize = function(aspect) {
  var size = this._mv.size();
  this._width = size.width;
  this._height = size.height;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.image.prototype.draw = function(delta) {
  if (!this._texture)
    return;
  this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
  this._program.setUniformVector('uScale', [
    this._texture.width / this._width * this.properties.scale,
    this._texture.height / this._height * this.properties.scale
  ]);
  this._program.setUniformVector('uOffset', [
    this.properties.scroll[0] / this._width,
    this.properties.scroll[1] / this._height
  ]);
  this._program.setUniformVector('uVolume', [this.properties.volume]);
  this._program.setTexture('uTexture', this._texture);
  this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
