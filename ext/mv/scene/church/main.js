/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - scene plugin - church -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.scene.church = function (options) {
  this._mv = options.mv;
  this.properties = {};

  this._frame = this._mv.create('frame', 'nicofarre', {
      led: MajVj.frame.nicofarre.LED_WHOLE_WALLS,
      frames: [
          { name: 'sandbox', options: { shader: MajVj.scene.church.shader } }
      ]});
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.scene.church.prototype.draw = function (delta) {
  this._mv.screen().setAlphaMode(false);
  this._frame.draw(delta);
};

// Fragment shader conforming the glsl sandbox.
MajVj.scene.church.shader = ' \
precision mediump float; \
uniform float time; \
uniform vec2 resolution; \
void main( void ) { \
  vec2 coord = gl_FragCoord.xy / resolution * 3.141592 * 2.0; \
  float dr = sin(coord.x * 10.0 + time * 3.0) - sin(coord.y + time * 10.0); \
  float dg = \
      sin(coord.x * 20.0 - time * 2.0) - sin(coord.y * 2.0 + time * 5.0); \
  float db = sin(coord.x * 15.0 - time) - sin(coord.y * 1.5 + time * 7.0); \
  float er = sin(coord.x * 12.0 + time * 5.0) - sin(coord.y + time * 11.0); \
  float eg = \
      sin(coord.x * 22.0 - time * 1.0) - sin(coord.y * 2.0 + time * 9.0); \
  float eb = \
      sin(coord.x * 32.0 - time * 4.0) - sin(coord.y * 1.5 + time * 3.0); \
  float r = dr * dg * er * eg; \
  float g = dg * db * eg * eb; \
  float b = db * dr * eb * er; \
  gl_FragColor = vec4(r, g, b, 1.0); \
}';
