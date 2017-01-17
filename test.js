

/*
typedef enum {
  SNAPPY_OK = 0,
  SNAPPY_INVALID_INPUT = 1,
  SNAPPY_BUFFER_TOO_SMALL = 2
} snappy_status;


snappy_status snappy_compress(const char* input,
                              size_t input_length,
                              char* compressed,
                              size_t* compressed_length);

snappy_status snappy_uncompress(const char* compressed,
                                size_t compressed_length,
                                char* uncompressed,
                                size_t* uncompressed_length);

size_t snappy_max_compressed_length(size_t source_length);

snappy_status snappy_uncompressed_length(const char* compressed,
                                         size_t compressed_length,
                                         size_t* result);

snappy_status snappy_validate_compressed_buffer(const char* compressed, size_t compressed_length);
*/


var Module = require("./snappy.js")
Module.snappy_compress = Module.cwrap("snappy_compress","number",["number","number","number","number"])
Module.snappy_uncompress = Module.cwrap("snappy_uncompress","number",["number","number","number","number"])
Module.snappy_max_compressed_length = Module.cwrap( "snappy_max_compressed_length","number",["number"] )


Module.max_compressed_length = function(inputsz) {
    var retval = this.snappy_max_compressed_length(inputsz);
    return retval;
}

// i8adata: Int8Array input
function makeI8Heap(mod, i8adata) {
    var nDataBytes = i8adata.length;
    var dataPtr = mod._malloc(nDataBytes);
    var dataHeap = new Uint8Array(mod.HEAPU8.buffer,dataPtr,nDataBytes);
    dataHeap.set(new Uint8Array(i8adata.buffer));    
    return dataHeap;
}

//
Module.compress = function(i8adata) {
//    console.log("i8adata:",i8adata);
    var input_heap = makeI8Heap(this,i8adata)
    var outlen_max = this.max_compressed_length(i8adata.length);
    console.log("outlen_max", outlen_max);
    var outputbuf = new Int8Array(outlen_max);
    var output_heap = makeI8Heap(this,outputbuf);
    var outsizebuf = new Int8Array(4); // sizeof(size_t) is 4 in emscripten
    var outsize_heap = makeI8Heap(this,outsizebuf);
    this.setValue( outsize_heap.byteOffset,outlen_max, "i8")
//    for(var i=0;i<i8adata.length;i++) console.log("input_heap:",i, this.getValue(input_heap.byteOffset+i,"i8"));
//    for(var i=0;i<outlen_max;i++) console.log("output_heap:",i, this.getValue(output_heap.byteOffset+i,"i8"));
    var retval = this.snappy_compress( input_heap.byteOffset, i8adata.length, output_heap.byteOffset, outsize_heap.byteOffset );
    console.log("snappy_compress call retval:",retval);
    for(var i=0;i<retval;i++) console.log( "output_heap:",i, this.getValue(output_heap.byteOffset+i,"i8"));
    var i8aout = null
    if(retval==0) {
        var b0 = this.getValue(outsize_heap.byteOffset+0,"i8") & 0xff;
        var b1 = this.getValue(outsize_heap.byteOffset+1,"i8") & 0xff;
        var b2 = this.getValue(outsize_heap.byteOffset+2,"i8") & 0xff;
        var b3 = this.getValue(outsize_heap.byteOffset+3,"i8") & 0xff;
        var outlen = b0+b1*256+b2*65536+b3*65536*256;
        console.log("compressed outlen:",outlen);
        for(var i=0;i<outlen;i++) console.log("output_heap:",i, this.getValue(output_heap.byteOffset+i,"i8"));        
        i8aout = new Int8Array(output_heap.buffer, output_heap.byteOffset, outlen);
    }
    
    this._free(outsize_heap.byteOffset);
    this._free(output_heap.byteOffset);
    this._free(input_heap.byteOffset);
    return i8aout;
}
Module.uncompress = 

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
        console.log("OK for ",a);
    }
}
        



///////////////////


var a0 = new Int8Array([11,22,33,44,55,4,44,4,4,4,4,44,4,4,4,4,44,4,4,4,4,4,4,44,4,4,4,4,4,4,44,4,4,4,4,44,4,4,4,4,4,4,4,44,4,4,4,4,4,4,44,4,4,4,4,4,4,44,4,4,4,4,4,4,44,4,4,4,4,44,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,44,4,4,4,4,44,4,4,4,4,4,4,4,4,4,44,4,4,4,4,4,4,4,44,4,4,4,4,4,4,4,4,4,4,4,44,4,44,44,44,44,44,44,44,44,4,4,4,4]); 
check(a0);

