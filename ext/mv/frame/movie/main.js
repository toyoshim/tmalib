/**
 * T'MediaArt library for Javascript
 *  - MajVj extension - frame plugin - movie -
 * @param mv MajVj object
 * @param screen Tma3DScreen oject
 * @param width offscreen width
 * @param height offscreen height
 * @param aspect screen aspect ratio (screen width / screen height)
 */
MajVj.frame.movie = function (mv, screen, width, height, aspect) {
    this._screen = screen;
    this._width = width;
    this._height = height;
    this._aspect = aspect;
    this._controller = null;
    this._video = null;
    this._texture = null;
    this._zoom = 1.0;

    this._program = screen.createProgram(
            screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.frame.movie._vertexShader),
            screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.frame.movie._fragmentShader));
    this._coords = screen.createBuffer([0, 0, 0, 1, 1, 1, 1, 0])
};

// Shader programs.
MajVj.frame.movie._vertexShader = null;
MajVj.frame.movie._fragmentShader = null;

/**
 * Loads resource asynchronously.
 * @return a Promise object
 */
MajVj.frame.movie.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('frame', 'movie', 'shaders.html', 'vertex'),
            MajVj.loadShader('frame', 'movie', 'shaders.html', 'fragment')
        ]).then(function (results) {
            MajVj.frame.movie._vertexShader = results[0];
            MajVj.frame.movie._fragmentShader = results[1];
            resolve();
        }, function (error) { console.log(error); });
    });
};

/**
 * Starts playing a movie from a specified URL.
 * @param url a movie URL
 * @return a Promise object
 */
MajVj.frame.movie.prototype.play = function (url) {
    return new Promise(function (resolve, reject) {
        MajVj.loadMovieFrom(url).then(function (video) {
            this._video = video;
            console.log('video: ' + video.videoWidth + 'x' + video.videoHeight);
            var aspect = video.videoWidth / video.videoHeight;
            if (this._aspect > aspect)
                this._zoom = this._aspect / aspect;
            this._texture = this._screen.createTexture(
                    video, true, Tma3DScreen.FILTER_LINEAR);
            video.play();
            video.addEventListener('ended', function() {
              video.currentTime = 0;
              video.play();
            });
            resolve();
        }.bind(this), function (error) { console.log(error); });
    }.bind(this));
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.frame.movie.prototype.onresize = function (aspect) {
    this._aspect = aspect;
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 */
MajVj.frame.movie.prototype.draw = function (delta) {
    if (!this._texture)
        return;
    this._texture.update(this._video);
    this._program.setAttributeArray('aCoord', this._coords, 0, 2, 0);
    this._program.setUniformVector('uZoom', [this._zoom]);
    this._program.setTexture('uTexture', this._texture);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
};

/**
 * Sets a controller.
 */
MajVj.frame.movie.prototype.setController = function (controller) {
    this._controller = controller;
};
