SRCS=snappy/snappy-c.cc snappy/snappy.cc snappy/snappy-sinksource.cc

all: bundle.js

bundle.js: browser_test.js snappy.em.js snappy.js
	browserify browser_test.js  -o bundle.js 

snappy.em.js: Makefile snappy/*.cc
	emcc $(SRCS) -o snappy.em.js -s EXPORTED_FUNCTIONS="['_snappy_uncompressed_length','_snappy_validate_compressed_buffer','_snappy_uncompress','_snappy_compress','_snappy_max_compressed_length']" --post-js post.js

test:
	node test.js

ctest: test.cpp
	g++ test.cpp snappy/snappy-sinksource.cc snappy/snappy-c.cc snappy/snappy.cc -o ctest
	./ctest

