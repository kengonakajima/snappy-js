var Module = require("./snappy.js")
Module.snappy_compress = Module.cwrap("snappy_compress","number",["number","number","number","number"])
Module.snappy_uncompress = Module.cwrap("snappy_uncompress","number",["number","number","number","number"])
Module.snappy_max_compressed_length = Module.cwrap( "snappy_max_compressed_length","number",["number"] )
Module.snappy_uncompressed_length = Module.cwrap( "snappy_uncompressed_length", "number", ["number","number","number"] );


function makeI8Heap(mod, ui8a) {
    var nDataBytes = ui8a.length;
    var dataPtr = mod._malloc(nDataBytes);
    var dataHeap = new Uint8Array(mod.HEAPU8.buffer,dataPtr,nDataBytes);
    dataHeap.set(new Uint8Array(ui8a.buffer));    
    return dataHeap;
}
Module.getInt32FromHeap = function(bo) {
    var b0 = this.getValue(bo+0,"i8") & 0xff;
    var b1 = this.getValue(bo+1,"i8") & 0xff;
    var b2 = this.getValue(bo+2,"i8") & 0xff;
    var b3 = this.getValue(bo+3,"i8") & 0xff;
    return b0+b1*256+b2*65536+b3*65536*256;
}
Module.setInt32ToHeap = function(bo,val) {
    var b0 = val&0xff;
    var b1 = (val/256)&0xff;
    var b2 = (val/65536)&0xff;
    var b3 = (val/65536/256)&0xff;
    this.setValue(bo+0,b0,"i8");
    this.setValue(bo+1,b1,"i8");
    this.setValue(bo+2,b2,"i8");
    this.setValue(bo+3,b3,"i8");    
}
//
Module.compress = function(ui8a) {
    var input_heap = makeI8Heap(this,ui8a)
    var outlen_max = this.snappy_max_compressed_length(ui8a.length);
    var output_heap = makeI8Heap(this,new Uint8Array(outlen_max));
    var outsize_heap = makeI8Heap(this,new Uint8Array(4)); // sizeof(size_t) is 4 in emscripten
    this.setInt32ToHeap(outsize_heap.byteOffset,outlen_max);
    var retval = this.snappy_compress( input_heap.byteOffset, ui8a.length, output_heap.byteOffset, outsize_heap.byteOffset );
//    console.log("snappy_compress call retval:",retval, "output_heap.buffer:", output_heap.buffer );
    var ui8aout = null
    if(retval==0) {
        var outlen = this.getInt32FromHeap(outsize_heap.byteOffset);
        ui8aout = new Uint8Array(outlen); // dont use new Uint8Array(buf,ofs,outlen); buffer.byteLength gets 16M dont know why
        for(var i=0;i<outlen;i++) ui8aout[i] = this.getValue(output_heap.byteOffset+i,"i8");
    } else {
        console.log("snappy_compress failed, retval:",retval);
    }
    
    this._free(outsize_heap.byteOffset);
    this._free(output_heap.byteOffset);
    this._free(input_heap.byteOffset);
    return ui8aout;
}
Module.uncompressed_length = function(ui8a) {
    var input_heap = makeI8Heap(this,ui8a);
    var result_heap = makeI8Heap(this,new Uint8Array(4));
    var retval = this.snappy_uncompressed_length( input_heap.byteOffset, ui8a.length, result_heap.byteOffset );
    var uncomp_size = this.getInt32FromHeap(result_heap.byteOffset);
    this._free(input_heap.byteOffset);
    this._free(result_heap.byteOffset);    
    if(retval!=0) {
        return -1;
    } else {
        return uncomp_size;
    }        
}
Module.uncompress = function(ui8a) {
    var uncomp_len = this.uncompressed_length(ui8a);
    var input_heap = makeI8Heap(this,ui8a);    
    var output_heap = makeI8Heap(this,new Uint8Array(uncomp_len));
    var outsize_heap = makeI8Heap(this,new Uint8Array(4));
    this.setInt32ToHeap(outsize_heap.byteOffset,uncomp_len);
    var retval = this.snappy_uncompress( input_heap.byteOffset, ui8a.length, output_heap.byteOffset, outsize_heap.byteOffset );
    var ui8aout = new Uint8Array(uncomp_len);
    for(var i=0;i<uncomp_len;i++) ui8aout[i] = this.getValue( output_heap.byteOffset+i,"i8");

    this._free(input_heap.byteOffset);
    this._free(output_heap.byteOffset);
    this._free(outsize_heap.byteOffset);
    if(retval!=0) {
        console.log("snappy_uncompress failed:",retval);
        return null;
    } else {
        return ui8aout;        
    }
}

function compareArray(a,b) {
    if(a.length!=b.length) return false;
    for(var i in a) {
        if(a[i]!=b[i]) return false;
    }
    return true;
}
function check(a) {
    var compressed = Module.compress(a);
    var uncompressed = Module.uncompress(compressed);
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
