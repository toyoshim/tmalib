Polymer('majvj-suite', {
  width: 0,
  height: 0,
  type: 'frame',
  name: undefined,
  options: undefined,
  base: '',
  ready: function () {
    var _majvj = this.$.majvj;
    var _core = _majvj.core;
    var tma = _core.tma;
    var TmaScreen = _core.TmaScreen;
    var Tma2DScreen = _core.Tma2DScreen;
    var Tma3DScreen = _core.Tma3DScreen;
    var TmaModelPrimitives = _core.TmaModelPrimitives;
    var TmaParticles = _core.TmaParticles;
    var TmaSequencer = _core.TmaSequencer;
    var TmaMotionBvh = _core.TmaMotionBvh;
    var TmaModelPly = _core.TmaModelPly;
    var TmaModelPs2Ico = _core.TmaModelPs2Ico;
    var MajVj = _majvj.MajVj;
    var vec2 = _majvj.vec2;
    var vec3 = _majvj.vec3;
    var vec4 = _majvj.vec4;
    var mat2 = _majvj.mat2;
    var mat3 = _majvj.mat3;
    var mat4 = _majvj.mat4;
    var quat4 = _majvj.quat4;
