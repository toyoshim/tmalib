    this.core = this.$.core;
    this.MajVj = MajVj;
    this.vec2 = module.exports.vec2;
    this.vec3 = module.exports.vec3;
    this.vec4 = module.exports.vec4;
    this.mat2 = module.exports.mat2;
    this.mat3 = module.exports.mat3;
    this.mat4 = module.exports.mat4;
    this.quat4 = module.exports.quat4;
    this.create = function (width, height, fullscreen, parent) {
      return new MajVj(width, height, fullscreen, parent);
    };
    this.setBase = function (base) {
      tma.base = base;
    };
  }
});
