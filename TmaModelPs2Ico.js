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
    for (var i = 0; i < nbvtx; ++i) {
        // TODO: Handle minor vertices.
        var vx = view.getInt16(offset + 0, true) / 1024;
        var vy = view.getInt16(offset + 2, true) / 1024;
        var vz = view.getInt16(offset + 4, true) / 1024;
        offset += 8 * nbsp;

        var nx = view.getInt16(offset + 0, true) / 4096;
        var ny = view.getInt16(offset + 2, true) / 4096;
        var nz = view.getInt16(offset + 4, true) / 4096;
        offset += 8;

        var sx = view.getInt16(offset + 0, true) / 16;
        var sy = 256 - view.getInt16(offset + 2, true) / 16;
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
    offset += 16;
    for (i = 0; i < nbksp; ++i) {
        var kspid = view.getUint32(offset + 0, true);
        var nbkf = view.getUint32(offset + 4, true);
        offset += 8 + 8 * nbkf;
    }

    // Texture section
    if (data.byteLength - offset != 32768) {
        tma.error('PS2ICO: texture data size is wrong')
        return false;
    }
    return true;
};

// node.js compatible export.
exports.TmaModelPs2Ico = TmaModelPs2Ico;
