/**
 * T'MediaArt library for JavaScript.
 */

/**
 * tma prototype
 *
 * This prototype provides base functions.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
var tma = {};

/**
 * Private prototype variables.
 */
// Holds head tag element.
tma._head = document.getElementsByTagName('head')[0];
// Holds base path for this JavaScript.
tma._base = "";
// Holds loaded scripts' data.
tma._scripts = {};
// If all external scripts are loaded.
tma.ready = false;
// Entry point for callback ti know when all external scripts are loaded.
tma.onload = null;
// Additional library URL list to load initially.
tma.extlibs = [];

/**
 * Takes a log at a each level.
 * @param arguments Variable number of arguments to log
 */
tma.log = function () {
    console.log.apply(console, arguments);
};
tma.info = function () {
    console.info.apply(console, arguments);
};
tma.warn = function () {
    console.warn.apply(console, arguments);
};
tma.error = function () {
    console.error.apply(console, arguments);
};

/**
 * Loads JavaScript library dynamically.
 * @param src a source file URL
 * @param callback callback to invoke when the JavaScript is loaded
 * @return Promise
 */
tma.load = function (src, callback) {
    var script = document.createElement('script');
    script.src = src;
    tma._scripts[src] = script;
    if (!callback) {
        return new Promise(function (resolve, reject) {
            script.onload = function () { resolve(); }
            tma._head.appendChild(script);
        });
    }
    script.onload = callback;
    tma._head.appendChild(script);
};

/**
 * Unloads JavaScript library dynamically.
 * @param src a source file URL
 */
tma.unload = function (src) {
    tma._head.removeChild(tma._scripts[src]);
    delete tma._scripts[src];
};

/**
 * Loads a shader program from external html by id.
 * @param src an external html URL
 * @param id script ID to obtain the shader program
 * @return Promise
 */
tma.loadShader = function (src, id) {
    return new Promise(function (resolve, reject) {
        var frames = document.getElementsByTagName('iframe');
        for (var i = 0; i < frames.length; ++i) {
            if (frames[i].src == src || frames[i]._src == src) {
                if (frames[i]._load) {
                    resolve(frames[i].contentDocument.getElementById(id).text);
                } else {
                    var callback = frames[i].onload;
                    frames[i].onload = function () {
                        callback.apply(this);
                        resolve(frames[i].contentDocument.getElementById(
                                id).text);
                    };
                }
                return;
            }
        }
        var frame = document.createElement('iframe');
        frame.onload = function () {
            this._load = true;
            resolve(this.contentDocument.getElementById(id).text); };
        frame.src = src;
        frame._src = src;
        tma._head.appendChild(frame);
    });
};

/**
 * Debug function to reload all external JavaScript files which are loaded.
 * @param callback callback to invoke when the JavaScript is reloaded
 */
tma.reload = function (callback) {
    // TODO: support shader reload.
    var srcs = [];
    for (var key in tma._scripts) {
        srcs.push(key);
        tma._head.removeChild(tma._scripts[key]);
    }
    tma._load(srcs, callback);
};

/**
 * Private load implementation to support plural source files.
 * @param srcs source file paths
 * @param callback callback to invoke when the JavaScript is loaded
 */
tma._load = function (srcs, callback) {
    var src = srcs.shift();
    tma.load(this._base + src, function () {
        if (srcs.length !== 0)
            tma._load(srcs, callback);
        else
            callback();
    });
};

/**
 * Initializations.
 */
var exports = {};
var global = window;
(function() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
        var match = scripts[i].src.match(/(^|.*\/)tma\.js$/);
        if (match) {
            tma._base = match[1];
            break;
        }
    }
    var libs = [
        'TmaScreen.js',
        'Tma2DScreen.js',
        'Tma3DScreen.js',
        'TmaParticle.js',
        'TmaMotionBvh.js',
        'TmaModelPly.js',
        'TmaModelPs2Ico.js'
    ];
    tma._load(libs, function () {
        tma.ready = true;
        if (0 !== tma.extlibs.length)
            tma._load(tma.extlibs, function () {
                if (tma.onload)
                    tma.onload();
            });
        else if (tma.onload)
            tma.onload();
    });
})();
