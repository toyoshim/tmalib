if (!window['Promise']) {
    Promise = function (resolver) {
        var resolve = function (result) {
            this._resolved = true;
            this._success = true;
            if (this._successCallback)
                this._successCallback(result);
            else
                this._result = result;
        }.bind(this);
        var reject = function (result) {
            this._resolved = true;
            this._success = false;
            if (this._errorCallback)
                this._errorCallback(result);
            else
                this._result = result;
        }.bind(this);
        this._resolved = false;
        this._success = false;
        this._result = null;
        this._successCallback = null;
        this._errorCallback = null;
        resolver(resolve, reject);
    };
    
    Promise.prototype.then = function (success, error) {
        if (this._resolved) {
            if (this._success)
                success(this._result);
            else
                error(this._result);
        } else {
            this._successCallback = success;
            this._errorCallback = error;
        }
    };
    
    Promise._all = function (promises) {
        Promise.call(this, function (resolve, reject) {
            this._all_promises = promises;
            this._all_resolved = 0;
            this._all_success = 0;
            this._all_results = [];
            this._all_resolve = resolve;
            this._all_reject = reject;
            for (var i = 0; i < promises.length; ++i) {
                if (promises[i]._resolved) {
                    this._all_resolved++;
                    if (promises[i]._success)
                        this._all_success++;
                    continue;
                }
                promises[i]._all_parent = this;
                promises[i].then(function(result) {
                    this._all_parent._all_resolved++;
                    this._all_parent._all_success++;
                    this._result = result;
                    this._all_parent._all_handleCallbacks();
                }, function(result) {
                    this._all_parent._all_resolved++;
                    this._result = result;
                    this._all_parent._all_handleCallbacks();
                });
            }
            this._all_handleCallbacks();
        }.bind(this));
    };
    Promise._all.prototype = Promise.prototype;
    Promise._all.prototype.constructor = Promise._all;
    Promise._all.prototype._all_handleCallbacks = function () {
        if (this._all_resolved != this._all_promises.length)
            return;
        for (var i = 0; i < this._all_promises.length; ++i)
            this._all_results[i] = this._all_promises[i]._result;
        if (this._all_resolved == this._all_success)
            this._all_resolve(this._all_results);
        else
            this._all_reject('one of Promises return an error.');
    };
    
    Promise.all = function (promises) {
        return new Promise._all(promises);
    };
}
