#include <stdio.h>

#include "snappy/snappy-c.h"

extern "C" {

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
    printf("sizeof size_t:%ld\n",sizeof(size_t));
    const char hoge[5] = { 11,22,33,44,55 };
    printf("orig:%d\n",(int)sizeof(hoge));
    for(int i=0;i<sizeof(hoge);i++) {
        printf(" %02x", hoge[i]);
    }
    printf("\n");
    
    char compressed[1000];
    int r = memCompressSnappy( compressed, sizeof(compressed), (char*)hoge, sizeof(hoge) );
    printf("compret:%d\n",r);
    for(int i=0;i<r;i++) {
        printf(" %02x ", compressed[i]);
    }
    printf("\n");
    char uncompressed[1000];
    int ur = memDecompressSnappy( uncompressed, sizeof(uncompressed), (char*)compressed, r);
    printf("uncompret:%d\n",ur);
    for(int i=0;i<ur;i++) {
        printf(" %02x", uncompressed[i]);
    }
    printf("\n");
    ///////
    
    const char poo[7]  = { 5,16,11,22,33,44,55 };
    ur = memDecompressSnappy( uncompressed, sizeof(uncompressed), (char*)poo, 7 );
    printf("fixeddecompret:%d\n",ur);
    for(int i=0;i<ur;i++) {
        printf(" %02x", uncompressed[i]);
    }
    printf("\n");    
    return 0;
}

}
