/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - movie -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.movie = function(options) {
  this._screen = options.screen;
  this._width = options.width;
  this._height = options.height;
  this._aspect = options.aspect;
  this._mute = !!options.mute;
  this._rate = options.rate ? options.rate : 1.0;
  this.properties = {
    scroll: [0, 0],  // base point in the original image pixel range
    scale: 0.0,      // automatically adjusted if 0 is specified
    volume: 1.0
  };
  this._video = null;
  this._texture = null;
  this._zoom = 1.0;  // automatic adjust scale

  this._program = this._screen.createProgram(
    this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
      MajVj.frame.movie._vertexShader),
    this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
      MajVj.frame.movie._fragmentShader));
  this._coords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0])
  if (options.url)
    this.play(options.url).then(function() {});
};

// Shader programs.
MajVj.frame.movie._vertexShader = null;
MajVj.frame.movie._fragmentShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.movie.load = function() {
  return new Promise(function(resolve, reject) {
    Promise.all([
      MajVj.loadShader('frame', 'movie', 'shaders.html', 'vertex'),
      MajVj.loadShader('frame', 'movie', 'shaders.html', 'fragment')
    ]).then(function(results) {
      MajVj.frame.movie._vertexShader = results[0];
      MajVj.frame.movie._fragmentShader = results[1];
      resolve();
    }, function(error) {
      tma.log(error);
    });
  });
};

/**
 * Starts playing a movie from a specified URL.
 * @param url a movie URL
 * @return a Promise object
 */
MajVj.frame.movie.prototype.play = function(url) {
  return new Promise(function(resolve, reject) {
    MajVj.loadMovieFrom(url).then(function(video) {
      this._video = video;
      tma.log('video: ' + video.videoWidth + 'x' + video.videoHeight);
      this._video.volume = this._mute ? 0 : 1;
      this._video.loop = true;
      this._video.playbackRate = this._rate;

      // Calculate automatic adjust scale.
      var aspect = video.videoWidth / video.videoHeight;
      if (this._aspect > aspect)
        this._zoom = this._aspect / aspect;
      this._texture = this._screen.createTexture(
        video, true, Tma3DScreen.FILTER_LINEAR);
      resolve();
    }.bind(this), function(error) {
      tma.log(error);
    });
  }.bind(this));
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.movie.prototype.onresize = function(aspect) {
  this._aspect = aspect;
  var size = this._mv.size();
  this._width = size.width;
  this._height = size.height;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.movie.prototype.draw = function(delta) {
  if (!this._texture)
    return;
  if (this._video.paused)
    this._video.play();
  this._texture.update(this._video);
  this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
  this._program.setUniformVector('uScale', this.properties.scale ? [
    this._video.videoWidth / this._width * this.properties.scale,
    this._video.videoHeight / this._height * this.properties.scale
  ] : [1, this._zoom]);
  this._program.setUniformVector('uOffset', [
    this.properties.scroll[0] / this._width,
    this.properties.scroll[1] / this._height
  ]);
  this._program.setUniformVector('uVolume', [this.properties.volume]);
  this._program.setTexture('uTexture', this._texture);
  this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
