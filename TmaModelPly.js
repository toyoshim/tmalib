/**
 * T'MediaArt library for JavaScript.
 */

/**
 * TmaModelPly prototype
 *
 * This prototype provide utility functions to handle ply files.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
function TmaModelPly() {
    this._vertices = [];
    this._normals = [];
    this._coord = [];
    this._indices = [];
}

/**
 * Loads a model data in ply format.
 * @param data ArrayBuffer
 * @return true if specified |data| is in valid ply format
 */
TmaModelPly.prototype.load = function (data) {
    var reader = new (function(arrayBuffer) {
        this._data = new Uint8Array(arrayBuffer);
        this._offset = 0;
        this.readNextLine = function() {
            var array = [];
            var i = this._offset;
            for (; i < this._data.byteLength; ++i) {
                if (this._data[i] == 0x0d || this._data[i] == 0x0a)
                    break;
                if (array[array.length - 1] != ' ' || this._data[i] != 0x20)
                    array.push(String.fromCharCode(this._data[i]));
            }
            if (array.length == 0)
                return null;
            if (this._data[i] == 0x0d)
                if (i + 1 < this._data.byteLength && this._data[i + 1] == 0x0a)
                    ++i;
            if (i != this._data.byteLength)
                i++;
            this._offset = i;
            while (array[array.length - 1] == ' ')
                array.pop();
            return array.join('');
        };
        this.next = function() {
            var line = this.readNextLine();
            if (!line)
                return null;
            return line.split(' ');
        };
    })(data);
    var magic = reader.readNextLine();
    if (magic != 'ply') {
        tma.error('ply: can not find magic word \'ply\'');
        return false;
    }
    var format = false;
    var eoh = false;
    var structure = {};
    var element = null;
    while (!eoh) {
        var line = reader.next();
        switch (line[0]) {
            case 'comment':
                line.shift();
                tma.info('ply: header comment: ' + line.join(' '));
                break;
            case 'element':
                if (line.length != 3) {
                    tma.error('ply: format error: ' + line.join(' '));
                    return false;
                }
                structure[line[1]] = element = {};
                element.count = parseInt(line[2]);
                element.keys = 0;
                element.key = {};
                element.data = [];
                break;
            case 'end_header':
                eoh = true;
                break;
            case 'format':
                if (line.length != 3 || line[1] != 'ascii' ||
                        line[2] != '1.0') {
                    tma.error('ply: unknown ' + line.join(' '));
                    return false;
                }
                format = true;
                break;
            case 'property':
                if (!element) {
                    tma.error('ply: property should follow element: ' +
                            line.join(' '));
                    return false;
                }
                if (line.length != 3 && line[1] != 'list') {
                    tma.error('ply: format error: ' + line.join(' '));
                    return false;
                }
                if (line[1] == 'list') {
                    element.key[line[line.length - 1]] = {
                        index: element.keys++,
                        type: line[1]
                    };
                } else if (line[1] == 'float' || line[1] == 'float32') {
                    element.key[line[2]] = {
                        index: element.keys++,
                        type: line[1]
                    };
                } else {
                    tma.error('ply: type ' + line[1] + ' is not supported');
                }
                break;
            default:
                tma.error('ply: unknown header: ' + line.join(' '));
                return false;
        }
    }
    if (!format) {
        tma.error('ply: format is not specified');
        return false;
    }
    if (!structure['vertex'] || !structure['vertex']['key']['x'] ||
            !structure['vertex']['key']['y'] ||
            !structure['vertex']['key']['z']) {
        tma.error('ply: vertex element with x, y, and z is not found');
        return false;
    }
    for (var vertex = 0; vertex < structure.vertex.count; vertex++) {
        var vertexData = reader.next();
        if (vertexData.length != structure.vertex.keys) {
            tma.error('ply: vertex element doesn\'t contain enough properties');
            return false;
        }
        var vertices = [];
        for (i = 0; i < vertexData.length; ++i)
            vertices.push(parseFloat(vertexData[i]));
        structure.vertex.data.push(vertices);
    }
    if (!structure['face']) {
        tma.error('ply: face element is not found');
        return false;
    }
    for (var face = 0; face < structure.face.count; face++) {
        var faceData = reader.next();
        if (faceData.length != (parseInt(faceData[0]) + 1)) {
            tma.error('ply: face element doesn\'t contain enough properties');
            return false;
        }
        var faces = [];
        for (i = 0; i < faceData.length; ++i)
            faces.push(parseInt(faceData[i]));
        structure.face.data.push(faces);
    }
    for (i = 0; i < structure.vertex.count; ++i) {
        this._vertices.push(
                structure.vertex.data[i][structure.vertex.key.x.index]);
        this._vertices.push(
                structure.vertex.data[i][structure.vertex.key.y.index]);
        this._vertices.push(
                structure.vertex.data[i][structure.vertex.key.z.index]);
    }
    for (i = 0; i < structure.face.count; ++i) {
        if (structure.face.data[i].length == 4) {
            // triangles.
            this._indices.push(structure.face.data[i][1]);
            this._indices.push(structure.face.data[i][2]);
            this._indices.push(structure.face.data[i][3]);
        } else {
            // quads
            this._indices.push(structure.face.data[i][1]);
            this._indices.push(structure.face.data[i][2]);
            this._indices.push(structure.face.data[i][3]);
            this._indices.push(structure.face.data[i][3]);
            this._indices.push(structure.face.data[i][4]);
            this._indices.push(structure.face.data[i][1]);
        }
    }
    return true;
};

/**
 * Modifies all vertices by the specified |scale|.
 * @param scale scale factor
 */
TmaModelPly.prototype.scale = function (scale) {
    for (var i = 0; i < this._vertices.length; ++i)
        this._vertices[i] *= scale;
};

/**
 * Gets model's vertices array.
 * @return model's vertices in Array
 */
TmaModelPly.prototype.getVertices = function () {
    return this._vertices;
};

/**
 * Gets texture coord. Address is normalized from 0.0 to 1.0.
 * @return texture coord in Array.
 */
TmaModelPly.prototype.getCoords = function () {
    return this._coord;
};

TmaModelPly.prototype.getIndices = function () {
    return this._indices;
};

// node.js compatible export.
exports.TmaModelPly = TmaModelPly;
