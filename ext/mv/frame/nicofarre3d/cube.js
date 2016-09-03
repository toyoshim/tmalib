/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d - cube module
 */
MajVj.frame.nicofarre3d.modules.cube = function () {
    this._n = 256;
    this._objects = new Array(this._n);
    for (var i = 0; i < this._n; ++i) {
        this._objects[i] = new MajVj.frame.nicofarre3d.modules.cube.object(
            (Math.random() - 0.5) * 20000);
    }
    this._cube = TmaModelPrimitives.createCube();
    this._cube.setDrawMode(Tma3DScreen.MODE_LINE_LOOP);
};

/**
 * object prototype
 *
 * This prototype represents a cube.
 * @param z an initial z position
 */
MajVj.frame.nicofarre3d.modules.cube.object = function (z) {
    this._init(z);
};

/**
 * Initialize a cube.
 * @param z an initial z position
 */
MajVj.frame.nicofarre3d.modules.cube.object.prototype._init = function (z) {
    this._position = [
        (Math.random() - 0.5) * 10000.0,
        (Math.random() - 0.5) * 1000.0,
        z];
    this._size = 100.0;  // Math.random() * 100.0;

    var r = Math.random();
    var g = Math.random();
    var b = Math.random();
    var avg = (r + g + b) / 3.0;
    r = (r + avg) / 2.0;
    g = (r + avg) / 2.0;
    b = (r + avg) / 2.0;
    this._color = [r, g, b, 1.0];
    this._rotate = Math.random() * Math.PI * 2.0;
};

/**
 * Draws a cube
 * @param api nicofarre3d interfaces
 * @param cube a cube primitive object
 * @param rotate rotation speed
 * @param speed approaching speed
 */
MajVj.frame.nicofarre3d.modules.cube.object.prototype.draw =
        function (api, cube, rotate, speed) {
    api.color = this._color;
    var s = this._size;
    api.drawPrimitive(cube, s, s, s, this._position, [[this._rotate, 0.0, 0.0]]);
    this._rotate += rotate;
    this._position[2] += speed;
    if (this._position[2] > 10000)
        this._init(this._position[2] - 20000);
};

/**
 * Clears screen.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.cube.prototype.clear = function (api) {
    api.color = [0.0, 0.0, 0.0, 1.0];
    api.clear(api.gl.COLOR_BUFFER_BIT | api.gl.DEPTH_BUFFER_BIT);
};

/**
 * Draws.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.cube.prototype.draw = function (api) {
    api.color = [0.0, 0.0, 0.0, 1.0];
    api.setAlphaMode(false);
    var speed = api.delta * 2.0;
    var rotate = speed / 1000.0;
    for (var i = 0; i < this._n; ++i)
        this._objects[i].draw(api, this._cube, rotate, speed);
};
