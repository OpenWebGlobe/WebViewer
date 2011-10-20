CLOSURE_LIBRARY=../external/closure-library
COMPILATION_LEVEL=ADVANCED_OPTIMIZATIONS
COMPILER_JAR=../external/closure/compiler.jar
SOURCES=$(shell find ../source/core ../source/core/layer ../source/core/nodes -maxdepth 1 -name \*.js)
TARGETS=\
	../compiled/deps.js \
	../compiled/owg-optimized.js \
	../compiled/owg-optimized.map \
	../source/demos/03_WorldDemo/openwebglobe.js

.PHONY: all
all: $(TARGETS)

../source/demos/03_WorldDemo/openwebglobe.js: ../compiled/owg-optimized.js
	cp $< $@

../compiled/deps.js: $(SOURCES) Makefile $(COMPILER_JAR) $(CLOSURE_LIBRARY)
	$(CLOSURE_LIBRARY)/closure/bin/build/depswriter.py \
		--root_with_prefix="$(CLOSURE_LIBRARY)/closure/ ../" \
		--root_with_prefix="../source/ ../../../../source/" \
		--output_file=$@

../compiled/owg-optimized.js ../compiled/owg-optimized.map: $(SOURCES) Makefile $(CLOSURE_LIBRARY) $(COMPILER_JAR)
	$(CLOSURE_LIBRARY)/closure/bin/build/closurebuilder.py \
		--compiler_flags=--compilation_level=$(COMPILATION_LEVEL) \
		--compiler_flags=--create_source_map=../compiled/owg-optimized.map \
		--compiler_flags=--externs=../source/externs/webgl_fixes.js \
		--compiler_flags=--warning_level=VERBOSE \
		--compiler_jar=$(COMPILER_JAR) \
		--namespace=owg.OpenWebGlobe \
		--output_file=$@ \
		--output_mode=compiled \
		--root=../external/closure-library/ \
		--root=../source/

.PHONY: clean
clean:
	rm -f $(TARGETS)

.PHONY: lint
lint:
	gjslint --strict $(SOURCES)

$(COMPILER_JAR):
	mkdir -p $(dir $(COMPILER_JAR))
	curl http://closure-compiler.googlecode.com/files/compiler-latest.tar.gz | tar -C $(dir $(COMPILER_JAR)) -xzf - compiler.jar

$(CLOSURE_LIBRARY):
	svn checkout http://closure-library.googlecode.com/svn/trunk/ $@
