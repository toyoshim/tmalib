/**
 * T'MediaArt library for JavaScript
 *  - MajVj extension - misc plugin - midi -
 * @param options options (See MajVj.prototype.create)
 */
MajVj.misc.midi = function (options) {
    this._options = options;
};

// MIDIAccess and MIDIInputs shared in all instances.
MajVj.misc.midi.useSysex = MajVj.getSetting('misc', 'midi', 'useSysex', false);
MajVj.misc.midi.portmaps = [];
MajVj.misc.midi.devicemaps = [];
MajVj.misc.midi.keymap = [];
MajVj.misc.midi._access = null;
MajVj.misc.midi._devices = {};
MajVj.misc.midi._inputs = [];

/**
 * Loads resources asynchronously.
 * @return a Promise object
 */
MajVj.misc.midi.load = function () {
    return new Promise(function (resolve, reject) {
        navigator.requestMIDIAccess({ sysex: MajVj.misc.midi.useSysex }).then(
                function (a) {
            MajVj.misc.midi._access = a;
            for (var i = 0; i < 128; ++i)
                MajVj.misc.midi.keymap[i] = 0;
            MajVj.misc.midi._access.onstatechange =
                    MajVj.misc.midi._onStateChange;
            for (var input of a.inputs)
                MajVj.misc.midi._addInputDevice(input[1]);
            resolve();
        }, function (e) {
            reject(e);
        });
    });
};

/**
 * Decays keymap values.
 */
MajVj.misc.midi.decay = function () {
    for (var i = 0; i < 128; ++i) {
        if (MajVj.misc.midi.keymap[i] > 0)
            MajVj.misc.midi.keymap[i] *= 0.99;
    }
};

/**
 * Add MIDIInput and make it ready to use.
 * @param port MIDIInput port to be added
 */
MajVj.misc.midi._addInputDevice = function (port) {
    if (MajVj.misc.midi._devices[port.id] !== undefined)
        return;
    console.log(port);
    var index = MajVj.misc.midi._inputs.length;
    MajVj.misc.midi._devices[port.id] = index;
    MajVj.misc.midi._inputs[index] = port;
    MajVj.misc.midi.portmaps[index] = [];
    MajVj.misc.midi.devicemaps[index] = [];
    var i;
    for (i = 0; i < 128; ++i)
        MajVj.misc.midi.devicemaps[index][i] = 0;
    for (var ch = 0; ch < 16; ++ch) {
        MajVj.misc.midi.portmaps[index][ch] = [];
        for (i = 0; i < 128; ++i)
            MajVj.misc.midi.portmaps[index][ch][i] = 0;
    }
    port.onmidimessage = MajVj.misc.midi._onMidiMessage;
};

/**
 * Event handler for onstatechange of MIDIAccess.
 * @param e MIDIConnectionEvent
 */
MajVj.misc.midi._onStateChange = function (e) {
    if (e.port.type != "input")
        return;
    MajVj.misc.midi._addInputDevice(e.port);
};

/**
 * Event handler for onmidimessage of MIDIInput.
 * @param e MIDIMessageEvent
 */
MajVj.misc.midi._onMidiMessage = function (e) {
    var data = e.data;
    var type = data[0] & 0xf0;
    if (type != 0x90 && type != 0x80)
        return;
    var index = MajVj.misc.midi._devices[e.target.id];
    var ch = data[0] & 0x0f;
    var note = data[1];
    if (0x90 == type) {
        // Note ON
        MajVj.misc.midi.portmaps[index][ch][note] = data[2];
        MajVj.misc.midi.devicemaps[index][note] = data[2];
        MajVj.misc.midi.keymap[note] = data[2];
    } else {
        // Note OFF
        MajVj.misc.midi.portmaps[index][ch][note] = 0;
        MajVj.misc.midi.devicemaps[index][note] = 0;
        MajVj.misc.midi.keymap[note] = 0;
    }
};

