    this.core = this.$.core;
    this.MajVj = MajVj;
    this.vec2 = exports.vec2;
    this.vec3 = exports.vec3;
    this.vec4 = exports.vec4;
    this.mat2 = exports.mat2;
    this.mat3 = exports.mat3;
    this.mat4 = exports.mat4;
    this.quat4 = exports.quat4;
    this.create = function (width, height, fullscreen, parent) {
      return new MajVj(width, height, fullscreen, parent);
    };
    this.setBase = function (base) {
      tma.base = base;
    };
  }
});
