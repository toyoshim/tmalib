/**
 * T'MediaArt library for JavaScript.
 */

/**
 * Tma3DScreen prototype
 *
 * This prototype provides WebGL operations.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 *
 * @param width screen width
 * @param height screen height
 */
function Tma3DScreen (width, height) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.backgroundColor = '#000000';
    this.canvas.onmousemove = this._onmousemove.bind(this);
    this.canvas.onmouseout = this._onmouseout.bind(this);
    this.canvas.onmousedown = this._onmousedown.bind(this);
    this.canvas.onmouseup = this._onmouseup.bind(this);
    this.canvas2d = document.createElement('canvas');
    this.context = this.canvas2d.getContext('2d');
    this.gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!this.gl) {
        tma.log('WebGL: webgl is not supported. Try experimental-webgl...');
        this.gl = this.canvas.getContext('experimental-webgl');
    }
    if (!this.gl) {
        tma.log('WebGL: Try webkit-3d...');
        this.gl = this.canvas.getContext('webkit-3d');
    }
    if (!this.gl) {
        tma.error('WebGL: not supported.');
    }
    if (this.gl.getExtension('OES_texture_float') == null) {
        tma.log('WebGL: float texture is not supported.');
    }
    this.gl.viewport(0, 0, width, height);
    this.setAlphaMode(false);
    this.setCullingMode(false, true);
    this._currentAlphaMode = {};
    this._currentCullingMode = {};
    this._alphaModeStack = [];
    this._cullingModeStack = [];
    this._lastBoundFrameBuffer = this;
    this._mouse = false;
    this._mouseX = 0;
    this._mouseY = 0;
    this._mouseClickX = 0;
    this._mouseClickY = 0;
    this._mouseWidth = 0;
    this._mouseHeight = 0;

    // Logging GL capabilities.
    tma.log('WebGL max vertex uniform vectors: ' +
            this.gl.getParameter(this.gl.MAX_VERTEX_UNIFORM_VECTORS));
    tma.log('WebGL max varying vectors: ' +
            this.gl.getParameter(this.gl.MAX_VARYING_VECTORS));
    tma.log('WebGL max fragment uniform vectors: ' +
            this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS));
    tma.log('WebGL max vertex attributes: ' +
            this.gl.getParameter(this.gl.MAX_VERTEX_ATTRIBS));

    if (!Tma3DScreen._MODE_INITIALIZED) {
        Tma3DScreen.MODE_POINTS = this.gl.POINTS;
        Tma3DScreen.MODE_LINES = this.gl.LINES;
        Tma3DScreen.MODE_LINE_LOOP = this.gl.LINE_LOOP;
        Tma3DScreen.MODE_LINE_STRIP = this.gl.LINE_STRIP;
        Tma3DScreen.MODE_TRIANGLES = this.gl.TRIANGLES;
        Tma3DScreen.MODE_TRIANGLE_STRIP = this.gl.TRIANGLE_STRIP;
        Tma3DScreen.MODE_TRIANGLE_FAN = this.gl.TRIANGLE_FAN;
        Tma3DScreen.FILTER_NEAREST = this.gl.NEAREST;
        Tma3DScreen.FILTER_LINEAR = this.gl.LINEAR;
        Tma3DScreen._MODE_INITIALIZED = true;
    }
}

/**
 * Prototype variables.
 */
// Vertex shader type.
Tma3DScreen.VERTEX_SHADER = 1;
// Fragment shader type.
Tma3DScreen.FRAGMENT_SHADER = 2;
// Draw modes.
Tma3DScreen._MODE_INITIALIZED = false;
Tma3DScreen.MODE_POINTS = 0;
Tma3DScreen.MODE_LINES = 1;
Tma3DScreen.MODE_LINE_LOOP = 2;
Tma3DScreen.MODE_LINE_STRIP = 3;
Tma3DScreen.MODE_TRIANGLES = 4;
Tma3DScreen.MODE_TRIANGLE_STRIP = 5;
Tma3DScreen.MODE_TRIANGLE_FAN = 6;
Tma3DScreen.FILTER_NEAREST = 0x2600;
Tma3DScreen.FILTER_LINEAR = 0x2601;

/**
 * Attaches to a DOMElement. TmaScreen.BODY is useful predefined DOMElement
 * which represents the <body> DOMElement.
 * @param element DOMElement
 */
Tma3DScreen.prototype.attachTo = function (element) {
    element.appendChild(this.canvas);
};

/**
 * Detaches from a DOMElement.
 * @param element DOMElement
 */
Tma3DScreen.prototype.detachFrom = function (element) {
    element.removeChild(this.canvas);
};

/**
 * Resizes canvas and viewport.
 * @param width width
 * @param height height
 */
Tma3DScreen.prototype.resize = function (width, height) {
    this.width = width;
    this.height = height;
    var ratio = window.devicePixelRatio;
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.gl.viewport(0, 0, width * ratio, height * ratio);
};

/**
 * Compiles a shader program.
 * @param type shader type
 * @param program shader program in text
 * @return created shader
 */
Tma3DScreen.prototype.compileShader = function (type, program) {
    var type = (Tma3DScreen.VERTEX_SHADER == type) ? this.gl.VERTEX_SHADER :
            this.gl.FRAGMENT_SHADER;
    var shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, program);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
        tma.log('WebGL compiling shader: ' + this.gl.getShaderInfoLog(shader) +
                ' : ' + program);
    return shader;
};

/**
 * Loads shader program from DOMElement and compiles it.
 * @param type shader type
 * @param id DOMElement id
 * @return created shader
 */
Tma3DScreen.prototype.loadShader = function (type, id) {
    return this.compileShader(type, document.getElementById(id).text);
};

/**
 * Links program and logs error information if failed.
 * @param program
 */
Tma3DScreen.prototype.linkProgram = function (program) {
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS))
        tma.log('WebGL link program error: ' +
                this.gl.getProgramInfoLog(program));
    tma.log('WebGL program active attributes ' +
            this.gl.getProgramParameter(program, this.gl.ACTIVE_ATTRIBUTES));
};

/**
 * Creates program object with shader objects.
 * @param vertex vertex shader
 * @param fragment fragment shader
 */
Tma3DScreen.prototype.createProgram = function (vertex, fragment) {
    var programObject = this.gl.createProgram();
    if (vertex.constructor.name && 'WebGLShader' != vertex.constructor.name)
        vertex = this.loadShader(Tma3DScreen.VERTEX_SHADER, vertex);
    this.gl.attachShader(programObject, vertex);
    if (fragment.constructor.name && 'WebGLShader' != fragment.constructor.name)
        fragment = this.loadShader(Tma3DScreen.FRAGMENT_SHADER, fragment);
    this.gl.attachShader(programObject, fragment);
    this.linkProgram(programObject);
    programObject._owner = this;
    programObject._index = 0;
    programObject._textureId = 0;
    programObject._textureIdMap = {};
    programObject._attributes = {};
    programObject._uniforms = {};
    programObject.attributeIndex = function (name) {
        if (!this._attributes[name]) {
            this._attributes[name] =
                    this._owner.gl.getAttribLocation(this, name);
        }
        return this._attributes[name];
    };
    programObject.uniformIndex = function (name) {
        if (!this._uniforms[name]) {
            this._uniforms[name] =
                    this._owner.gl.getUniformLocation(this, name);
        }
        return this._uniforms[name];
    };
    programObject.setAttribute = function (name, array) {
        var index = this._attributeIndex(name);
        this._owner.setAttribute(this, index, array);
    };
    programObject.setAttributeArray =
            function (name, buffer, offset, dimension, stride) {
        var index = this.attributeIndex(name);
        buffer.bind();
        this._owner.setAttributeArray(this, index, offset, dimension, stride);
    };
    programObject.setUniformVector = function (name, array) {
        var index = this.uniformIndex(name);
        this._owner.setUniformVector(this, index, array);
    };
    programObject.setUniformMatrix = function (name, array) {
        var index = this.uniformIndex(name);
        this._owner.setUniformMatrix(this, index, array);
    };
    programObject.setTexture = function (name, texture) {
        var index = this.uniformIndex(name);
        var id = this._textureIdMap[name];
        if (!id) {
            id = this._textureId++;
            this._textureIdMap[name] = id;
        }
        this._owner.setTexture(this, index, id, texture);
    };
    programObject.drawArrays = function (mode, offset, length) {
        this._owner.drawArrays(this, mode, offset, length);
    };
    programObject.drawElements = function (mode, buffer, offset, length) {
        buffer.bind();
        this._owner.drawElements(this, mode, offset, length);
    };
    return programObject;
};

/**
 * Creates an array buffer from |array| and bind it to WebGL context.
 * @param array data to store in Array or ArrayBuffer
 * @return created buffer
 */
Tma3DScreen.prototype.createBuffer = function (array) {
    var buffer = this.gl.createBuffer();
    buffer._buffer = (array.constructor.name == 'Float32Array') ?
          array : new Float32Array(array);
    buffer._owner = this;
    buffer.bind = function () {
        this._owner.gl.bindBuffer(this._owner.gl.ARRAY_BUFFER, this);
    };
    buffer.buffer = function () {
        return this._buffer;
    };
    buffer.update = function () {
        this.bind();
        var gl = this._owner.gl;
        gl.bufferData(gl.ARRAY_BUFFER, buffer._buffer, gl.STATIC_DRAW);
    };
    buffer.deleteBuffer = function () {
        this._owner.gl.deleteBuffer(this);
        this._buffer = null;
        this._owner = null;
    };
    buffer.update();
    return buffer;
};

/**
 * Create an element array buffer from |array| and bind it to WebGL context.
 * @param array
 * @return created buffer
 */
Tma3DScreen.prototype.createElementBuffer = function (array) {
    var buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array),
            this.gl.STATIC_DRAW);
    buffer._owner = this;
    buffer.bind = function () {
        this._owner.gl.bindBuffer(this._owner.gl.ELEMENT_ARRAY_BUFFER, this);
    };
    return buffer;
};

/**
 * Create an frame buffer for offscreen rendering.
 * @width offscreen width
 * @height offscreen height
 * @return created frame buffer object
 */
Tma3DScreen.prototype.createFrameBuffer = function (width, height) {
    var buffer = this.gl.createFramebuffer();
    buffer.width = width;
    buffer.height = height;
    buffer._owner = this;
    buffer.texture = null;
    buffer.renderbuffer = null;
    buffer.bind = function () {
        var last = this._owner._lastBoundFrameBuffer;
        if (last == this)
            return last;
        this._owner._lastBoundFrameBuffer = this;
        var gl = this._owner.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this);
        if (!this.texture) {
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(
                    gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(
                    gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(
                    gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0,
                    gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                    gl.TEXTURE_2D, this.texture, 0);
        }
        if (!this.renderbuffer) {
            this.renderbuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
                    this.width, this.height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
                    gl.RENDERBUFFER, this.renderbuffer);
        }
        gl.viewport(0, 0, this.width, this.height);
        return last;
    };
    return buffer;
};

/**
 * Create ImageData for texture.
 * @param width texture width
 * @param height texture height
 * @param data texture data
 */
Tma3DScreen.prototype.createImage = function (width, height, data) {
    var image = this.context.createImageData(width, height);
    if (data) {
        var dst = image.data;
        var size = width * height * 4;
        for (var i = 0; i < size; ++i)
            dst[i] = data[i];
    }
    image.setPixel = TmaScreen.prototype.setPixel;
    image.addPixel = TmaScreen.prototype.addPixel;
    image.drawLine = TmaScreen.prototype.drawLine;
    return image;
};

/**
 * Converts Image object to ImageData object.
 * @param image Image object
 * @return a new ImageData object
 */
Tma3DScreen.prototype.convertImage = function (image) {
    this.canvas2d.width = image.width;
    this.canvas2d.height = image.height;
    this.context.drawImage(image, 0, 0);
    var src = this.context.getImageData(0, 0, image.width, image.height);
    return this.createImage(src.width, src.height, src.data);
};

/**
 * Creates a texture buffer from string.
 * @param text a text shown in the created texture
 * @param font font information
 * @param texture output texture restrictions
 */
Tma3DScreen.prototype.createStringTexture = function (text, font, texture) {
    var fontname = font.size + 'px ' + font.name;
    this.context.font = fontname;
    var w = this.context.measureText(text).width;
    var h = font.size * devicePixelRatio * 1.5; // FIXME: just in case.
    if (texture) {
        if (texture.width)
            w = texture.width;
        if (texture.height)
            h = texture.height;
    }
    this.canvas2d.width = w;
    this.canvas2d.height = h;
    // Other rendering contexts should be set after changing canvas size.
    this.context.font = fontname;
    this.context.fillStyle = font.background;
    this.context.fillRect(0, 0, w, h);
    this.context.fillStyle = font.foreground;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillText(text, w / 2, h / 2);
    var src = this.context.getImageData(0, 0, w, h);
    var image = this.createImage(src.width, src.height, src.data);
    return this.createTexture(image, true, Tma3DScreen.FILTER_LINEAR);
};

/**
 * Create texture buffer from Float32Array object.
 * @param data Float32Array object
 * @param width texture width
 * @param height texture height
 * @param flip image flip flag
 */
Tma3DScreen.prototype.createFloatTexture =
        function (data, width, height, flip) {
    var texture = this.gl.createTexture();
    texture.width = width;
    texture.height = height;
    texture.data = data;
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, flip);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0,
            this.gl.RGBA, this.gl.FLOAT, data);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    texture._flip = flip;
    texture._owner = this;
    texture.update = function (data) {
        var gl = this._owner.gl;
        gl.bindTexture(gl.TEXTURE_2D, this);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0,
                gl.RGBA, gl.FLOAT, data);
    };
    return texture;
};

/**
 * Create texture buffer from Image object.
 * @param image Image object or ImageData object
 * @param flip image flip flag
 * @param filter texture mag filter
 */
Tma3DScreen.prototype.createTexture = function (image, flip, filter) {
    var texture = this.gl.createTexture();
    texture.width = image.width;
    texture.height = image.height;
    texture.image = image;
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, flip);
    // TODO: Handles level of detail
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA,
            this.gl.UNSIGNED_BYTE, image);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, filter);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, filter);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(
        this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    texture._flip = flip;
    texture._owner = this;
    texture.update = function (image) {
        var gl = this._owner.gl;
        gl.bindTexture(gl.TEXTURE_2D, this);
        gl.texImage2D(
                gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    };
    return texture;
};

/**
 * Reset framebuffer to default screen buffer.
 * @return previous frame buffer
 */
Tma3DScreen.prototype.bind = function () {
    var last = this._lastBoundFrameBuffer;
    this._lastBoundFrameBuffer = this;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this.width, this.height);
    return last;
};

/**
 * Sets a float array to an internal buffer as a constant attribute array.
 * @param index attribute index
 * @param array float array
 */
Tma3DScreen.prototype.setAttribute = function (program, index, array) {
    this.gl.useProgram(program);
    if (1 == array.length)
        this.gl.vertexAttrib1fv(index, array);
    else if (2 == array.length)
        this.gl.vertexAttrib2fv(index, array);
    else if (3 == array.length)
        this.gl.vertexAttrib3fv(index, array);
    else if (4 == array.length)
        this.gl.vertexAttrib4fv(index, array);
    this.gl.disableVertexAttribArray(index);
};

/**
 * Sets float arrays to an internal buffer as a attribute arrays.
 * @param index attribute index
 * @param offset offset in stored data buffer
 * @param dimension array dimension
 * @param stride stride distance in stored data buffer
 */
Tma3DScreen.prototype.setAttributeArray =
        function (program, index, offset, dimension, stride) {
    this.gl.useProgram(program);
    this.gl.vertexAttribPointer(
            index, dimension, this.gl.FLOAT, false, stride, offset);
    this.gl.enableVertexAttribArray(index);
};

/**
 * Sets a float vector to an internal buffer as a constant uniform array.
 * @param index uniform index
 * @param array float vector
 */
Tma3DScreen.prototype.setUniformVector = function (program, index, array) {
    this.gl.useProgram(program);
    if (1 == array.length)
        this.gl.uniform1fv(index, array);
    else if (2 == array.length)
        this.gl.uniform2fv(index, array);
    else if (3 == array.length)
        this.gl.uniform3fv(index, array);
    else if (4 == array.length)
        this.gl.uniform4fv(index, array);
    else
        tma.error('WebGL unknown uniform vector size: ' + array.length);
};

/**
 * Sets a float matrix to an internal buffer as a constant uniform array.
 * @param index uniform index
 * @param array float matrix
 */
Tma3DScreen.prototype.setUniformMatrix = function (program, index, array) {
    this.gl.useProgram(program);
    if (4 == array.length)
        this.gl.uniformMatrix2fv(index, false, array);
    else if (9 == array.length)
        this.gl.uniformMatrix3fv(index, false, array);
    else if (16 == array.length)
        this.gl.uniformMatrix4fv(index, false, array);
    else
        tma.error('WebGL unknown uniform matrix size: ' + array.length);
};

/**
 * Sets |texture| to |program|.
 * @param program program object
 * @param index uniform index
 * @param id texture ID
 * @param texture texture object
 */
Tma3DScreen.prototype.setTexture = function (program, index, id, texture) {
    this.gl.useProgram(program);
    this.gl.activeTexture(this.gl.TEXTURE0 + id);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(index, id);
};

/**
 * Draws primitives by vertices.
 * @param program program object with shaders
 * @param mode draw mode
 * @param offset start offset
 * @param length total length
 */
Tma3DScreen.prototype.drawArrays = function (program, mode, offset, length) {
    this.gl.useProgram(program);
    this.gl.drawArrays(mode, offset, length);
};

/**
 * Draws primitives by vertices with indices.
 * @param program program object with shaders
 * @param mode draw mode
 * @param offset start offset
 * @param length total length
 */
Tma3DScreen.prototype.drawElements = function (program, mode, offset, length) {
    this.gl.useProgram(program);
    this.gl.drawElements(mode, length, this.gl.UNSIGNED_SHORT, offset);
};

/**
 * Fills screen with specified color.
 * @param r color R
 * @param g color G
 * @param b color B
 * @param a color A
 */
Tma3DScreen.prototype.fillColor = function (r, g, b, a) {
    this.gl.clearColor(r, g, b, a);
    this.gl.clearDepth(1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
};

/**
 * Sets alpha blending mode.
 * @param on enable alpha blending
 * @param src source drawing mode
 * @param dst destination drawing mode
 */
Tma3DScreen.prototype.setAlphaMode = function (on, src, dst) {
    this._currentAlphaMode = { on: on, src: src, dst: dst };
    if (on) {
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(src, dst);
    } else {
        this.gl.disable(this.gl.BLEND);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
    }
};

/**
 * Saves the current alpha blending mode to an internal stack.
 */
Tma3DScreen.prototype.pushAlphaMode = function () {
    this._alphaModeStack.push(this._currentAlphaMode);
};

/**
 * Restores an alpha blending mode from an internal stack.
 */
Tma3DScreen.prototype.popAlphaMode = function () {
    var mode = this._alphaModeStack.pop();
    this.setAlphaMode(mode.on, mode.src, mode.dst);
};

/**
 * Sets culling mode.
 * @param on enable culling
 * @param ccw front face direction is GL_CCW if true, otherwise GL_CW
 */
Tma3DScreen.prototype.setCullingMode = function (on, ccw) {
    this._currentCullingMode = { on: on, ccw: ccw };
    if (on) {
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.frontFace(ccw ? this.gl.CCW : this.gl.CW);
    } else {
        this.gl.disable(this.gl.CULL_FACE);
    }
};

/**
 * Saves the current culling mode to an internal stack.
 */
Tma3DScreen.prototype.pushCullingMode = function () {
    this._cullingModeStack.push(this._currentCullingMode);
};

/**
 * Restores an culling mode from an internal stack.
 */
Tma3DScreen.prototype.popCullingMode = function () {
    var mode = this._cullingModeStack.pop();
    this.setCullingMode(mode.on, mode.ccw);
};

/**
 * Sets line width.
 * @param width line width
 */
Tma3DScreen.prototype.setLineWidth = function (width) {
    this.gl.lineWidth(width);
};

/**
 * Flush the OpenGL ES 2.0 pipeline.
 */
Tma3DScreen.prototype.flush = function () {
    this.gl.flush();
};

/**
 * Gets mouse information.
 * @return an object containing
 *      over: true if mouse is currently over this screen
 *      x: mouse x position if |over| is true
 *      y: mouse y position if |over| is true
 */
Tma3DScreen.prototype.mouse = function () {
    if (!this._mouse)
        return {
            over: false,
            x: 0,
            y: 0,
            click: {
                on: false,
                x: 0,
                y: 0,
            },
            width: 0,
            height: 0,
        };
    return {
        over: this._mouse,
        x: this._mouseX,
        y: this._mouseY,
        click: {
            on: this._mousePressed,
            x: this._mouseClickX,
            y: this._mouseClickY
        },
        width: this._mouseWidth,
        height: this._mouseHeight,
    };
};

/**
 * Private implementation to update mouse state.
 * @param e DOM MouseEvent
 */
Tma3DScreen.prototype._onmousemove = function (e) {
    this._mouse = true;
    var rect = e.target.getBoundingClientRect();
    this._mouseX = e.clientX - rect.left;
    this._mouseY = e.clientY - rect.top;
    this._mouseWidth = rect.right - rect.left;
    this._mouseHeight = rect.bottom - rect.top;
    if (this._mousePressed)
        this.onMouseDrag(this._mouseX, this._mouseY);
};

/**
 * Private implementation to update mouse state.
 * @param e DOM MouseEvent
 */
Tma3DScreen.prototype._onmouseout = function (e) {
    this._mouse = false;
};

// TODO: Move following functions to TmaScreen.
Tma3DScreen.prototype._onmousedown = function (e) {
    var rect = e.target.getBoundingClientRect();
    this._mouseX = e.clientX - rect.left;
    this._mouseY = e.clientY - rect.top;
    this._mousePressed = true;
    this._mouseClickX = this._mouseX;
    this._mouseClickY = this._mouseY;
    this.onMouseDown(this._mouseX, this._mouseY);
    this.onMouseDrag(this._mouseX, this._mouseY);
};

Tma3DScreen.prototype._onmouseup = function (e) {
    var rect = e.target.getBoundingClientRect();
    this._mouseX = e.clientX - rect.left;
    this._mouseY = e.clientY - rect.top;
    this._mousePressed = false;
    this.onMouseDrag(this._mouseX, this._mouseY);
    this.onMouseUp(this._mouseX, this._mouseY);
};

Tma3DScreen.prototype.onMouseDown = function (x, y) {
};

Tma3DScreen.prototype.onMouseDrag = function (x, y) {
};

Tma3DScreen.prototype.onMouseUp = function (x, y) {
};

// node.js compatible export.
exports.Tma3DScreen = Tma3DScreen;
