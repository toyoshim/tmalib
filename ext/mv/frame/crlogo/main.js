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
    this.properties = { knob: 0.0, slider: 0.0 };
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.crlogo._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.crlogo._fragmentShader));
    this._pMatrix = mat4.create();
    this._mvMatrix = mat4.identity(mat4.create());
    this._rotate = 0.0;

    var logo = MajVj.frame.crlogo._logos[0];
    this._vertices = this._screen.createBuffer(logo.vertices);
    this._vertices.items = logo.items;
    this._offsets = this._screen.createBuffer(logo.offsets);
    this._colors = this._screen.createBuffer(logo.colors);
    this._ps = new MajVj.frame.crlogo.ps(this, 0);

    this.onresize(this._aspect);
};

/**
 * Creates logo data
 * @param path resource file relative path from the plugin directory
 */
MajVj.frame.crlogo._createLogo = function (path) {
    return new Promise(function (resolve, reject) {
        MajVj.loadImage('frame', 'crlogo', path).then(function (image) {
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
    mat4.perspective(this._pMatrix, 45, aspect, 0.1, 1000.0);
    mat4.translate(this._pMatrix, this._pMatrix, [ 0.0, 0.0, -250.0 ]);
    mat4.rotate(this._pMatrix, this._pMatrix, this._rotate, [ 0.1, 0.2, 0.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.crlogo.prototype.draw = function (delta) {
    this._program.setUniformMatrix('uMVMatrix', this._mvMatrix);
    var rotate = 0.002 * delta * (0.5 + this.properties.slider * 1.5);
    this._rotate += rotate;
    mat4.rotate(this._pMatrix, this._pMatrix, rotate, [ 0.1, 0.2, 0.0 ]);

    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    this._program.setAttributeArray(
            'aVertexPosition', this._vertices, 0, 3, 0);
    this._program.setAttributeArray('aVertexOffset', this._offsets, 0, 3, 0);
    this._program.setAttributeArray('aColor', this._colors, 0, 4, 0);
    this._program.drawArrays(
            Tma3DScreen.MODE_TRIANGLES, 0, this._vertices.items);
    this._ps.update(delta);
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
    var timeout = Math.random() * 100 /
            (this._parent.properties.knob * 2.2 + 0.2);

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
