function TmaScreen (width, height) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.onmousemove = this._onmousemove.bind(this);
    this.canvas.onmouseout = this._onmouseout.bind(this);
    this.context = this.canvas.getContext("2d");
    this._locked = TmaScreen._UNLOCK;
    this._image = this.context.getImageData(0, 0, this.width, this.height);
    this._offscreenImage = this.createImageData();
    this._afterimage = "rgba(0, 0, 0, 0.05)";
    this._blurCanvas = document.createElement("canvas");
    this._blurCanvas.width = width;
    this._blurCanvas.height = height;
    this._blurContext = this._blurCanvas.getContext("2d");
    this._blurRatio = 0;
    this._blurAlpha = 0;
    this._blurZoom = 0;
    this._blurWidth = 0;
    this._blurHeight = 0;
    this._blurSource = { x: 0, y: 0, w: 0, h: 0 };
    this._blurDestination = { x: 0, y: 0, w: 0, h: 0 };
    this._blurMove = { x: 0, y: 0 };
    this._mouse = false;
    this._mouseX = 0;
    this._mouseY = 0;
}

TmaScreen.BODY = document.getElementsByTagName("body")[0];
TmaScreen._UNLOCK = 0;
TmaScreen.LOCK = 1;
TmaScreen.LOCK_WITH_SCREEN = 2;

TmaScreen.prototype.attachTo = function (element) {
    element.appendChild(this.canvas);
};

TmaScreen.prototype.detachFrom = function (element) {
    element.removeChild(this.canvas);
};

TmaScreen.prototype.createImageData = function () {
    return this.context.createImageData(this.width, this.height);
};

TmaScreen.prototype.setPixel = function (x, y, r, g, b, a) {
    var offset = (y * this.width + x) * 4;
    var data = this._image.data;
    data[offset + 0] = r;
    data[offset + 1] = g;
    data[offset + 2] = b;
    data[offset + 3] = a;
};

TmaScreen.prototype.lock = function (method) {
    if (TmaScreen.LOCK_WITH_SCREEN == method)
        this._image = this.context.getImageData(0, 0, this.width, this.height);
    else
        this._image = this._offscreenImage;
    return this._image;
};

TmaScreen.prototype.unlock = function () {
    this.context.putImageData(this._image, 0, 0);
    this._applyBlur();
    this._applyAfterimage();
};

TmaScreen.prototype.afterimage = function (rgba) {
    this._afterimage = rgba;
};

TmaScreen.prototype.blur = function (ratio, alpha, zoom, x, y) {
    this._blurRatio = ratio;
    this._blurAlpha = alpha;
    this._blurZoom = zoom;
    this._blurMove = { x: x, y: y };
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
};

TmaScreen.prototype.fill = function (rgba) {
    this.context.strokeStyle = rgba;
    this.context.fillStyle = rgba;
    this.context.fillRect(0, 0, this.width, this.height);
};

TmaScreen.prototype.mouse = function () {
    return {
        over: this._mouse,
        x: this._mouseX,
        y: this._mouseY
    };
};

TmaScreen.prototype._applyAfterimage = function () {
    if (!this._afterimage)
        return;
    this.fill(this._afterimage);
};

TmaScreen.prototype._applyBlur = function () {
    if (!this._blurRatio)
        return;
    this._blurContext.drawImage(this.canvas, 0, 0, this.width, this.height,
            0, 0, this._blurWidth, this._blurHeight);
    this.context.globalCompositeOperation = "lighter";
    this.context.globalAlpha = this._blurAlpha;
    this.context.drawImage(this._blurCanvas, this._blurSource.x,
            this._blurSource.y, this._blurSource.w, this._blurSource.h,
            this._blurDestination.x, this._blurDestination.y,
            this._blurDestination.w, this._blurDestination.h);
    this.context.globalCompositeOperation = "source-over";
    this.context.globalAlpha = 1;
};

TmaScreen.prototype._onmousemove = function (e) {
    this._mouse = true;
    var rect = e.target.getBoundingClientRect();
    this._mouseX = e.clientX - rect.left;
    this._mouseY = e.clientY - rect.top;
};

TmaScreen.prototype._onmouseout = function (e) {
    this._mouse = false;
};
