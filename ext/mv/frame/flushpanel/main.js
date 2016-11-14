/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - flushpanel -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.flushpanel = function(options) {
  this.properties = {
    color: options.color || [0.3, 0.3, 0.3],
    units: options.units || [4, 1],
    speed: options.speed || 0.1,
    mode: options.mode || "l2r"
  };
  this._init(this.properties.units[0] * this.properties.units[1]);
  this._program = options.screen.createProgram(
      options.screen.compileShader(Tma3DScreen.VERTEX_SHADER,
          MajVj.frame.flushpanel._vertexShader),
      options.screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
          MajVj.frame.flushpanel._fragmentShader));
  this._coords = options.screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
};

// Shader programs.
MajVj.frame.flushpanel._vertexShader = null;
MajVj.frame.flushpanel._fragmentShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.flushpanel.load = function() {
  return new Promise(function(resolve, reject) {
    Promise.all([
      MajVj.loadShader('frame', 'flushpanel', 'shaders.html', 'vertex'),
      MajVj.loadShader('frame', 'flushpanel', 'shaders.html', 'fragment')
    ]).then(function (shaders) {
      MajVj.frame.flushpanel._vertexShader = shaders[0];
      MajVj.frame.flushpanel._fragmentShader = shaders[1];
      resolve();
    });
  });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.flushpanel.prototype.onresize = function(aspect) {
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.flushpanel.prototype.draw = function(delta) {
  this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
  var color = [
      this.properties.color[0],
      this.properties.color[1],
      this.properties.color[2],
      1.0
  ];
  var nx = this.properties.units[0];
  var ny = this.properties.units[1];
  var n = nx * ny;
  if (this._units.length != n)
    this._init(n);
  var w = 1 / nx;
  var h = 1 / ny;
  var x = (1 - nx) * w;
  var y = (1 - ny) * h;
  var i = 0;
  var d = delta * this.properties.speed;
  for (var iy = 0; iy < ny; ++iy) {
    for (var ix = 0; ix < nx; ++ix) {
      var unit = this._units[i++];
      unit.t += unit.w * d;
      this._program.setUniformVector('uUnit', [w, h, x, y]);
      color[3] = (Math.sin(unit.t) + 1) / 2;
      this._program.setUniformVector('uColor', color);
      this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
      x += w * 2;
    }
    y += h * 2;
  }
};

MajVj.frame.flushpanel.prototype._init = function(n) {
  this._units = new Array(n);
  if (this.properties.mode == "random") {
    for (var i = 0; i < n; ++i)
      this._units[i] = { w: Math.random(), t: 0 };
  } else if (this.properties.mode == "r2l") {
    for (var i = 0; i < n; ++i)
      this._units[i] = { w: 0.1, t: Math.PI * 2 * i / n };
  } else if (this.properties.mode == "l2r") {
    for (var i = 0; i < n; ++i)
      this._units[i] = { w: 0.1, t: Math.PI * 2 * (n - i) / n };
  }
};