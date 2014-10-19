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
  console.error(e.stack);
};

// Holds loading and loaded JavaScript libraries.
tma._libraries = {};

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
    var promise = new Promise(function (resolve, reject) {
      var callbacks = tma._libraries[src].callbacks;
      callbacks.push(resolve);
      if (callback)
        callbacks.push(callback);
    });
    return promise;
  }
};

/**
 * TODO: Add a cache capability.
 * Fetches a data via XMLHttpRequest.
 * @param url a url to fetch a data
 * @param type a response type in string (optional: 'arraybuffer' is default)
 * @return a Primise
 */
tma.fetch = function (url, type) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = type || 'arraybuffer';
    xhr.onload = function () {
      if (!this.response)
        reject();
      else
        resolve(this.response);
      this.onload = null;
    }.bind(xhr);
    xhr.send();
  });
};

/**
 * TODO: Use fetch with resopnseType 'document'.
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
            resolve(frames[i].contentDocument.getElementById(id).text);
          };
        }
        return;
      }
    }
    var frame = document.createElement('iframe');
    frame.onload = function () {
      this._load = true;
      resolve(this.contentDocument.getElementById(id).text);
    };
    frame.src = src;
    frame._src = src;
    document.head.appendChild(frame);
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
