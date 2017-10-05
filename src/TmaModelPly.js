/**
 * T'MediaArt library for JavaScript.
 */

/**
 * TmaModelPly prototype
 *
 * This prototype provides utility functions to handle ply files.
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
    var reader = new (function(input) {
        if (typeof input == 'string') {
            this._data = input;
            this._cr = '\r';
            this._lf = '\n';
            this._sp = ' ';
            this._conv = function (c) { return c; };
        } else {
            this._data = new Uint8Array(input);
            this._cr = 0x0d;
            this._lf = 0x0a;
            this._sp = 0x20;
            this._conv = function (c) { return String.fromCharCode(c); };
        }
        this._offset = 0;
        this.readNextLine = function() {
            var array = [];
            var i = this._offset;
            for (; i < this._data.length; ++i) {
                if (this._data[i] == this._cr || this._data[i] == this._lf)
                    break;
                if (array[array.length - 1] != ' ' ||
                        this._data[i] != this._sp) {
                    array.push(this._conv(this._data[i]));
                }
            }
            if (array.length == 0 && i == this._data.length)
                return null;
            if (this._data[i] == this._cr)
                if (i + 1 < this._data.length && this._data[i + 1] == this._lf)
                    ++i;
            if (i != this._data.length)
                i++;
            this._offset = i;
            while (array.length > 0 && array[array.length - 1] == ' ')
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
    var magic;
    do {
        magic = reader.readNextLine();
    } while (magic !== null && magic.length == 0);
    if (magic === null || magic != 'ply') {
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
                element.is_list = [];
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
                    element.is_list[element.keys] = true;
                    element.key[line[line.length - 1]] = {
                        index: element.keys++,
                        type: line[1],
                        list_type: line[3]
                    };
                } else if (line[1] == 'float' || line[1] == 'float32' ||
                        line[1] == 'int' || line[1] == 'uchar') {
                    element.is_list[element.keys] = false;
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
        if (faceData.length < structure.face.keys) {
            tma.error('ply: face element doesn\'t contain enough properties');
            return false;
        }
        var faces = [];
        var index = 0;
        for (i = 0; i < faceData.length; ++i) {
            if (structure.face.is_list[index++]) {
                var n = parseInt(faceData[i]);
                var list = [];
                for (var j = 0; j < n; ++j)
                    list.push(parseFloat(faceData[i + j + 1]));
                i += n;
                faces.push(list);
            } else {
                faces.push(parseFloat(faceData[i]));
            }
        }
        structure.face.data.push(faces);
    }
    delete structure.face.is_list;
    for (i = 0; i < structure.vertex.count; ++i) {
        this._vertices.push(
                structure.vertex.data[i][structure.vertex.key.x.index]);
        this._vertices.push(
                structure.vertex.data[i][structure.vertex.key.y.index]);
        this._vertices.push(
                structure.vertex.data[i][structure.vertex.key.z.index]);
    }
    var indices_index = structure.face.key.vertex_indices.index;
    for (i = 0; i < structure.face.count; ++i) {
        if (structure.face.data[i][indices_index].length == 3) {
            // triangles.
            this._indices.push(structure.face.data[i][indices_index][0]);
            this._indices.push(structure.face.data[i][indices_index][1]);
            this._indices.push(structure.face.data[i][indices_index][2]);
        } else {
            // quads
            this._indices.push(structure.face.data[i][indices_index][0]);
            this._indices.push(structure.face.data[i][indices_index][1]);
            this._indices.push(structure.face.data[i][indices_index][2]);
            this._indices.push(structure.face.data[i][indices_index][2]);
            this._indices.push(structure.face.data[i][indices_index][3]);
            this._indices.push(structure.face.data[i][indices_index][0]);
        }
    }
    var texcoord_index = structure.face.key.texcoord.index;
    if (texcoord_index !== undefined) {
        this._coords = new Array(structure.vertex.count * 2);
        for (i = 0; i < structure.face.count; ++i) {
            if (structure.face.data[i][texcoord_index].length == 6) {
                this._coords[structure.face.data[i][indices_index][0] * 2 + 0] = structure.face.data[i][texcoord_index][0];
                this._coords[structure.face.data[i][indices_index][0] * 2 + 1] = structure.face.data[i][texcoord_index][1];
                this._coords[structure.face.data[i][indices_index][1] * 2 + 0] = structure.face.data[i][texcoord_index][2];
                this._coords[structure.face.data[i][indices_index][1] * 2 + 1] = structure.face.data[i][texcoord_index][3];
                this._coords[structure.face.data[i][indices_index][2] * 2 + 0] = structure.face.data[i][texcoord_index][4];
                this._coords[structure.face.data[i][indices_index][2] * 2 + 1] = structure.face.data[i][texcoord_index][5];
            }
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
 * @return texture coord in Array
 */
TmaModelPly.prototype.getCoords = function () {
    return this._coords;
};

/**
 * Gets model's vertex indices.
 * @return model's vertex indices in Array
 */
TmaModelPly.prototype.getIndices = function () {
    return this._indices;
};

// node.js compatible export.
exports.TmaModelPly = TmaModelPly;
