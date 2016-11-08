/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - random -
 * based on Ken random's reference implementation of improved noise in Java.
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.random = function (options) {
  // [min, max)
  this._base = options.min || 0.0;
  var max = options.max !== undefined ? options.max : 1.0;
  this._scale = max - this._base;
  this._n = options.seed || 1976.0227;
};

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.random.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Generates a random value in [options.min, options.max). |min| and |max|
 * should be specified together if caller want to overwrite options values.
 * @param min minimum value that overwrites options.min (optional)
 * @param max maximum value that overwrites options.max (optional)
 * @return a random value
 */
MajVj.misc.random.prototype.generate = function (min, max) {
  var base = this._base;
  var scale = this._scale;
  if (min !== undefined && max !== undefined) {
    base = min;
    scale = max - min;
  }
  var n = this._n;
  n = n ^ (n << 13);
  n = n ^ (n >> 17);
  n = n ^ (n << 5);
  // Bit-shift makes the value signed int. Make it back to a float.
  if (n < 0)
    n += 0x100000000;
  this._n = n;
  n = n / 0x100000000;
  return base + n * scale;
};
