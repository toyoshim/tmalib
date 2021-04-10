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
    this._normals = [];
    this._coords = [];
    this._indices = [];
    this._colors = [];
    this._verticesBuffer = null;
    this._normalsBuffer = null;
    this._coordsBuffer = null;
    this._indicesBuffer = null;
    this._colorsBuffer = null;
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
 * Gets number of total vertices.
 * @return number of total vertices.
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
 * Gets model's normals array.
 * @return model's normals in Array or Float32Array
 */
TmaModelPrimitives.prototype.getNormals = function () {
    return this._normals;
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
 * Gets model's active vertex indices offset.
 * @return model's vertex indices offset (in bytes)
 */
TmaModelPrimitives.prototype.getIndicesOffset = function () {
    return 0;
};

/**
 * Gets model's active vertex indices length.
 * @return model's vertex indices length (in count)
 */
TmaModelPrimitives.prototype.getIndicesLength = function () {
    return this._indices.length;
};

/**
 * Gets model's colors.
 * @return model's colors in Array
 */
TmaModelPrimitives.prototype.getColors = function () {
    return this._colors;
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
 * Gets an array buffer bound to the normals. It may be created if needed.
 * @param screen a Tma3DScreen object that will be used to create a buffer
 * @return an array buffer object
 */
TmaModelPrimitives.prototype.getNormalsBuffer = function (screen) {
    if (!this._normalsBuffer)
        this._normalsBuffer = screen.createBuffer(this.getNormals());
    return this._normalsBuffer;
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
 * Gets an array buffer bound to the colors. It may be created if needed.
 * @param screen a Tma3DScreen object that will be used to create a buffer
 * @return an array buffer object for colors
 */
TmaModelPrimitives.prototype.getColorsBuffer = function (screen) {
    if (!this._colorsBuffer)
        this._colorsBuffer = screen.createBuffer(this.getColors());
    return this._colorsBuffer;
};

/**
 * Pushes a vertex attributes.
 * @param p position [x, y, z] in the local space.
 * @param coords texture [u, v].
 * @param normal [normal] [x, y, z] for the vertex.
 */
TmaModelPrimitives.prototype.pushVertex = function (p, coords, normal) {
    this._vertices = this._vertices.concat(p);
    this._coords = this._coords.concat(coords);
    if (normal)
        this._normals = this._normals.concat(normal);
    else if (this.getNormals().length != 0)
        this._normals = this._normals.concat([0, 0, 0]);
};

/**
 * Pushes indices for a polygon.
 * @param a the first vertex index
 * @param b the second vertex index
 * @param c the third vertex index
 */
TmaModelPrimitives.prototype.pushPolygon = function (a, b, c) {
    this._indices.push(a);
    this._indices.push(b);
    this._indices.push(c);
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
 * Creates a flat ring model.
 * @param resolution resolution
 * @param ir inner radius
 * @param or outer radius
 */
TmaModelPrimitives.prototype._createFlatRing = function (resolution, ir, or) {
    var max = resolution - 1;
    var delta = 2 * Math.PI / max;
    for (var i = 0; i < resolution; ++i) {
        var t = delta * i;
        var x = Math.cos(t);
        var y = Math.sin(t);
        this._vertices.push(or * x);
        this._vertices.push(or * y);
        this._vertices.push(0);
        this._vertices.push(ir * x);
        this._vertices.push(ir * y);
        this._vertices.push(0);
        this._coords.push(i / max);
        this._coords.push(1);
        this._coords.push(i / max);
        this._coords.push(0);
        this._indices.push(i * 2 + 0);
        this._indices.push(i * 2 + 1);
    }
    this._mode = Tma3DScreen.MODE_TRIANGLE_STRIP;
};

/**
 * Creates a model containing points.
 * @param points an Array containing points, e.g. [x0, y0, z0, x1, y1, z1, ...]
 * @param colors an Array containing colors, as [r0, g0, b0, a0, ...] (optional)
 */
TmaModelPrimitives.prototype._createPoints = function (points, colors) {
    this._vertices = points;
    var count = points.length / 3;
    this._indices = new Array(count);
    this._colors = new Array(count * 4);
    this._coords = null;
    for (var i = 0; i < count; ++i) {
        this._indices[i] = i;
        this._colors[i * 4 + 0] = colors ? colors[i * 4 + 0] : 1.0;
        this._colors[i * 4 + 1] = colors ? colors[i * 4 + 1] : 1.0;
        this._colors[i * 4 + 2] = colors ? colors[i * 4 + 2] : 1.0;
        this._colors[i * 4 + 3] = colors ? colors[i * 4 + 3] : 1.0;
    }
    this._mode = Tma3DScreen.MODE_POINTS;
};

/**
 * Creates a sphere model with evenly divided triangles.
 * @param resolution divition depth
 * @param flag SPHERE_FLAG_NO_TEXTURE (optional)
 */
TmaModelPrimitives.prototype._createSphereEven = function (resolution, flag) {
    // Maybe there are smarter ways to use quotanion or something.
    var no_texture = flag && (flag & TmaModelPrimitives.SPHERE_FLAG_NO_TEXTURE);
    var square = [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ -1, 0, 0 ], [ 0, -1, 0 ] ];
    var pushVertex = function (v, p) {
        var length = this._vertices.length / 3;
        var x = 0.5 + Math.atan2(v[1], v[0]) / Math.PI / 2;
        if (x == 0.0 && p)
            x = 1.0;
        if (x == 1.0 && !p)
            x = 0.0;
        var y = 1 - Math.acos(v[2]) / Math.PI;
        for (var i = 0; i < length; ++i) {
            // TODO: Make following checks use hash if it costs.
            if (this._vertices[i * 3 + 0] != v[0] ||
                this._vertices[i * 3 + 1] != v[1] ||
                this._vertices[i * 3 + 2] != v[2] ||
                (!no_texture && (
                    this._coords[i * 2 + 0] != x ||
                    this._coords[i * 2 + 1] != y)))
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
    if (no_texture)
        this._mode = Tma3DScreen.MODE_LINE_TRIANGLES;
};

TmaModelPrimitives.SPHERE_METHOD_THEODOLITE = 0;
TmaModelPrimitives.SPHERE_METHOD_EVEN = 1;
TmaModelPrimitives.SPHERE_FLAG_NO_TEXTURE = 1;

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
 * Creates a flat ring model.
 * @param resolution resolution
 * @param ir inner radius
 * @param or outer radius
 * @return A TmaModelPromitives object containing a flat ring model
 */
TmaModelPrimitives.createFlagRing = function (resolution, ir, or) {
    var ring = new TmaModelPrimitives();
    ring._createFlatRing(resolution, ir, or);
    return ring;
};

/**
 * Creates a model containing points.
 * @param points an Array containing points, e.g. [x0, y0, z0, x1, y1, z1, ...]
 * @param colors an Array containing colors, as [r0, g0, b0, a0, ...] (optional)
 * @return A TmaModelPrimitives object containing points
 */
TmaModelPrimitives.createPoints = function (points, colors) {
    var model = new TmaModelPrimitives();
    model._createPoints(points, colors);
    return model;
};

/**
 * Creates a model containing stars.
 * @param stars total number of starts
 * @param range space size in float for x, y, z being between -space and space
 * @return A TmaModelPrimitives object containing stars
 */
TmaModelPrimitives.createStars = function (stars, space) {
    var model = new TmaModelPrimitives();
    var points = new Array(stars * 3);
    var colors = new Array(stars * 4);
    for (var i = 0; i < stars; ++i) {
        points[i * 3 + 0] = space * (Math.random() * 2 - 1);
        points[i * 3 + 1] = space * (Math.random() * 2 - 1);
        points[i * 3 + 2] = space * (Math.random() * 2 - 1);
        // Avoid green-ish colors thouse H is in 60-240.
        var h = (240 + Math.random() * 180) % 360;
        var s = Math.random() * Math.random() * Math.random();
        if (250 < h && h < 280)
            s = Math.random * 0.1;
        var rgb = TmaScreen.HSV2RGB(h, s, Math.random());
        colors[i * 4 + 0] = rgb.r / 255;
        colors[i * 4 + 1] = rgb.g / 255;
        colors[i * 4 + 2] = rgb.b / 255;
        colors[i * 4 + 3] = 1;  // Always set max value as a alpha
    }
    model._createPoints(points, colors);
    return model;
};

/**
 * Creates a sphere model.
 * @param resolution mesh resolution
 * @param method SPHERE_METHOD_THEODOLITE or SPHERE_METHOD_EVEN
 * @param flag SPHERE_FLAG_NO_TEXTURE (optional)
 * @return A TmaModelPrimitives object containing a sphere model
 */
TmaModelPrimitives.createSphere = function (resolution, method, flag) {
    var sphere = new TmaModelPrimitives();
    // TODO: implement theodolite method.
    sphere._createSphereEven(resolution, flag);
    return sphere;
};

// node.js compatible export.
exports.TmaModelPrimitives = TmaModelPrimitives;
