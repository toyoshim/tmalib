/**
 * T'MediaArt library for JavaScript.
 */

/**
 * TmaSequencer prototype.
 *
 * This prototype provides a sequencer that schedule tasks.
 * @author Takashi Toyoshima <toyoshim@gmail.com>
 */
function TmaSequencer () {
    this._elapsed = 0.0;
    this._queue = [];
    this._active = [];
    this._finished = [];
}

/**
 * Starts tasks.
 * @param time start time in msec
 */
TmaSequencer.prototype.start = function (time) {
    this.stop();
    this._elapsed = 0;
};

/**
 * Stops tasks.
 */
TmaSequencer.prototype.stop = function () {
    for (var i = 0; i < this._active.length; ++i)
        this._active[i].task.stop();
    this._queue = this._finished.concat(this._active, this._queue);
    this._active = [];
    this._finished = [];
};

/**
 * Runs tasks.
 * @param delta delta time in msec from the last call
 */
TmaSequencer.prototype.run = function (delta) {
    this._elapsed += delta;

    var active = [];
    for (var i = 0; i < this._active.length; ++i) {
        var result = this._active[i].task.run(
                delta, this._elapsed - this._active[i].when);
        if (result == 0) {
            active.push(this._active[i]);
        } else {
            this._active[i].task.stop();
            this._finished.push(this._active[i]);
        }
    }
    this._active = active;

    while (this._queue.length > 0 && this._queue[0].when < this._elapsed) {
        var item = this._queue.shift();
        item.task.start();
        var result = item.task.run(this._elapsed - item.when);
        if (result == 0) {
            active.push(item);
        } else {
            item.task.stop();
            this._finished.push(item);
        }
    }
};

/**
 * Register a task.
 * @param when time to start a task in msec
 * @param task a task to run
 */
TmaSequencer.prototype.register = function (when, task) {
    var entry = { when: when, task: task };
    for (var i = 0; i < this._queue.length; ++i) {
        if (this._queue[i].when <= when)
            continue;
        if (i == 0) {
            this._queue = this._unshift(entry);
        } else {
            this._queue = this._queue.slice(0, i).concat(
                    [entry], this._queue.slice(i, this._queue.length));
        }
        return;
    }
    this._queue.push(entry);
};

/**
 * Gets elapsed time.
 * @return elapsed time in msec
 */
TmaSequencer.prototype.elapsed = function () {
    return this._elapsed;
};

/**
 * Checks if an active or queued task still exist.
 * @return true if exists
 */
TmaSequencer.prototype.active = function () {
    return this._active.length != 0 || this._queue.length != 0;
};

/**
 * TmaSequencer.Task prototype.
 *
 * This prototype provides a simple task that runs in a sequencer.
 * @param duration duration time
 * @param callback a callback to run inside Task.run().
 */
TmaSequencer.Task = function (duration, callback) {
    this.reset(duration);
    this._callback = callback;
};

// Constant to specify a never ending task.
TmaSequencer.Task.INFINITE = -1;

/**
 * Resets.
 * @param duration a task duration
 */
TmaSequencer.Task.prototype.reset = function (duration) {
    this._duration = duration;
    this._elapsed = 0;
};

/**
 * Starts a task
 */
TmaSequencer.Task.prototype.start = function () {
    this.stop();
    this._elapsed = 0;
};

/**
 * Stops a task
 */
TmaSequencer.Task.prototype.stop = function () {
};

/**
 * Helper function to calculate return value for run().
 * @param delta delta time in msec from the last call
 */
TmaSequencer.Task.prototype.spend = function (delta) {
    this._elapsed += delta;
    if (this._duration == TmaSequencer.Task.INFINITE)
        return 0;
    if (this._elapsed <= this._duration)
        return 0;
    return this._elapsed - this._duration;
};

/**
 * Runs a task.
 * @param delta delta time in msec from the last call
 * @param time elapsed time from a task starts
 * @return 0 if not finished, otherwise a positive time that is not consumed
 */
TmaSequencer.Task.prototype.run = function (delta, time) {
    if (this._callback)
      this._callback(delta, time);
    return this.spend(delta);
};

/**
 * Gets a duration time on this task.
 * @return a duration time
 */
TmaSequencer.Task.prototype.duration = function () {
    return this._duration;
};

/**
 * TmaSequencer.SerialTask prototype.
 *
 * This prototype provides a serial task runs registered task in serial.
 */
TmaSequencer.SerialTask = function () {
    this.superclass(0);
    this._queue = [];
    this._active = null;
    this._finished = [];
    this._start = 0;
};

// Inherits TmaSequencer.Task.
TmaSequencer.SerialTask.prototype = new TmaSequencer.Task();
TmaSequencer.SerialTask.prototype.superclass = TmaSequencer.Task;
TmaSequencer.SerialTask.prototype.constructor = TmaSequencer.SerialTask;

/**
 * Appends a task.
 * @param task a task to run
 */
TmaSequencer.SerialTask.prototype.append = function (task) {
    var duration = task.duration();
    if (duration == TmaSequencer.Task.INFINITE)
        this._duration = TmaSequencer.Task.INFINITE;
    else
        this._duration += duration;
    this._queue.push(task);
};

/**
 * Starts a task
 */
TmaSequencer.SerialTask.prototype.start = function () {
    this.stop();
    this._elapsed = 0;
    this._active = this._queue.shift();
};

/**
 * Stops a task
 */
TmaSequencer.SerialTask.prototype.stop = function () {
    if (this._active) {
        this._active.stop();
        this._finished.push(this._active);
        this._active = null;
    }
    this._queue = this._finished.concat(this._queue);
    this._finished = [];
};

/**
 * Runs a task.
 * @param delta delta time in msec from the last call
 * @param time elapsed time from a task starts
 * @return 0 if not finished, otherwise a positive time that is not consumed
 */
TmaSequencer.SerialTask.prototype.run = function (delta, time) {
    var rest = delta;
    while (this._active) {
        var result = this._active.run(rest, time - this._start);
        if (result == 0)
            return this.spend(delta);
        var consume = rest - result;
        time += consume;
        rest = result;
        this._active.stop();
        this._start += this._active.duration();
        this._finished.push(this._active);
        this._active = this._queue.shift();
    }
    return this.spend(delta);
};
