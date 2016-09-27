/**
 * T'MediaArt library for JavaScript.
 * - header script for unified version.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
var exports = {};
var module = {};
var global = {};
var tma = { base: '', ready: true };
/**
 * T'MediaArt library for JavaScript.
 * - core script - the second boot loader.
 */

/**
 * Takes a log at a each level.
 * @param arguments Variable number of arguments to log
 */
tma.log = console.log.bind(console);
tma.info = console.info.bind(console);
tma.warn = console.warn.bind(console);
tma.error = console.error.bind(console);

// Error callback.
tma.ecb = function (e) {
  console.error(e);
};

// Holds loading and loaded JavaScript libraries, and resources.
tma._libraries = {};
tma._resources = {};

/**
 * Returns library base path.
 * @return string base path
 */
tma.basePath = function () {
  return tma.base;
};

/**
 * Loads JavaScript library asynchronously.
 * @param src a source file URL
 * @param callback callback to invoke when the JavaScript is loaded (optional)
 * @return Promise if callback is not specified
 */
tma.load = function (src, callback) {
  if (!tma._libraries[src]) {
    // This is the first request to |src|?
    var promise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      var state = {
        callbacks: [resolve],
        ready: false,
        script: script
      };
      if (callback)
        state.callbacks.push(callback);
      tma._libraries[src] = state;
      script.src = src;
      script.onload = function () {
        this.ready = true;
        for (var i = 0; i < this.callbacks.length; ++i)
          this.callbacks[i]();
        this.callbacks = undefined;
      }.bind(state);
      document.head.appendChild(script);
    });
    return promise;
  } else if (tma._libraries[src].ready) {
    // The same library is already loaded.
    if (callback)
      callback();
    return new Promise(function (resolve, reject) {
      resolve();
    });
  } else {
    // The same library is on loading.
    return new Promise(function (resolve, reject) {
      var callbacks = tma._libraries[src].callbacks;
      callbacks.push(resolve);
      if (callback)
        callbacks.push(callback);
    });
  }
};

/**
 * Fetches a data via XMLHttpRequest.
 * @param url a url to fetch a data
 * @param type a response type in string (optional: 'arraybuffer' is default)
 * @param cache flag to use a cache for the result (optional: false by default)
 * @return a Primise
 */
tma.fetch = function (url, type, cache) {
  if (!type)
    type = 'arraybuffer';
  var key = type + ':' + url;
  if (cache && tma._resources[key]) {
    if (tma._resources[key].ready) {
      // The same resource is already loaded.
      return new Promise(function (resolve, reject) {
        resolve(tma_resources[key].resource);
      });
    } else {
      // The same resource is on loading.
      return new Promise(function (resolve, reject) {
        tma._resources[key].callbacks.push(resolve);
      });
    }
  }
  return new Promise(function (resolve, reject) {
    if (cache) {
      tma._resources[key] = {
        callbacks: [],
        ready: false,
        resource: undefined
      };
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = type;
    xhr.onload = function () {
      if (!this.response) {
        reject(this);
      } else {
        resolve(this.response);
        if (cache) {
          var state = tma._resources[key];
          state.ready = true;
          state.resource = this.response;
          for (var i = 0; i < state.callbacks.length; ++i)
            state.callbacks[i](this.response);
        }
      }
      this.onload = null;
    }.bind(xhr);
    xhr.send();
  });
};

/**
 * Loads a shader program from external html by id.
 * @param src an external html URL
 * @param id script ID to obtain the shader program
 * @return Promise
 */
tma.loadShader = function (src, id) {
  return new Promise(function (resolve, reject) {
    tma.fetch(src, 'document', true).then(function (dom) {
      resolve(dom.getElementById(id).text);
    }, tma.ecb);
  });
};

/**
 * Loads sub scripts.
 */
tma._boot = function () {
  // TmaModelPromitives depends on Tma3DScreen.
  // Tma3DScreen and Tma2DScreen depend on TmaScreen.
  var screen = new Promise(function (resolve, reject) {
    tma.load(tma.base + 'src/TmaScreen.js').then(function () {
      Promise.all([
        tma.load(tma.base + 'src/Tma2DScreen.js'),
        new Promise(function (resolve, reject) {
          tma.load(tma.base + 'src/Tma3DScreen.js', function () {
            tma.load(tma.base + 'src/TmaModelPrimitives.js', resolve);
          }, tma.ecb);
        }, tma.ecb)
      ]).then(function () { resolve(); }, tma.ecb);
    }, tma.ecb);
  });
  Promise.all([
    screen,
    tma.load(tma.base + 'src/TmaParticle.js'),
    tma.load(tma.base + 'src/TmaSequencer.js'),
    tma.load(tma.base + 'src/TmaTimeline.js'),
    tma.load(tma.base + 'src/TmaMotionBvh.js'),
    tma.load(tma.base + 'src/TmaModelPly.js'),
    tma.load(tma.base + 'src/TmaModelPs2Ico.js')
  ]).then(function () {
    tma.ready = true;
    Promise.all(tma.extlibs.map(function (src) {
      return tma.load(tma.base + src);
    })).then(function () {
      if (tma.onload)
        tma.onload();
    }, tma.ebc);
  }, tma.ecb);
};
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
TmaScreen.BODY = document.getElementsByTagName('body')[0];
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
exports.TmaScreen = TmaScreen;/**
 * T'MediaArt library for JavaScript.
 */

/**
 * Tma2DScreen prototype
 *
 * This prototype provides canvas operations.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 *
 * @param width screen width
 * @param height screen height
 */
function Tma2DScreen (width, height) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.onmousemove = this._onmousemove.bind(this);
    this.canvas.onmouseout = this._onmouseout.bind(this);
    this.canvas.onmousedown = this._onmousedown.bind(this);
    this.canvas.onmouseup = this._onmouseup.bind(this);
    this.context = this.canvas.getContext('2d');
    this._image = this.context.getImageData(0, 0, this.width, this.height);
    this.data = this._image.data;
    this._offscreenCanvas = document.createElement('canvas');
    this._offscreenCanvas.width = width;
    this._offscreenCanvas.height = height;
    this._offscreenContext = this._offscreenCanvas.getContext('2d');
    this._offscreenImage = this.createImageData(width, height);
    this._afterimage = 0;
    this._blurCanvas = document.createElement('canvas');
    this._blurCanvas.width = width;
    this._blurCanvas.height = height;
    this._blurContext = this._blurCanvas.getContext('2d');
    this._blurRatio = 0;
    this._blurAlpha = 0;
    this._blurWidth = 0;
    this._blurHeight = 0;
    this._blurSource = { x: 0, y: 0, w: 0, h: 0 };
    this._blurDestination = { x: 0, y: 0, w: 0, h: 0 };
    this._blurSync = true;
    this._mouse = false;
    this._mouseX = 0;
    this._mouseY = 0;
    this._mousePressed = false;
}

/**
 * Attaches to a DOMElement. TmaScreen.BODY is useful predefined DOMElement
 * which represents the <body> DOMElement.
 * @param element DOMElement
 */
Tma2DScreen.prototype.attachTo = function (element) {
    element.appendChild(this.canvas);
};

/**
 * Detaches from a DOMElement.
 * @param element DOMElement
 */
Tma2DScreen.prototype.detachFrom = function (element) {
    element.removeChild(this.canvas);
};

/**
 * Creates ImageData object with current screen size.
 * @param width Image width
 * @param height Image height
 * @return Image object.
 */
Tma2DScreen.prototype.createImageData = function (width, height) {
    return this.context.createImageData(width, height);
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
Tma2DScreen.prototype.setPixel = TmaScreen.prototype.setPixel;

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
Tma2DScreen.prototype.addPixel = TmaScreen.prototype.addPixel;

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
Tma2DScreen.prototype.drawLine = TmaScreen.prototype.drawLine;

/**
 * Locks screen to get ImageData object to update screen. If |method| is
 * TmaScreen.LOCK_WITH_SCREEN, returning ImageData contains the current showing
 * screen image. Otherwise, it returns offscreen ImageData which contains an
 * undefined image.
 * @param method TmaScreen.LOCK or TmaScreen.LOCK_WITH_SCREEN
 */
Tma2DScreen.prototype.lock = function (method) {
    if (TmaScreen.LOCK_WITH_SCREEN == method)
        this._image = this.context.getImageData(0, 0, this.width, this.height);
    else
        this._image = this._offscreenImage;
    this.data = this._image.data;
    return this._image;
};

/**
 * Unlocks screen to apply effects. This function must be called after |lock|.
 */
Tma2DScreen.prototype.unlock = function () {
    if (this._blurRatio && this._blurSync)
        this._offscreenContext.putImageData(this._image, 0, 0);
    else
        this.context.putImageData(this._image, 0, 0);
    this.applyEffects();
};

/**
 * Sets afterimage parameter. |rgba| will be drawn over all pixels at the last
 * stage of screen update. Calling without |rgba| disables afterimage effect.
 * @param rgba Color and alpha parameter (E.g., 'rgba(255, 0, 0, 1.0)')
 */
Tma2DScreen.prototype.afterimage = function (rgba) {
    this._afterimage = rgba;
};

/**
 * Sets blur parameters. Blur effect will be applied at screen update. Calling
 * without any parameters or with |ratio| being 0 disables blur effect.
 * @param ratio Blur sharpness (from +0.0 to 1.0: no blur)
 * @param alpha Alpha blending parameter for blur effect (from 0.0 to 1.0)
 * @param zoom Zoom ratio of blur effect (> 1.0)
 * @param x X motion parameter (from -width to +width makes sense)
 * @param y Y motion parameter (from -height to +height makes sense)
 * @param sync Applies effects offscreen
 */
Tma2DScreen.prototype.blur = function (ratio, alpha, zoom, x, y, sync) {
    this._blurRatio = ratio;
    this._blurAlpha = alpha;
    this._blurWidth = ~~(this.width * ratio);
    this._blurHeight = ~~(this.height * ratio);
    var bx = ~~((this._blurWidth - (this._blurWidth / zoom)) / 2);
    var by = ~~((this._blurHeight - (this._blurHeight / zoom)) / 2);
    this._blurSource.x = bx;
    this._blurSource.y = by;
    this._blurSource.w = this._blurWidth - bx - bx;
    this._blurSource.h = this._blurHeight - by - by;
    this._blurDestination.x = 0;
    this._blurDestination.y = 0;
    this._blurDestination.w = this.width;
    this._blurDestination.h = this.height;
    var dx = (x >= 0) ? x : -x;
    var dy = (y >= 0) ? y : -y;
    var sx = ~~(dx * this._blurSource.w / this._blurDestination.w);
    var sy = ~~(dy * this._blurSource.h / this._blurDestination.h);
    this._blurSource.w -= sx;
    this._blurDestination.w -= dx;
    this._blurSource.h -= sy;
    this._blurDestination.h -= dy;
    if (x > 0)
        this._blurSource.x += sx;
    else if (x < 0)
        this._blurDestination.x += sx;
    if (y > 0)
        this._blurSource.y += sy;
    else if (y < 0)
        this._blurDestination.y += sy;
    this._blurSync = sync;
};

/**
 * Fills screen with |rgba|.
 * @param rgba Color and alpha parameter (E.g., 'rgba(255, 0, 0, 1.0)')
 */
Tma2DScreen.prototype.fill = function (rgba) {
    this.context.strokeStyle = rgba;
    this.context.fillStyle = rgba;
    this.context.fillRect(0, 0, this.width, this.height);
};

/**
 * Applies effects.
 */
Tma2DScreen.prototype.applyEffects = function () {
    this._applyBlur();
    this._applyAfterimage();
};

/**
 * Private implementation to apply afterimage effect.
 */
Tma2DScreen.prototype._applyAfterimage = function () {
    if (!this._afterimage)
        return;
    this.fill(this._afterimage);
};

/**
 * Private implementation to apply blur effect.
 */
Tma2DScreen.prototype._applyBlur = function () {
    if (!this._blurRatio)
        return;
    var canvas;
    var context;
    if (this._blurSync) {
        canvas = this._offscreenCanvas;
        context = this._offscreenContext;
    } else {
        canvas = this.canvas;
        context = this.context;
    }
    this._blurContext.drawImage(canvas, 0, 0, this.width, this.height,
        0, 0, this._blurWidth, this._blurHeight);
    context.globalCompositeOperation = 'lighter';
    context.globalAlpha = this._blurAlpha;
    context.drawImage(this._blurCanvas, this._blurSource.x,
        this._blurSource.y, this._blurSource.w, this._blurSource.h,
        this._blurDestination.x, this._blurDestination.y,
        this._blurDestination.w, this._blurDestination.h);
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
    if (this._blurSync)
        this.context.drawImage(canvas, 0, 0);
};

/**
 * Gets mouse information.
 * @return an object containing
 *      over: true if mouse is currently over this screen
 *      x: mouse x position if |over| is true
 *      y: mouse y position if |over| is true
 */
Tma2DScreen.prototype.mouse = function () {
    if (!this._mouse)
        return { over: this._mouse };
    return {
        over: this._mouse,
        x: this._mouseX,
        y: this._mouseY
    };
};

/**
 * Private implementation to update mouse state.
 * @param e DOM MouseEvent
 */
Tma2DScreen.prototype._onmousemove = function (e) {
    this._mouse = true;
    var rect = e.target.getBoundingClientRect();
    this._mouseX = e.clientX - rect.left;
    this._mouseY = e.clientY - rect.top;
    if (this._mousePressed)
        this.onMouseDrag(this._mouseX, this._mouseY);
};

/**
 * Private implementation to update mouse state.
 * @param e DOM MouseEvent
 */
Tma2DScreen.prototype._onmouseout = function (e) {
    this._mouse = false;
};

Tma2DScreen.prototype._onmousedown = function (e) {
    var rect = e.target.getBoundingClientRect();
    this._mouseX = e.clientX - rect.left;
    this._mouseY = e.clientY - rect.top;
    this._mousePressed = true;
    this.onMouseDown(this._mouseX, this._mouseY);
    this.onMouseDrag(this._mouseX, this._mouseY);
};

Tma2DScreen.prototype._onmouseup = function (e) {
    var rect = e.target.getBoundingClientRect();
    this._mouseX = e.clientX - rect.left;
    this._mouseY = e.clientY - rect.top;
    this._mousePressed = false;
    this.onMouseDrag(this._mouseX, this._mouseY);
    this.onMouseUp(this._mouseX, this._mouseY);
};

Tma2DScreen.prototype.onMouseDown = function (x, y) {
};

Tma2DScreen.prototype.onMouseDrag = function (x, y) {
};

Tma2DScreen.prototype.onMouseUp = function (x, y) {
};

// node.js compatible export.
exports.Tma2DScreen = Tma2DScreen;
/**
 * T'MediaArt library for JavaScript.
 */

/**
 * Tma3DScreen prototype
 *
 * This prototype provides WebGL operations.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 *
 * @param width screen width
 * @param height screen height
 */
function Tma3DScreen (width, height) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.backgroundColor = '#000000';
    this.resize(width, height);
    this.gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true });
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.onmousemove = this._onmousemove.bind(this);
    this.canvas.onmouseout = this._onmouseout.bind(this);
    this.canvas.onmousedown = this._onmousedown.bind(this);
    this.canvas.onmouseup = this._onmouseup.bind(this);
    this.canvas2d = document.createElement('canvas');
    this.context = this.canvas2d.getContext('2d');
    if (!this.gl) {
        tma.log('WebGL: webgl is not supported. Try experimental-webgl...');
        this.gl = this.canvas.getContext('experimental-webgl');
    }
    if (!this.gl) {
        tma.log('WebGL: Try webkit-3d...');
        this.gl = this.canvas.getContext('webkit-3d');
    }
    if (!this.gl) {
        tma.error('WebGL: not supported.');
    }
    if (this.gl.getExtension('OES_texture_float') == null) {
        tma.log('WebGL: float texture is not supported.');
    }
    this.setAlphaMode(false);
    this.setCullingMode(false, true);
    this._currentAlphaMode = {};
    this._currentCullingMode = {};
    this._alphaModeStack = [];
    this._cullingModeStack = [];
    this._lastBoundFrameBuffer = this;
    this._mouse = false;
    this._mouseX = 0;
    this._mouseY = 0;
    this._mouseClickX = 0;
    this._mouseClickY = 0;
    this._mouseWidth = 0;
    this._mouseHeight = 0;

    // Logging GL capabilities.
    tma.log('WebGL max vertex uniform vectors: ' +
            this.gl.getParameter(this.gl.MAX_VERTEX_UNIFORM_VECTORS));
    tma.log('WebGL max varying vectors: ' +
            this.gl.getParameter(this.gl.MAX_VARYING_VECTORS));
    tma.log('WebGL max fragment uniform vectors: ' +
            this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS));
    tma.log('WebGL max vertex attributes: ' +
            this.gl.getParameter(this.gl.MAX_VERTEX_ATTRIBS));

    if (!Tma3DScreen._MODE_INITIALIZED) {
        Tma3DScreen.MODE_POINTS = this.gl.POINTS;
        Tma3DScreen.MODE_LINES = this.gl.LINES;
        Tma3DScreen.MODE_LINE_LOOP = this.gl.LINE_LOOP;
        Tma3DScreen.MODE_LINE_STRIP = this.gl.LINE_STRIP;
        Tma3DScreen.MODE_TRIANGLES = this.gl.TRIANGLES;
        Tma3DScreen.MODE_TRIANGLE_STRIP = this.gl.TRIANGLE_STRIP;
        Tma3DScreen.MODE_TRIANGLE_FAN = this.gl.TRIANGLE_FAN;
        Tma3DScreen.FILTER_NEAREST = this.gl.NEAREST;
        Tma3DScreen.FILTER_LINEAR = this.gl.LINEAR;
        Tma3DScreen._MODE_INITIALIZED = true;
    }
}

/**
 * Prototype variables.
 */
// Vertex shader type.
Tma3DScreen.VERTEX_SHADER = 1;
// Fragment shader type.
Tma3DScreen.FRAGMENT_SHADER = 2;
// Draw modes.
Tma3DScreen._MODE_INITIALIZED = false;
Tma3DScreen.MODE_POINTS = 0;
Tma3DScreen.MODE_LINES = 1;
Tma3DScreen.MODE_LINE_LOOP = 2;
Tma3DScreen.MODE_LINE_STRIP = 3;
Tma3DScreen.MODE_TRIANGLES = 4;
Tma3DScreen.MODE_TRIANGLE_STRIP = 5;
Tma3DScreen.MODE_TRIANGLE_FAN = 6;
Tma3DScreen.FILTER_NEAREST = 0x2600;
Tma3DScreen.FILTER_LINEAR = 0x2601;

/**
 * Attaches to a DOMElement. TmaScreen.BODY is useful predefined DOMElement
 * which represents the <body> DOMElement.
 * @param element DOMElement
 */
Tma3DScreen.prototype.attachTo = function (element) {
    element.appendChild(this.canvas);
};

/**
 * Detaches from a DOMElement.
 * @param element DOMElement
 */
Tma3DScreen.prototype.detachFrom = function (element) {
    element.removeChild(this.canvas);
};

/**
 * Resizes canvas and viewport.
 * @param width width
 * @param height height
 */
Tma3DScreen.prototype.resize = function (width, height) {
    this.width = width;
    this.height = height;
    var dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    if (this.gl)
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
};

/**
 * Compiles a shader program.
 * @param type shader type
 * @param program shader program in text
 * @return created shader
 */
Tma3DScreen.prototype.compileShader = function (type, program) {
    var type = (Tma3DScreen.VERTEX_SHADER == type) ? this.gl.VERTEX_SHADER :
            this.gl.FRAGMENT_SHADER;
    var shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, program);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
        tma.log('WebGL compiling shader: ' + this.gl.getShaderInfoLog(shader) +
                ' : ' + program);
    return shader;
};

/**
 * Loads shader program from DOMElement and compiles it.
 * @param type shader type
 * @param id DOMElement id
 * @return created shader
 */
Tma3DScreen.prototype.loadShader = function (type, id) {
    return this.compileShader(type, document.getElementById(id).text);
};

/**
 * Links program and logs error information if failed.
 * @param program
 */
Tma3DScreen.prototype.linkProgram = function (program) {
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS))
        tma.log('WebGL link program error: ' +
                this.gl.getProgramInfoLog(program));
    tma.log('WebGL program active attributes ' +
            this.gl.getProgramParameter(program, this.gl.ACTIVE_ATTRIBUTES));
};

/**
 * Creates program object with shader objects.
 * @param vertex vertex shader
 * @param fragment fragment shader
 */
Tma3DScreen.prototype.createProgram = function (vertex, fragment) {
    var programObject = this.gl.createProgram();
    if (vertex.constructor.name && 'WebGLShader' != vertex.constructor.name)
        vertex = this.loadShader(Tma3DScreen.VERTEX_SHADER, vertex);
    this.gl.attachShader(programObject, vertex);
    if (fragment.constructor.name && 'WebGLShader' != fragment.constructor.name)
        fragment = this.loadShader(Tma3DScreen.FRAGMENT_SHADER, fragment);
    this.gl.attachShader(programObject, fragment);
    this.linkProgram(programObject);
    programObject._owner = this;
    programObject._index = 0;
    programObject._textureId = 0;
    programObject._textureIdMap = {};
    programObject._attributes = {};
    programObject._uniforms = {};
    programObject.attributeIndex = function (name) {
        if (!this._attributes[name]) {
            this._attributes[name] =
                    this._owner.gl.getAttribLocation(this, name);
        }
        return this._attributes[name];
    };
    programObject.uniformIndex = function (name) {
        if (!this._uniforms[name]) {
            this._uniforms[name] =
                    this._owner.gl.getUniformLocation(this, name);
        }
        return this._uniforms[name];
    };
    programObject.setAttribute = function (name, array) {
        var index = this._attributeIndex(name);
        this._owner.setAttribute(this, index, array);
    };
    programObject.setAttributeArray =
            function (name, buffer, offset, dimension, stride) {
        var index = this.attributeIndex(name);
        buffer.bind();
        this._owner.setAttributeArray(this, index, offset, dimension, stride);
    };
    programObject.setUniformVector = function (name, array) {
        var index = this.uniformIndex(name);
        this._owner.setUniformVector(this, index, array);
    };
    programObject.setUniformMatrix = function (name, array) {
        var index = this.uniformIndex(name);
        this._owner.setUniformMatrix(this, index, array);
    };
    programObject.setTexture = function (name, texture) {
        var index = this.uniformIndex(name);
        var id = this._textureIdMap[name];
        if (!id) {
            id = this._textureId++;
            this._textureIdMap[name] = id;
        }
        this._owner.setTexture(this, index, id, texture);
    };
    programObject.drawArrays = function (mode, offset, length) {
        this._owner.drawArrays(this, mode, offset, length);
    };
    programObject.drawElements = function (mode, buffer, offset, length) {
        buffer.bind();
        this._owner.drawElements(this, mode, offset, length);
    };
    return programObject;
};

/**
 * Creates an array buffer from |array| and bind it to WebGL context.
 * @param array data to store in Array or ArrayBuffer
 * @return created buffer
 */
Tma3DScreen.prototype.createBuffer = function (array) {
    var buffer = this.gl.createBuffer();
    buffer._buffer = (array.constructor.name == 'Float32Array') ?
          array : new Float32Array(array);
    buffer._owner = this;
    buffer.bind = function () {
        this._owner.gl.bindBuffer(this._owner.gl.ARRAY_BUFFER, this);
    };
    buffer.buffer = function () {
        return this._buffer;
    };
    buffer.update = function () {
        this.bind();
        var gl = this._owner.gl;
        gl.bufferData(gl.ARRAY_BUFFER, buffer._buffer, gl.STATIC_DRAW);
    };
    buffer.deleteBuffer = function () {
        this._owner.gl.deleteBuffer(this);
        this._buffer = null;
        this._owner = null;
    };
    buffer.update();
    return buffer;
};

/**
 * Create an element array buffer from |array| and bind it to WebGL context.
 * @param array
 * @return created buffer
 */
Tma3DScreen.prototype.createElementBuffer = function (array) {
    var buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array),
            this.gl.STATIC_DRAW);
    buffer._owner = this;
    buffer.bind = function () {
        this._owner.gl.bindBuffer(this._owner.gl.ELEMENT_ARRAY_BUFFER, this);
    };
    return buffer;
};

/**
 * Create an frame buffer for offscreen rendering.
 * @width offscreen width
 * @height offscreen height
 * @return created frame buffer object
 */
Tma3DScreen.prototype.createFrameBuffer = function (width, height) {
    var buffer = this.gl.createFramebuffer();
    buffer.width = width;
    buffer.height = height;
    buffer._owner = this;
    buffer.texture = null;
    buffer.renderbuffer = null;
    buffer.bind = function () {
        var last = this._owner._lastBoundFrameBuffer;
        if (last == this)
            return last;
        this._owner._lastBoundFrameBuffer = this;
        var gl = this._owner.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this);
        if (!this.texture) {
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(
                    gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(
                    gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(
                    gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0,
                    gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                    gl.TEXTURE_2D, this.texture, 0);
        }
        if (!this.renderbuffer) {
            this.renderbuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
                    this.width, this.height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
                    gl.RENDERBUFFER, this.renderbuffer);
        }
        gl.viewport(0, 0, this.width, this.height);
        return last;
    };
    return buffer;
};

/**
 * Create ImageData for texture.
 * @param width texture width
 * @param height texture height
 * @param data texture data
 */
Tma3DScreen.prototype.createImage = function (width, height, data) {
    var image = this.context.createImageData(width, height);
    if (data) {
        var dst = image.data;
        var size = width * height * 4;
        for (var i = 0; i < size; ++i)
            dst[i] = data[i];
    }
    image.setPixel = TmaScreen.prototype.setPixel;
    image.addPixel = TmaScreen.prototype.addPixel;
    image.drawLine = TmaScreen.prototype.drawLine;
    return image;
};

/**
 * Converts Image object to ImageData object.
 * @param image Image object
 * @return a new ImageData object
 */
Tma3DScreen.prototype.convertImage = function (image) {
    this.canvas2d.width = image.width;
    this.canvas2d.height = image.height;
    this.context.drawImage(image, 0, 0);
    var src = this.context.getImageData(0, 0, image.width, image.height);
    return this.createImage(src.width, src.height, src.data);
};

/**
 * Creates a texture buffer from string.
 * @param text a text shown in the created texture
 * @param font font information
 * @param texture output texture restrictions
 */
Tma3DScreen.prototype.createStringTexture = function (text, font, texture) {
    var fontname = font.size + 'px ' + font.name;
    this.context.font = fontname;
    var w = this.context.measureText(text).width;
    var h = font.size * devicePixelRatio * 1.5; // FIXME: just in case.
    if (texture) {
        if (texture.width)
            w = texture.width;
        if (texture.height)
            h = texture.height;
    }
    this.canvas2d.width = w;
    this.canvas2d.height = h;
    // Other rendering contexts should be set after changing canvas size.
    this.context.font = fontname;
    this.context.fillStyle = font.background;
    this.context.fillRect(0, 0, w, h);
    this.context.fillStyle = font.foreground;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillText(text, w / 2, h / 2);
    var src = this.context.getImageData(0, 0, w, h);
    var image = this.createImage(src.width, src.height, src.data);
    return this.createTexture(image, true, Tma3DScreen.FILTER_LINEAR);
};

/**
 * Create texture buffer from Float32Array object.
 * @param data Float32Array object
 * @param width texture width
 * @param height texture height
 * @param flip image flip flag
 */
Tma3DScreen.prototype.createFloatTexture =
        function (data, width, height, flip) {
    var texture = this.gl.createTexture();
    texture.width = width;
    texture.height = height;
    texture.data = data;
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, flip);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0,
            this.gl.RGBA, this.gl.FLOAT, data);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    texture._flip = flip;
    texture._owner = this;
    texture.update = function (data) {
        var gl = this._owner.gl;
        gl.bindTexture(gl.TEXTURE_2D, this);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0,
                gl.RGBA, gl.FLOAT, data);
    };
    return texture;
};

/**
 * Create texture buffer from Image object.
 * @param image Image object or ImageData object
 * @param flip image flip flag
 * @param filter texture mag filter
 */
Tma3DScreen.prototype.createTexture = function (image, flip, filter) {
    var texture = this.gl.createTexture();
    texture.width = image.width;
    texture.height = image.height;
    texture.image = image;
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, flip);
    // TODO: Handles level of detail
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA,
            this.gl.UNSIGNED_BYTE, image);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, filter);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, filter);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    texture._flip = flip;
    texture._owner = this;
    texture.update = function (image) {
        var gl = this._owner.gl;
        gl.bindTexture(gl.TEXTURE_2D, this);
        gl.texImage2D(
                gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    };
    return texture;
};

/**
 * Reset framebuffer to default screen buffer.
 * @return previous frame buffer
 */
Tma3DScreen.prototype.bind = function () {
    var last = this._lastBoundFrameBuffer;
    this._lastBoundFrameBuffer = this;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    return last;
};

/**
 * Sets a float array to an internal buffer as a constant attribute array.
 * @param index attribute index
 * @param array float array
 */
Tma3DScreen.prototype.setAttribute = function (program, index, array) {
    this.gl.useProgram(program);
    if (1 == array.length)
        this.gl.vertexAttrib1fv(index, array);
    else if (2 == array.length)
        this.gl.vertexAttrib2fv(index, array);
    else if (3 == array.length)
        this.gl.vertexAttrib3fv(index, array);
    else if (4 == array.length)
        this.gl.vertexAttrib4fv(index, array);
    this.gl.disableVertexAttribArray(index);
};

/**
 * Sets float arrays to an internal buffer as a attribute arrays.
 * @param index attribute index
 * @param offset offset in stored data buffer
 * @param dimension array dimension
 * @param stride stride distance in stored data buffer
 */
Tma3DScreen.prototype.setAttributeArray =
        function (program, index, offset, dimension, stride) {
    this.gl.useProgram(program);
    this.gl.vertexAttribPointer(
            index, dimension, this.gl.FLOAT, false, stride, offset);
    this.gl.enableVertexAttribArray(index);
};

/**
 * Sets a float vector to an internal buffer as a constant uniform array.
 * @param index uniform index
 * @param array float vector
 */
Tma3DScreen.prototype.setUniformVector = function (program, index, array) {
    this.gl.useProgram(program);
    if (1 == array.length)
        this.gl.uniform1fv(index, array);
    else if (2 == array.length)
        this.gl.uniform2fv(index, array);
    else if (3 == array.length)
        this.gl.uniform3fv(index, array);
    else if (4 == array.length)
        this.gl.uniform4fv(index, array);
    else
        tma.error('WebGL unknown uniform vector size: ' + array.length);
};

/**
 * Sets a float matrix to an internal buffer as a constant uniform array.
 * @param index uniform index
 * @param array float matrix
 */
Tma3DScreen.prototype.setUniformMatrix = function (program, index, array) {
    this.gl.useProgram(program);
    if (4 == array.length)
        this.gl.uniformMatrix2fv(index, false, array);
    else if (9 == array.length)
        this.gl.uniformMatrix3fv(index, false, array);
    else if (16 == array.length)
        this.gl.uniformMatrix4fv(index, false, array);
    else
        tma.error('WebGL unknown uniform matrix size: ' + array.length);
};

/**
 * Sets |texture| to |program|.
 * @param program program object
 * @param index uniform index
 * @param id texture ID
 * @param texture texture object
 */
Tma3DScreen.prototype.setTexture = function (program, index, id, texture) {
    this.gl.useProgram(program);
    this.gl.activeTexture(this.gl.TEXTURE0 + id);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(index, id);
};

/**
 * Draws primitives by vertices.
 * @param program program object with shaders
 * @param mode draw mode
 * @param offset start offset
 * @param length total length
 */
Tma3DScreen.prototype.drawArrays = function (program, mode, offset, length) {
    this.gl.useProgram(program);
    this.gl.drawArrays(mode, offset, length);
};

/**
 * Draws primitives by vertices with indices.
 * @param program program object with shaders
 * @param mode draw mode
 * @param offset start offset
 * @param length total length
 */
Tma3DScreen.prototype.drawElements = function (program, mode, offset, length) {
    this.gl.useProgram(program);
    this.gl.drawElements(mode, length, this.gl.UNSIGNED_SHORT, offset);
};

/**
 * Fills screen with specified color.
 * @param r color R
 * @param g color G
 * @param b color B
 * @param a color A
 */
Tma3DScreen.prototype.fillColor = function (r, g, b, a) {
    this.gl.clearColor(r, g, b, a);
    this.gl.clearDepth(1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
};

/**
 * Sets alpha blending mode.
 * @param on enable alpha blending
 * @param src source drawing mode
 * @param dst destination drawing mode
 */
Tma3DScreen.prototype.setAlphaMode = function (on, src, dst) {
    this._currentAlphaMode = { on: on, src: src, dst: dst };
    if (on) {
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(src, dst);
    } else {
        this.gl.disable(this.gl.BLEND);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
    }
};

/**
 * Saves the current alpha blending mode to an internal stack.
 */
Tma3DScreen.prototype.pushAlphaMode = function () {
    this._alphaModeStack.push(this._currentAlphaMode);
};

/**
 * Restores an alpha blending mode from an internal stack.
 */
Tma3DScreen.prototype.popAlphaMode = function () {
    var mode = this._alphaModeStack.pop();
    this.setAlphaMode(mode.on, mode.src, mode.dst);
};

/**
 * Sets culling mode.
 * @param on enable culling
 * @param ccw front face direction is GL_CCW if true, otherwise GL_CW
 */
Tma3DScreen.prototype.setCullingMode = function (on, ccw) {
    this._currentCullingMode = { on: on, ccw: ccw };
    if (on) {
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.frontFace(ccw ? this.gl.CCW : this.gl.CW);
    } else {
        this.gl.disable(this.gl.CULL_FACE);
    }
};

/**
 * Saves the current culling mode to an internal stack.
 */
Tma3DScreen.prototype.pushCullingMode = function () {
    this._cullingModeStack.push(this._currentCullingMode);
};

/**
 * Restores an culling mode from an internal stack.
 */
Tma3DScreen.prototype.popCullingMode = function () {
    var mode = this._cullingModeStack.pop();
    this.setCullingMode(mode.on, mode.ccw);
};

/**
 * Sets line width.
 * @param width line width
 */
Tma3DScreen.prototype.setLineWidth = function (width) {
    this.gl.lineWidth(width);
};

/**
 * Flush the OpenGL ES 2.0 pipeline.
 */
Tma3DScreen.prototype.flush = function () {
    this.gl.flush();
};

/**
 * Gets mouse information.
 * @return an object containing
 *      over: true if mouse is currently over this screen
 *      x: mouse x position if |over| is true
 *      y: mouse y position if |over| is true
 */
Tma3DScreen.prototype.mouse = function () {
    if (!this._mouse)
        return {
            over: false,
            x: 0,
            y: 0,
            click: {
                on: false,
                x: 0,
                y: 0,
            },
            width: 0,
            height: 0,
        };
    return {
        over: this._mouse,
        x: this._mouseX,
        y: this._mouseY,
        click: {
            on: this._mousePressed,
            x: this._mouseClickX,
            y: this._mouseClickY
        },
        width: this._mouseWidth,
        height: this._mouseHeight,
    };
};

/**
 * Private implementation to update mouse state.
 * @param e DOM MouseEvent
 */
Tma3DScreen.prototype._onmousemove = function (e) {
    this._mouse = true;
    var rect = e.target.getBoundingClientRect();
    this._mouseX = e.clientX - rect.left;
    this._mouseY = e.clientY - rect.top;
    this._mouseWidth = rect.right - rect.left;
    this._mouseHeight = rect.bottom - rect.top;
    if (this._mousePressed)
        this.onMouseDrag(this._mouseX, this._mouseY);
};

/**
 * Private implementation to update mouse state.
 * @param e DOM MouseEvent
 */
Tma3DScreen.prototype._onmouseout = function (e) {
    this._mouse = false;
};

// TODO: Move following functions to TmaScreen.
Tma3DScreen.prototype._onmousedown = function (e) {
    var rect = e.target.getBoundingClientRect();
    this._mouseX = e.clientX - rect.left;
    this._mouseY = e.clientY - rect.top;
    this._mousePressed = true;
    this._mouseClickX = this._mouseX;
    this._mouseClickY = this._mouseY;
    this.onMouseDown(this._mouseX, this._mouseY);
    this.onMouseDrag(this._mouseX, this._mouseY);
};

Tma3DScreen.prototype._onmouseup = function (e) {
    var rect = e.target.getBoundingClientRect();
    this._mouseX = e.clientX - rect.left;
    this._mouseY = e.clientY - rect.top;
    this._mousePressed = false;
    this.onMouseDrag(this._mouseX, this._mouseY);
    this.onMouseUp(this._mouseX, this._mouseY);
};

Tma3DScreen.prototype.onMouseDown = function (x, y) {
};

Tma3DScreen.prototype.onMouseDrag = function (x, y) {
};

Tma3DScreen.prototype.onMouseUp = function (x, y) {
};

// node.js compatible export.
exports.Tma3DScreen = Tma3DScreen;
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
    this._colors = [];
    this._verticesBuffer = null;
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
    this._colors = new Array(count * 4);
    this._coords = null;
    for (var i = 0; i < count; ++i) {
        this._indices[i] = i;
        this._colors[i * 4 + 0] = 1.0;
        this._colors[i * 4 + 1] = 1.0;
        this._colors[i * 4 + 2] = 1.0;
        this._colors[i * 4 + 3] = 1.0;
    }
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
/**
 * T'MediaArt library for JavaScript.
 */

/**
 * TmaParticle prototype. Inheritant prototypes should implement nothing in the
 * constructor, but |initialize()| because JavaScript level objects will be
 * reused by calling |initialize()| to optimize performance.
 * E.g., function Foo () { TmaParticle.apply(this, arguments); }
 *       Foo.prototype = new TmaParticle(null, 0);
 *       Foo.prototype.constructor = Foo;
 * TODO: Simplify the way to inherit this.
 *
 * This prototype provides particle.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 *
 * @param container an owner |TmaParticle.Container| object
 * @param offset internal offset in |container|
 */
function TmaParticle (container, offset) {
    this._container = container;
    this._offset = offset;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
}

/**
 * Object initializer. This function is called when the object is going to be
 * reused. Inheritance should implement this function correctly.
 */
TmaParticle.prototype.initialize = function () {
};

/**
 * This function is called in owner |TmaParticle.Container.update()|.
 * Inheritance may want to implement physical calculation here.
 * @return false if this object must be removed, otherwise true
 */
TmaParticle.prototype.update = function () {
    return false;
};

/**
 * Removes this object from owner |TmaParticle.Container| virtually. This object
 * isn't destructed, but temporally ignored and will be reused.
 * TODO: Obsolete.
 */
TmaParticle.prototype.remove = function () {
    this._container.remove(this._offset);
};

/**
 * TmaParticle.Container prototype. This object can contains many particles
 * effectively.
 * @param func constructor function to create TmaParticle inheritant object
 */
TmaParticle.Container = function (func) {
    this.length = 0;
    this._func = func;
    this._particles = [];
};

/**
 * Gets a particle at |offset|. |offset| for a particle will be changed after
 * |remove()|.
 * @param offset offset in
 * TODO: Obsolete.
 */
TmaParticle.Container.prototype.at = function (offset) {
    return this._particles[offset];
};

/**
 * Adds a particle. Arguments for this function will be passed as is to
 * |initialize()|.
 * @param arguments variable length arguments to be passed to |initialize()|
 */
TmaParticle.Container.prototype.add = function () {
    if (this._particles.length == this.length)
        this._particles[this.length] = new this._func(this, this.length);
    this._particles[this.length].initialize.apply(
            this._particles[this.length++], arguments);
};

/**
 * Removes a particle virtually. The particle isn't destructed, but temporally
 * ignored and will be reused later in the next |add()|.
 * @param offset offset to a particle
 */
TmaParticle.Container.prototype.remove = function (offset) {
    var particle = this._particles[offset];
    particle._offset = --this.length;
    this._particles[offset] = this._particles[this.length];
    this._particles[offset]._offset = offset;
    this._particles[this.length] = particle;
};

/**
 * Calls |update()| for all registered |TmaParticle| objects, and removes the
 * objects which returns false virtually. All arguments will be passed into
 * each particle's |update()|.
 * @param arguments arbitrary arguments which will be passed into particles.
 */
TmaParticle.Container.prototype.update = function () {
    for (var i = 0; i < this.length; ) {
        if (this._particles[i].update.apply(this._particles[i], arguments))
            i++;
        else
            this.remove(i);
    }
};

// node.js compatible export.
exports.TmaParticle = TmaParticle;
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

TmaMotionBvh._KEY_CHANNELS = 'CHANNELS';
TmaMotionBvh._KEY_ENDSITE = 'End Site';
TmaMotionBvh._KEY_HIERARCHY = 'HIERARCHY';
TmaMotionBvh._KEY_JOINT = 'JOINT';
TmaMotionBvh._KEY_MOTION = 'MOTION';
TmaMotionBvh._KEY_OFFSET = 'OFFSET';
TmaMotionBvh._KEY_ROOT = 'ROOT';
TmaMotionBvh._KEY_POSITION = 'position';
TmaMotionBvh._KEY_ROTATION = 'rotation';
TmaMotionBvh._KEY_FRAMES = 'Frames: ';
TmaMotionBvh._KEY_FRAME_TIME = 'Frame Time: ';

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
        tma.error('BVH: JOINT/End Site doesn\'t start with \'{\'');
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
                    tma.error('BVH: End Site can not have a ' +
                        'CHANNELS');
                    return false;
                }
                result = TmaMotionBvh._parse(context);
                if (TmaMotionBvh._ID_NUMBER != result.id) {
                    tma.error('BVH: CHANNELS requires a number');
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
                            tma.error('BVH: CHANNELS has unknown ' +
                                'channel keyword');
                            return false;
                    }
                }
                joint.totalChannels += idMax;
                break;
            case TmaMotionBvh._ID_END:
                return true;
            case TmaMotionBvh._ID_ENDSITE:
                var endSite = { name: 'End Site' };
                tma.log('BVH: End Site');
                joint.joint.push(endSite);
                if (!TmaMotionBvh._parseJoint(context, endSite, true))
                    return false;
                break;
            case TmaMotionBvh._ID_JOINT:
                if (site) {
                    tma.error('BVH: End Site can not have a JOINT');
                    return false;
                }
                result = TmaMotionBvh._parse(context);
                if (TmaMotionBvh._ID_NAME != result.id) {
                    tma.error('BVH: JOINT doesn\'t have a name');
                    return false;
                }
                var childJoint = { name: result.value };
                tma.log('BVH: JOINT ' + result.value);
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
                tma.error('BVH: OFFSET requires three numbers');
                return false;
            default:
                tma.error('BVH: internal error');
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
                    tma.warn('BVH: dot apears twice for a number');
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
        tma.error('BVH: HIERARCHY not found');
        return false;
    }
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_ROOT != result.id) {
        tma.error('BVH: ROOT not found');
        return false;
    }
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_NAME != result.id) {
        tma.error('BVH: ROOT doesn\'t have a name');
        return false;
    }
    tma.log('BVH: ROOT ' + result.value);
    var root = { name: result.value };
    if (!TmaMotionBvh._parseJoint(context, root, false))
        return false;
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_MOTION != result.id) {
        tma.error('BVH: MOTION not found');
        return false;
    }
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_FRAMES != result.id) {
        tma.error('BVH: Frames not found');
        return false;
    }
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_NUMBER != result.id) {
        tma.error('BVH: Frames doesn\'t have a number');
        return false;
    }
    tma.log('BVH: Frames ' + result.value);
    this.frameLength = result.value;
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_FRAME_TIME != result.id) {
        tma.error('BVH: Frame Time not found');
        return false;
    }
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_NUMBER != result.id) {
        tma.error('BVH: Frame Time doesn\'t have a number');
        return false;
    }
    tma.log('BVH: Frame Time ' + result.value);
    this.frameTime = result.value;
    tma.log('BVH: Total Channels ' + root.totalChannels);

    this._frameData = [];
    for (var frame = 0; frame < this.frameLength; frame++) {
        var data = [];
        for (var ch = 0; ch < root.totalChannels; ch++) {
            result = TmaMotionBvh._parse(context);
            if (TmaMotionBvh._ID_NUMBER != result.id) {
                tma.error('BVH: data broken at frame ' + frame);
                return false;
            }
            data.push(result.value);
        }
        this._frameData.push(data);
    }
    tma.log('BVH: done');
    result = TmaMotionBvh._parse(context);
    if (TmaMotionBvh._ID_EOF != result.id)
        tma.warn('BVH: unused data exists');

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
                } else if (line[1] == 'float' || line[1] == 'float32' ||
                        line[1] == 'int' || line[1] == 'uchar') {
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
 * @return texture coord in Array
 */
TmaModelPly.prototype.getCoords = function () {
    return this._coord;
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
    this._coords = null;
    this._indices = null;
    this._verticesBuffer = null;
    this._coordsBuffer = null;
    this._indicesBuffer = null;
    this._texture = null;
    this._weights = null;
    this._mode = Tma3DScreen.MODE_TRIANGLES;
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
 * @param screen Tma3DScreen
 * @param data ArrayBuffer
 * @return true if specified |data| is in valid ICO format
 */
TmaModelPs2Ico.prototype.load = function (screen, data) {
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
    this._indices = new Array(nbvtx);
    for (var index = 0; index < nbvtx; ++index)
        this._indices[index] = index;
    this._coords = new Array(nbvtx * 2);
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
        this._coords[i * 2 + 0] = sx;
        this._coords[i * 2 + 1] = 1 - sy;
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
    var texture = new Array(128 * 128 * 4);
    for (i = 0; i < texture.length; i += 4) {
        var psmct16 = view.getUint16(offset, true);
        offset += 2;
        texture[i + 0] = ((psmct16 >>  0) & 0x1f) << 3;
        texture[i + 1] = ((psmct16 >>  5) & 0x1f) << 3;
        texture[i + 2] = ((psmct16 >> 10) & 0x1f) << 3;
        texture[i + 3] = 0xff;
    }
    this._texture = screen.createTexture(
            screen.createImage(128, 128, texture),
            true,
            Tma3DScreen.FILTER_LINEAR);
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
 * Gets number of vertices.
 * @return number of vertices.
 */
TmaModelPs2Ico.prototype.items = function () {
    return this._indices.length;
};

/**
 * Gets model's vertices array of a shape.
 * @param shape shape number
 * @return model's vertices in Array
 */
TmaModelPs2Ico.prototype.getVertices = function (shape) {
    return this._vertices[shape || 0];
};

/**
 * Gets texture coord. Address is normalized from 0.0 to 1.0.
 * @return texture coord in Array.
 */
TmaModelPs2Ico.prototype.getCoords = function () {
    return this._coords;
};

/**
 * Gets model's vertex indices.
 * @return model's vertex indices in Array
 */
TmaModelPs2Ico.prototype.getIndices = function () {
    return this._indices;
};

/**
 * Gets an array buffer bound to the vertices. It may be created if needed.
 * @param screen a Tma3DScreen object that will be used to create a buffer
 * @return an array buffer object
 */
TmaModelPs2Ico.prototype.getVerticesBuffer = function (screen) {
    if (!this._verticesBuffer)
        this._verticesBuffer = screen.createBuffer(this.getVertices());
    return this._verticesBuffer;
};

/**
 * Gets an array buffer bound to the coords. It may be created if needed.
 * @param screen a Tma3DScreen object that will be used to create a buffer
 * @return an array buffer object for texture coords
 */
TmaModelPs2Ico.prototype.getCoordsBuffer = function (screen) {
    if (!this._coordsBuffer)
        this._coordsBuffer = screen.createBuffer(this.getCoords());
    return this._coordsBuffer;
};

/**
 * Gets an element buffer bound to the indices. It may be created if needed.
 * @param screen a Tma3DScreen object that will be used to create a buffer
 * @return an element buffer object
 */
TmaModelPs2Ico.prototype.getIndicesBuffer = function (screen) {
    if (!this._indicesBuffer)
        this._indicesBuffer = screen.createElementBuffer(this.getIndices());
    return this._indicesBuffer;
};

/**
 * Gets texture data. Texture image is always 128 x 128 in RGBA.
 * @return texture data in Array
 */
TmaModelPs2Ico.prototype.getTexture = function () {
    return this._texture;
};

/**
 * Gets a recommended drawing mode.
 * @return a drawing mode, e.g. Tma3DScreen.MODE_TRIANGLES
 */
TmaModelPs2Ico.prototype.getDrawMode = function () {
    return this._mode;
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
