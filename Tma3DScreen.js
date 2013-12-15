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
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.onmousemove = this._onmousemove.bind(this);
    this.canvas.onmouseout = this._onmouseout.bind(this);
    this.canvas.onmousedown = this._onmousedown.bind(this);
    this.canvas.onmouseup = this._onmouseup.bind(this);
    this.context = document.createElement("canvas").getContext("2d");
    this.gl = this.canvas.getContext("webgl");
    if (!this.gl) {
        tma.log("WebGL: webgl is not supported. Try experimental-webgl...");
        this.gl = this.canvas.getContext("experimental-webgl");
    }
    if (!this.gl) {
        tma.log("WebGL: Try webkit-3d...");
        this.gl = this.canvas.getContext("webkit-3d");
    }
    if (!this.gl) {
        tma.error("WebGL: not supported.");
    }
    this.gl.viewport(0, 0, width, height);
    this.setAlphaMode(false);
    this._mouse = false;
    this._mouseX = 0;
    this._mouseY = 0;

    // Logging GL capabilities.
    tma.log("WebGL max vertex uniform vectors: " +
            this.gl.getParameter(this.gl.MAX_VERTEX_UNIFORM_VECTORS));
    tma.log("WebGL max varying vectors: " +
            this.gl.getParameter(this.gl.MAX_VARYING_VECTORS));
    tma.log("WebGL max fragment uniform vectors: " +
            this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS));
    tma.log("WebGL max vertex attributes: " +
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
        tma.log("WebGL compiling shader " + id + ": " +
                this.gl.getShaderInfoLog(shader));
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
        tma.log("WebGL link program error: " +
                this.gl.getProgramInfoLog(program));
    tma.log("WebGL program active attributes " +
            this.gl.getProgramParameter(program, this.gl.ACTIVE_ATTRIBUTES));
};

/**
 * Creates program object with shader objects.
 * @param vertex vertex shader
 * @param fragment fragment shader
 */
Tma3DScreen.prototype.createProgram = function (vertex, fragment) {
    var programObject = this.gl.createProgram();
    if ("WebGLShader" != vertex.constructor.name)
        vertex = this.loadShader(Tma3DScreen.VERTEX_SHADER, vertex);
    this.gl.attachShader(programObject, vertex);
    if ("WebGLShader" != fragment.constructor.name)
        fragment = this.loadShader(Tma3DScreen.FRAGMENT_SHADER, fragment);
    this.gl.attachShader(programObject, fragment);
    this.linkProgram(programObject);
    programObject._owner = this;
    programObject._index = 0;
    programObject._textureId = 0;
    programObject._textureIdMap = {};
    programObject.assign = function (name) {
        var index = this._index++;
        this._owner.gl.bindAttribLocation(this, index, name);
        this._owner.linkProgram(this);
        return index;
    };
    programObject.attributeIndex = function (name) {
        return this._owner.gl.getAttribLocation(this, name);
    };
    programObject.uniformIndex = function (name) {
        return this._owner.gl.getUniformLocation(this, name);
    };
    programObject.setAttribute = function (name, array) {
        var index = this._owner.gl.getAttribLocation(this, name);
        this._owner.setAttribute(this, index, array);
    };
    programObject.setAttributeArray =
            function (name, buffer, offset, dimension, stride) {
        var index = this._owner.gl.getAttribLocation(this, name);
        buffer.bind();
        this._owner.setAttributeArray(this, index, offset, dimension, stride);
    };
    programObject.setUniform = function (name, array) {
        var index = this._owner.gl.getUniformLocation(this, name);
        this._owner.setUniform(this, index, array);
    };
    programObject.setUniformVector = function (name, array) {
        var index = this._owner.gl.getUniformLocation(this, name);
        this._owner.setUniformVector(this, index, array);
    };
    programObject.setUniformMatrix = function (name, array) {
        var index = this._owner.gl.getUniformLocation(this, name);
        this._owner.setUniformMatrix(this, index, array);
    };
    programObject.setTexture = function (name, texture) {
        var index = this._owner.gl.getUniformLocation(this, name);
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
 * @param array data to store
 * @return created buffer
 */
Tma3DScreen.prototype.createBuffer = function (array) {
    var buffer = this.gl.createBuffer();
    buffer._buffer = new Float32Array(array);
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
        var gl = this._owner.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this);
        if (!this.texture) {
            this.texture = gl.createTexture(); }{
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,
                    gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,
                    gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height,
                    0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                    gl.TEXTURE_2D, this.texture, 0);
        }
        if (!this.renderbuffer) {
            this.renderbuffer = gl.createRenderbuffer(); }{
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
                    this.width, this.height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
                    gl.RENDERBUFFER, this.renderbuffer);
        }
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
 * Create texture buffer from Image object.
 * @param image Image object or ImageData object
 * @param flip image flip flag
 * @param filter texture mag filter
 */
Tma3DScreen.prototype.createTexture = function (image, flip, filter) {
    var texture = this.gl.createTexture();
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
 */
Tma3DScreen.prototype.bind = function () {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
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
 * Sets a float array to an internal buffer as a constant uniform array.
 * TODO: Split this function into two functions for vectors and matrices.
 * @param index uniform index
 * @param array float array
 */
Tma3DScreen.prototype.setUniform = function (program, index, array) {
    console.log("this function is obsoleted.");
    this.gl.useProgram(program);
    if (1 == array.length)
        this.gl.uniform1fv(index, array);
    else if (3 == array.length)
        this.gl.uniform3fv(index, array);
    else if (4 == array.length)
        this.gl.uniformMatrix2fv(index, false, array);
    else if (9 == array.length)
        this.gl.uniformMatrix3fv(index, false, array);
    else if (16 == array.length)
        this.gl.uniformMatrix4fv(index, false, array);
    else
        tma.error('WebGL unknown uniform matrix size: ' + array.length);
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
        return { over: this._mouse };
    return {
        over: this._mouse,
        x: this._mouseX,
        y: this._mouseY
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
