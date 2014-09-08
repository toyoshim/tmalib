/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d - beams module
 *  @param options options
 */
MajVj.frame.nicofarre3d.modules.beams = function (options) {
    this._container = new TmaParticle.Container(
            MajVj.frame.nicofarre3d.modules.beams.Particle);
    this._period = options.period || 1000;
    this._unit = options.unit || 20;
    this._dir = options.dir || MajVj.frame.nicofarre3d.modules.beams.DIR_ALL;
    this._tick = 0;
    this._nextTime = 0;
    this._beams = [];
    this._size = 8192 * 2;
    this._speed = options.speed || this._size / 200;
    this._maxParticles = 10000;
    this._lastParticles = 0;
    this._model = TmaModelPrimitives.createPoints(
            new Array(this._maxParticles * 3));
};

/**
 * Particle prototype
 *
 * This prototype controls a particle.
 */
MajVj.frame.nicofarre3d.modules.beams.Particle = function () {
    TmaParticle.apply(this, arguments);
};

// Inherits TmaParticle.
MajVj.frame.nicofarre3d.modules.beams.Particle.prototype =
        new TmaParticle(null, 0);
MajVj.frame.nicofarre3d.modules.beams.Particle.prototype.constructor =
        MajVj.frame.nicofarre3d.modules.beams.Particle;

MajVj.frame.nicofarre3d.modules.beams.DIR_ALL = [0, 1, 2, 3];
MajVj.frame.nicofarre3d.modules.beams.DIR_Z = [0, 1];
MajVj.frame.nicofarre3d.modules.beams.DIR_F2B = [0];
MajVj.frame.nicofarre3d.modules.beams.DIR_B2F = [1];
MajVj.frame.nicofarre3d.modules.beams.DIR_X = [2, 3];
MajVj.frame.nicofarre3d.modules.beams.DIR_L2R = [2];
MajVj.frame.nicofarre3d.modules.beams.DIR_R2L = [3];

/**
 *
 */
MajVj.frame.nicofarre3d.modules.beams.Particle.prototype.initialize =
        function (size, speed, dir) {
    var pattern = (0|(dir.length * Math.random())) % dir.length;
    switch (dir[pattern]) {
      case 0:
        this.x = (Math.random() - 0.5) * size;
        this.y = (Math.random() - 0.5) * size / 10;
        this.z = -size;
        this.vx = 0;
        this.vy = 0;
        this.vz = speed;
        break;
      case 1:
        this.x = (Math.random() - 0.5) * size;
        this.y = (Math.random() - 0.5) * size / 10;
        this.z = size;
        this.vx = 0;
        this.vy = 0;
        this.vz = -speed;
        break;
      case 2:
        this.x = -size;
        this.y = (Math.random() - 0.5) * size / 10;
        this.z = (Math.random() - 0.5) * size;
        this.vx = speed;
        this.vy = 0;
        this.vz = 0;
        break;
      case 3:
        this.x = size;
        this.y = (Math.random() - 0.5) * size / 10;
        this.z = (Math.random() - 0.5) * size;
        this.vx = -speed;
        this.vy = 0;
        this.vz = 0;
        break;
    }
    this.x -= (this.x % 1000);
    this.y -= (this.x % 1000);
    this.z -= (this.x % 1000);
    this.color = [Math.random(), Math.random(), Math.random(), 1.0];
    this.size = size;
};

/**
 *
 */
MajVj.frame.nicofarre3d.modules.beams.Particle.prototype.update =
        function (delta) {
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;
    var ysize = this.size / 10;
    if ((this.x > this.size && this.vx > 0) ||
            (this.x < -this.size && this.vx < 0))
        return false;
    if ((this.y > ysize && this.vy > 0) ||
            (this.y < -ysize && this.vy < 0))
        return false;
    if ((this.z > this.size && this.vz > 0) ||
            (this.z < -this.size && this.vz < 0))
        return false;
    return true;
};

/**
 * Clears screen.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.beams.prototype.clear = function (api) {
    api.clear(api.gl.DEPTH_BUFFER_BIT);
    api.setAlphaMode(true, api.gl.ONE, api.gl.SRC_ALPHA);
    api.fill([0.0, 0.0, 0.0, 0.92]);
};

/**
 * Draws.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.beams.prototype.draw = function (api) {
    // Update beams.
    var size = this._size;
    var ysize = size / 10.0;

    // Update particles.
    this._tick += api.delta;
    while (this._tick > this._nextTime) {
        this._nextTime += this._period;
        var emit = Math.min(
                this._unit, this._maxParticles - this._container.length);
        for (var i = 0; i < emit; ++i)
            this._container.add(this._size, this._speed, this._dir);
    }
    this._container.update();

    var n = Math.min(this._maxParticles, this._container.length);
    var vertices = this._model.getVerticesBuffer(api.screen);
    var vbuffer = vertices.buffer();
    var colors = this._model.getColorsBuffer(api.screen);
    var cbuffer = colors.buffer();
    for (i = 0; i < n; ++i) {
        var particle = this._container.at(i);
        vbuffer[i * 3 + 0] = particle.x;
        vbuffer[i * 3 + 1] = particle.y;
        vbuffer[i * 3 + 2] = particle.z;
        cbuffer[i * 4 + 0] = particle.color[0];
        cbuffer[i * 4 + 1] = particle.color[1];
        cbuffer[i * 4 + 2] = particle.color[2];
        cbuffer[i * 4 + 3] = particle.color[3];
    }
    for (; i < this._lastParticles; ++i) {
        vbuffer[i * 3 + 0] = 0.0;
        vbuffer[i * 3 + 1] = 0.0;
        vbuffer[i * 3 + 2] = 0.0;
        cbuffer[i * 4 + 0] = 0.0;
        cbuffer[i * 4 + 1] = 0.0;
        cbuffer[i * 4 + 2] = 0.0;
        cbuffer[i * 4 + 3] = 0.0;
    }
    this._lastParticles = this._container.length;
    vertices.update();
    colors.update();
    api.drawPrimitive(this._model, 1.0, 1.0, 1.0, [0.0, 0.0, 0.0]);
};
