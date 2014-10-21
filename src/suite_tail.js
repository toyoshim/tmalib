    this.majvj = _majvj;
    this.tma = tma;
    this.create = function (width, height, fullscreen, parent) {
      return new MajVj(width, height, fullscreen, parent);
    };

    var _loadedPlugin = {};
    this.loadPlugin = function (type, name) {
      return new Promise(function (resolve, reject) {
        if (!MajVj[type])
          return reject('unknown plugin type: ' + type);
        if (!MajVj[type][name])
          return reject('unknown plugin: ' + type + '/' + name);
        if (_loadedPlugin[type] && _loadedPlugin[type][name])
          return resolve(MajVj[type][name]);
        if (!_loadedPlugin[type])
          _loadedPlugin[type] = {};
        if (!MajVj[type][name].load) {
          _loadedPlugin[type][name] = MajVj[type][name];
          resolve(MajVj[type][name]);
        }
        MajVj[type][name].load().then(function () {
          _loadedPlugin[type][name] = MajVj[type][name];
          resolve(MajVj[type][name]);
        }, tma.ecb);
      });
    };
    this.loadAllPlugin = function (base) {
      if (base)
        tma.base = base;
      return Promise.all([
        this.loadPlugin('frame', 'wired')
      ]);
    };
    this.setBase = function (base) {
      tma.base = base;
    };

    if (this.name) {
      this.setBase(this.base);
      if (0 == this.width)
        this.width = 240;
      if (0 == this.height)
        this.height = 135;
      var vj = this.create(this.width, this.height, false, this.$.main);
      this.loadPlugin(this.type, this.name).then(function () {
        var frame = vj.create(this.type, this.name);
        vj.run(function (delta) {
          vj.screen().fillColor(0, 0, 0, 1);
          try {
            frame.draw(delta);
          } catch (e) { tma.error(e.stack); }
        });
      }.bind(this), tma.ecb);
    }
  }
});
