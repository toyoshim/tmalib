/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - mirror -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.mirror = function (options) {
    this._screen = options.screen;
    this.onresize(options.aspect);
    this.properties = {
        division: options.division || 4,
        zoom: 1.5
    };
    this._coords = null;
    this._indices = null;
    this._division = 0;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.mirror._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.mirror._fragmentShader));
};

// Shader programs.
MajVj.effect.mirror._vertexShader = null;
MajVj.effect.mirror._fragmentShader = null;

/**
 * Loads resources asynchronously.
 */
MajVj.effect.mirror.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'mirror', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'mirror', 'shaders.html', 'fragment')
        ]).then(function (shaders) {
            MajVj.effect.mirror._vertexShader = shaders[0];
            MajVj.effect.mirror._fragmentShader = shaders[1];
            resolve();
        }, function () { reject('mirror.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.mirror.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    this._zoom = [ 1.0, 1.0 ];
    if (this._aspect > 1)
        this._zoom[1] = this._aspect;
    else
        this._zoom[0] = 1 / this._aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.mirror.prototype.draw = function (delta, texture) {
    if (this._division != this.properties.division)
        this._prepareCoords();

    this._program.setAttributeArray('aCoord', this._coords, 0, 4, 0);
    var zoom = [
        this._zoom[0] * this.properties.zoom,
        this._zoom[1] * this.properties.zoom
    ];
    this._program.setUniformVector('uZoom', zoom);
    this._program.setTexture('uTexture', texture);
    var length = this._division * 6;
    this._program.drawElements(
            Tma3DScreen.MODE_TRIANGLES, this._indices, 0, length);
};

MajVj.effect.mirror.prototype._prepareCoords = function () {
    var n = this.properties.division;
    var coords = [];
    var delta = Math.PI * 2 / n;
    var theta = 0;
    var p0 = [ 0, 0 ];
    var p1 = [ Math.cos(theta), Math.sin(theta) ];
    var p2 = [ Math.cos(delta), Math.sin(delta) ];
    var p3 = [ p1[0] + p2[0], p1[1] + p2[1] ];
    var index = 0;
    var indices = [];
    for (var i = 0; i < n; ++i) {
        var t1 = theta;
        theta += delta;
        var t2 = theta;
        var qa = [ Math.cos(t1), Math.sin(t1) ];
        var qb = [ Math.cos(t2), Math.sin(t2) ];
        var q1 = (i % 2) ? qb : qa;
        var q2 = (i % 2) ? qa : qb;
        var q3 = [ q1[0] + q2[0], q1[1] + q2[1] ];
        [].push.apply(coords, [ 0, 0, p0[0], p0[1] ]);
        [].push.apply(coords, [ q1[0], q1[1], p1[0], p1[1] ]);
        [].push.apply(coords, [ q2[0], q2[1], p2[0], p2[1] ]);
        indices.push(index + 0);
        indices.push(index + 1);
        indices.push(index + 2);
        [].push.apply(coords, [ q3[0], q3[1], p3[0], p3[1] ]);
        indices.push(index + 1);
        indices.push(index + 2);
        indices.push(index + 3);
        index += 4;
    }
    this._coords = this._screen.createBuffer(coords);
    this._indices = this._screen.createElementBuffer(indices);
    this._division = n;
};