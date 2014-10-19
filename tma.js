/**
 * T'MediaArt library for JavaScript.
 * - bootstrap script - the first boot loader.
 */

var exports = {};
var module = {};
var global = {};

/**
 * tma prototype
 *
 * This prototype provides base functions.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
var tma = {
  base: undefined,    // Base URL to load sub resources.
  ready: false,       // Flag to know tmalib gets ready.
  onload: undefined,  // Callback that is fired once tmalib gets ready.
  extlibs: [],        // Holds URLs to load before the library gets ready.
  global: true        // Exports to global (window).
};

// Starts loading sub scripts after DOM gets ready. A user may set tma.onload
// and tma.extlibs to use additional libraries until then.
document.addEventListener('DOMContentLoaded', function () {
  if (tma.base === undefined) {
    tma.base = '';
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var match = scripts[i].src.match(/(^|.*\/)tma\.js$/);
      if (match) {
        tma.base = match[1];
        break;
      }
    }
  }
  if (tma.global) {
    exports = window;
    module.exports = window;
    global = window;
  }
  var core = document.createElement('script');
  core.src = tma.base + 'src/core.js';
  core.onload = function () {
    tma._boot();
  };
  document.head.appendChild(core);
});
