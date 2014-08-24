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
 * @return model's vertices in Array
 */
TmaModelPrimitives.prototype.getVertices = function () {
    return this._vertices;
};

/**
 * Gets texture coord. Address is normalized from 0.0 to 1.0.
 * @return texture coord in Array.
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
          5, 4, 6, 6, 7, 5,
          0, 1, 3, 3, 2, 0];
    this._coords = [
          0, 0, 0, 1, 1, 1, 1, 0,
          0, 0, 0, 1, 1, 1, 1, 0,
          0, 0, 0, 1, 1, 1, 1, 0,
          0, 0, 0, 1, 1, 1, 1, 0,
          0, 0, 0, 1, 1, 1, 1, 0,
          0, 0, 0, 1, 1, 1, 1, 0];
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
 * Creates a cube model.
 * @return A TmaModelPrimitives object containing a cube model
 */
TmaModelPrimitives.createCube = function () {
    var cube = new TmaModelPrimitives();
    cube._createCube();
    return cube;
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
