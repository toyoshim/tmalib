/**
 * T'MediaArt library for JavaScript.
 */

/**
 * TmaMotionBvh prototype
 *
 * This prototype provide utility functions to handle BVH files.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
function TmaMotionBvh() {
    this.frameLength = 0;  // contains total frame number
    this.frameTime = 0;  // contains frame tick time
    this._frameData = [];  // contains frame data
    this._root = null;  // contains skeleton structure
}

/**
 * Private constant variables.
 */
TmaMotionBvh._CODE_A = 'A'.charCodeAt(0);
TmaMotionBvh._CODE_Z = 'Z'.charCodeAt(0);
TmaMotionBvh._CODE_a = 'a'.charCodeAt(0);
TmaMotionBvh._CODE_z = 'z'.charCodeAt(0);
TmaMotionBvh._CODE_0 = '0'.charCodeAt(0);
TmaMotionBvh._CODE_9 = '9'.charCodeAt(0);
TmaMotionBvh._CODE_DOT = '.'.charCodeAt(0);
TmaMotionBvh._CODE_MINUS = '-'.charCodeAt(0);

TmaMotionBvh._CASE_CHANNELS = 'C'.charCodeAt(0);
TmaMotionBvh._CASE_ENDSITE = 'E'.charCodeAt(0);
TmaMotionBvh._CASE_FRAME = 'F'.charCodeAt(0);
TmaMotionBvh._CASE_HIERARCHY = 'H'.charCodeAt(0);
TmaMotionBvh._CASE_JOINT = 'J'.charCodeAt(0);
TmaMotionBvh._CASE_MOTION = 'M'.charCodeAt(0);
TmaMotionBvh._CASE_OFFSET = 'O'.charCodeAt(0);
TmaMotionBvh._CASE_ROOT = 'R'.charCodeAt(0);
TmaMotionBvh._CASE_X = 'X'.charCodeAt(0);
TmaMotionBvh._CASE_Y = 'Y'.charCodeAt(0);
TmaMotionBvh._CASE_Z = 'Z'.charCodeAt(0);
TmaMotionBvh._CASE_POSITION = 'p'.charCodeAt(0);
TmaMotionBvh._CASE_ROTATION = 'r'.charCodeAt(0);
TmaMotionBvh._CASE_BEGIN = '{'.charCodeAt(0);
TmaMotionBvh._CASE_END = '}'.charCodeAt(0);
TmaMotionBvh._CASE_SP = ' '.charCodeAt(0);
TmaMotionBvh._CASE_CR = '\r'.charCodeAt(0);
TmaMotionBvh._CASE_LF = '\n'.charCodeAt(0);

TmaMotionBvh._KEY_CHANNELS = "CHANNELS";
TmaMotionBvh._KEY_ENDSITE = "End Site";
TmaMotionBvh._KEY_HIERARCHY = "HIERARCHY";
TmaMotionBvh._KEY_JOINT = "JOINT";
TmaMotionBvh._KEY_MOTION = "MOTION";
TmaMotionBvh._KEY_OFFSET = "OFFSET";
TmaMotionBvh._KEY_ROOT = "ROOT";
TmaMotionBvh._KEY_POSITION = "position";
TmaMotionBvh._KEY_ROTATION = "rotation";
TmaMotionBvh._KEY_FRAMES = "Frames: ";
TmaMotionBvh._KEY_FRAME_TIME = "Frame Time: ";

TmaMotionBvh._ID_UNKNOWN = -2;
TmaMotionBvh._ID_EOF = -1;
TmaMotionBvh._ID_CHANNELS = 1;
TmaMotionBvh._ID_ENDSITE = 2;
TmaMotionBvh._ID_HIERARCHY = 3;
TmaMotionBvh._ID_JOINT = 4;
TmaMotionBvh._ID_MOTION = 5;
TmaMotionBvh._ID_OFFSET = 6;
TmaMotionBvh._ID_ROOT = 7;
TmaMotionBvh._ID_XPOSITION = 8;
TmaMotionBvh._ID_YPOSITION = 9;
TmaMotionBvh._ID_ZPOSITION = 10;
TmaMotionBvh._ID_XROTATION = 11;
TmaMotionBvh._ID_YROTATION = 12;
TmaMotionBvh._ID_ZROTATION = 13;
TmaMotionBvh._ID_BEGIN = 14;
TmaMotionBvh._ID_END = 15;
TmaMotionBvh._ID_NAME = 16;
TmaMotionBvh._ID_NUMBER = 17;
TmaMotionBvh._ID_FRAMES = 18;
TmaMotionBvh._ID_FRAME_TIME = 19;

/**
 * Private function to check if |code| is a number.
 * @param code an ascii code to be checked
 * @return true if specified |code| is a number
 */
TmaMotionBvh._isNumber = function (code) {
    if ((TmaMotionBvh._CODE_0 <= code) && (code <= TmaMotionBvh._CODE_9))
        return true;
    return false;
};

/**
 * Private function to check if |code| is an alphabet.
 * @param code an ascii code to be checked
 * @return true if specified |code| is an alphabet
 */
TmaMotionBvh._isAlphabet = function (code) {
    if ((TmaMotionBvh._CODE_A <= code) && (code <= TmaMotionBvh._CODE_Z))
        return true;
    if ((TmaMotionBvh._CODE_a <= code) && (code <= TmaMotionBvh._CODE_z))
        return true;
    return false;
};

/**
 * Private function to check data specified by |context| start with |key|.
 * @param context an object containing;
 *      data: Uint8Array contains input data
 *      offset: point to start parsing
 * @param key an string with which start
 * @return true if |context| start with |key|
 */
TmaMotionBvh._checkKey = function (context, key) {
    var length = key.length;
    if (context.offset + length > context.byteLength)
        return false;
    for (var i = 0; i < length; i++) {
        if (context.data[context.offset + i] != key.charCodeAt(i))
            return false;
    }
    context.offset += length;
    return true;
};

/**
 * Private function to parse root, joint, or end site structure.
 * @param context an object containing;
 *      data: Uint8Array contains input data
 *      offset: point to start parsing
 * @param joint object to which stores result containing;
 *      site: true if this joint contains an end site structure
 *      offset: an object contains an offset vector like;
 *          x: X offset
 *          y: Y offset
 *          z: Z offset
 *      joint: an array contains child joints
 *      channels: an object representing degree of freedom like;
 *          Xposition: true if this joint has X position channel
 *          Yposition: true if this joint has Y position channel
 *          Zposition: true if this joint has Z position channel
 *          Xrotation: true if this joint has X rotation channel
 *          Yrotation: true if this joint has Y rotation channel
 *          Zrotation: true if this joint has Z rotation channel
 *      totalChannels: number of channels in this and child joints.
 * @param site true if parsing target is end site structure
 * @return true if parser finishes successfully
 */
TmaMotionBvh._parseJoint = function (context, joint, site) {
    var result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_BEGIN != result.id) {
        tma.error("BVH: JOINT/End Site doesn't start with '{'");
        return false;
    }
    joint.site = site;
    joint.joint = [];
    joint.totalChannels = 0;
    for (;;) {
        result = TmaMotionBvh._parse(context);
        switch (result.id) {
            case TmaMotionBvh._ID_CHANNELS:
                if (site) {
                    tma.error("BVH: End Site can not have a " +
                        "CHANNELS");
                    return false;
                }
                result = TmaMotionBvh._parse(context);
                if (TmaMotionBvh._ID_NUMBER != result.id) {
                    tma.error("BVH: CHANNELS requires a number");
                    return false;
                }
                var idMax = result.value;
                joint.channels = {
                    Xposition: false,
                    Yposition: false,
                    Zposition: false,
                    Xrotation: false,
                    Yrotation: false,
                    Zrotation: false
                };
                for (var id = 0; id < idMax; id++) {
                        result = TmaMotionBvh._parse(context);
                    switch (result.id) {
                        case TmaMotionBvh._ID_XPOSITION:
                            joint.channels.Xposition = true;
                            break;
                        case TmaMotionBvh._ID_YPOSITION:
                            joint.channels.Yposition = true;
                            break;
                        case TmaMotionBvh._ID_ZPOSITION:
                            joint.channels.Zposition = true;
                            break;
                        case TmaMotionBvh._ID_XROTATION:
                            joint.channels.Xrotation = true;
                            break;
                        case TmaMotionBvh._ID_YROTATION:
                            joint.channels.Yrotation = true;
                            break;
                        case TmaMotionBvh._ID_ZROTATION:
                            joint.channels.Zrotation = true;
                            break;
                        default:
                            tma.error("BVH: CHANNELS has unknown " +
                                "channel keyword");
                            return false;
                    }
                }
                joint.totalChannels += idMax;
                break;
            case TmaMotionBvh._ID_END:
                return true;
            case TmaMotionBvh._ID_ENDSITE:
                var endSite = { name: "End Site" };
                tma.log("BVH: End Site");
                joint.joint.push(endSite);
                if (!TmaMotionBvh._parseJoint(context, endSite, true))
                    return false;
                break;
            case TmaMotionBvh._ID_JOINT:
                if (site) {
                    tma.error("BVH: End Site can not have a JOINT");
                    return false;
                }
                result = TmaMotionBvh._parse(context);
                if (TmaMotionBvh._ID_NAME != result.id) {
                    tma.error("BVH: JOINT doesn't have a name");
                    return false;
                }
                var childJoint = { name: result.value };
                tma.log("BVH: JOINT " + result.value);
                joint.joint.push(childJoint);
                if (!TmaMotionBvh._parseJoint(context, childJoint, false))
                    return false;
                joint.totalChannels += childJoint.totalChannels;
                break;
            case TmaMotionBvh._ID_OFFSET:
                result = TmaMotionBvh._parse(context);
                if (TmaMotionBvh._ID_NUMBER == result.id) {
                    var x = result.value;
                    result = TmaMotionBvh._parse(context);
                    if (TmaMotionBvh._ID_NUMBER == result.id) {
                        var y = result.value;
                        result = TmaMotionBvh._parse(context);
                        if (TmaMotionBvh._ID_NUMBER == result.id) {
                            var z = result.value;
                            joint.offset = { x: x, y: y, z: z };
                            break;
                        }
                    }
                }
                tma.error("BVH: OFFSET requires three numbers");
                return false;
            default:
                tma.error("BVH: internal error");
                return false;
        }
    }
    return true;
};

/**
 * Private function to parse data in BVH format.
 * @param context an object containing;
 *      data: Uint8Array contains input data
 *      offset: point to start parsing
 * @return true if parser finishes successfully
 */
TmaMotionBvh._parse = function (context) {
    var length = context.data.byteLength;
    for (var unknown = { id: TmaMotionBvh._ID_UNKNOWN };
         context.offset < length; context.offset++) {
        var first = context.data[context.offset];
        var ids = [];
        switch (first) {
            case TmaMotionBvh._CASE_CHANNELS:
                if (!TmaMotionBvh._checkKey(
                    context, TmaMotionBvh._KEY_CHANNELS))
                    break;
                return { id: TmaMotionBvh._ID_CHANNELS };
            case TmaMotionBvh._CASE_ENDSITE:
                if (!TmaMotionBvh._checkKey(
                    context, TmaMotionBvh._KEY_ENDSITE))
                    break;
                return { id: TmaMotionBvh._ID_ENDSITE };
            case TmaMotionBvh._CASE_FRAME:
                if (TmaMotionBvh._checkKey(context, TmaMotionBvh._KEY_FRAMES))
                    return { id: TmaMotionBvh._ID_FRAMES };
                if (TmaMotionBvh._checkKey(
                    context, TmaMotionBvh._KEY_FRAME_TIME))
                    return { id: TmaMotionBvh._ID_FRAME_TIME };
                break;
            case TmaMotionBvh._CASE_HIERARCHY:
                if (!TmaMotionBvh._checkKey(
                    context, TmaMotionBvh._KEY_HIERARCHY))
                    break;
                return { id: TmaMotionBvh._ID_HIERARCHY };
            case TmaMotionBvh._CASE_JOINT:
                if (!TmaMotionBvh._checkKey(context, TmaMotionBvh._KEY_JOINT))
                    break;
                return { id: TmaMotionBvh._ID_JOINT };
            case TmaMotionBvh._CASE_MOTION:
                if (!TmaMotionBvh._checkKey(context, TmaMotionBvh._KEY_MOTION))
                    break;
                return { id: TmaMotionBvh._ID_MOTION };
            case TmaMotionBvh._CASE_OFFSET:
                if (!TmaMotionBvh._checkKey(context, TmaMotionBvh._KEY_OFFSET))
                    break;
                return { id: TmaMotionBvh._ID_OFFSET };
            case TmaMotionBvh._CASE_ROOT:
                if (!TmaMotionBvh._checkKey(context, TmaMotionBvh._KEY_ROOT))
                    break;
                return { id: TmaMotionBvh._ID_ROOT };
            case TmaMotionBvh._CASE_X:
                ids = [ TmaMotionBvh._ID_XPOSITION,
                    TmaMotionBvh._ID_XROTATION ];
                break;
            case TmaMotionBvh._CASE_Y:
                ids = [ TmaMotionBvh._ID_YPOSITION,
                    TmaMotionBvh._ID_YROTATION ];
                break;
            case TmaMotionBvh._CASE_Z:
                ids = [ TmaMotionBvh._ID_ZPOSITION,
                    TmaMotionBvh._ID_ZROTATION ];
                break;
            case TmaMotionBvh._CASE_BEGIN:
                context.offset++;
                return { id: TmaMotionBvh._ID_BEGIN };
            case TmaMotionBvh._CASE_END:
                context.offset++;
                return { id: TmaMotionBvh._ID_END };
            case TmaMotionBvh._CASE_SP:
            case TmaMotionBvh._CASE_CR:
            case TmaMotionBvh._CASE_LF:
                continue;
            default:
                break;
        }
        if ((0 != ids.length) && ((context.offset + 1) < length)) {
            var second = context.data[++context.offset];
            if (TmaMotionBvh._CASE_POSITION == second) {
                if (TmaMotionBvh._checkKey(
                    context, TmaMotionBvh._KEY_POSITION))
                    return { id: ids[0] };
            } else if (TmaMotionBvh._CASE_ROTATION == second) {
                if (TmaMotionBvh._checkKey(
                    context, TmaMotionBvh._KEY_ROTATION))
                    return { id: ids[1] };
            }
            context.offset--;
        }
        var code;
        if (TmaMotionBvh._isAlphabet(context.data[context.offset])) {
            for (var name = []; context.offset < context.data.byteLength;
                 context.offset++) {
                code = context.data[context.offset];
                if (!TmaMotionBvh._isAlphabet(code) &&
                    !TmaMotionBvh._isNumber(code))
                    break;
                name.push(String.fromCharCode(code));
            }
            return { id: TmaMotionBvh._ID_NAME, value: name.join('') };
        }
        var number = [];
        if (TmaMotionBvh._CODE_MINUS == context.data[context.offset]) {
            number.push('-');
            context.offset++;
        }
        for (var dot = false; context.offset < context.data.byteLength;
             context.offset++) {
            code = context.data[context.offset];
            if (TmaMotionBvh._CODE_DOT == code) {
                if (dot) {
                    tma.warn("BVH: dot apears twice for a number");
                    return unknown;
                }
                dot = true;
            } else if (!TmaMotionBvh._isNumber(code)) {
                break;
            }
            number.push(String.fromCharCode(code));
        }
        if (0 == number.length)
            return unknown;
        return { id: TmaMotionBvh._ID_NUMBER, value: Number(number.join('')) };
    }
    return { id: TmaMotionBvh._ID_EOF };
};

/**
 * Loads a motion data in BVH format.
 * @param data ArrayBuffer
 * @return true if specified |data| is in valid BVH format
 */
TmaMotionBvh.prototype.load = function (data) {
    var context = {
        data: new Uint8Array(data),
        offset: 0
    };
    var result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_HIERARCHY != result.id) {
        tma.error("BVH: HIERARCHY not found");
        return false;
    }
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_ROOT != result.id) {
        tma.error("BVH: ROOT not found");
        return false;
    }
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_NAME != result.id) {
        tma.error("BVH: ROOT doesn't have a name");
        return false;
    }
    tma.log("BVH: ROOT " + result.value);
    var root = { name: result.value };
    if (!TmaMotionBvh._parseJoint(context, root, false))
        return false;
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_MOTION != result.id) {
        tma.error("BVH: MOTION not found");
        return false;
    }
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_FRAMES != result.id) {
        tma.error("BVH: Frames not found");
        return false;
    }
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_NUMBER != result.id) {
        tma.error("BVH: Frames doesn't have a number");
        return false;
    }
    tma.log("BVH: Frames " + result.value);
    this.frameLength = result.value;
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_FRAME_TIME != result.id) {
        tma.error("BVH: Frame Time not found");
        return false;
    }
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_NUMBER != result.id) {
        tma.error("BVH: Frame Time doesn't have a number");
        return false;
    }
    tma.log("BVH: Frame Time " + result.value);
    this.frameTime = result.value;
    tma.log("BVH: Total Channels " + root.totalChannels);

    this._frameData = [];
    for (var frame = 0; frame < this.frameLength; frame++) {
        var data = [];
        for (var ch = 0; ch < root.totalChannels; ch++) {
            result = TmaMotionBvh._parse(context);
            if (TmaMotionBvh._ID_NUMBER != result.id) {
                tma.error("BVH: data broken at frame " + frame);
                return false;
            }
            data.push(result.value);
        }
        this._frameData.push(data);
    }
    tma.log("BVH: done");
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_EOF != result.id)
        tma.warn("BVH: unused data exists");

    this._root = root;
    return true;
};

/**
 * Gets a motion vector for frame |offset|.
 * @param offset frame index
 * @return a vector containing all channels data for the frame
 */
TmaMotionBvh.prototype.getFrameAt = function (offset) {
    return this._frameData[offset];
};

// node.js compatible export.
exports.TmaMotionBvh = TmaMotionBvh;
