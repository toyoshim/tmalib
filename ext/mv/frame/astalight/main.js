/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - astalight -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.astalight = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = { keymap: [], volume: 0.0 };
    for (var i = 0; i < 128; ++i)
        this.properties.keymap[i] = 0.0;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.astalight._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.astalight._fragmentShader));
    this._pMatrix = mat4.create();
    this._mvMatrix = mat4.create();
    this._rotate = 0.0;
    this._alpha = 1.0;
    var zoom = 4;
    var brightness = 1.0;
    if (options.brightness)
        brightness = options.brightness;
    if (options.zoom)
        zoom = options.zoom;
    if (options.image) {
        this._texture = this._screen.createTexture(
                this._screen.convertImage(options.image),
                true,
                Tma3DScreen.FILTER_LINEAR);
    } else {
        this._texture = this._screen.createStringTexture(
                String.fromCharCode(65290), {
                size: 300,
                name: 'Serif',
                foreground: 'rgba(255, 100, 200, 255)',
                background: 'rgba(0, 0, 0, 255)' }, {
                width: 256,
                height: 256 });
    }
    var data = MajVj.frame.astalight._createData(this._texture, zoom, brightness);
    this._vertices = this._screen.createBuffer(data.vertices);
    this._vertices.items = data.items;
    this._offsets = this._screen.createBuffer(data.offsets);
    this._colors = this._screen.createBuffer(data.colors);
    this._ps = new MajVj.frame.astalight.ps(this);

    this.onresize(this._aspect);
    mat4.identity(this._mvMatrix);
};

/**
 * Creates data
 * @param texture source texture object
 * @param zoom texture zoom
 */
MajVj.frame.astalight._createData = function (texture, zoom, brightness) {
    var bitmap = texture.image.data;
    var size = texture.image.width;
    var resolution = 64;
    var step = size / resolution;
    var d = resolution / 2;

    var data = [];
    for (var y = 0; y < resolution; ++y) {
        for (var x = 0; x < resolution; ++x) {
            var offset = (y * size + x) * step * 4;
            var r = bitmap[offset + 0] / 255 * brightness;
            var g = bitmap[offset + 1] / 255 * brightness;
            var b = bitmap[offset + 2] / 255 * brightness;
            if (r == 0 && g == 0 && b == 0)
                continue;
            data.push([(x - d) * zoom, (d - y) * zoom, r, g, b]);
        }
    }
    var length = data.length;
    var vertices = MajVj.frame.astalight._createVertices(length);
    var items = vertices.length / 3;
    var offsets = MajVj.frame.astalight._createOffsets(data);
    var colors = MajVj.frame.astalight._createColors(data);
    return {
        raw: data,
        vertices: vertices,
        items: items,
        offsets: offsets,
        colors: colors
    };
};

/**
 * Creates vertices data
 * @param squares number of squares
 * @return vertices data
 */
MajVj.frame.astalight._createVertices = function (squares) {
    var points = 6;
    var length = points * 3;
    var vertices = new Array(length * squares);
    var size = 2.0;
    for (var i = 0; i < squares; i++) {
        var offset = i * length;
        vertices[offset +  0] = -size;
        vertices[offset +  1] = -size;
        vertices[offset +  2] =  0.0;
        vertices[offset +  3] = -size;
        vertices[offset +  4] =  size;
        vertices[offset +  5] =  0.0;
        vertices[offset +  6] =  size;
        vertices[offset +  7] =  size;
        vertices[offset +  8] =  0.0;
        vertices[offset +  9] =  size;
        vertices[offset + 10] =  size;
        vertices[offset + 11] =  0.0;
        vertices[offset + 12] =  size;
        vertices[offset + 13] = -size;
        vertices[offset + 14] =  0.0;
        vertices[offset + 15] = -size;
        vertices[offset + 16] = -size;
        vertices[offset + 17] =  0.0;
    }
    return vertices;
};

/**
 * Creates offsets data
 * @param data created particle data.
 * @return offsets data
 */
MajVj.frame.astalight._createOffsets = function (data) {
    var points = 6;
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
MajVj.frame.astalight._createColors = function (data) {
    var points = 6;
    var length = data.length * 4 * points;
    var colors = new Array(length);
    for (var i = 0; i < data.length; i++) {
        var point = data[i];
        var base = i * 4 * points;
        for (var j = 0; j < 4 * points; j += 4) {
            colors[base + j + 0] = point[2];
            colors[base + j + 1] = point[3];
            colors[base + j + 2] = point[4];
            colors[base + j + 3] = 1.0;
        }
    }
    return colors;
};

// Shader programs.
MajVj.frame.astalight._vertexShader = null;
MajVj.frame.astalight._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.astalight.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'astalight', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'astalight', 'shaders.html', 'fragment'),
        ]).then(function (results) {
            MajVj.frame.astalight._vertexShader = results[0];
            MajVj.frame.astalight._fragmentShader = results[1];
            resolve();
        }, function (error) { reject(error); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.astalight.prototype.onresize = function (aspect) {
    mat4.perspective(this._pMatrix, Math.PI / 4, aspect, 0.1, 1000.0);
    mat4.translate(this._pMatrix, this._pMatrix, [ 0.0, 0.0, -200.0 ]);
    mat4.rotate(this._pMatrix, this._pMatrix, this._rotate, [ 0.1, 0.2, 0.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.astalight.prototype.draw = function (delta) {
    this._ps.update(delta);
    this._program.setUniformMatrix('uMVMatrix', this._mvMatrix);
    var rotate = 0.002 * delta;
    this._rotate += rotate;
    mat4.rotate(this._pMatrix, this._pMatrix, rotate, [ 0.1, 0.2, 0.0 ]);
    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    this._program.setUniformVector('uAlpha', [this._alpha]);
    this._program.setTexture('uTexture', this._texture);
    this._program.setAttributeArray(
            'aVertexPosition', this._vertices, 0, 3, 0);
    this._program.setAttributeArray('aVertexOffset', this._offsets, 0, 3, 0);
    this._program.setAttributeArray('aColor', this._colors, 0, 4, 0);
    this._program.drawArrays(
            Tma3DScreen.MODE_TRIANGLES, 0, this._vertices.items);
};

MajVj.frame.astalight.ps = function(parent) {
    // Function aliases for speed optimization.
    this._random = Math.random;
    this._PI = Math.PI;
    this._abs = Math.abs;
    this._sin = Math.sin;
    this._cos = Math.cos;
    this._pow = Math.pow;

    this._onCrash = false;

    this._parent = parent;
    this._mode = 0;
    var buffer = this._parent._offsets.buffer();
    this._length = buffer.length / 18;
    this._x = new Float32Array(this._length);
    this._y = new Float32Array(this._length);
    this._z = new Float32Array(this._length);
    this._bx = new Float32Array(this._length);
    this._by = new Float32Array(this._length);
    this._bz = new Float32Array(this._length);
    this._vx = new Float32Array(this._length);
    this._vy = new Float32Array(this._length);
    this._vz = new Float32Array(this._length);
    this._az = new Float32Array(this._length);
    this._gx = 0.0;
    this._gy = 0.0;
    this._gz = 0.0;
    this._rx = 0.0;
    this._ry = 0.0;
    for (var i = 0; i < this._length; ++i) {
        var offset = i * 18;
        this._x[i] = buffer[offset + 0];
        this._y[i] = buffer[offset + 1];
        this._z[i] = 0.0;
        this._bx[i] = buffer[offset + 0];
        this._by[i] = buffer[offset + 1];
        this._bz[i] = 0.0;
        this._vx[i] = 0.0;
        this._vy[i] = 0.0;
        this._vz[i] = 0.0;
        this._az[i] = 0.0;
    }
};

MajVj.frame.astalight.ps.prototype._crash = function (key) {
    this._mode = 0;
    for (var i = 0; i < this._length; ++i) {
        var v = (this._abs(this._bx[i]) + 32 - key) / 2;
        this._vx[i] = (this._random() - 0.5) * v;
        this._vy[i] = (this._random() - 0.5) * v;
        this._vz[i] = (this._random() - 0.5) * v * v;
    }
};

MajVj.frame.astalight.ps.prototype.update = function (delta) {
    var buffer = this._parent._offsets.buffer();
    var points = 6;
    var i;
    this._rx += 0.0002 * delta;
    this._ry += 0.0004 * delta;
    var radx = 2.0 * this._PI * this._rx / 360;
    var rady = 2.0 * this._PI * this._ry / 360;
    this._gx = this._sin(radx) * this._sin(rady);
    this._gy = this._cos(radx);
    this._gz = -this._sin(radx) * this._cos(rady);
    var fall = 0;

    var map = this._parent.properties.keymap;
    for (i = 0; i < this._length; ++i) {
        var key = this._abs(this._bx[i]) + 32;
        var val = map[key] +
                (map[key + 1] + map[key - 1]) * 0.9 +
                (map[key + 2] + map[key - 2]) * 0.8 +
                (map[key + 3] + map[key - 3]) * 0.6 +
                (map[key + 4] + map[key - 4]) * 0.3;
        this._az[i] = val / 128;
    }
    var onCrash = false;
    var crashKey = 0;
    var ons = 0;
    for (i = 0; i < 128; ++i) {
        if (map[i] > 110) {
            onCrash = true;
            crashKey = i;
        }
        fall += map[i];
    }
    if (onCrash && !this._onCrash)
        this._crash(crashKey);
    this._onCrash = onCrash;

    var t1 = this._pow(0.9, delta / 30);
    var t2 = 0.01 *  delta / 10;
    for (i = 0; i < this._length; ++i) {
        this._vz[i] += this._az[i];
        this._vx[i] *= t1;
        this._vy[i] *= t1;
        this._vz[i] *= t1;
        this._vx[i] += (this._bx[i] - this._x[i]) * t2;
        this._vy[i] += (this._by[i] - this._y[i]) * t2;
        this._vz[i] += (this._bz[i] - this._z[i]) * t2;
    }
    if (fall > 0) {
        var power = delta / 4096 * fall;
        var gx = this._gx * power;
        var gy = this._gy * power;
        var gz = this._gz * power;
        for (i = 0; i < this._length; ++i) {
            this._vx[i] += gx;
            this._vy[i] += gy;
            this._vz[i] += gz;
        }
    }
    var dst = 0;
    var zoom = 1.0 + this._parent.properties.volume;
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
