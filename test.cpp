#include <stdio.h>

#include "snappy/snappy-c.h"


int memCompressSnappy( char *out, int outlen, char *in, int inlen ) {
    size_t maxsz = snappy_max_compressed_length(inlen);
    size_t osz = outlen;
    snappy_status ret = snappy_compress( in, inlen, out, &osz);
    if(ret == SNAPPY_OK ) return (int)osz; 
    return 0;
}
int memDecompressSnappy( char *out, int outlen, char *in, int inlen ) {
    size_t osz = outlen;
    snappy_status ret = snappy_uncompress( in, inlen, out, &osz );
    if(ret == SNAPPY_OK ) return osz; 
    return 0;
}


int main() {
    const char hoge[5] = { 11,22,33,44,55 };
    char compressed[1000];
    
    int r = memCompressSnappy( compressed, sizeof(compressed), (char*)hoge, sizeof(hoge) );
    printf("compret:%d\n",r);
    for(int i=0;i<r;i++) {
        printf(" %02x ", compressed[i]);
    }
    return 0;
}
