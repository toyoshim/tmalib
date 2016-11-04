/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - zoom -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.zoom = function(options) {
  this.properties = {
    multi: [1, 1],
    scale: [1, 1],
    volume: 1
  };

  this._program = options.screen.createProgram(
    options.screen.compileShader(Tma3DScreen.VERTEX_SHADER,
      MajVj.effect.zoom._vertexShader),
    options.screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
      MajVj.effect.zoom._fragmentShader));
  this._coords = options.screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
};

// Shader programs.
MajVj.effect.zoom._vertexShader = null;
MajVj.effect.zoom._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.zoom.load = function() {
  return new Promise(function(resolve, reject) {
    Promise.all([
      MajVj.loadShader('effect', 'zoom', 'shaders.html', 'vertex'),
      MajVj.loadShader('effect', 'zoom', 'shaders.html', 'fragment'),
    ]).then(function(data) {
      MajVj.effect.zoom._vertexShader = data[0];
      MajVj.effect.zoom._fragmentShader = data[1];
      resolve();
    }, function() {
      reject('zoom.load fails');
    });
  });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.zoom.prototype.onresize = function(aspect) {};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.zoom.prototype.draw = function(delta, texture) {
  this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
  this._program.setTexture('uTexture', texture);
  this._program.setUniformVector('uMulti', this.properties.multi);
  this._program.setUniformVector('uScale', this.properties.scale);
  this._program.setUniformVector('uVolume', [this.properties.volume]);
  this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};
