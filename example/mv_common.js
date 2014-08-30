var controller = {};
controller.volume = [0.0, 0.0];
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

window.addEventListener('message', function (e) {
  console.log(e.data);
  if (e.data.type == 'range')
    controller.volume[e.data.index] = e.data.value;
  else if (e.data.type == 'button')
    console.log(e.data.value);
});

function _(f){return function(){try{f();}catch(e){console.error(e.stack);}}}

