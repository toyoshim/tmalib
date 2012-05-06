/**
 * T'MediaArt library for JavaScript.
 */

/**
 * TmaScreen prototype
 *
 * This prototype provides canvas operations.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 *
 * @param width screen width
 * @param height screen height
 */
function TmaScreen (width, height, mode) {
    if (!mode || (TmaScreen.MODE_2D == mode))
        return new Tma2DScreen(width, height);
    return new Tma3DScreen(width, height);
}

/**
 * Prototype variables.
 */
TmaScreen.BODY = document.getElementsByTagName("body")[0];
// Locks screen to get offscreen ImageData object.
TmaScreen.LOCK = 1;
// Locks screen to get ImageData object containing screen.
TmaScreen.LOCK_WITH_SCREEN = 2;
// Screen for 2D canvas.
TmaScreen.MODE_2D = 1;
// Screen for WebGL.
TmaScreen.MODE_3D = 2;

/**
 * Converts a RGB color to a HSV color.
 * @param r Red (from 0 to 255)
 * @param g Green (from 0 to 255)
 * @param b Blue (from 0 to 255)
 * @return an object containing
 *      h: Hue (from 0.0 to 360.0)
 *      s: Saturation (from 0.0 to 1.0)
 *      v: Value (from 0.0 to 1.0)
 */
TmaScreen.RGB2HSV = function (r, g, b) {
    var max = 0;
    var min = 0;
    var h = 0.0;
    if (r > g) {
        // r > g
        if (r > b) {
            // r > g, b
            max = r;
            min = (g > b) ? b : g;
            h = 60 * (g - b) / (max - min);
        } else {
            // b >= r > g
            max = b;
            min = g;
            h = 60 * (r - g) / (max - min) + 240;
        }
    } else {
        // g >= r
        if (g >= b) {
            // g >= r, b
            max = g;
            min = (r > b) ? b : r;
            h = 60 * (b - r) / (max - min) + 120;
        } else {
            // b > g >= r
            max = b;
            min = r;
            h = 60 * (r - g) / (max - min) + 240;
        }
    }
    return { h: (h + 360) % 360, s: (max - min) / max, v: max / 255 }
};

/**
 * Converts a HSV color to a RGB color.
 * @param h Hue (from 0.0 to 360.0)
 * @param s Saturation (from 0.0 to 1.0)
 * @param v Value (from 0.0 to 1.0)
 * @return an object containing
 *      r: Red (from 0 to 255)
 *      g: Green (from 0 to 255)
 *      b: Blue (from 0 to 255)
 */
TmaScreen.HSV2RGB = function (h, s, v) {
    v = v * 255;
    var iv = ~~v;
    if (0 == s) {
        return { r: iv, g: iv, b: iv };
    } else {
        var f = h / 60;
        var i = ~~f;
        f -= i;
        var m = ~~(v * (1 - s));
        var n = ~~(v * (1 - s * f));
        var k = ~~(v * (1 - s * (1 - f)));
        switch (i) {
            case 0:
                return { r: v, g: k, b: m };
            case 1:
                return { r: n, g: v, b: m };
            case 2:
                return { r: m, g: v, b: k };
            case 3:
                return { r: m, g: n, b: v };
            case 4:
                return { r: k, g: m, b: v };
            case 5:
                return { r: v, g: m, b: n };
        }
    }
};

// node.js compatible export.
exports.TmaScreen = TmaScreen;