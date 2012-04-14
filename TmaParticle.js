/**
 * T'MediaArt library for JavaScript.
 */

/**
 * TmaParticle prototype. Inheritant prototypes should implement nothing in the
 * constructor, but |initialize()| because JavaScript level objects will be
 * reused by calling |initialize()| to optimize performance.
 *
 * This prototype provides particle.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
function TmaParticle (container, offset) {
    this._container = container;
    this._offset = offset;
}

TmaParticle.prototype.initialize = function () {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
};

TmaParticle.prototype.remove = function () {
    this._container.remove(this._offset);
};

TmaParticle.Container = function (func) {
    this.length = 0;
    this._func = func;
    this._particles = [];
};

TmaParticle.Container.prototype.at = function (offset) {
    return this._particles[offset];
};

TmaParticle.Container.prototype.add = function () {
    if (this._particles.length == this.length)
        this._particles[this.length] = new this._func(this, this.length);
    this._particles[this.length].initialize.apply(
            this._particles[this.length++], arguments);
};

TmaParticle.Container.prototype.remove = function (offset) {
    var particle = this._particles[offset];
    particle._offset = --this.length;
    this._particles[offset] = this._particles[this.length];
    this._particles[offset]._offset = offset;
    this._particles[this.length] = particle;
};