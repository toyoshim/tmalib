/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - effect plugin - nicofarre -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.effect.nicofarre = function (options) {
    this._screen = options.screen;
    this._width = options.width;
    this._height = options.height;
    this._aspect = options.aspect;
    this.properties = { volume: [ 0.0, 0.0 ] };
    this._front = (options.front !== undefined) ? options.front : true;
    this._program = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.nicofarre._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.nicofarre._fragmentShader));
    this._programForCeiling = this._screen.createProgram(
            this._screen.compileShader(Tma3DScreen.VERTEX_SHADER,
                    MajVj.effect.nicofarre._vertexShader),
            this._screen.compileShader(Tma3DScreen.FRAGMENT_SHADER,
                    MajVj.effect.nicofarre._fragmentShaderForCeiling));
    this._pMatrix = mat4.create();
    this.onresize(this._aspect);
    this._mvMatrix = mat4.identity(mat4.create());
    var position = options.position || [0, 0, -500];
    mat4.translate(this._mvMatrix, this._mvMatrix, position);
    this._coords = this._screen.createBuffer([
            // A (right): 1480x280, x=420
            420, -140, -740,
            420, 140, -740,
            420, 140, 740,
            420, -140, 740,
            // B (stage): 840x280, z=-740
            -420, -140, -740,
            -420, 140, -740,
            420, 140, -740,
            420, -140, -740,
            // C (left): 1480x280, 4=-420
            -420, -140, 740,
            -420, 140, 740,
            -420, 140, -740,
            -420, -140, -740,
            // D (back): 840x280, z=740
            420, -140, 740,
            420, 140, 740,
            -420, 140, 740,
            -420, -140, 740,
            // E (stage right): 160x280, z=-580
            260, -140, -580,
            260, 140, -580,
            420, 140, -580,
            420, -140, -580,
            // F (stage left): 160x280, z=-580
            -420, -140, -580,
            -420, 140, -580,
            -260, 140, -580,
            -260, -140, -580,
            // G (ceiling): 840x1480, y=140
            -420, 140, -740,
            -420, 140, 740,
            420, 140, 740,
            420, 140, -740]);
    this._texCoords = this._screen.createBuffer([
            // A (right): (40, 760) - (1520, 1040) / (1920, 1080)
            40 / 1920, 760 / 1080,
            40 / 1920, 1040 / 1080,
            1520 / 1920, 1040 / 1080,
            1520 / 1920, 760 / 1080,
            // B (stage): (40, 120) - (880, 400) / (1920, 1080)
            40 / 1920, 120 / 1080,
            40 / 1920, 400 / 1080,
            880 / 1920, 400 / 1080,
            880 / 1920, 120 / 1080,
            // C (left): (40, 440) - (1520, 720) / (1920, 1080)
            40 / 1920, 440 / 1080,
            40 / 1920, 720 / 1080,
            1520 / 1920, 720 / 1080,
            1520 / 1920, 440 / 1080,
            // D (back): (920, 120) - (1760, 400) / (1920, 1080)
            920 / 1920, 120 / 1080,
            920 / 1920, 400 / 1080,
            1760 / 1920, 400 / 1080,
            1760 / 1920, 120 / 1080,
            // E (stage right): (1560, 760) - (1720, 1040) / (1920, 1080)
            1560 / 1920, 760 / 1080,
            1560 / 1920, 1040 / 1080,
            1720 / 1920, 1040 / 1080,
            1720 / 1920, 760 / 1080,
            // F (stage left): (1560, 440) - (1720, 720) / (1920, 1080)
            1560 / 1920, 440 / 1080,
            1560 / 1920, 720 / 1080,
            1720 / 1920, 720 / 1080,
            1720 / 1920, 440 / 1080,
            // G (ceiling): (1760, 870) - (1858, 1040) / (1920, 1080)
            1760 / 1920, 870 / 1080,
            1760 / 1920, 1040 / 1080,
            1858 / 1920, 1040 / 1080,
            1858 / 1920, 870 / 1080]);
    this._phase = this._screen.createBuffer([
            // A, B, C, D, E, F
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            // G (0, 0) - (138, 210) * PI
            0, 0,
            0, 210 * Math.PI,
            138 * Math.PI, 210 * Math.PI,
            138 * Math.PI, 0]);
};

// Shader programs.
MajVj.effect.nicofarre._vertexShader = null;
MajVj.effect.nicofarre._fragmentShader = null;
MajVj.effect.nicofarre._fragmentShaderForCeiling = null;


/**
 * Loads resources asynchronously.
 */
MajVj.effect.nicofarre.load = function () {
    return new Promise(function (resolve, reject) {
        Promise.all([
            MajVj.loadShader('effect', 'nicofarre', 'shaders.html', 'vertex'),
            MajVj.loadShader('effect', 'nicofarre', 'shaders.html', 'fragment'),
            MajVj.loadShader('effect', 'nicofarre', 'shaders.html',
                    'fragmentForCeiling'),
        ]).then(function (shaders) {
            MajVj.effect.nicofarre._vertexShader = shaders[0];
            MajVj.effect.nicofarre._fragmentShader = shaders[1];
            MajVj.effect.nicofarre._fragmentShaderForCeiling = shaders[2];
            resolve();
        }, function () { reject('nicofarre.load fails'); });
    });
};

/**
 * Handles screen resize.
 * @param aspect screen aspect ratio
 */
MajVj.effect.nicofarre.prototype.onresize = function (aspect) {
    this._aspect = aspect;
    mat4.perspective(this._pMatrix, Math.PI / 4, aspect, 0.1, 10000.0);
};

/**
 * Draws a frame.
 * @param delta delta time from the last rendering
 * @param texture texture data
 */
MajVj.effect.nicofarre.prototype.draw = function (delta, texture) {
    var mvMatrix = mat4.clone(this._mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0, 0, 1000 * this.properties.volume[0]]);
    mat4.rotate(mvMatrix, mvMatrix, Math.PI * this.properties.volume[1], [0, 1, 0]);
    this._screen.pushAlphaMode();
    this._screen.setAlphaMode(false);
    this._screen.pushCullingMode();
    this._screen.setCullingMode(true, false);
    this._program.setAttributeArray('aCoord', this._coords, 0, 3, 0);
    this._program.setAttributeArray('aTexCoord', this._texCoords, 0, 2, 0);
    this._program.setUniformMatrix('uPMatrix', this._pMatrix);
    this._program.setUniformMatrix('uMVMatrix', mvMatrix);
    this._program.setTexture('uTexture', texture);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 0, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 4, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 8, 4);
    this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 12, 4);
    if (this._front) {
        this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 16, 4);
        this._program.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 20, 4);
    }
    this._programForCeiling.setAttributeArray('aCoord', this._coords, 0, 3, 0);
    this._programForCeiling.setAttributeArray('aTexCoord', this._texCoords, 0,
            2, 0);
    this._programForCeiling.setAttributeArray('aPhase', this._phase, 0, 2, 0)
    this._programForCeiling.setUniformMatrix('uPMatrix', this._pMatrix);
    this._programForCeiling.setUniformMatrix('uMVMatrix', mvMatrix);
    this._programForCeiling.setTexture('uTexture', texture);
    this._programForCeiling.drawArrays(Tma3DScreen.MODE_TRIANGLE_FAN, 24, 4);
    this._screen.popCullingMode();
    this._screen.popAlphaMode();
};
