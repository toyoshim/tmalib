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
