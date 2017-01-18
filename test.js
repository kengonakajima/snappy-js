var Snappy = require("./snappy.js");

function compareArray(a,b) {
    if(a.length!=b.length) return false;
    for(var i in a) {
        if(a[i]!=b[i]) return false;
    }
    return true;
}
function check(a) {
    var compressed = Snappy.compress(a);
    var uncompressed = Snappy.uncompress(compressed);
    if( compareArray(uncompressed,a) == false ) {
        console.log("no match!",uncompressed,a);
    } else {
        console.log("OK for data length:",a.length);
    }
}
        



///////////////////


var a0 = new Uint8Array([11,22,33,44,55]);
check(a0);

var a1 = new Uint8Array([11,22,33,44,55,4,44,4,4,4,4,44,4,4,4,4,44,4,4,4,4,4,4,44,4,4,4,4,4,4,44,4,4,4,4,44,4,4,4,4,4,4,4,44,4,4,4,4,4,4,44,4,4,4,4,4,4,44,4,4,4,4,4,4,44,4,4,4,4,44,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,44,4,4,4,4,44,4,4,4,4,4,4,4,4,4,44,4,4,4,4,4,4,4,44,4,4,4,4,4,4,4,4,4,4,4,44,4,44,44,44,44,44,44,44,44,4,4,4,4]); 
check(a1);

var a2 = new Uint8Array(1000);
for(var i=0;i<1000;i++) a2[i] = Math.random() * 255;
check(a2);

var a3 = new Uint8Array(10000);
for(var i=0;i<10000;i++) a3[i] = Math.random() * 255;
check(a3);

var a4 = new Uint8Array(100000);
for(var i=0;i<100000;i++) a4[i] = Math.random() * 255;
var st = new Date().getTime();
check(a4);
var et = new Date().getTime();
console.log("time for", a4.length, ":", (et-st), "ms");
