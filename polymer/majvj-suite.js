Polymer('majvj-suite', {
  width: 0,
  height: 0,
  type: 'frame',
  name: undefined,
  options: undefined,
  base: '',
  ready: function () {
    var _majvj = this.$.majvj;
    var _core = _majvj.core;
    var tma = _core.tma;
    var TmaScreen = _core.TmaScreen;
    var Tma2DScreen = _core.Tma2DScreen;
    var Tma3DScreen = _core.Tma3DScreen;
    var TmaModelPrimitives = _core.TmaModelPrimitives;
    var TmaParticle = _core.TmaParticle;
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
    MajVj.loadScript = function (type, name, src) {
      tma.log('all script should be preloaded to avoid name space pollution: ' +
              'ignore MajVj.loadScript(' + type + ', ' + name + ', ' + src +
              ');');
      return new Promise(function (resolve, reject) { resolve() });
    };
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.nicofarre = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre._fragmentShader));
    this._coords = this._screen.createBuffer([
            // A (right): (40, 760) - (1520, 1040) / (1920, 1080)
            40 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            // B (stage): (40, 120) - (880, 400) / (1920, 1080)
            40 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // C (left): (40, 440) - (1520, 720) / (1920, 1080)
            40 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // D (back): (920, 120) - (1760, 400) / (1920, 1080)
            920 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            920 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // E (stage right): (1560, 760) - (1720, 1040) / (1920, 1080)
            1560 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            1560 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            // F (stage left): (1560, 440) - (1720, 720) / (1920, 1080)
            1560 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            1560 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // G (ceiling): (1760, 870) - (1858, 1040) / (1920, 1080)
            1760 / 1920 * 2 - 1, 870 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1858 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1858 / 1920 * 2 - 1, 870 / 1080 * 2 - 1,
            // LEFT_STAGE_RIGHT - C
            40 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // LEFT_STAGE_RIGHT - B
            40 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // LEFT_STAGE_RIGHT - A
            40 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            // WHOLE WALLS - D
            920 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            920 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // WHOLE WALLS - C
            40 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // WHOLE WALLS - B
            40 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // WHOLE WALLS - A
            40 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 760 / 1080 * 2 - 1]);
    this._texCoods = this._screen.createBuffer([
            0, 0, 0, 1, 1, 1, 1, 0,  // A
            0, 0, 0, 1, 1, 1, 1, 0,  // B
            0, 0, 0, 1, 1, 1, 1, 0,  // C
            0, 0, 0, 1, 1, 1, 1, 0,  // D
            0, 0, 0, 1, 1, 1, 1, 0,  // E
            0, 0, 0, 1, 1, 1, 1, 0,  // F
            0, 0, 0, 1, 1, 1, 1, 0,  // G
            // LEFT_STAGE_RIGHT - C, B, A
            0, 0, 0, 1, 1480 / 3800, 1, 1480 / 3800, 0,
            1480 / 3800, 0, 1480 / 3800, 1, 2320 / 3800, 1, 2320 / 3800, 0,
            2320 / 3800, 0, 2320 / 3800, 1, 3800 / 3800, 1, 3800 / 3800, 0,
            // WHOLE WALLS - D, C, B, A
            4220 / 4640, 0, 4220 / 4640, 1, 5060 / 4640, 1, 5060 / 4640, 0,
            420 / 4640, 0, 420 / 4640, 1, 1900 / 4640, 1, 1900 / 4640, 0,
            1900 / 4640, 0, 1900 / 4640, 1, 2740 / 4640, 1, 2740 / 4640, 0,
            2740 / 4640, 0, 2740 / 4640, 1, 4220 / 4640, 1, 4220 / 4640, 0,
            ]);
    var size = [
            [1480, 280],  // A
            [840, 280],   // B
            [1480, 280],  // C
            [840, 280],   // D
            [160, 280],   // E
            [160, 280],   // F
            [98, 170],    // G
            // LEFT_STAGE_RIGHT - C, B, A
            [3800, 280], [], [],
            // WHOLE WALLS - D, (C, B, A)
            [4640, 280], [], [], []];
    this._led = options.led;
    this._mirror = options.mirror;
    if (this._mirror === undefined)
        this._mirror = MajVj.frame.nicofarre.MIRROR_OFF;
    var w = size[this._led[0]][0] * this._width / 1920;
    var h = size[this._led[0]][1] * this._height / 1080;
    this._fbo = this._screen.createFrameBuffer(w, h);
    this._frames = [];
    for (var i = 0; i < options.frames.length; ++i) {
        var frame = options.frames[i];
        var flags = {};
        if (typeof frame != 'string') {
            flags = frame.options || {};
            frame = frame.name;
        }
        flags.width = flags.width || w;
        flags.height = flags.height || h;
        flags.aspect = flags.aspect || w / h;
        this._frames[i] = options.mv.create('frame', frame, flags);
    }
};

// Const values to specify the showing LED screen.
MajVj.frame.nicofarre.LED_A = [0];
MajVj.frame.nicofarre.LED_B = [1];
MajVj.frame.nicofarre.LED_C = [2];
MajVj.frame.nicofarre.LED_D = [3];
MajVj.frame.nicofarre.LED_E = [4];
MajVj.frame.nicofarre.LED_F = [5];
MajVj.frame.nicofarre.LED_G = [6];
MajVj.frame.nicofarre.LED_WALL_RIGHT = [0];
MajVj.frame.nicofarre.LED_STAGE = [1];
MajVj.frame.nicofarre.LED_WALL_LEFT = [2];
MajVj.frame.nicofarre.LED_BACK = [3];
MajVj.frame.nicofarre.LED_FRONT_RIGHT = [4];
MajVj.frame.nicofarre.LED_FRONT_LEFT = [5];
MajVj.frame.nicofarre.LED_CEILING = [6];
MajVj.frame.nicofarre.LED_FRONT_BOTH = [4, 5];
MajVj.frame.nicofarre.LED_WALL_BOTH = [0, 2];
MajVj.frame.nicofarre.LED_STAGE_AND_BACK = [1, 3];
MajVj.frame.nicofarre.LED_LEFT_STAGE_RIGHT = [7, 8, 9];
MajVj.frame.nicofarre.LED_WHOLE_WALLS = [10, 11, 12, 13];

// Const values to specify mirroing mode.
MajVj.frame.nicofarre.MIRROR_OFF = -1;
MajVj.frame.nicofarre.MIRROR_ON_RIGHT = 0;
MajVj.frame.nicofarre.MIRROR_ON_LEFT = 1;

// Shader programs.
MajVj.frame.nicofarre._vertexShader = null;
MajVj.frame.nicofarre._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.nicofarre.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'nicofarre', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'nicofarre', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.nicofarre._vertexShader = shaders[0];
            MajVj.frame.nicofarre._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('nicofarre.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.nicofarre.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.nicofarre.prototype.draw = function (delta) {
    var fbo = this._fbo.bind();
    var i;
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(true, this._screen.gl.ONE, this._screen.gl.ONE);
    this._screen.fillColor(0.0, 0.0, 0.0, 1.0);
    for (i = 0; i < this._frames.length; ++i)
        this._frames[i].draw(delta);
    this._screen.popAlphaMode();
    fbo.bind();
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setAttributeArray('aTexCoord', this._texCoods, 0, 2, 0);
    this._program.setTexture('uTexture', this._fbo.texture);
    for (i = 0; i < this._led.length; ++i) {
        var offset = this._led[i] * 4;
        var mirror = (i == this._mirror) ? 1 : 0;
        this._program.setUniformVector('uMirror', [mirror]);
        this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, offset, 4);
    }
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.nicofarre.prototype.setController = function (controller) {
    this._controller = controller;
};

/**
 * Gets a frame plugin internally created
 * @return a frame plugin object
 */
MajVj.frame.nicofarre.prototype.getFrame = function (i) {
    return this._frames[i];
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - crlogo -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.crlogo = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.crlogo._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.crlogo._fragmentShader));
    this._pMatrix = mat4.create();
    this._mvMatrix = mat4.create();
    this._rotate = 0.0;

    var logo = MajVj.frame.crlogo._logos[0];
    this._vertices = this._screen.createBuffer(logo.vertices);
    this._vertices.items = logo.items;
    this._offsets = this._screen.createBuffer(logo.offsets);
    this._colors = this._screen.createBuffer(logo.colors);
    this._ps = new MajVj.frame.crlogo.ps(this, 0);

    this.onresize(this._aspect);
    mat4.identity(this._mvMatrix);
};

/**
 * Creates logo data
 * @param path resource file relative path from the plugin directory
 */
MajVj.frame.crlogo._createLogo = function (path) {
    return new Promise(function (resolve, reject) {
        MajVj.loadImage('frame', 'crlogo', path).then(function (image) {
            tma.log('generating ' + image.width + 'x' + image.height +
                    ' particles from ' + path);
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            var context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, image.width, image.height);

            var bitmap = context.getImageData(
                    0, 0, image.width, image.height).data;
            var getPixel = function (x, y) {
                var ix = x|0;
                var iy = y|0;
                if (ix < 0 || iy < 0 ||
                        ix >= canvas.width || iy >= canvas.height)
                    return [ 0.0, 0.0, 0.0, 0.0 ];
                var index = iy * image.width + ix;
                var base = index * 4;
                return [bitmap[base + 0] / 255,
                        bitmap[base + 1] / 255,
                        bitmap[base + 2] / 255,
                        bitmap[base + 3] / 255];
            };

            var size = Math.max(image.width, image.height);
            var offset_x = (image.width - size) / 2;
            var offset_y = (image.height - size) / 2;
            var resolution = 48;
            var zoom = 4;
            var step = size / resolution;

            var y = offset_y;
            var data = [];
            for (var index_y = 0; index_y < resolution; ++index_y) {
                var x = offset_x;
                for (var index_x = 0; index_x < resolution; ++index_x) {
                    var c = getPixel(x, y);
                    x += step;
                    var px = index_x - resolution / 2 - 0.5;
                    var py = resolution / 2 - index_y - 0.5;
                    px *= zoom;
                    py *= zoom;
                    if ((c[0] > 0.7 && c[1] > 0.7 && c[2] > 0.7) ||
                            (c[0] < 0.3 && c[1] < 0.3 && c[2] < 0.3) ||
                            c[3] < 0.3) {
                        data.push([px, py, 1.0, 1.0, 1.0, 0.0]);
                    } else {
                        data.push([px, py, c[0], c[1], c[2], c[3]]);
                    }
                }
                y += step;
            }
            var length = data.length;
            var vertices = MajVj.frame.crlogo._createVertices(data);
            var items = MajVj.frame.crlogo._resolution * 3 * length;
            var offsets = MajVj.frame.crlogo._createOffsets(data);
            var colors = MajVj.frame.crlogo._createColors(data);
            resolve({
                raw: data,
                vertices: vertices,
                items: items,
                offsets: offsets,
                colors: colors
            });
        }, function (error) { reject(error); });
    });
};

/**
 * Creates vertices data
 * @param data created particle data.
 * @return vertices data
 */
MajVj.frame.crlogo._createVertices = function (data) {
    var circleLength = MajVj.frame.crlogo._circle.length;
    var length = circleLength * data.length;
    var vertices = new Array(length);
    for (var i = 0; i < length; i += circleLength) {
        for (var j = 0; j < circleLength; ++j)
            vertices[i + j] = MajVj.frame.crlogo._circle[j];
    }
    return vertices;
};

/**
 * Creates offsets data
 * @param data created particle data.
 * @return offsets data
 */
MajVj.frame.crlogo._createOffsets = function (data) {
    var points = MajVj.frame.crlogo._resolution * 3;
    var length = data.length * 3 * points;
    var offsets = new Array(length);
    for (var i = 0; i < data.length; i++) {
        var point = data[i];
        var base = i * 3 * points;
        for (var j = 0; j < 3 * points; j += 3) {
            offsets[base + j + 0] = point[0];
            offsets[base + j + 1] = point[1];
            offsets[base + j + 2] = 0.0;
        }
    }
    return offsets;
};

/**
 * Creates colors data
 * @param data created particle data.
 * @return colors data
 */
MajVj.frame.crlogo._createColors = function (data) {
    var points = MajVj.frame.crlogo._resolution * 3;
    var length = data.length * 4 * points;
    var colors = new Array(length);
    for (var i = 0; i < data.length; i++) {
        var point = data[i];
        var base = i * 4 * points;
        for (var j = 0; j < 4 * points; j += 4) {
            colors[base + j + 0] = point[2];
            colors[base + j + 1] = point[3];
            colors[base + j + 2] = point[4];
            colors[base + j + 3] = point[5];
        }
    }
    return colors;
};


// Shader programs.
MajVj.frame.crlogo._vertexShader = null;
MajVj.frame.crlogo._fragmentShader = null;

// Logo data.
MajVj.frame.crlogo._logos = [];

// Circle resolution.
MajVj.frame.crlogo._resolution = 4;

// Circle vertices.
MajVj.frame.crlogo._circle = (function () {
    var circle = [];
    var resolution = MajVj.frame.crlogo._resolution;
    for (var i = 0; i < resolution; ++i) {
        circle = circle.concat([0.0, 0.0, 0.0]);
        var w = 2.0 * Math.PI * i / resolution;
        circle = circle.concat([ Math.cos(w), Math.sin(w), 0.0 ]);
        w = 2.0 * Math.PI * (i + 1) / resolution;
        circle = circle.concat([ Math.cos(w), Math.sin(w), 0.0 ]);
    }
    return circle;
})();

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.crlogo.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'crlogo', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'crlogo', 'shaders.html', 'fragment'),
            MajVj.frame.crlogo._createLogo('logo0.jpg'),
            MajVj.frame.crlogo._createLogo('logo1.jpg')
            // Add other logos here.
        ]).then(function (results) {
            MajVj.frame.crlogo._vertexShader = results[0];
            MajVj.frame.crlogo._fragmentShader = results[1];
            MajVj.frame.crlogo._logos[0] = results[2];
            MajVj.frame.crlogo._logos[1] = results[3];
            // Store other logo data here.
            resolve();
        }, function (error) { reject(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.crlogo.prototype.onresize = function (aspect) {
    mat4.perspective(45, aspect, 0.1, 1000.0, this._pMatrix);
    mat4.translate(this._pMatrix, [ 0.0, 0.0, -250.0 ]);
    mat4.rotate(this._pMatrix, this._rotate, [ 0.1, 0.2, 0.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.crlogo.prototype.draw = function (delta) {
    this._program.setUniformMatrix('uMVMatrix', this._mvMatrix);
    var rotate = 0.002 * delta;
    if (this._controller && this._controller.slider)
        rotate = rotate * (0.5 + this._controller.slider * 1.5);
    this._rotate += rotate;
    mat4.rotate(this._pMatrix, rotate, [ 0.1, 0.2, 0.0 ]);

    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    this._program.setAttributeArray(
            'aVertexPosition', this._vertices, 0, 3, 0);
    this._program.setAttributeArray('aVertexOffset', this._offsets, 0, 3, 0);
    this._program.setAttributeArray('aColor', this._colors, 0, 4, 0);
    this._program.drawArrays(
            Tma3DScreen.MODE_TRIANGLES, 0, this._vertices.items);
    this._ps.update(delta);
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.crlogo.prototype.setController = function (controller) {
    if (this._controller) {
        this._controller.onsolo = null;
        this._controller.onmute = null;
        this._controller.onrecord = null;
    }
    this._controller = controller;
    if (!controller)
        return;
    this._controller.onsolo = function (on) {
        if (!on)
            return;
        this.crash();
    }.bind(this._ps);
    this._controller.onmute = function (on) {
        if (!on)
            return;
        this._mode = 1;
    }.bind(this._ps);
};

MajVj.frame.crlogo.ps = function(parent, index) {
    // Function aliases for speed optimization.
    this._random = Math.random;
    this._PI = Math.PI;
    this._sin = Math.sin;
    this._cos = Math.cos;
    this._pow = Math.pow;

    this._parent = parent;
    this._index = index;
    this._data = MajVj.frame.crlogo._logos[index].raw;
    this._mode = 0;
    this._autoCount = 0;
    this._morph = false;
    this._morphSrc = null;
    this._morphDst = null;
    this._morphSpeed = 0.0;
    this._morphCount = 0.0;
    this._morphIndex = 0;
    this._length = this._data.length;
    this._x = new Float32Array(this._length);
    this._y = new Float32Array(this._length);
    this._z = new Float32Array(this._length);
    this._bx = new Float32Array(this._length);
    this._by = new Float32Array(this._length);
    this._bz = new Float32Array(this._length);
    this._vx = new Float32Array(this._length);
    this._vy = new Float32Array(this._length);
    this._vz = new Float32Array(this._length);
    this._gx = 0.0;
    this._gy = 0.0;
    this._gz = 0.0;
    this._rx = 0.0;
    this._ry = 0.0;
    for (var i = 0; i < this._length; ++i) {
        var p = this._data[i];
        this._x[i] = p[0];
        this._y[i] = p[1];
        this._z[i] = 0.0;
        this._bx[i] = p[0];
        this._by[i] = p[1];
        this._bz[i] = 0.0;
        this._vx[i] = 0.0;
        this._vy[i] = 0.0;
        this._vz[i] = 0.0;
    }
};

MajVj.frame.crlogo.ps.prototype.crash = function () {
    this._mode = 0;
    for (var i = 0; i < this._length; ++i) {
        this._vx[i] = this._random() * 100 - 50;
        this._vy[i] = this._random() * 100 - 50;
        this._vz[i] = this._random() * 100 - 50;
    }
};

MajVj.frame.crlogo.ps.prototype.pilot = function () {
    if (this._autoCount > 0) {
        this._autoCount--;
        return;
    }
    var timeout = Math.random() * 100;
    if (this._parent._controller && this._parent._controller.knob)
        timeout = timeout / (this._parent._controller.knob * 2.2 + 0.2);

    this._mode = Math.floor(Math.random() * 4);
    if (this._mode == 0)
        timeout *= 1.6;
    this._autoCount = Math.floor(timeout);
    if (this._mode == 2)
        this.crash();
    if (this._mode == 3)
        this.autoMorph(false);
};

MajVj.frame.crlogo.ps.prototype.autoMorph = function (force) {
    if (!force && Math.random() > 0.1) {
        this._mode = 0;
        return;
    }
    if (this._morph)
        return;
    var src = this._morphIndex;
    this._morphIndex++;
    if (this._morphIndex == MajVj.frame.crlogo._logos.length)
        this._morphIndex = 0;
    var dst = this._morphIndex;
    this.morph(MajVj.frame.crlogo._logos[src].colors,
            MajVj.frame.crlogo._logos[dst].colors, 0.3);
    this._mode = 0;
};

MajVj.frame.crlogo.ps.prototype.morph = function (src, dst, speed) {
    if (src.length != dst.length) {
        tma.log('image size is different');
        return;
    }
    this._morphSrc = src;
    this._morphDst = dst;
    this._morphCount = 0;
    this._morphSpeed = speed;
    this._morph = true;
};

MajVj.frame.crlogo.ps.prototype.update = function (delta) {
    this.pilot();
    if (this._morph) {
        this._morphCount += this._morphSpeed * delta;
        var ratio = this._morphCount / 1000;
        if (ratio >= 1.0) {
            ratio = 1.0;
            this._morph = false;
        }
        var colors = this._parent._colors.buffer();
        var sr = 1.0 - ratio;
        var dr = ratio;
        var length = this._morphSrc.length;
        for (var i = 0; i < length; ++i)
            colors[i] = this._morphSrc[i] * sr + this._morphDst[i] * dr;
        this._parent._colors.update();
    }

    var buffer = this._parent._offsets.buffer();
    var points = MajVj.frame.crlogo._resolution * 3;
    var i;
    this._rx += 0.0002 * delta;
    this._ry += 0.0004 * delta;
    var radx = 2.0 * this._PI * this._rx / 360;
    var rady = 2.0 * this._PI * this._ry / 360;
    this._gx = this._sin(radx) * this._sin(rady);
    this._gy = this._cos(radx);
    this._gz = -this._sin(radx) * this._cos(rady);
    if (this._mode == 0) {
        var t1 = this._pow(0.9, delta / 30);
        var t2 = 0.01 *  delta / 30;
        for (i = 0; i < this._length; ++i) {
            this._vx[i] *= t1;
            this._vy[i] *= t1;
            this._vz[i] *= t1;
            this._vx[i] += (this._bx[i] - this._x[i]) * t2;
            this._vy[i] += (this._by[i] - this._y[i]) * t2;
            this._vz[i] += (this._bz[i] - this._z[i]) * t2;
        }
    } else {
        var gx = this._gx * delta / 30;
        var gy = this._gy * delta / 30;
        var gz = this._gz * delta / 30;
        var range = 100.0;
        for (i = 0; i < this._length; ++i) {
            if (this._x[i] < -range || range < this._x[i])
                this._vx[i] *= -1.0;
            else
                this._vx[i] += gx;
            if (this._y[i] < -range || range < this._y[i])
                this._vy[i] *= -1.0;
            else
                this._vy[i] += gy;
            if (this._z[i] < -range || range < this._z[i])
                this._vz[i] *= -1.0;
            else
                this._vz[i] += gz;
        }
    }
    var dst = 0;
    var zoom = 1.0;
    if (window['player'] && player['average'])
        zoom = 1.0 + (player.average / 10.0);
    for (i = 0; i < this._length; ++i) {
        this._x[i] += this._vx[i];
        this._y[i] += this._vy[i];
        this._z[i] += this._vz[i];
        for (var point = 0; point < points; point++) {
            buffer[dst + 0] = this._x[i] * zoom;
            buffer[dst + 1] = this._y[i] * zoom;
            buffer[dst + 2] = this._z[i] * zoom;
            dst += 3;
        }
    }
    this._parent._offsets.update();
};
/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - specticle -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.specticle = function (options) {
    this._mv = options.mv;
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;
    this._color = options.color || [0.7, 0.2, 0.5, 1.0];
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.specticle._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.specticle._fragmentShader));
    this._matrix = mat4.identity();
    this.onresize(this._aspect);
    this._t = 0.0;
    this._n = 500;
    this._coords = this._screen.createBuffer(new Array(this._n * 3));
    this._dh = new Array(this._n);
    this._dv = new Array(this._n);
    this._r = new Array(this._n);
    this._sv = new Array(this._n);
    this._sh = new Array(this._n);
    var random = options.random || 1.0;
    for (var i = 0; i < this._n; ++i) {
        this._dh[i] = Math.random() * Math.PI * 2;
        this._dv[i] = Math.random() * Math.PI * 2;
        this._r[i] = Math.random() * random * 6 + (3 - random);
        this._sv[i] = Math.random() * 10 + 10;
        this._sh[i] = Math.random() * 20 + 20;
    }
};

// Shader programs.
MajVj.frame.specticle._vertexShader = null;
MajVj.frame.specticle._fragmentShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.specticle.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'specticle', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'specticle', 'shaders.html', 'fragment')
        ]).then(function (results) {
            MajVj.frame.specticle._vertexShader = results[0];
            MajVj.frame.specticle._fragmentShader = results[1];
            resolve();
        }, function (error) { tma.log(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.specticle.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(45, aspect, 0.1, 100.0, this._matrix);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.specticle.prototype.draw = function (delta) {
    this._t += delta;
    var t = this._t / 10000;
    var buffer = this._coords.buffer();
    var fft = this._controller && this._controller.sound &&
          this._controller.sound.fftDb && this._controller.sound.fftDb.length;
    var useLength = !fft || this._controller.sound.fftDb.length - 128;
    for (var i = 0; i < this._n; ++i) {
        var y = Math.sin(t * this._sv[i] + this._dv[i]) * 10;
        var r = 1.0;
        if (fft) {
            var n = 0 | (useLength * (y + 10) / 20);
            var d = 80.0 + this._controller.sound.fftDb[128 + n];
            if (d < 0)
                d = 0;
            r = d / 20;
        }
        buffer[i * 3 + 0] =
            Math.cos(t * this._sh[i] + this._dh[i]) * this._r[i] * r;
        buffer[i * 3 + 1] = y;
        buffer[i * 3 + 2] =
            Math.sin(t * this._sh[i] + this._dh[i]) * this._r[i] * r - 40;
    }
    this._coords.update();
    this._screen.setAlphaMode(true, this._screen.gl.ONE, this._screen.gl.ONE);
    this._program.setAttributeArray('aCoord', this._coords, 0, 3, 0);
    this._program.setUniformMatrix('uMatrix', this._matrix);
    this._program.setUniformVector('uColor', this._color);
    this._program.drawArrays(Tma3DScreen.MODE_POINTS, 0, this._n);
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.specticle.prototype.setController = function (controller) {
    this._controller = controller;
};
/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - filter -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.filter = function (options) {
    this._mv = options.mv;
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;
    this._color = options.color || [0.0, 0.0, 0.0, 1.0];
    this._zoom = (typeof options.zoom != 'undefined') ? options.zoom : 1.0;
    this._fade = (typeof options.fade != 'undefined') ? options.fade : 1.0;
    this._offset = options.offset || [0.0, 0.0];
    this._texture = null;
    this._colorProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.filter._vColorShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.filter._fColorShader));
    this._textureProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.filter._vTextureShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.filter._fTextureShader));
    this._coords = null;
    this._texCoords = this._screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0]);
    this._blend_src = this._screen.gl.ZERO;
    this._blend_dst = this._screen.gl.ZERO;
    this._setFilterType(options.filter);
    if (options.texture)
        this.setTexture(options.texture);
    else
        this._coords = this._screen.createBuffer([-1, -1, -1, 1, 1, 1, 1, -1]);
};

// Filter type.
MajVj.frame.filter.REVERSE = 0;     // 1 - DST
MajVj.frame.filter.SRC = 1;         // SRC
MajVj.frame.filter.ALPHA = 2;       // SRC * a + DST * (1 - a)
MajVj.frame.filter.ADD = 3;         // SRC + DST
MajVj.frame.filter.MUL = 4;         // SRC * DST

// Shader programs.
MajVj.frame.filter._vColorShader = null;
MajVj.frame.filter._fColorShader = null;
MajVj.frame.filter._vTextureShader = null;
MajVj.frame.filter._fTextureShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.filter.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'filter', 'shaders.html', 'vColor'),
            MajVj.loadShader('frame', 'filter', 'shaders.html', 'fColor'),
            MajVj.loadShader('frame', 'filter', 'shaders.html', 'vTexture'),
            MajVj.loadShader('frame', 'filter', 'shaders.html', 'fTexture')
        ]).then(function (results) {
            MajVj.frame.filter._vColorShader = results[0];
            MajVj.frame.filter._fColorShader = results[1];
            MajVj.frame.filter._vTextureShader = results[2];
            MajVj.frame.filter._fTextureShader = results[3];
            resolve();
        }, function (error) { tma.log(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.filter.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.filter.prototype.draw = function (delta) {
    this._screen.setAlphaMode(true, this._blend_src, this._blend_dst);
    if (this._texture) {
        this._textureProgram.setAttributeArray('aCoord', this._coords, 0, 2, 0);
        this._textureProgram.setAttributeArray(
                'aTexCoord', this._texCoords, 0, 2, 0);
        this._textureProgram.setTexture('uTexture', this._texture);
        this._textureProgram.setUniformVector('uFade', [this._fade]);
        this._textureProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    } else if (this._coords) {
        this._colorProgram.setAttributeArray('aCoord', this._coords, 0, 2, 0);
        this._colorProgram.setUniformVector('uColor', this._color);
        this._colorProgram.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    }
};

/**
 * Sets a controller.
 */
MajVj.frame.filter.prototype.setController = function (controller) {
    this._controller = controller;
};

/**
 * Sets a color.
 * @param color a color in [r, g, b, a]
 */
MajVj.frame.filter.prototype.setColor = function (color) {
    this._color = color;
};

/**
 * Sets a texture.
 * @param texture a URL to point a image data for textrue, or Image object
 */
MajVj.frame.filter.prototype.setTexture = function (texture) {
    if (typeof texture === 'object' &&
        texture.constructor.name === 'HTMLImageElement') {
        this._texture = this._screen.createTexture(
              texture, true, Tma3DScreen.FILTER_LINEAR);
        this._resetCoords();
    } else {
        MajVj.loadImageFrom(texture).then(function (image) {
            this._texture = this._screen.createTexture(
                    image, true, Tma3DScreen.FILTER_LINEAR);
            this._resetCoords();
        }.bind(this), function (e) { tma.log(e); });
    }
};

/**
 * Sets texture zoom ratio.
 * @param zoom zoom ratio
 */
MajVj.frame.filter.prototype.setZoom = function (zoom) {
    this._zoom = zoom;
    this._resetCoords();
};

/**
 * Sets texture offset.
 * @param offset texture offset ratio
 */
MajVj.frame.filter.prototype.setOffset = function (offset) {
    this._offset = offset;
    this._resetCoords();
};

/**
 * Sets fade level.
 * @param fade fade level
 * offset texture offset ratio
 */
MajVj.frame.filter.prototype.setFade = function (fade) {
    this._fade = fade;
};

/**
 * Resets coords.
 */
MajVj.frame.filter.prototype._resetCoords = function () {
    if (!this._texture)
        return;
    var aspect = this._texture.width / this._texture.height;
    var w = this._zoom;
    var h = this._zoom;
    if (this._aspect > aspect)
        w *= aspect / this._aspect;
    else
        h *= this._aspect / aspect;
    var x = this._offset[0] * this._zoom;
    var y = this._offset[1] * this._zoom;
    var coords = [-w + x, -h + y, -w + x, h + y, w + x, h + y, w + x, -h + y];
    if (!this._coords) {
        this._coords = this._screen.createBuffer(coords);
    } else {
        var buffer = this._coords.buffer();
        for (var i = 0; i < coords.length; ++i)
            buffer[i] = coords[i];
        this._coords.update();
    }
};

/**
 * Sets a filter type.
 */
MajVj.frame.filter.prototype._setFilterType = function (type) {
    if (!type)
        type = MajVj.frame.filter.REVERSE;
    var gl = this._screen.gl;
    switch (type) {
        case MajVj.frame.filter.REVERSE:
            this._blend_src = gl.ZERO;
            this._blend_dst = gl.ONE_MINUS_DST_COLOR;
            break;
        case MajVj.frame.filter.SRC:
            this._blend_src = gl.ONE;
            this._blend_dst = gl.ZERO;
            break;
        case MajVj.frame.filter.ALPHA:
            this._blend_src = gl.SRC_ALPHA;
            this._blend_dst = gl.ONE_MINUS_SRC_ALPHA;
            break;
        case MajVj.frame.filter.ADD:
            this._blend_src = gl.ONE;
            this._blend_dst = gl.ONE;
            break;
        case MajVj.frame.filter.MUL:
            this._blend_src = gl.DST_COLOR;
            this._blend_dst = gl.ZERO;
            break;
    }
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - at -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.at = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;

    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.at._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.at._fragmentShader));
    this._sphere = TmaModelPrimitives.createSphere(
            MajVj.frame.at.resolution, TmaModelPrimitives.SPHERE_METHOD_EVEN);
    this._vertices = this._screen.createBuffer(this._sphere.getVertices());
    this._indices = this._screen.createElementBuffer(this._sphere.getIndices());
    this._program.setAttributeArray('aVertexPosition', this._vertices, 0, 3, 0);
    this._pMatrix = mat4.create();
    this._mvMatrix = mat4.create();
    this._rotate = [0, 0, 0];
    this._translate = [0, 0, 0];
    mat4.identity(this._mvMatrix);

    var crlogo = (function() {
        var data = [
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0 ],  // oo********oo
            [ 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0 ],  // oo********oo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]   // oooooooooooo
        ];
        var logo = [];
        var ny = data.length;
        var nx = data[0].length;
        for (var y = 0; y < ny; ++y) {
            for (var x = 0; x < nx; ++x) {
                var color = (data[y][x] == 1) ? [0.75, 0.01, 0.00]
                                              : [0.10, 0.10, 0.25];
                logo.push([x - (nx - 1) / 2,
                           y - (ny - 1) / 2,
                           color[0] * 512,
                           color[1] * 512,
                           color[2] * 512]);
            }
        }
        return logo;
    })();
    var ablogo = (function() {
        var data = [
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],  // oo********oo
            [ 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 ],  // oo********oo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]   // oooooooooooo
        ];
        var logo = [];
        var ny = data.length;
        var nx = data[0].length;
        for (var y = 0; y < ny; ++y) {
            for (var x = 0; x < nx; ++x) {
                var color = (data[y][x] == 1) ? [0.75, 0.01, 0.00]
                                              : [0.10, 0.10, 0.25];
                logo.push([x - (nx - 1) / 2,
                           y - (ny - 1) / 2,
                           color[0] * 512,
                           color[1] * 512,
                           color[2] * 512]);
            }
        }
        return logo;
    })();
    this._logo = [];
    this._state = 0;
    for (var i = 0; i < crlogo.length; ++i) {
        this._logo[i] = {
            at: this,
            p: [ablogo[i][0] * 2, ablogo[i][1] * -2, 0, 0],
            h: [ablogo[i][0] * 2, ablogo[i][1] * -2, 0, 0],
            i: [ablogo[i][0] * 2,
                    -7 * Math.sin(ablogo[i][1] / 12 * Math.PI * 2),
                    -7 * Math.cos(ablogo[i][1] / 12 * Math.PI * 2), 0],
            v: [0, 0, 0],
            a: [0, 0, 0],
            cr: [crlogo[i][2] / 512, crlogo[i][3] / 512, crlogo[i][4] / 512],
            ab: [ablogo[i][2] / 512, ablogo[i][3] / 512, ablogo[i][4] / 512],
            c: [crlogo[i][2] / 512, crlogo[i][3] / 512, crlogo[i][4] / 512],
            m: 0,
            flip: false,
            update: function (delta) {
                if (this.at._state == 0) {
                    this.a = [(Math.random() - 0.5) * 0.5,
                              (Math.random() - 0.5) * 0.5,
                              (Math.random() - 0.5) * 0.5];
                    this.v = [this.a[0] * -30, this.a[1] * -30, this.a[2] * -30];
                    if (this.flip) {
                        this.c[0] = this.ab[0];
                        this.c[1] = this.ab[1];
                        this.c[2] = this.ab[2];
                    } else {
                        this.c[0] = this.cr[0];
                        this.c[1] = this.cr[1];
                        this.c[2] = this.cr[2];
                    }
                    this.flip = !this.flip;
                } else if (this.at._state == 1) {
                    var shrink = (this.p[0] - this.h[0]) * this.v[0] < 0;
                    this.a = [this.a[0] * 0.98, this.a[1] * 0.98, this.a[2] * 0.98];
                    this.v[0] += this.a[0];
                    this.v[1] += this.a[1];
                    this.v[2] += this.a[2];
                    this.p[0] += this.v[0];
                    this.p[1] += this.v[1];
                    this.p[2] += this.v[2];
                    if (shrink && (this.p[0] - this.h[0]) * this.v[0] > 0) {
                        this.a = [0, 0, 0];
                        this.v = [0, 0, 0];
                        this.p[0] = this.h[0];
                        this.p[1] = this.h[1];
                        this.p[2] = this.h[2];
                    }
                } else if (this.at._state == 5) {
                    this.m += 0.001 * delta;
                    if (this.m >= 1)
                        this.m = 1;
                    this.p[0] = (1 - this.m) * this.h[0] + this.m * this.i[0];
                    this.p[1] = (1 - this.m) * this.h[1] + this.m * this.i[1];
                    this.p[2] = (1 - this.m) * this.h[2] + this.m * this.i[2];
                } else if (this.at._state == 7) {
                    this.m -= 0.001 * delta;
                    if (this.m <= 0)
                        this.m = 0;
                    this.p[0] = (1 - this.m) * this.h[0] + this.m * this.i[0];
                    this.p[1] = (1 - this.m) * this.h[1] + this.m * this.i[1];
                    this.p[2] = (1 - this.m) * this.h[2] + this.m * this.i[2];
                }
            }
        };
    }
    this.onresize(this._aspect);
};

MajVj.frame.at.resolution = 3;
// Shader programs.
MajVj.frame.at._vertexShader = null;
MajVj.frame.at._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.at.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'at', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'at', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.at._vertexShader = shaders[0];
            MajVj.frame.at._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('at.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.at.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(45, aspect, 0.1, 100.0, this._pMatrix);
    mat4.translate(this._pMatrix, [ 0.0, 0.0, -70.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.at.prototype.draw = function (delta) {
    this._program.setAttributeArray('aVertexPosition', this._vertices, 0, 3, 0);
    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    var nMatrix = mat3.create();
    var oMatrix = mat4.create(this._mvMatrix);
    mat4.translate(oMatrix, this._translate);
    mat4.rotate(oMatrix, this._rotate[0], [1, 0, 0]);
    mat4.rotate(oMatrix, this._rotate[1], [0, 1, 0]);
    mat4.rotate(oMatrix, this._rotate[2], [0, 0, 1]);
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(false);
    for (var i = 0; i < this._logo.length; ++i) {
        this._logo[i].update(delta);
        var mvMatrix = mat4.create(oMatrix);
        mat4.translate(mvMatrix, this._logo[i].p);
        this._program.setUniformMatrix('uMVMatrix', mvMatrix);
        var nMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, nMatrix);
        mat3.transpose(nMatrix);
        this._program.setUniformMatrix('uNMatrix', nMatrix);
        this._program.setUniformVector('uColor', this._logo[i].c);
        this._program.drawElements(Tma3DScreen.MODE_TRIANGLES,
                                   this._indices,
                                   0,
                                   this._sphere.items());
    }
    this._screen.popAlphaMode();
    if (this._state == 0) {
        this._rotate = [0, 0, 0];
        this._translate = [0, 0, 0];
        this._state = 1;
    } else if (this._state == 1) {
        for (i = 0; i < this._logo.length; ++i) {
            if (this._logo[i].p[0] != this._logo[i].h[0] ||
                    this._logo[i].p[1] != this._logo[i].h[1] ||
                    this._logo[i].p[2] != this._logo[i].h[2])
                return;
        }
        this._state = 2;
    } else if (this._state == 2) {
        this._rotate[0] += 0.004 * delta;
        this._translate[2] += 0.016 * delta;
        if (this._rotate[0] >= Math.PI * 3.5) {
            this._rotate[0] = Math.PI * 3.5;
            this._translate[2] = this._rotate[0] * 4;
            this._state = 3;
        }
        this._translate[1] = Math.sin(this._rotate[0]) * 4;
    } else if (this._state == 3) {
        this._rotate[2] += 0.0015 * delta;
        this._translate[1] -= 0.0015 * delta;
        this._translate[2] += 0.0015 * delta;
        if (this._rotate[2] >= Math.PI) {
            this._rotate[2] = Math.PI;
            this._translate[1] = Math.sin(Math.PI * 3.5) * 4 -this._rotate[2];
            this._translate[2] = Math.PI * 15;
            this._state = 4;
        }
    } else if (this._state == 4) {
        this._rotate[2] += 0.0015 * delta;
        this._translate[1] += 0.0015 * delta;
        this._translate[2] -= 0.0060 * delta;
        if (this._rotate[2] >= Math.PI * 2) {
            this._rotate[2] = Math.PI * 2;
            this._translate[1] = Math.sin(Math.PI * 3.5) * 4;
            this._translate[2] = Math.PI * 11;
            this._state = 5;
        }
    } else if (this._state == 5) {
        this._rotate[0] += 0.0015 * delta;
        this._rotate[2] += 0.0015 * delta;
        this._translate[1] += 0.0015 * delta;
        this._translate[2] -= 0.0060 * delta;
        if (this._rotate[0] >= Math.PI * 4) {
            this._rotate[0] = Math.PI * 4;
            this._rotate[2] = Math.PI * 2.5;
            this._translate[1] = Math.sin(Math.PI * 3.5) * 4 + Math.PI * 0.5;
            this._translate[2] = Math.PI * 9;
            this._state = 6;
        }
    } else if (this._state == 6) {
        this._rotate[0] += 0.0015 * delta;
        this._rotate[2] += 0.0015 * delta;
        if (this._rotate[2] >= Math.PI * 3.5) {
            this._rotate[0] = Math.PI * 5;
            this._state = 7;
        }
    } else if (this._state == 7) {
        this._rotate[0] += 0.0030 * delta;
        this._rotate[2] += 0.0015 * delta;
        this._translate[1] += 0.001 * delta;
        this._translate[2] -= 0.001 * delta;
        if (this._translate[1] >= 0)
            this._translate[1] = 0;
        if (this._translate[2] <= 0)
            this._translate[2] = 0;
        if (this._rotate[2] >= Math.PI * 5.0) {
            this._rotate[2] = Math.PI * 5.0;
            this._state = 0;
        }
    }
};

/**
 * Sets a controller.
 * @param controller a controller object
 */
MajVj.frame.at.prototype.setController = function (controller) {
    this._controller = controller;
};
/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.nicofarre3d = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this._controller = options.controller;
    this._clearCallback = options.clear;
    this._drawCallback = options.draw;
    this._modules = [];
    this._api = {
      clear: this._clear.bind(this),
      color: [1.0, 1.0, 1.0, 1.0],
      createFont: this._createFont.bind(this),
      createTexture: this._screen.createTexture,
      delta: 0.0,
      drawBox: this._drawBox.bind(this),
      drawCharacter: this._drawCharacter.bind(this),
      drawCube: this._drawCube.bind(this),
      drawLine: this._drawLine.bind(this),
      drawPrimitive: this._drawPrimitive.bind(this),
      fill: this._fill.bind(this),
      gl: this._screen.gl,
      screen: this._screen,
      setAlphaMode: this._screen.setAlphaMode,
    };

    this._screenProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre3d._vScreenShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre3d._fScreenShader));
    this._drawProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre3d._vDrawShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre3d._fDrawShader));
    this._textureProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre3d._vTextureShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre3d._fTextureShader));
    this._pointProgram = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.nicofarre3d._vPointShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.nicofarre3d._fPointShader));
    this._coords = this._screen.createBuffer([
            // A (right): (40, 760) - (1520, 1040) / (1920, 1080)
            40 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            // B (stage): (40, 120) - (880, 400) / (1920, 1080)
            40 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            880 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // C (left): (40, 440) - (1520, 720) / (1920, 1080)
            40 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            40 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 720 / 1080 * 2 - 1,
            1520 / 1920 * 2 - 1, 440 / 1080 * 2 - 1,
            // D (back): (920, 120) - (1760, 400) / (1920, 1080)
            920 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            920 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 400 / 1080 * 2 - 1,
            1760 / 1920 * 2 - 1, 120 / 1080 * 2 - 1,
            // E (stage right): (1560, 760) - (1720, 1040) / (1920, 1080)
            1560 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            1560 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 1040 / 1080 * 2 - 1,
            1720 / 1920 * 2 - 1, 760 / 1080 * 2 - 1,
            // F (stage lef