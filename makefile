usage:
	@echo 'Usage: make <target>'
	@echo '<target>:'
	@echo '    install-deps'
	@echo '    build'

install-deps:
	bower install
	cp ./bower_components/gl-matrix/gl-matrix-min.js ./ext/gl-matrix.js

build:
	cat \
		src/head.js \
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
	cat \
		src/polymer_head.js \
		dist/tmalib.js \
		src/polymer_tail.js \
	| tee polymer/tma-core.js \
	| ./bower_components/uglify-js/bin/uglifyjs -nc -o polymer/tma-core.min.js
