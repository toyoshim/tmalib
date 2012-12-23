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
    if (width == TmaScreen.FULL_WIDTH)
        width = Math.max(document.body.clientWidth,
                document.body.scrollWidth,
                document.documentElement.scrollWidth,
                document.documentElement.clientWidth);
    if (height == TmaScreen.FULL_HEIGHT)
        height = Math.max(document.body.clientHeight,
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                document.documentElement.clientHeight);
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
// Set max window width.
TmaScreen.FULL_WIDTH = -1;
// Set max window height.
TmaScreen.FULL_HEIGHT = -1;

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

/**
 * Sets pixel data to specified point by specified color, and alpha blending
 * parameters. This operation is applied to locked image data.
 * @param x X position to set pixel
 * @param y Y position to set pixel
 * @param l Red (from 0 to 255) or H (from 0.0 to 360.0)
 * @param m Green (from 0 to 255) or S (from 0.0 to 1.0)
 * @param n Blue (from 0 to 255) or V (from 0.0 to 1.0)
 * @param a Alpha (from 0 to 255)
 * @param hsv True if specified l, m, n parameters are in HSV format.
 */
TmaScreen.prototype.setPixel = function (x, y, l, m, n, a, hsv) {
    var offset = (y * this.width + x) * 4;
    var data = this.data;
    if (hsv) {
        var rgb = TmaScreen.HSV2RGB(l, m, n);
        data[offset + 0] = rgb.r;
        data[offset + 1] = rgb.g;
        data[offset + 2] = rgb.b;
        data[offset + 3] = a;
    } else {
        data[offset + 0] = l;
        data[offset + 1] = m;
        data[offset + 2] = n;
        data[offset + 3] = a;
    }
};

/**
 * Composites pixel data to specified point, color, and alpha blending
 * parameters. This operation is applied to locked image data.
 * @param x X position to add pixel
 * @param y Y position to add pixel
 * @param l Red (from 0 to 255) or H (from 0.0 to 360.0)
 * @param m Green (from 0 to 255) or S (from 0.0 to 1.0)
 * @param n Blue (from 0 to 255) or V (from 0.0 to 1.0)
 * @param a Alpha (from 0 to 255)
 * @param hsv True if specified l, m, n parameters are in HSV format.
 */
TmaScreen.prototype.addPixel = function (x, y, l, m, n, a, hsv) {
    var offset = (y * this.width + x) * 4;
    var data = this.data;
    if (hsv) {
        var rgb = TmaScreen.HSV2RGB(l, m, n);
        data[offset + 0] += rgb.r;
        data[offset + 1] += rgb.g;
        data[offset + 2] += rgb.b;
        data[offset + 3] = a;
    } else {
        data[offset + 0] += l;
        data[offset + 1] += m;
        data[offset + 2] += n;
        data[offset + 3] = a;
    }
};

/**
 * Draw a line at specified position by specified color, and alpha blending
 * parameters. This operation is applied to locked image data.
 * @param x1 Source X position to draw line
 * @param y1 Source Y position to draw line
 * @param x2 Destination X position to draw line
 * @param y2 Destination Y position to draw line
 * @param l Red (from 0 to 255) or H (from 0.0 to 360.0)
 * @param m Green (from 0 to 255) or S (from 0.0 to 1.0)
 * @param n Blue (from 0 to 255) or V (from 0.0 to 1.0)
 * @param a Alpha (from 0 to 255)
 * @param hsv True if specified l, m, n parameters are in HSV format.
 * @param blend Add to original pixel when |blend| is true, otherwise replace
 */
TmaScreen.prototype.drawLine =
        function (x1, y1, x2, y2, l, m, n, a, hsv, blend) {
    var offset = (y1 * this.width + x1) * 4;
    var data = this.data;
    var r = l;
    var g = m;
    var b = n;
    if (hsv) {
        var rgb = TmaScreen.HSV2RGB(l, m, n);
        r = rgb.r;
        g = rgb.g;
        b = rgb.b;
    }
    var dx = x2 - x1;
    var dy = y2 - y1;
    var ax = (dx > 0) ? dx : -dx;
    var ay = (dy > 0) ? dy : -dy;
    if (ax < ay) {
        // line by line
        var direction = (dy > 0) ? 1 : -1;
        var diff = dx / dy;
        var lineBytes = (dy > 0) ? this.width * 4 : -this.width * 4;
        var rowBytes = 4;
        if (blend) {
            for (var y = y1; ; y += direction) {
                var position = offset + ~~(diff * (y - y1)) * rowBytes;
                data[position + 0] += r;
                data[position + 1] += g;
                data[position + 2] += b;
                data[position + 3] = a;
                if (y == y2)
                    break;
                offset += lineBytes;
            }
        } else {
            for (y = y1; ; y += direction) {
                position = offset + ~~(diff * (y - y1)) * rowBytes;
                data[position + 0] = r;
                data[position + 1] = g;
                data[position + 2] = b;
                data[position + 3] = a;
                if (y == y2)
                    break;
                offset += lineBytes;
            }
        }
    } else {
        // row by row
        direction = (dx > 0) ? 1 : -1;
        diff = dy / dx;
        lineBytes = this.width * 4;
        rowBytes = (dx > 0) ? 4 : -4;
        if (blend) {
            for (var x = x1; ; x += direction) {
                position = offset + ~~(diff * (x - x1)) * lineBytes;
                data[position + 0] += r;
                data[position + 1] += g;
                data[position + 2] += b;
                data[position + 3] = a;
                if (x == x2)
                    break;
                offset += rowBytes;
            }
        } else {
            for (x = x1; ; x += direction) {
                position = offset + ~~(diff * (x - x1)) * lineBytes;
                data[position + 0] = r;
                data[position + 1] = g;
                data[position + 2] = b;
                data[position + 3] = a;
                if (x == x2)
                    break;
                offset += rowBytes;
            }
        }
    }
};

// node.js compatible export.
exports.TmaScreen = TmaScreen;