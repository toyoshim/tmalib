/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - perlin -
 * based on Ken Perlin's reference implementation of improved noise in Java.
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.perlin = function (options) {
    this._options = options;
    this._p = MajVj.misc.perlin._permutation;
};

MajVj.misc.perlin._permutation = [
    151, 160, 137,  91,  90,  15, 131,  13,
    201,  95,  96,  53, 194, 233,   7, 225,
    140,  36, 103,  30,  69, 142,   8,  99,
     37, 240,  21,  10,  23, 190,   6, 148,
    247, 120, 234,  75,   0,  26, 197,  62,
     94, 252, 219, 203, 117,  35,  11,  32,
     57, 177,  33,  88, 237, 149,  56,  87,
    174,  20, 125, 136, 171, 168,  68, 175,
     74, 165,  71, 134, 139,  48,  27, 166,
     77, 146, 158, 231,  83, 111, 229, 122,
     60, 211, 133, 230, 220, 105,  92,  41,
     55,  46, 245,  40, 244, 102, 143,  54,
     65,  25,  63, 161,   1, 216,  80,  73,
    209,  76, 132, 187, 208,  89,  18, 169,
    200, 196, 135, 130, 116, 188, 159,  86,
    164, 100, 109, 198, 173, 186,   3,  64,
     52, 217, 226, 250, 124, 123,   5, 202,
     38, 147, 118, 126, 255,  82,  85, 212,
    207, 206,  59, 227,  47,  16,  58,  17,
    182, 189,  28,  42, 223, 183, 170, 213,
    119, 248, 152,   2,  44, 154, 163,  70,
    221, 153, 101, 155, 167,  43, 172,   9,
    129,  22,  39, 253,  19,  98, 108, 110,
     79, 113, 224, 232, 178, 185, 112, 104,
    218, 246,  97, 228, 251,  34, 242, 193,
    238, 210, 144,  12, 191, 179, 162, 241,
     81,  51, 145, 235, 249,  14, 239 ,107,
     49, 192, 214,  31, 181, 199, 106, 157,
    184,  84, 204, 176, 115, 121,  50,  45,
    127,   4, 150, 254, 138, 236, 205,  93,
    222, 114,  67,  29,  24,  72, 243, 141,
    128, 195,  78,  66, 215,  61, 156, 180
];

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.perlin.load = function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
};

/**
 * Returns a corresponding perlin noise value to the location.
 * @param x X location
 * @param y Y location
 * @param z Z location
 * @return a perlin noise value
 */
MajVj.misc.perlin.prototype.noise = function (x, y, z) {
    var X = Math.floor(x) & 255;
    var Y = Math.floor(y) & 255;
    var Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    var u = this._fade(x);
    var v = this._fade(y);
    var w = this._fade(z);
    var A = this._p[X] + Y;
    var AA = this._p[A % 256] + Z;
    var AB = this._p[(A + 1) % 256] + Z;
    var B = this._p[(X + 1) % 256] + Y;
    var BA = this._p[B % 256] + Z;
    var BB = this._p[(B + 1) % 256] + Z;

    return this._lerp(w,
                      this._lerp(v,
                                 this._lerp(u,
                                            this._grad(this._p[AA % 256],
                                                       x,
                                                       y,
                                                       z),
                                            this._grad(this._p[BA % 256],
                                                       x - 1,
                                                       y,
                                                       z)),
                                 this._lerp(u,
                                            this._grad(this._p[AB % 256],
                                                       x,
                                                       y - 1,
                                                       z),
                                            this._grad(this._p[BB % 256],
                                                       x - 1,
                                                       y - 1,
                                                       z))),
                      this._lerp(v,
                                 this._lerp(u,
                                            this._grad(this._p[(AA + 1) % 256],
                                                       x,
                                                       y,
                                                       z - 1),
                                            this._grad(this._p[(BA + 1) % 256],
                                                       x - 1,
                                                       y,
                                                       z - 1)),
                                 this._lerp(u,
                                            this._grad(this._p[(AB + 1) % 256],
                                                       x,
                                                       y - 1,
                                                       z - 1),
                                            this._grad(this._p[(BB + 1) % 256],
                                                       x - 1,
                                                       y - 1,
                                                       z - 1))));
}

MajVj.misc.perlin.prototype._fade = function (t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

MajVj.misc.perlin.prototype._lerp = function (t, a, b) {
    return a + t * (b - a);
}

MajVj.misc.perlin.prototype._grad = function (hash, x, y, z) {
    var h = hash & 15;
    var u = h < 8 ? x : y;
    var v = h < 4 ? y : h == 12 || h == 14 ? x : z;
    return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
}