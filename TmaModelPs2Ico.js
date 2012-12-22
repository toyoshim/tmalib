/**
 * T'MediaArt library for JavaScript.
 */

/**
 * TmaModelPs2Ico prototype
 *
 * This prototype provide utility functions to handle PlayStation 2 ico files.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
function TmaModelPs2Ico() {
    this.shapes = 0;
    this.frames = 0;
    this._vertices = null;
    this._coord = null;
    this._texture = null;
    this._weights = null;
}

/**
 * Private constant variables.
 */
TmaModelPs2Ico._OFFSET_VERSION = 0;
TmaModelPs2Ico._OFFSET_NBSP = 4;
TmaModelPs2Ico._OFFSET_ATTRIB = 8;
TmaModelPs2Ico._OFFSET_BFACE = 12;
TmaModelPs2Ico._OFFSET_NBVTX = 16;
TmaModelPs2Ico._OFFSET_VTX = 20;

TmaModelPs2Ico._ATTRIB_IIP = 1;
TmaModelPs2Ico._ATTRIB_ANTI = 2;
TmaModelPs2Ico._ATTRIB_TEX = 4;
TmaModelPs2Ico._ATTRIB_RLE = 8;

/**
 * Loads a model data in PlayStation 2 ICO format.
 * @param data ArrayBuffer
 * @return true if specified |data| is in valid ICO format
 */
TmaModelPs2Ico.prototype.load = function (data) {
    var view = new DataView(data);
    var version = view.getUint32(TmaModelPs2Ico._OFFSET_VERSION, true);
    if (version != 0x00010000) {
        tma.error('PS2ICO: Unknown version format');
        return false;
    }
    tma.info('PS2ICO: version 1.00');
    var nbsp = view.getUint32(TmaModelPs2Ico._OFFSET_NBSP, true);
    this.shapes = nbsp;
    tma.info('PS2ICO: shapes ' + nbsp);
    var attrib = view.getUint32(TmaModelPs2Ico._OFFSET_ATTRIB, true);
    tma.info('PS2ICO: attributes ' + attrib.toString(16));
    if (attrib & TmaModelPs2Ico._ATTRIB_RLE) {
        tma.error('PS2ICO: run-length encoding texture is not supported');
        return false;
    }
    var bface = view.getFloat32(TmaModelPs2Ico._OFFSET_BFACE, true);
    tma.info('PS2ICO: back face clip ' + bface);
    var nbvtx = view.getUint32(TmaModelPs2Ico._OFFSET_NBVTX, true);
    tma.info('PS2ICO: vertices ' + nbvtx);

    // Model vertices
    var offset = TmaModelPs2Ico._OFFSET_VTX;
    this._vertices = new Array(nbsp);
    for (var shape = 0; shape < nbsp; ++shape)
        this._vertices[shape] = new Array(nbvtx * 3);
    this._coord = new Array(nbvtx * 2);
    for (var i = 0; i < nbvtx; ++i) {
        for (shape = 0; shape < nbsp; ++shape) {
            var vx = view.getInt16(offset + 0, true) / 1024;
            var vy = -view.getInt16(offset + 2, true) / 1024;
            var vz = -view.getInt16(offset + 4, true) / 1024;
            this._vertices[shape][i * 3 + 0] = vx;
            this._vertices[shape][i * 3 + 1] = vy;
            this._vertices[shape][i * 3 + 2] = vz;
            offset += 8;
        }

        var nx = view.getInt16(offset + 0, true) / 4096;
        var ny = view.getInt16(offset + 2, true) / 4096;
        var nz = view.getInt16(offset + 4, true) / 4096;
        offset += 8;

        var sx = view.getInt16(offset + 0, true) / 4096;
        var sy = view.getInt16(offset + 2, true) / 4096;
        this._coord[i * 2 + 0] = sx;
        this._coord[i * 2 + 1] = 1 - sy;
        offset += 4;

        var color = view.getUint32(offset, false);  // RGBA
        offset += 4;
    }

    // Animation section
    tma.info('PS2ICO: animation data start at 0x' + offset.toString(16));
    var nbseq = view.getUint32(offset, true);
    tma.info('PS2ICO: sequences ' + nbseq);
    if (nbseq != 1) {
        tma.error('PS2ICO: nbseq must be 1');
        return false;
    }
    offset += 4;

    var nbframe = view.getUint32(offset + 0, true);
    var playSpeed = view.getFloat32(offset + 4, true);
    var playOffset = view.getUint32(offset + 8, true);
    var nbksp = view.getUint32(offset + 12, true);
    tma.info('PS2ICO: frames ' + nbframe);
    tma.info('PS2ICO: speed ' + playSpeed);
    tma.info('PS2ICO: offset ' + playOffset);
    tma.info('PS2ICO: nbksp ' + nbksp);
    this.frames = nbframe;
    this._weights = new Array(nbframe);
    for (i = 0; i < nbframe; ++i)
        this._weights[i] = new Array(nbksp);
    offset += 16;
    for (i = 0; i < nbksp; ++i) {
        var kspid = view.getUint32(offset + 0, true);
        var nbkf = view.getUint32(offset + 4, true);
        offset += 8;
        tma.info('PS2ICO: animation ' + kspid);
        var previousFrame = 0;
        var previousWeight = 0;
        for (var key = 0; key < nbkf; ++key) {
            var frame = view.getFloat32(offset + 0, true);
            var weight = view.getFloat32(offset + 4, true);
            var distance = frame - previousFrame;
            if (distance == 0) {
                previousFrame = frame;
                previousWeight = weight;
            } else {
                var diff = weight - previousWeight;
                var step = diff / distance;
                for (var currentFrame = previousFrame; currentFrame < frame;
                        ++currentFrame) {
                    this._weights[currentFrame][i] = previousWeight;
//                    tma.info('PS2ICO: > ... ' + currentFrame + ':' +
//                            previousWeight);
                    previousWeight += step;
                }
                previousFrame = currentFrame;
                previousWeight = weight;
            }
            tma.info('PS2ICO: > ' + frame + ',' + weight);
            offset += 8;
        }
        for (; previousFrame < 60; ++previousFrame)
            this._weights[previousFrame][i] = previousWeight;
    }

    // Texture section
    if (data.byteLength - offset != 32768) {
        tma.error('PS2ICO: texture data size is wrong')
        return false;
    }
    this._texture = new Array(128 * 128 * 4);
    for (i = 0; i < this._texture.length; i += 4) {
        var psmct16 = view.getUint16(offset, true);
        offset += 2;
        this._texture[i + 0] = ((psmct16 >>  0) & 0x1f) << 3;
        this._texture[i + 1] = ((psmct16 >>  5) & 0x1f) << 3;
        this._texture[i + 2] = ((psmct16 >> 10) & 0x1f) << 3;
        this._texture[i + 3] = 0xff;
    }
    return true;
};

/**
 * Modifies all vertices by the specified |scale|.
 * @param scale scale factor
 */
TmaModelPs2Ico.prototype.scale = function (scale) {
    for (var shape = 0; shape < this.shapes; ++shape) {
        var vertices = this._vertices[shape];
        for (var i = 0; i < vertices.length; ++i)
            vertices[i] *= scale;
    }
};

/**
 * Gets model's vertices array of a shape.
 * @param shape shape number
 * @return model's vertices in Array
 */
TmaModelPs2Ico.prototype.getVertices = function (shape) {
    return this._vertices[shape];
};

/**
 * Gets texture coord. Address is normalized from 0.0 to 1.0.
 * @return texture coord in Array.
 */
TmaModelPs2Ico.prototype.getCoords = function () {
    return this._coord;
};

/**
 * Gets texture data. Texture image is always 128 x 128 in RGBA.
 * @return texture data in Array
 */
TmaModelPs2Ico.prototype.getTexture = function () {
    return this._texture;
};

/**
 * Gets shape weights data for a frame.
 * @param frame frame number from 0 to |this.frames| - 1
 * @return weights in Array
 */
TmaModelPs2Ico.prototype.getWeights = function (frame) {
    return this._weights[frame];
};

// node.js compatible export.
exports.TmaModelPs2Ico = TmaModelPs2Ico;
