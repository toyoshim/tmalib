Polymer('majvj-suite', {
  ready: function () {
    var _majvj = this.$.majvj;
    var _core = _majvj.core;
    var tma = _core.tma;
    var TmaScreen = _core.TmaScreen;
    var Tma2DScreen = _core.Tma2DScreen;
    var Tma3DScreen = _core.Tma3DScreen;
    var TmaModelPrimitives = _core.TmaModelPrimitives;
    var TmaParticles = _core.TmaParticles;
    var TmaSequencer = _core.TmaSequencer;
    var TmaMotionBvh = _core.TmaMotionBvh;
    var TmaModelPly = _core.TmaModelPly;
    var TmaModelPs2Ico = _core.TmaModelPs2Ico;
    var MajVj = _majvj.MajVj;
    var vec2 = _majvj.vec2;
    var vec3 = _majvj.vec3;
    var vec4 = _majvj.vec4;
    var mat2 = _majvj.mat2;
    var mat3 = _majvj.mat3;
    var mat4 = _majvj.mat4;
    var quat4 = _majvj.quat4;
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - wired -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.wired = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;
    this._rotate = 0.0;

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.wired._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.wired._fragmentShader));
    this._lines = this._screen.createBuffer(function () {
        var i = 0;
        var lines = new Array()
        for (var z = -900; z <= 900; z += 100) {
            for (var x = -900; x <= 900; x += 100) {
                lines[i + 0] = x;
                lines[i + 1] = -900;
                lines[i + 2] = z;
                lines[i + 3] = x;
                lines[i + 4] = 900;
                lines[i + 5] = z;
                i += 6;
            }
            for (var y = -900; y <= 900; y += 100) {
                lines[i + 0] = -900;
                lines[i + 1] = y;
                lines[i + 2] = z;
                lines[i + 3] = 900;
                lines[i + 4] = y;
                lines[i + 5] = z;
                i += 6;
            }
        }
        for (var x = -900; x <= 900; x += 100) {
            for (var y = -900; y <= 900; y += 100) {
                lines[i + 0] = x;
                lines[i + 1] = y;
                lines[i + 2] = -900;
                lines[i + 3] = x;
                lines[i + 4] = y;
                lines[i + 5] = 900;
                i += 6;
            }
        }
        return lines;
    } ());
    this._lines.items = 1944;
    this._pMatrix = mat4.create();
    this.onresize(this._aspect);
};

// Shader programs.
MajVj.frame.wired._vertexShader = null;
MajVj.frame.wired._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.wired.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'wired', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'wired', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.wired._vertexShader = shaders[0];
            MajVj.frame.wired._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('wired.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.wired.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(45, aspect, 0.1, 1000.0, this._pMatrix);
    mat4.translate(this._pMatrix, [ 0.0, 0.0, -250.0 ]);
    mat4.rotate(this._pMatrix, this._rotate, [ 0.1, 0.2, 0.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.wired.prototype.draw = function (delta) {
    var rotate = 0.002 * delta;
    if (this._controller && this._controller.slider)
        rotate = rotate * (0.5 + this._controller.slider * 1.5);
    this._rotate += rotate;
    mat4.rotate(this._pMatrix, rotate, [ 0.1, 0.2, 0.0 ]);
    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    this._program.setAttributeArray(
            'aVertexPosition', this._lines, 0, 3, 0);
    this._program.drawArrays(Tma3DScreen.MODE_LINES, 0, this._lines.items);
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.wired.prototype.setController = function (controller) {
    this._controller = controller;
};
    this.majvj = _majvj;
    this.tma = tma;
    this.create = function (width, height, fullscreen, parent) {
      return new MajVj(width, height, fullscreen, parent);
    };

    var _loadedPlugin = {};
    this.loadPlugin = function (type, name) {
      return new Promise(function (resolve, reject) {
        if (!MajVj[type])
          return reject('unknown plugin type: ' + type);
        if (!MajVj[type][name])
          return reject('unknown plugin: ' + type + '/' + name);
        if (_loadedPlugin[type] && _loadedPlugin[type][name])
          return resolve(MajVj[type][name]);
        if (!_loadedPlugin[type])
          _loadedPlugin[type] = {};
        if (!MajVj[type][name].load) {
          _loadedPlugin[type][name] = MajVj[type][name];
          resolve(MajVj[type][name]);
        }
        MajVj[type][name].load().then(function () {
          _loadedPlugin[type][name] = MajVj[type][name];
          resolve(MajVj[type][name]);
        }, tma.ecb);
      });
    };
    this.loadAllPlugin = function (base) {
      if (base)
        tma.base = base;
      return Promise.all([
        this.loadPlugin('frame', 'wired')
      ]);
    };
    this.setBase = function (base) {
      tma.base = base;
    };
  }
});
