usage:
	@echo 'Usage: make <target>'
	@echo '<target>:'
	@echo '    all'
	@echo '    install-deps'
	@echo '    build'

all:
	make install-deps
	make build

install-deps:
	bower install
	cp ./bower_components/gl-matrix/gl-matrix-min.js ./ext/gl-matrix.js

build:
	make build-tmalib
	make build-tma-core
	make build-tma-majvj
	make build-majvj-suite

build-tmalib:
	cat \
		src/head.js \
		src/core.js \
		src/TmaScreen.js \
		src/Tma2DScreen.js \
		src/Tma3DScreen.js \
		src/TmaModelPrimitives.js \
		src/TmaParticle.js \
		src/TmaSequencer.js \
		src/TmaMotionBvh.js \
		src/TmaModelPly.js \
		src/TmaModelPs2Ico.js \
	| tee dist/tmalib.js \
	| ./bower_components/uglify-js/bin/uglifyjs -nc -o dist/tmalib.min.js

build-tma-core:
	cat \
		src/core_head.js \
		dist/tmalib.js \
		src/core_tail.js \
	| tee polymer/tma-core.js \
	| ./bower_components/uglify-js/bin/uglifyjs -nc -o polymer/tma-core.min.js

build-tma-majvj:
	cat \
		src/majvj_head.js \
		bower_components/gl-matrix/gl-matrix.js \
		ext/mv/MajVj.js \
		src/majvj_tail.js \
	| tee polymer/tma-majvj.js \
	| ./bower_components/uglify-js/bin/uglifyjs -nc -o polymer/tma-majvj.min.js

build-majvj-suite:
	cat \
		src/suite_head.js \
		`find ext/mv -name main.js` \
		src/suite_tail.js \
	| tee polymer/majvj-suite.js \
	| ./bower_components/uglify-js/bin/uglifyjs -nc -o polymer/majvj-suite.min.js
