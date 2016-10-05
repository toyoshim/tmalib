(function () {
  var vr = false;
  var position = [ 0.0, 0.0, 0.0 ];
  var orientation = [ 0.0, 0.0, -90.0 ];
  var ready = false;

  var button = document.createElement('button');
  button.id = 'button';
  button.innerText = '|o o|';
  button.style.position = 'absolute';
  button.style.top = 0;
  button.style.left = 0;
  button.style.display = 'block';
  button.addEventListener('click', e => {
    document.body.webkitRequestFullscreen();
    window.screen.orientation.lock('landscape').then();
    button.style.display = 'none';
    vr = true;
  }, false);

  window.addEventListener('resize', function (e) {
    if (document.webkitFullscreenElement)
      return;
    document.getElementById('button').style.display = 'block';
    vr = false;
  }, false);

  document.body.addEventListener('keydown', function (e) {
    switch (e.which) {
      case 65:  // a
        position[0] -= 1.0;
        break;
      case 68:  // d
        position[1] += 1.0;
        break;
      case 69:  // e
        position[2] -= 1.0;
        break;
      case 70:  // f
        position[0] += 1.0;
        break;
      case 72:  // h
        orientation[0] -= 1.0;
        break;
      case 73:  // i
        orientation[1] -= 1.0;
        break;
      case 74:  // j
        orientation[2] -= 1.0;
        break;
      case 75:  // k
        orientation[2] += 1.0;
        break;
      case 76:  // l
        orientation[0] += 1.0;
        break;
      case 83:  // s
        position[1] -= 1.0;
        break;
      case 85:  // u
        orientation[1] += 1.0;
        break;
      case 87:  // w
        position[2] -= 1.0;
        break;
      case 88:  // x
        position[2] += 1.0;
        break;
      default:
        console.log(e.which);
    }
  });

  window.addEventListener('deviceorientation', function (e) {
    if (e.alpha == null)
      return;
    orientation[0]= e.alpha;
    orientation[1]= e.beta;
    orientation[2]= e.gamma;
  }, false);

  window.vr_run = function (frame) {
    if (!ready) {
      document.body.appendChild(button);
      ready = true;
    }
    frame.properties.vr = vr;
    frame.properties.orientation = orientation;
    frame.properties.position = position;
  };
})();
