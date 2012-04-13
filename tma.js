function tma () {
}

tma._head = document.getElementsByTagName("head")[0];
tma._base = "";
tma._scripts = {};
tma.ready = false;
tma.onload = null;

tma.log = function () {
  console.log.apply(console, arguments);
};

tma.warn = function () {
  console.warn.apply(console, arguments);
};

tma.error = function () {
  console.error.apply(console, arguments);
};

tma.load = function (src, callback) {
  var script = document.createElement("script");
  script.onload = callback;
  script.src = src;
  tma._head.appendChild(script);
  tma._scripts[src] = script;
};

tma.unload = function (src) {
  tma._head.removeChild(tma._scripts[src]);
  delete tma._scripts[src];
};

tma._load = function (srcs, callback) {
  var invoker;
  if (callback) {
    var done = 0;
    invoker = function () {
      done++;
      if (srcs.length == done)
        callback();
    }
  }
  for (var i = 0; i < srcs.length; i++)
    tma.load(this._base + srcs[i], invoker);
};

tma.reload = function (callback) {
  var srcs = [];
  for (var key in tma._scripts) {
    srcs.push(key);
    tma._head.removeChild(tma._scripts[key]);
  }
  tma._load(srcs, callback);
};

(function() {
  var scripts = document.getElementsByTagName("script");
  for (var i = 0; i < scripts.length; i++) {
    var match = scripts[i].src.match(/(^|.*\/)tma\.js$/);
    if (match) {
      tma._base = match[1];
      break;
    }
  }
  var libs = [
    "TmaScreen.js"
  ];
  tma._load(libs, function () {
    tma.ready = true;
    if (tma.onload)
      tma.onload();
  });
})();

