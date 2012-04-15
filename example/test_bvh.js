#!/usr/local/bin/node
var fs = require("fs");

global.tma = console;
global.TmaMotionBvh = require("../TmaMotionBvh.js").TmaMotionBvh;

tma.log("==== Start BvhTest ====");

var examples = [
    "data/kashiyuka.bvh",
    "data/nocchi.bvh",
    "data/aachan.bvh"
];

for (var id = 0; id < 3; id++) {
    // Read data from an example file and convert it to Uint8Array.
    var buffer = fs.readFileSync(examples[id]);
    var data = new Uint8Array(buffer.length);
    for (var i = 0; i < buffer.length; i++)
        data[i] = buffer[i];

    // Creates an object under test and pass read data as an ArrayBuffer.
    var bvh = new TmaMotionBvh();
    var result = bvh.load(data.buffer);

    if (!result) {
        tma.error("!!!! ERROR !!!!");
        break;
    }
}

tma.log("==== Finished " + id + " tests ====");
