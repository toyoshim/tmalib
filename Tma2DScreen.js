/**
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
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.onmousemove = this._onmousemove.bind(this);
    this.canvas.onmouseout = this._onmouseout.bind(this);
    this.canvas.onmousedown = this._onmousedown.bind(this);
    this.canvas.onmouseup = this._onmouseup.bind(this);
    this.context = this.canvas.getContext("2d");
    this._image = this.context.getImageData(0, 0, this.width, this.height);
    this.data = this._image.data;
    this._offscreenCanvas = document.createElement("canvas");
    this._offscreenCanvas.width = width;
    this._offscreenCanvas.height = height;
    this._offscreenContext = this._offscreenCanvas.getContext("2d");
    this._offscreenImage = this.createImageData(width, height);
    this._afterimage = 0;
    this._blurCanvas = document.createElement("canvas");
    this._blurCanvas.width = width;
    this._blurCanvas.height = height;
    this._blurContext = this._blurCanvas.getContext("2d");
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
 * @param rgba Color and alpha parameter (E.g., "rgba(255, 0, 0, 1.0)")
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
 * @param rgba Color and alpha parameter (E.g., "rgba(255, 0, 0, 1.0)")
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
    context.globalCompositeOperation = "lighter";
    context.globalAlpha = this._blurAlpha;
    context.drawImage(this._blurCanvas, this._blurSource.x,
        this._blurSource.y, this._blurSource.w, this._blurSource.h,
        this._blurDestination.x, this._blurDestination.y,
        this._blurDestination.w, this._blurDestination.h);
    context.globalCompositeOperation = "source-over";
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
