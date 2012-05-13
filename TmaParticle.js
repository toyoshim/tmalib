/**
 * T'MediaArt library for JavaScript.
 */

/**
 * TmaParticle prototype. Inheritant prototypes should implement nothing in the
 * constructor, but |initialize()| because JavaScript level objects will be
 * reused by calling |initialize()| to optimize performance.
 * E.g., function Foo () { TmaParticle.apply(this, arguments); }
 *       Foo.prototype = new TmaParticle(null, 0);
 *       Foo.prototype.constructor = Foo;
 * TODO: Simplify the way to inherit this.
 *
 * This prototype provides particle.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 *
 * @param container an owner |TmaParticle.Container| object
 * @param offset internal offset in |container|
 */
function TmaParticle (container, offset) {
    this._container = container;
    this._offset = offset;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
}

/**
 * Object initializer. This function is called when the object is going to be
 * reused. Inheritance should implement this function correctly.
 */
TmaParticle.prototype.initialize = function () {
};

/**
 * This function is called in owner |TmaParticle.Container.update()|.
 * Inheritance may want to implement physical calculation here.
 * @return false if this object must be removed, otherwise true
 */
TmaParticle.prototype.update = function () {
    return false;
};

/**
 * Removes this object from owner |TmaParticle.Container| virtually. This object
 * isn't destructed, but temporally ignored and will be reused.
 * TODO: Obsolete.
 */
TmaParticle.prototype.remove = function () {
    this._container.remove(this._offset);
};

/**
 * TmaParticle.Container prototype. This object can contains many particles
 * effectively.
 */
TmaParticle.Container = function (func) {
    this.length = 0;
    this._func = func;
    this._particles = [];
};

/**
 * Gets a particle at |offset|. |offset| for a particle will be changed after
 * |remove()|.
 * @param offset offset in
 * TODO: Obsolete.
 */
TmaParticle.Container.prototype.at = function (offset) {
    return this._particles[offset];
};

/**
 * Adds a particle. Arguments for this function will be passed as is to
 * |initialize()|.
 * @param arguments variable length arguments to be passed to |initialize()|
 */
TmaParticle.Container.prototype.add = function () {
    if (this._particles.length == this.length)
        this._particles[this.length] = new this._func(this, this.length);
    this._particles[this.length].initialize.apply(
            this._particles[this.length++], arguments);
};

/**
 * Removes a particle virtually. The particle isn't destructed, but temporally
 * ignored and will be reused later in the next |add()|.
 * @param offset offset to a particle
 */
TmaParticle.Container.prototype.remove = function (offset) {
    var particle = this._particles[offset];
    particle._offset = --this.length;
    this._particles[offset] = this._particles[this.length];
    this._particles[offset]._offset = offset;
    this._particles[this.length] = particle;
};

/**
 * Calls |update()| for all registered |TmaParticle| objects, and removes the
 * objects which returns false virtually. All arguments will be passed into
 * each particle's |update()|.
 * @param arguments arbitrary arguments which will be passed into particles.
 */
TmaParticle.Container.prototype.update = function () {
    for (var i = 0; i < this.length; ) {
        if (this._particles[i].update.apply(this._particles[i], arguments))
            i++;
        else
            this.remove(i);
    }
};

// node.js compatible export.
exports.TmaParticle = TmaParticle;