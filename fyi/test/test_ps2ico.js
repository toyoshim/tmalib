#!/usr/local/bin/node
var fs = require("fs");

global.tma = console;
global.TmaModelPs2Ico = require("../TmaModelPs2Ico.js").TmaModelPs2Ico;

tma.log("==== Start Ps2IcoTest ====");

var examples = [
    "data/CDIMAGE04060.BIN",
    "data/CDIMAGE05513.BIN",
    "data/CDIMAGE05518.BIN",
    "data/CDIMAGE05519.BIN",
    "data/CDIMAGE05520.BIN"
];

for (var id = 0; id < examples.length; id++) {
    // Read data from an example file and convert it to Uint8Array.
    var buffer = fs.readFileSync(examples[id]);
    var data = new Uint8Array(buffer.length);
    for (var i = 0; i < buffer.length; i++)
        data[i] = buffer[i];

    // Creates an object under test and pass read data as an ArrayBuffer.
    var model = new TmaModelPs2Ico();
    var result = model.load(data.buffer);

    if (!result) {
        tma.error("!!!! ERROR !!!!");
        break;
    }
}

tma.log("==== Finished " + id + " tests ====");
