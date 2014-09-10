/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - frame plugin - nicofarre3d - roll module
 */
MajVj.frame.nicofarre3d.modules.roll = function (options) {
  this._api = options.api;

  var font = options.font || {
    size: 90,
    name: 'Sans',
    foreground: 'rgba(19, 76, 51, 255)',
    background: 'rgba(0, 0, 0, 255'
  };
  var headFont = options.headFont || font;
  var script = options.script || [
    { head: true, text: 'Powered by' },
    { text: 'Takashi Toyoshima' }
  ];
  this._headScale = options.headScale || 1.2;
  this._ghost = (typeof options.ghost != 'undefined') ? options.ghost : 0.8;

  var texts = [];
  var heads = [];
  for (var i = 0; i < script.length; ++i) {
    if (script[i].head)
      heads.push(script[i].text);
    else
      texts.push(script[i].text);
  }
  this._normFont = this._api.createFont(font, texts.join(''));
  this._headFont = this._api.createFont(headFont || font, heads.join(''));

  this._sequencer = new TmaSequencer();
  var delay = options.delay || 0;
  var t = delay * 1000;
  for (i = 0; i < script.length; ++i) {
    this._sequencer.register(t, this._createTextLineTask(script[i]));
    t += 3000;
  }

  this._sequencer.start();
}

/**
 * Clears screen.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.roll.prototype.clear = function (api) {
  var rate = this._ghost;
  api.setAlphaMode(true, api.gl.DST_COLOR, api.gl.ZERO);
  api.fill([rate, rate, rate, 1.0]);
};

/**
 * Draws.
 * @param api nicofarre3d interfaces
 */
MajVj.frame.nicofarre3d.modules.roll.prototype.draw = function (api) {
  api.setAlphaMode(true, api.gl.ONE, api.gl.ONE);
  this._sequencer.run(api.delta);
};

MajVj.frame.nicofarre3d.modules.roll.prototype._createTextLineTask =
    function (script) {
  var task = new TmaSequencer.ParallelTask();
  var width = 0;
  var text = script.text;
  var font = script.head ? this._headFont : this._normFont;
  var scale = script.head ? this._headScale : 1.0;
  for (var i = 0; i < text.length; ++i)
    width += font[text[i]].width * scale;
  var x = -width / 2;
  for (i = 0; i < text.length; ++i) {
    var size = font[text[i]].width * scale;
    task.append(new MajVj.frame.nicofarre3d.modules.roll.Cell(
        this._api, font, text[i], x + size / 2, scale, 100 * i));
    x += size;
  }
  return task;
};

MajVj.frame.nicofarre3d.modules.roll.Cell =
    function (api, font, c, x, scale, delay) {
  this._api = api;
  this._font = font;
  this._scale = scale;
  this._sx = (Math.random() - 0.5) * 10000;
  this._sy = (Math.random() - 0.5) * 3000;
  this._sz = Math.random() * 5000;
  this._dx = x;
  this._dy = -50;
  this._dz = -1000;
  this._rx = x;
  this._ry = 0;
  this._rz = -2000;
  this._vy = +0.5;
  this._vz = -1;
  this._c = c;
  this._time = 0;
  this._appearDuration = 1000;
  this._stopDuration = 3000;
  this._wipeoutDuration = 100;
  this._wipeDuration = 1000;
  this._wipeinDuration = 100;
  this._rollDuration = 10000;
  this.SerialTask();
  this.append(new TmaSequencer.Task(delay));
  this.append(new TmaSequencer.Task(0, this._reset.bind(this)));
  this.append(new TmaSequencer.Task(
      this._appearDuration, this._appear.bind(this)));
  this.append(new TmaSequencer.Task(0, this._reset.bind(this)));
  this.append(new TmaSequencer.Task(0, this._reset.bind(this)));
  this.append(new TmaSequencer.Task(
      this._stopDuration - delay, this._stop.bind(this)));
  this.append(new TmaSequencer.Task(0, this._reset.bind(this)));
  this.append(new TmaSequencer.Task(
      this._wipeoutDuration, this._wipeout.bind(this)));
  this.append(new TmaSequencer.Task(0, this._reset.bind(this)));
  this.append(new TmaSequencer.Task(this._wipeDuration));
  this.append(new TmaSequencer.Task(0, this._reset.bind(this)));
  this.append(new TmaSequencer.Task(
      this._wipeinDuration, this._wipein.bind(this)));
  this.append(new TmaSequencer.Task(0, this._reset.bind(this)));
  this.append(new TmaSequencer.Task(
      this._rollDuration, this._roll.bind(this)));
};

MajVj.frame.nicofarre3d.modules.roll.Cell.prototype =
    new TmaSequencer.SerialTask;
MajVj.frame.nicofarre3d.modules.roll.Cell.prototype.SerialTask =
    TmaSequencer.SerialTask;
MajVj.frame.nicofarre3d.modules.roll.Cell.prototype.constructor =
    MajVj.frame.nicofarre3d.modules.roll.Cell;

MajVj.frame.nicofarre3d.modules.roll.Cell.prototype._reset =
    function (delta, time) {
  this._time = time;
};

MajVj.frame.nicofarre3d.modules.roll.Cell.prototype._appear =
    function (delta, time) {
  var rate = (time - this._time) / this._appearDuration;
  var irate = 1 - rate;
  var p = [this._sx * irate + this._dx * rate,
           this._sy * irate + this._dy * rate,
           this._sz * irate + this._dz * rate];
  this._api.drawCharacter(this._font, this._c, this._scale, this._scale, p);
};

MajVj.frame.nicofarre3d.modules.roll.Cell.prototype._stop =
    function (delta, time) {
  this._api.drawCharacter(
      this._font, this._c, this._scale, this._scale,
      [this._dx, this._dy, this._dz]);
};

MajVj.frame.nicofarre3d.modules.roll.Cell.prototype._wipeout =
    function (delta, time) {
  var rate = (time - this._time) / this._wipeoutDuration;
  var irate = 1 - rate;
  this._api.drawCharacter(
      this._font, this._c, this._scale * (1 + rate * 2.5), this._scale * irate,
      [this._dx * (1 + rate * 5), this._dy, this._dz]);
};

MajVj.frame.nicofarre3d.modules.roll.Cell.prototype._wipein =
    function (delta, time) {
  var rate = (time - this._time) / this._wipeinDuration;
  var irate = 1 - rate;
  this._api.drawCharacter(
      this._font, this._c, this._scale * (1 + irate * 2.5), this._scale * irate,
      [this._rx * (1 + irate * 5), this._ry, this._rz],
      [-Math.PI / 3, 0, 0]);
  this._ry += this._vy;
  this._rz += this._vz;
};

MajVj.frame.nicofarre3d.modules.roll.Cell.prototype._roll =
    function (delta, time) {
  this._api.drawCharacter(
      this._font, this._c, this._scale, this._scale,
      [this._rx, this._ry, this._rz],
      [-Math.PI / 4, 0, 0]);
  this._ry += this._vy;
  this._rz += this._vz;
};
