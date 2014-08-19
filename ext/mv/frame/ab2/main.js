/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - ab2 -
 * @param screen Tma3DScreen object
 * @param width offscreen width
 * @param height offscreen height
 * @param aspect screen aspect ratio (screen width / screen height)
 */
MajVj.frame.ab2 = function (screen, width, height, aspect) {
    this._screen = screen;
    this._width = width;
    this._height = height;
    this._aspect = aspect;
    this._controller = null;

    this._program = screen.createProgram(
            screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.ab2._vertexShader),
            screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.ab2._fragmentShader));
    this._sphere = TmaModelPrimitives.createSphere(
            MajVj.frame.ab2.resolution, TmaModelPrimitives.SPHERE_METHOD_EVEN);
    this._vertices = screen.createBuffer(this._sphere.getVertices());
    this._indices = screen.createElementBuffer(this._sphere.getIndices());
    this._program.setAttributeArray('aVertexPosition', this._vertices, 0, 3, 0);
    this._pMatrix = mat4.create();
    this._mvMatrix = mat4.create();
    this._rotate = [0, 0, 0];
    this._translate = [0, 0, 0];
    mat4.identity(this._mvMatrix);

    var crlogo = [[-5,-5,255,255,255,255],[-4,-5,255,255,255,255],[-3,-5,255,255,255,255],[-2,-5,255,255,255,255],[-1,-5,255,255,255,255],[0,-5,255,255,255,255],[1,-5,255,255,255,255],[2,-5,255,255,255,255],[3,-5,255,255,255,255],[4,-5,255,255,255,255],[5,-5,255,255,255,255],[6,-5,255,255,255,255],[-5,-4,255,255,255,255],[-4,-4,255,255,255,255],[-3,-4,255,255,255,255],[-2,-4,255,255,255,255],[-1,-4,243,117,95,255],[0,-4,244,128,105,255],[1,-4,244,123,102,255],[2,-4,242,107,88,255],[3,-4,255,255,253,255],[4,-4,255,255,255,255],[5,-4,255,255,255,255],[6,-4,255,255,255,255],[-5,-3,255,255,255,255],[-4,-3,255,255,255,255],[-3,-3,237,239,238,255],[-2,-3,238,86,72,255],[-1,-3,238,95,79,255],[0,-3,240,99,82,255],[1,-3,239,98,81,255],[2,-3,240,90,75,255],[3,-3,235,77,65,255],[4,-3,238,237,243,255],[5,-3,255,255,255,255],[6,-3,255,255,255,255],[-5,-2,255,255,255,255],[-4,-2,254,254,254,255],[-3,-2,233,59,52,255],[-2,-2,233,64,57,255],[-1,-2,233,70,61,255],[0,-2,235,72,63,255],[1,-2,234,70,61,255],[2,-2,234,65,58,255],[3,-2,232,59,53,255],[4,-2,232,58,51,255],[5,-2,253,255,252,255],[6,-2,255,255,255,255],[-5,-1,255,255,255,255],[-4,-1,87,191,92,255],[-3,-1,92,193,91,255],[-2,-1,232,58,51,255],[-1,-1,241,249,251,255],[0,-1,131,182,225,255],[1,-1,132,183,226,255],[2,-1,244,254,255,255],[3,-1,253,217,1,255],[4,-1,253,217,1,255],[5,-1,251,215,5,255],[6,-1,255,255,255,255],[-5,0,255,255,255,255],[-4,0,89,191,91,255],[-3,0,91,193,91,255],[-2,0,209,45,36,255],[-1,0,87,156,211,255],[0,0,103,163,213,255],[1,0,105,165,215,255],[2,0,88,157,212,255],[3,0,253,217,1,255],[4,0,253,217,1,255],[5,0,250,213,0,255],[6,0,255,255,255,255],[-5,1,255,255,255,255],[-4,1,89,186,91,255],[-3,1,91,193,91,255],[-2,1,91,193,91,255],[-1,1,59,141,197,255],[0,1,67,148,204,255],[1,1,67,147,206,255],[2,1,60,142,200,255],[3,1,253,217,1,255],[4,1,253,217,1,255],[5,1,249,211,16,255],[6,1,255,255,255,255],[-5,2,255,255,255,255],[-4,2,89,175,88,255],[-3,2,90,192,92,255],[-2,2,91,193,91,255],[-1,2,213,226,217,255],[0,2,39,118,175,255],[1,2,39,122,176,255],[2,2,204,229,207,255],[3,2,253,217,1,255],[4,2,252,215,4,255],[5,2,243,198,34,255],[6,2,255,255,255,255],[-5,3,255,255,255,255],[-4,3,252,252,252,255],[-3,3,86,179,88,255],[-2,3,90,192,92,255],[-1,3,91,193,91,255],[0,3,91,193,91,255],[1,3,84,181,86,255],[2,3,252,217,1,255],[3,3,250,215,0,255],[4,3,244,203,27,255],[5,3,251,251,251,255],[6,3,255,255,255,255],[-5,4,255,255,255,255],[-4,4,255,255,255,255],[-3,4,223,223,223,255],[-2,4,85,175,87,255],[-1,4,89,184,90,255],[0,4,88,188,90,255],[1,4,249,211,12,255],[2,4,247,207,21,255],[3,4,239,195,36,255],[4,4,223,225,222,255],[5,4,255,255,255,255],[6,4,255,255,255,255],[-5,5,255,255,255,255],[-4,5,255,255,255,255],[-3,5,255,255,255,255],[-2,5,250,250,250,255],[-1,5,68,149,82,255],[0,5,72,158,87,255],[1,5,228,179,50,255],[2,5,220,169,52,255],[3,5,249,249,249,255],[4,5,255,255,255,255],[5,5,255,255,255,255],[6,5,255,255,255,255]];
    var ablogo = (function() {
        var data = [
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],  // oooooooooooo
            [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],  // oo********oo
            [ 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0 ],  // oooo*oo*oooo
            [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],  // oo********oo
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
            ab2: this,
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
                if (this.ab2._state == 0) {
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
                } else if (this.ab2._state == 1) {
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
                } else if (this.ab2._state == 5) {
                    this.m += 0.001 * delta;
                    if (this.m >= 1)
                        this.m = 1;
                    this.p[0] = (1 - this.m) * this.h[0] + this.m * this.i[0];
                    this.p[1] = (1 - this.m) * this.h[1] + this.m * this.i[1];
                    this.p[2] = (1 - this.m) * this.h[2] + this.m * this.i[2];
                } else if (this.ab2._state == 7) {
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

MajVj.frame.ab2.resolution = 3;
// Shader programs.
MajVj.frame.ab2._vertexShader = null;
MajVj.frame.ab2._fragmentShader = null;

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.frame.ab2.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'ab2', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'ab2', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.frame.ab2._vertexShader = shaders[0];
            MajVj.frame.ab2._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('ab2.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.ab2.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(45, aspect, 0.1, 100.0, this._pMatrix);
    mat4.translate(this._pMatrix, [ 0.0, 0.0, -70.0 ]);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.ab2.prototype.draw = function (delta) {
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
MajVj.frame.ab2.prototype.setController = function (controller) {
    this._controller = controller;
};
