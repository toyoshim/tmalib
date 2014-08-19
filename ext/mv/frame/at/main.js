/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - at -
 * @param screen Tma3DScreen object
 * @param width offscreen width
 * @param height offscreen height
 * @param aspect screen aspect ratio (screen width / screen height)
 */
MajVj.frame.at = function (screen, width, height, aspect) {
    this._screen = screen;
    this._width = width;
    this._height = height;
    this._aspect = aspect;
    this._controller = null;

    this._program = screen.createProgram(
            screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.at._vertexShader),
            screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.at._fragmentShader));
    this._sphere = TmaModelPrimitives.createSphere(
            MajVj.frame.at.resolution, TmaModelPrimitives.SPHERE_METHOD_EVEN);
    this._vertices = screen.createBuffer(this._sphere.getVertices());
    this._indices = screen.createElementBuffer(this._sphere.getIndices());
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
    this.onresize(aspect);
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
 */
MajVj.frame.at.prototype.setController = function (controller) {
    this._controller = controller;
};
