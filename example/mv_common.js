var controller = {
  volume: [0.0, 0.0],
  nano2: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  orientation: [0.0, 0.0, -90.0],
  sound: {},
  hasOrientation: false,
  get vr() {
    if (!this._vrUsed) {
      this._vrUsed = true;
      var button = document.createElement('button');
      button.id = 'button';
      button.innerText = '|o o|';
      button.style.position = 'absolute';
      button.style.top = 0;
      button.style.left = 0;
      button.addEventListener('click', function (e) {
        document.body.webkitRequestFullscreen();
        screen.orientation.lock('landscape').then();
        button.style.display = 'none';
        controller._vr = true;
      }, false);
      document.body.appendChild(button);
      window.addEventListener('resize', function (e) {
        if (document.webkitFullscreenElement)
          return;
        document.getElementById('button').style.display = 'block';
        controller._vr = false;
      }, false);
    }
    return this._vr;
  },
  _vr: false,
  _vrUsed: false
};


var emulate = true;
document.body.addEventListener('keydown', function (e) {
  switch (e.which) {
    case 70:  // f
      document.body.webkitRequestFullscreen();
      break;
    case 72:  // h
      controller.volume[1] -= 0.01;
      break;
    case 74:  // j
      controller.volume[0] -= 0.01;
      break;
    case 75:  // k
      controller.volume[0] += 0.01;
      break;
    case 76:  // l
      controller.volume[1] += 0.01;
      break;
    case 88:  // x
      emulate = !emulate;
      controller._vr = !controller._vr;
      break;
    default:
      console.log(e.which);
  }
});

function nanoKONTROL2 (e) {
  var data = e.data;
  if (data[0] == 176 && data[1] < 8) {  // sliders
    controller.nano2[data[1]] = data[2] / 127;
  } else if (data[0] == 176 && 16 <= data[1] && data[1] < 24) { // knobs
    // Do something here.
  } else {
    console.log(data);
  }
}


if (navigator['requestMIDIAccess']) {
  navigator.requestMIDIAccess().then(function (a) {
    var inputs = [];
    if (typeof a.inputs === "function") {
      inputs = a.inputs();
    } else {
      var it = a.inputs.values();
      for (var o = it.next(); !o.done; o = it.next())
        inputs.push(o.value);
    }
    for (var i = 0; i < inputs.length; ++i) {
      if (inputs[i].name == 'nanoKONTROL2') {
        inputs[i].onmidimessage = nanoKONTROL2;
        console.log(inputs[i].name + ' found.');
        window.nano2 = inputs[i];  // make it alive
      } else {
        console.log(inputs[i]);
      }
    }
  }, function (e) { console.log(e); });
}


window.addEventListener('message', function (e) {
  console.log(e.data);
  if (e.data.type == 'range')
    controller.volume[e.data.index] = e.data.value;
  else if (e.data.type == 'button')
    console.log(e.data.value);
});

var ws = {};
//ws = new WebSocket('wss://wshub.herokuapp.com/majvj', ['x-wshub']);
ws.onmessage = function (e) {
  var data;
  try {
    data = JSON.parse(e.data);
  } catch (e) {
    return;
  }
  if (data.client != 'majvj')
    return;
  if (data.type == 'log')
    console.log(data.data);
  if (data.type == 'deviceorientation' && !controller.hasOrientation) {
    controller.orientation[0] = data.alpha;
    controller.orientation[1] = data.beta;
    controller.orientation[2] = data.gamma;
  }
};

window.addEventListener('deviceorientation', function (e) {
  if (e.alpha == null)
    return;
  controller.hasOrientation = true;
  controller.orientation[0]= e.alpha;
  controller.orientation[1]= e.beta;
  controller.orientation[2]= e.gamma;
  if (ws.readyState != ws.OPEN)
    return;
  ws.send(JSON.stringify({
    client: 'majvj',
    type: 'deviceorientation',
    alpha: e.alpha,
    beta: e.beta,
    gamma: e.gamma
  }));
}, true);

function _(f){return function(){try{f();}catch(e){console.error(e.stack);}}}

