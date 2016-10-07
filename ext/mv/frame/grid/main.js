/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - grid -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.frame.grid = function (options) {
    this._screen = options.screen;
    this.onresize(options.aspect);
    this._api2d = options.mv.get2DInterface({ width: 1, height: 1 });
    this._api3d = options.mv.create('frame', 'api3d', {
            draw: this._draw.bind(this)
    });
    this.properties = {
        z: options.z,
        n: 8,
        orientation: [ 0, 0, -90 ],
        vr: false,
        parallax_overlap: 0.0,
        color: (options.color === undefined) ? [ 1.0, 1.0, 1.0, 1.0 ]
                                             : options.color,
        zoom: (options.zoom === undefined) ? 1.0 : options.zoom
    };
};

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.grid.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.grid.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    this._zoom = [ 1.0, 1.0 ];
    if (this._aspect > 1)
        this._zoom[1] = this._aspect;
    else
        this._zoom[0] /= this._aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.grid.prototype.draw = function (delta) {
    if (this.properties.z) {
        this._api3d.properties.orientation = this.properties.orientation;
        this._api3d.properties.vr = this.properties.vr;
        this._api3d.properties.parallax_overlap =
                this.properties.parallax_overlap;
        this._api3d.properties.parallax_distance =
                this.properties.parallax_distance;
        return this._api3d.draw(delta);
    }

    var c = this.properties.color;
    var n = this.properties.n - 1;
    var zoom = this.properties.zoom;
    
    this._api2d.stroke(c[0] * 255, c[1] * 255, c[2] * 255, c[3] * 255);
    this._api2d.strokeWeight(1);

    var linex = (1 - this._zoom[0] * zoom) / 2;
    var stepx = this._zoom[0] * zoom / n;
    for (var x = 0; x <= n; ++x) {
        this._api2d.line(linex, 0, linex, 1.0);
        linex += stepx;
    }
    var liney = (1 - this._zoom[1] * zoom) / 2;
    var stepy = this._zoom[1] * zoom / n;
    for (var y = 0; y <= n; ++y) {
        this._api2d.line(0, liney, 1.0, liney);
        liney += stepy;
    }
};

MajVj.frame.grid.prototype._draw = function (api) {
    api.color = this.properties.color;

    var n = this.properties.n - 1;
    var zoom = this.properties.zoom;

    var s = -1 * zoom;
    var e =  1 * zoom;
    var step = (e - s) / n;
    var linez = s;
    var x, y, z;
    for (var z = 0; z <= n; ++z) {
        var linex = s;
        for (var x = 0; x <= n; ++x) {
            api.drawLine([linex, s, linez], [linex, e, linez]);
            api.drawLine([linex, linez, s], [linex, linez, e]);
            linex += step;
        }
        var liney = s;
        for (var y = 0; y <= n; ++y) {
            api.drawLine([s, liney, linez], [e, liney, linez]);
            api.drawLine([linez, liney, s], [linez, liney, e]);
            liney += step;
        }
        linez += step;
    }
};
