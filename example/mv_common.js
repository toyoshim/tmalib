var controller = {};
controller.volume = [0.0, 0.0];
controller.nano2 = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
controller.orientation = [0.0, 0.0, 0.0];
controller.hasOrientation = false;
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

var ws = new WebSocket('wss://wshub.herokuapp.com/majvj', ['x-wshub']);
ws.onmessage = function (e) {
  console.log(e.data);
  try {
    var data = JSON.parse(e.data);
  } catch (e) {
    return;
  }
  if (data.client != 'majvj')
    return;
  if (data.type == 'log')
    console.log(data.data);
  if (data.type == 'deviceorientation' && !controller.hasOrientation)
    controller.orientation = [e.alpha, e.beta, e.gamma];
};

window.addEventListener('deviceorientation', function (e) {
  controller.hasOrientation = true;
  controller.orientation = [e.alpha, e.beta, e.gamma];
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

