MINIFY=./node_modules/uglify/bin/uglify -o

usage:
	@echo 'Usage: make <target>'
	@echo '<target>:'
	@echo '    all            ... install-bower && install-deps && build'
	@echo '    install-npm    ... apt-get install npm'
	@echo '    install-bower  ... npm install bower'
	@echo '    install-deps   ... bower install && cp'
	@echo '    install-uglify ... npm install uglify'
	@echo '    build'

all:
	make install-bower && make install-uglify && make install-deps && make build

install-npm:
	apt-get install npm
	ln -s /usr/bin/nodejs /usr/local/bin/node

install-bower:
	npm install bower

install-deps:
	./node_modules/bower/bin/bower install
	cp ./bower_components/gl-matrix/gl-matrix-min.js ./ext/gl-matrix.js

install-uglify:
	npm install uglify

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
	| ${MINIFY} dist/tmalib.min.js

build-tma-core:
	cat \
		src/core_head.js \
		dist/tmalib.js \
		src/core_tail.js \
	| tee polymer/tma-core.js \
	| ${MINIFY} polymer/tma-core.min.js

build-tma-majvj:
	cat \
		src/majvj_head.js \
		bower_components/gl-matrix/gl-matrix.js \
		ext/mv/MajVj.js \
		src/majvj_tail.js \
	| tee polymer/tma-majvj.js \
	| ${MINIFY} polymer/tma-majvj.min.js

build-majvj-suite:
	cat \
		src/suite_head.js \
		`find ext/mv -name main.js` \
		`find ext/mv/frame/nicofarre3d -name \*.js | grep -v main.js` \
		src/suite_tail.js \
	| tee polymer/majvj-suite.js \
	| ${MINIFY} polymer/majvj-suite.min.js
