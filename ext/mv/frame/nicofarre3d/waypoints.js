/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d - waypoints module
 */
MajVj.frame.nicofarre3d.modules.waypoints = function (options) {
    this._container = new TmaParticle.Container(
            MajVj.frame.nicofarre3d.modules.waypoints.Particle);
    this._waypoints = [];
    this._size = options.size || 4096;
    this._height = options.height || 2048;
    this._gravity = options.gravity / 1000 || 0.002;
    this._h = 0;
    this._lastParticles = 0;
    this._maxParticles = options.particles || 10000;
    this._range = options.range || 100000;
    this._emit = options.emit || 4;
    var waypoints = options.waypoints || 32;
    var wayspeed = options.wayspeed || 10;
    for (var points = 0; points < waypoints; ++points) {
        this._waypoints.push({
            x: (Math.random() - 0.5) * 2.0 * this._size,
            y: (Math.random() - 0.5) * 2.0 * this._height,
            z: (Math.random() - 0.5) * 2.0 * this._size,
            vx: (Math.random() * 2 - 1) * wayspeed,
            vy: (Math.random() * 2 - 1) * wayspeed,
            vz: (Math.random() * 2 - 1) * wayspeed
        });
    }
    this._waypoints.push({ x: 0.0, y: 0.0, z: 0.0, vx: 0.0, vy: 0.0, vz: 0.0 });
    this._model = TmaModelPrimitives.createPoints(
            new Array(this._maxParticles * 3));
};

/**
 * Particle prototype
 *
 * This prototype controls a particle.
 */
MajVj.frame.nicofarre3d.modules.waypoints.Particle = function () {
    TmaParticle.apply(this, arguments);
};

// Inherits TmaParticle.
MajVj.frame.nicofarre3d.modules.waypoints.Particle.prototype =
        new TmaParticle(null, 0);
MajVj.frame.nicofarre3d.modules.waypoints.Particle.prototype.constructor =
        MajVj.frame.nicofarre3d.modules.waypoints.Particle;

/**
 *
 */
MajVj.frame.nicofarre3d.modules.waypoints.Particle.prototype.initialize =
        function (h, waypoints, size, gravity, range) {
    this.x = Math.random() * 1000;
    this.y = Math.random() * 1000;
    this.z = Math.random() * 1000;
    this.ox = this.x;
    this.oy = this.y;
    this.oz = this.z;
    var color = TmaScreen.HSV2RGB(h, 1 - Math.random() / 4, Math.random() / 2);
    this.color = [color.r / 255, color.g / 255, color.b / 255, 1.0];
    this.target = 0;
    this.waypoints = waypoints;
    this.size = size;
    this.gravity = gravity;
    this.range = range;
};

/**
 *
 */
MajVj.frame.nicofarre3d.modules.waypoints.Particle.prototype.update =
        function (delta) {
    var waypoint = this.waypoints[this.target];
    var dx = waypoint.x - this.x;
    var dy = waypoint.y - this.y;
    var dz = waypoint.z - this.z;
    if (dx * dx + dy * dy + dz * dz < this.range) {
        this.target++;
        if (this.target == this.waypoints.length)
            return false;
        this.vx += Math.random() * 2 - 1;
        this.vy += Math.random() * 2 - 1;
        this.vz += Math.random() * 2 - 1;
    }
    this.vx += dx * this.gravity;
    this.vy += dy * this.gravity;
    this.vz += dz * this.gravity;
    this.vx *= 0.97;
    this.vy *= 0.97;
    this.vz *= 0.97;
    this.ox = this.x;
    this.oy = this.y;
    this.oz = this.z;
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;
    return true;
};

/**
 * Clears screen.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.waypoints.prototype.clear = function (api) {
  //api.color = [0.0, 0.0, 0.0, 1.0];
  //api.clear(api.gl.COLOR_BUFFER_BIT | api.gl.DEPTH_BUFFER_BIT);
  api.clear(api.gl.DEPTH_BUFFER_BIT);
  api.setAlphaMode(true, api.gl.ONE, api.gl.SRC_ALPHA);
  api.fill([0.0, 0.0, 0.0, 0.8]);
};

/**
 * Draws.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.waypoints.prototype.draw = function (api) {
    api.setAlphaMode(true, api.gl.ONE, api.gl.ONE);

    // Update waypoints.
    var size = this._size;
    var ysize = this._height;
    for (var point = 0; point < this._waypoints.length; ++point) {
        var waypoint = this._waypoints[point];
        waypoint.x += waypoint.vx;
        waypoint.y += waypoint.vy;
        waypoint.z += waypoint.vz;
        if ((waypoint.x > size && waypoint.vx > 0) ||
                (waypoint.x < -size && waypoint.vx < 0))
            waypoint.vx = -waypoint.vx;
        if ((waypoint.y > ysize && waypoint.vy > 0) ||
                (waypoint.y < -ysize && waypoint.vy < 0))
            waypoint.vy = -waypoint.vy;
        if ((waypoint.z > size && waypoint.vz > 0) ||
                (waypoint.z < -size && waypoint.vz < 0))
            waypoint.vz = -waypoint.vz;
    }

    // Update particles.
    var emit = Math.min(
        this._emit, this._maxParticles - this._container.length);
    for (var i = 0; i < emit; ++i) {
        this._container.add(this._h, this._waypoints, this._size,
                            this._gravity, this._range);
    }
    this._h = (this._h + 1) % 360;
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
