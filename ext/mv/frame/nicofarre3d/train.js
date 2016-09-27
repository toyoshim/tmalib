/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d - train module
 *  @param options options
 */
MajVj.frame.nicofarre3d.modules.train = function (options) {
    this._container = new TmaParticle.Container(
            MajVj.frame.nicofarre3d.modules.train.Particle);
    this._period = options.period || 500;
    this.properties = options.properties;
    this.properties.train = [ 0.0, 0.0 ];
    this._tick = 0;
    this._nextTime = 0;
    this._frontRails = [];
    this._backRails = [];
    this._houseR = 0;
    this._houseL = 0;
    this._offset = 0;
    this._r = 0.0;
    this._fly = 0.0;
    for (var i = 0; i < 30; ++i) {
        this._frontRails.push(this._newRail());
        this._backRails.push(this._newRail());
    }
    this._box = TmaModelPrimitives.createCube();
    this._box.setDrawMode(Tma3DScreen.MODE_LINE_LOOP);
};

/**
 * Clears.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.train.prototype.clear = function (api) {
    api.clear(api.gl.DEPTH_BUFFER_BIT);
    api.setAlphaMode(true, api.gl.ONE, api.gl.SRC_ALPHA);
    api.fill([0.0, 0.0, 0.0, 0.7]);
};

/**
 * Draws.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.train.prototype.draw = function (api) {
    this._r = this.properties.train[0] - 0.5;
    this._fly = 10000 * this.properties.train[1];
    api.setAlphaMode(true, api.gl.ONE, api.gl.ONE);

    this._tick += api.delta;
    while (this._tick >= this._nextTime) {
        this._update();
        this._nextTime += this._period;
    }

    var color = [0.1, 0.1, 0.1, 1.0];
    api.color = color;
    var z = -1000 + this._offset;
    var x = 0.0;
    var r = 0.0;
    for (var i = 0; i < this._frontRails.length; ++i) {
        var rail = this._frontRails[i];
        api.drawBox(500, 200, [x, -500.0 - this._fly, z],
                [-Math.PI / 2.0, r, 0.0]);
        var xdiff = 250.0 * Math.cos(r);
        var zdiff = 250.0 * Math.sin(r);
        api.drawBox(800, 10, [x + xdiff, -450.0 - this._fly, z - zdiff],
                [-Math.PI / 2.0, r, Math.PI / 2.0 - r]);
        api.drawBox(800, 10, [x - xdiff, -450.0 - this._fly, z + zdiff],
                [-Math.PI / 2.0, r, Math.PI / 2.0 - r]);
        if (rail.houseR) {
            api.color = rail.houseRC;
            api.drawPrimitive(this._box,
                    2000, rail.houseRH, rail.houseR,
                    [x + xdiff * 20, -500.0 - this._fly, z - zdiff * 20],
                    [[0, -r, 0]]);
            api.color = color;

        }
        if (rail.houseL) {
            api.color = rail.houseLC;
            api.drawPrimitive(this._box,
                    2000, rail.houseLH, rail.houseL,
                    [x - xdiff * 20, -500.0 - this._fly, z + zdiff * 20],
                    [[0, -r, 0]]);
            api.color = color;
        }
        z -= 1000 * Math.cos(r);
        x += 1000 * Math.sin(r);
        r += rail.r;
    }
    z = 0 + this._offset;
    x = 0.0;
    r = 0.0;
    for (i = this._backRails.length - 1; i >= 0; --i) {
        var rail = this._backRails[i];
        api.drawBox(500, 200, [x, -500.0 - this._fly, z],
                [-Math.PI / 2.0, r, 0.0]);
        var xdiff = 250.0 * Math.cos(r);
        var zdiff = 250.0 * Math.sin(r);
        api.drawBox(800, 10, [x + xdiff, -450.0 - this._fly, z - zdiff],
                [-Math.PI / 2.0, r, Math.PI / 2.0 - r]);
        api.drawBox(800, 10, [x - xdiff, -450.0 - this._fly, z + zdiff],
                [-Math.PI / 2.0, r, Math.PI / 2.0 - r]);
        if (rail.houseR) {
            api.color = rail.houseRC;
            api.drawPrimitive(this._box,
                    2000, rail.houseRH, rail.houseR,
                    [x + xdiff * 20, -500.0 - this._fly, z - zdiff * 20],
                    [[0, -r, 0]]);
            api.color = color;

        }
        if (rail.houseL) {
            api.color = rail.houseLC;
            api.drawPrimitive(this._box,
                    2000, rail.houseLH, rail.houseL,
                    [x - xdiff * 20, -500.0 - this._fly, z + zdiff * 20],
                    [[0, -r, 0]]);
            api.color = color;
        }
        z += 1000 * Math.cos(r);
        x -= 1000 * Math.sin(r);
        r -= rail.r;
    }
};

MajVj.frame.nicofarre3d.modules.train.prototype._newRail = function () {
    var houseR = 0;
    var houseRH = 0;
    if (this._houseR == 0) {
        this._houseR = 2 + (Math.random() * 3)|0;
        houseR = this._houseR * 1000;
        houseRH = Math.random() * 5000;
    } else {
        this._houseR--;
    }
    var houseL = 0;
    var houseLH = 0;
    if (this._houseL == 0) {
        this._houseL = 2 + (Math.random() * 3)|0;
        houseL = this._houseL * 1000;
        houseLH = Math.random() * 5000;
    } else {
        this._houseL--;
    }
    return {
        r: this._r,
        houseR: houseR,
        houseRH: houseRH,
        houseRC: [0.02 + Math.random() / 256,
                  0.02 + Math.random() / 256,
                  0.02 + Math.random() / 256, 1.0],
        houseL: houseL,
        houseLH: houseLH,
        houseLC: [0.02 + Math.random() / 256,
                  0.02 + Math.random() / 256,
                  0.02 + Math.random() / 256, 1.0]
    };
};

MajVj.frame.nicofarre3d.modules.train.prototype._update = function () {
    this._offset += 250;
    if (this._offset == 1000) {
        this._offset = 0;
        this._backRails.shift();
        this._backRails.push(this._frontRails.shift());
        this._frontRails.push(this._newRail());
    }
};

