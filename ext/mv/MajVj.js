/**
 * T'MediaArt library for JavaScript.
 *  - MajVj extension -
 */

 /**
  * MajVj prototype
  *
  * This prototype provides a framework for VJ applications.
  * @author Takashi Toyoshima <toyoshim@gmail.com>
  * @param width offscreen width
  * @param height offscreen height
  * @param fullscreen flag to decide if MajVj runs as a fullscreen app.
  */
function MajVj (width, height, fullscreen) {
    this._width = width;
    this._height = height;
    this._fullscreen = (fullscreen === undefined) ? true : fullscreen;
    this._aspect = width / height;
    this._timestamp = undefined;
    this._screen = new TmaScreen(width, height, TmaScreen.MODE_3D);
    this._screen.setAlphaMode(
            true, this._screen.gl.SRC_ALPHA, this._screen.gl.ONE);
    this._screen.attachTo(TmaScreen.BODY);
    this._fps = new Array(60);
    this._fpsCount = 0;
    this._fpsAvg = 0.0;
    this.onresize();
}

/**
 * Handles screen resize.
 */
MajVj.prototype.onresize = function () {
    if (!this._fullscreen)
        return;
    this._screen.canvas.style.width = window.innerWidth + 'px';
    this._screen.canvas.style.height = window.innerHeight + 'px';
    this._aspect =
            this._screen.canvas.clientWidth / this._screen.canvas.clientHeight;
    console.log('resize: ' + this._screen.canvas.clientWidth + 'x' +
            this._screen.canvas.clientHeight);
};

/**
 * Creates a plugin instance.
 * @param type 'effect' or 'frame'
 * @param name plugin name
 * @param options options
 * @return a plugin instance
 */
MajVj.prototype.create = function (type, name, options) {
    if (!MajVj[type] || !MajVj[type][name]) {
        console.error('unknown plugin: ' + type + '/' + name);
        return null;
    }
    var opt = options || {};
    opt.mv = this;
    opt.screen = this._screen;
    opt.width = opt.width || this._width;  // offscreen width
    opt.height = opt.height || this._height;  // offscreen height
    // screen aspect / offscreen aspect
    opt.aspect = opt.aspect || this.aspect();
    return new MajVj[type][name](opt);
};

/**
 * Returns using Tma3DScreen object.
 * @return Tma3DScreen object
 */
MajVj.prototype.screen = function () {
    return this._screen;
};

/**
 * Returns screen aspect ratio.
 * @return aspect ratio
 */
MajVj.prototype.aspect = function () {
    return this._aspect;
};

/**
 * Returns frame rate in fps.
 * @return a frame rate in fps
 */
MajVj.prototype.fps = function () {
    return this._fpsAvg;
};

/**
 * Run the main function periodically.
 * @param main a function to run periodically
 */
 MajVj.prototype.run = function (main) {
    var requestAnimationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame;
    var loop = function (time) {
        var delta = time - this._timestamp;
        this._fps[this._fpsCount] = 1000 / delta;
        this._fpsCount++;
        if (this._fpsCount == 60) {
            this._fpsCount = 0;
            var fps = 0.0;
            for (var i = 0; i < 60; ++i)
                fps += this._fps[i];
            this._fpsAvg = fps / 60.0;
        }
        main(delta);
        this._screen.gl.flush();
        this._timestamp = time;
        requestAnimationFrame(loop, this._canvas);
    }.bind(this);
    var stabilize = function (time) {
        if (this._timestamp) {
            var delta = time - this._timestamp;
            if (delta < 100)
                return loop(time);
        }
        this._timestamp = time;
        requestAnimationFrame(stabilize, this._canvas);
    }.bind(this);
    stabilize();
};

/**
 * Creates source path for plugins with type and name.
 * @param type 'effect' or 'frame'
 * @param name plugin name
 * @param path relative file path in plugin directory
 * @return a path name in text
 */
MajVj.createPath = function (type, name, path) {
    return tma.basePath() + 'ext/mv/' + type + '/' + name + '/' + path;
};

/**
 * Loads all MajVj plugins.
 * @return a Promise object
 */
MajVj.loadAllPlugins = function () {
    return Promise.all([
        MajVj.loadPlugin('effect', 'glow'),
        MajVj.loadPlugin('effect', 'nicofarre'),
        MajVj.loadPlugin('effect', 'rgb'),
        MajVj.loadPlugin('frame', 'ab2'),
        MajVj.loadPlugin('frame', 'at'),
        MajVj.loadPlugin('frame', 'crlogo'),
        MajVj.loadPlugin('frame', 'effect'),
        MajVj.loadPlugin('frame', 'filter'),
        MajVj.loadPlugin('frame', 'mixer'),
        MajVj.loadPlugin('frame', 'morphere'),
        MajVj.loadPlugin('frame', 'movie'),
        MajVj.loadPlugin('frame', 'nico_test'),
        MajVj.loadPlugin('frame', 'nicofarre'),
        MajVj.loadPlugin('frame', 'nicofarre3d'),
        MajVj.loadPlugin('frame', 'sandbox'),
        MajVj.loadPlugin('frame', 'signal'),
        MajVj.loadPlugin('frame', 'snow'),
        MajVj.loadPlugin('frame', 'specticle'),
        MajVj.loadPlugin('frame', 'wired'),
        MajVj.loadPlugin('misc', 'sound')
    ]);
};


/**
 * Loads a MajVj plugin.
 * @param type 'effect' or 'frame'
 * @param name plugin name
 * @return a Promise object
 */
MajVj.loadPlugin = function (type, name) {
    return new Promise(function (resolve, reject) {
        if (MajVj[type][name]) {
            resolve();
            return;
        }
        MajVj.loadScript(type, name, 'main.js').then(function () {
            MajVj[type][name].load().then(function () {
                resolve();
            }, function (e) { reject(e); });
        }, function () { reject('plugin load error: ' + name); });
    });
};

/**
 * Loads shader program from an external html file.
 * @param type 'effect' or 'frame'
 * @param name plugin name
 * @param html path for an external html file
 * @param id html tag id
 * @return a Promise object
 */
MajVj.loadShader = function (type, name, html, id) {
    return tma.loadShader(MajVj.createPath(type, name, html), id);
};

/**
 * Loads an external JavaScript file.
 * @param type 'effect' or 'frame'
 * @param name plugin name
 * @param src relative file path in plugin directory
 * @return a Promise object
 */
MajVj.loadScript = function (type, name, src) {
    return tma.load(MajVj.createPath(type, name, src));
};

/**
 * Loads an image file from a url.
 * @param url a URL to load an image
 * @return a Promise object
 */
MajVj.loadImageFrom = function (url) {
    return new Promise(function (resolve, reject) {
        var image = new Image();
        image.onload = function () { resolve(this); };
        image.src = url;
    });
};

/**
 * Loads an image file.
 * @param type 'effect' or 'frame'
 * @param name plugin name
 * @param path relative file path in plugin directory
 * @return a Promise object
 */
MajVj.loadImage = function (type, name, path) {
    return MajVj.loadImageFrom(MajVj.createPath(type, name, path));
};

/**
 * Loads a movie file from a url.
 * @param url a URL to load a movie
 * @return a Promise object
 */
MajVj.loadMovieFrom = function (url) {
    return new Promise(function (resolve, reject) {
        var video = document.createElement('video');
        video.src = url;
        video.style.setProperty('display', 'none');
        video.addEventListener('canplay', function () {
            resolve(this);
        }, false);
        document.head.appendChild(video);
    });
};

/**
 * Loads a movie file.
 * @param type 'effect' or 'frame'
 * @param name plugin name
 * @param path relative file path in plugin directory
 * @return a Promise object
 */
MajVj.loadMovie = function (type, name, path) {
    return MajVj.loadMovieFrom(MajVj.createPath(type, name, path));
};

MajVj.effect = {};
MajVj.frame = {};
MajVj.misc = {};
