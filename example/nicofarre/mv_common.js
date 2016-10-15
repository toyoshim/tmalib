controller = {
  volume: [0.0, 0.0],
  nano2: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  sound: {},
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
    var it = a.inputs.values();
    for (var o = it.next(); !o.done; o = it.next()) {
      var port = o.value;
      if (port.name == 'nanoKONTROL2') {
        port.onmidimessage = nanoKONTROL2;
        console.log(inputs[i].name + ' found.');
        window.nano2 = port;  // make it alive
      } else {
        console.log(port);
      }
    }
  }, function (e) { console.log(e); });
}


function _(f){return function(){try{f();}catch(e){console.error(e.stack);}}}

