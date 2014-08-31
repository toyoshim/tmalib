/**
 * T'MediaArt library for JavaScript.
 */

/**
 * TmaModelPrimitives prototype
 *
 * This prototype provides utility functions to create and use basic objects,
 * e.g., sphere.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
function TmaModelPrimitives() {
    this._vertices = [];
    this._coords = [];
    this._indices = [];
    this._verticesBuffer = null;
    this._coordsBuffer = null;
    this._indicesBuffer = null;
    this._texture = null;
    this._mode = Tma3DScreen.MODE_TRIANGLES;
}

/**
 * Modifies all vertices by the specified |scale|.
 * @param scale scale factor
 */
TmaModelPrimitives.prototype.scale = function (scale) {
    for (var i = 0; i < this._vertices.length; ++i)
        this._vertices[i] *= scale;
};

/**
 * Gets number of vertices.
 * @return number of vertices.
 */
TmaModelPrimitives.prototype.items = function () {
    return this._indices.length;
};

/**
 * Gets model's vertices array.
 * @return model's vertices in Array or Float32Array
 */
TmaModelPrimitives.prototype.getVertices = function () {
    return this._vertices;
};

/**
 * Gets texture coord. Address is normalized from 0.0 to 1.0.
 * @return texture coord in Array
 */
TmaModelPrimitives.prototype.getCoords = function () {
    return this._coords;
};

/**
 * Gets model's vertex indices.
 * @return model's vertex indices in Array
 */
TmaModelPrimitives.prototype.getIndices = function () {
    return this._indices;
};

/**
 * Gets an array buffer bound to the vertices. It may be created if needed.
 * @param screen a Tma3DScreen object that will be used to create a buffer
 * @return an array buffer object
 */
TmaModelPrimitives.prototype.getVerticesBuffer = function (screen) {
    if (!this._verticesBuffer)
        this._verticesBuffer = screen.createBuffer(this.getVertices());
    return this._verticesBuffer;
};

/**
 * Gets an array buffer bound to the coords. It may be created if needed.
 * @param screen a Tma3DScreen object that will be used to create a buffer
 * @return an array buffer object for texture coords
 */
TmaModelPrimitives.prototype.getCoordsBuffer = function (screen) {
    if (!this._coordsBuffer)
        this._coordsBuffer = screen.createBuffer(this.getCoords());
    return this._coordsBuffer;
};

/**
 * Gets an element buffer bound to the indices. It may be created if needed.
 * @param screen a Tma3DScreen object that will be used to create a buffer
 * @return an element buffer object
 */
TmaModelPrimitives.prototype.getIndicesBuffer = function (screen) {
    if (!this._indicesBuffer)
        this._indicesBuffer = screen.createElementBuffer(this.getIndices());
    return this._indicesBuffer;
};

/**
 * Sets a texture.
 * @param texture a texture object
 */
TmaModelPrimitives.prototype.setTexture = function (texture) {
    this._texture = texture;
};

/**
 * Gets a bound texture object.
 * @return a texture object
 */
TmaModelPrimitives.prototype.getTexture = function () {
    return this._texture;
};

/**
 * Sets a recommended drawing mode.
 * @param mode a drawing mode, e.g. Tma3DScreen.MODE_TRIANGLES
 */
TmaModelPrimitives.prototype.setDrawMode = function (mode) {
    this._mode = mode;
};

/**
 * Gets a recommended drawing mode.
 * @return a drawing mode, e.g. Tma3DScreen.MODE_TRIANGLES
 */
TmaModelPrimitives.prototype.getDrawMode = function () {
    return this._mode;
};

/**
 * Creates a box model.
 */
TmaModelPrimitives.prototype._createBox = function () {
    this._vertices = [
            -0.5, -0.5, 0,
             0.5, -0.5, 0,
             0.5,  0.5, 0,
            -0.5,  0.5, 0];
    this._indices = [0, 1, 2, 2, 3, 0];
    this._coords = [0, 0, 1, 0, 1, 1, 0, 1];
};

/**
 * Creates a cube model.
 */
TmaModelPrimitives.prototype._createCube = function () {
    this._vertices = [
            -0.5, -0.5, -0.5,  // 0
            -0.5, -0.5,  0.5,  // 1
            -0.5,  0.5, -0.5,  // 2
            -0.5,  0.5,  0.5,  // 3
             0.5, -0.5, -0.5,  // 4
             0.5, -0.5,  0.5,  // 5
             0.5,  0.5, -0.5,  // 6
             0.5,  0.5,  0.5]; // 7
    this._indices = [
          1, 5, 7, 7, 3, 1,
          3, 7, 6, 6, 2, 3,
          2, 6, 4, 4, 0, 2,
          0, 4, 5, 5, 1, 0,
          4, 6, 7, 7, 5, 4,
          0, 1, 3, 3, 2, 0];
    this._coords = [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
};

/**
 * Creates a model containing points.
 * @param points an Array containing points, e.g. [x0, y0, z0, x1, y1, z1, ...]
 */
TmaModelPrimitives.prototype._createPoints = function (points) {
    this._vertices = points;
    var count = points.length / 3;
    this._indices = new Array(count);
    this._coords = null;
    for (var i = 0; i < count; ++i)
        this._indices[i] = i;
    this._mode = Tma3DScreen.MODE_POINTS;
};

/**
 * Creates a sphere model with evenly divided triangles.
 * @param resolution divition depth
 */
TmaModelPrimitives.prototype._createSphereEven = function (resolution) {
    // Maybe there are smarter ways to use quotanion or something.
    var square = [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ -1, 0, 0 ], [ 0, -1, 0 ] ];
    var pushVertex = function (v, p) {
        var length = this._vertices.length / 3;
        var r = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        var x = 0.5;
        if (r != 0)
            x = Math.acos(v[0] / r) / Math.PI / 2;
        if (v[1] < 0.0)
            x = 1 - x;
        if (x == 0.0 && !p)
            x = 1.0;
        var y = 1 - Math.acos(v[2]) / Math.PI;
        for (var i = 0; i < length; ++i) {
            // TODO: Make following checks use hash if it costs.
            if (this._vertices[i * 3 + 0] != v[0] ||
                this._vertices[i * 3 + 1] != v[1] ||
                this._vertices[i * 3 + 2] != v[2] ||
                this._coords[i * 2 + 0] != x ||
                this._coords[i * 2 + 1] != y)
                continue;
            this._indices.push(i);
            return;
        }
        this._indices.push(i);
        this._vertices = this._vertices.concat(v);
        this._coords.push(x);
        this._coords.push(y);
    }.bind(this);
    var pushTriangle = function (a, b, c) {
        var p = ((a[1] + b[1] + c[1]) / 3) > 0;
        pushVertex(a, p);
        pushVertex(b, p);
        pushVertex(c, p);
    }.bind(this);
    var create = function (depth, a, b, c) {
        if (depth == 0) {
            pushTriangle(a, b, c);
            return;
        }
        depth--;
        var complement = function (a, b) {
            var x = (a[0] + b[0]) / 2;
            var y = (a[1] + b[1]) / 2;
            var z = (a[2] + b[2]) / 2;
            r = Math.sqrt(x * x + y * y + z * z);
            return [ x / r, y / r, z / r ];
        }
        var ab = complement(a, b);
        var bc = complement(b, c);
        var ca = complement(c, a);
        create(depth, a, ab, ca);
        create(depth, ab, b, bc);
        create(depth, bc, c, ca);
        create(depth, ab, bc, ca);
    }
    for (var i = 0; i < square.length; ++i) {
        var next = (i + 1) % square.length;
        create(resolution, square[i], square[next], [ 0, 0, 1]);
        create(resolution, square[i], square[next], [ 0, 0, -1]);
    }
};

TmaModelPrimitives.SPHERE_METHOD_THEODOLITE = 0;
TmaModelPrimitives.SPHERE_METHOD_EVEN = 1;

/**
 * Creates a box model.
 * @return A TmaModelPrimitives object containing a cube model
 */
TmaModelPrimitives.createBox = function () {
    var cube = new TmaModelPrimitives();
    cube._createBox();
    return cube;
};

/**
 * Creates a cube model.
 * @return A TmaModelPrimitives object containing a cube model
 */
TmaModelPrimitives.createCube = function () {
    var cube = new TmaModelPrimitives();
    cube._createCube();
    return cube;
};

/**
 * Creates a model containing points.
 * @param points an Array containing points, e.g. [x0, y0, z0, x1, y1, z1, ...]
 * @return A TmaModelPrimitives object containing a points
 */
TmaModelPrimitives.createPoints = function (points) {
    var model = new TmaModelPrimitives();
    model._createPoints(points);
    return model;
};

/**
 * Creates a sphere model.
 * @param resolution mesh resolution
 * @param method SPHERE_METHOD_THEODOLITE or SPHERE_METHOD_EVEN
 * @return A TmaModelPrimitives object containing a sphere model
 */
TmaModelPrimitives.createSphere = function (resolution, method) {
    var sphere = new TmaModelPrimitives();
    // TODO: implement theodolite method.
    sphere._createSphereEven(resolution);
    return sphere;
};

// node.js compatible export.
exports.TmaModelPrimitives = TmaModelPrimitives;
