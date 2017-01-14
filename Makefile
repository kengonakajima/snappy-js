SRCS=snappy/snappy-c.cc snappy/snappy.cc snappy/snappy-sinksource.cc 

all: snappy.js 

snappy.js: Makefile
	emcc $(SRCS) -o snappy.js -s EXPORTED_FUNCTIONS="['_snappy_uncompressed_length','_snappy_validate_compressed_buffer','_snappy_uncompress']"

test:
	node test_snappy.js