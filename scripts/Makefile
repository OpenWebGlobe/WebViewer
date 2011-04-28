CLOSURE_LIBRARY=../external/closure-library
COMPILER_JAR=../external/closure/compiler.jar
SOURCES=$(shell find ../source/core ../source/core/layer ../source/core/nodes -maxdepth 1 -name \*.js)
TARGETS=../compiled/deps.js ../compiled/owg.js ../compiled/owg-optimized.js

.PHONY: all
all: $(TARGETS)

../compiled/deps.js: $(SOURCES) Makefile $(COMPILER_JAR) $(CLOSURE_LIBRARY)
	$(CLOSURE_LIBRARY)/closure/bin/build/depswriter.py \
		--root_with_prefix="$(CLOSURE_LIBRARY)/closure/ ../" \
		--root_with_prefix="../source/ ../../../../source/" \
		--output_file=$@

../compiled/owg.js: $(SOURCES) Makefile $(COMPILER_JAR)
	java -jar $(COMPILER_JAR) --js_output_file=$@ $(foreach s,$(SOURCES),--js=$(s))

../compiled/owg-optimized.js: $(SOURCES) Makefile $(COMPILER_JAR)
	java -jar $(COMPILER_JAR) \
		--js_output_file=$@ \
		--compilation_level=ADVANCED_OPTIMIZATIONS \
		--warning_level=VERBOSE \
		$(foreach s,$(SOURCES),--js=$(s))

.PHONY: clean
clean:
	rm $(TARGETS)

.PHONY: lint
lint:
	gjslint --strict $(SOURCES)

$(COMPILER_JAR):
	mkdir -p $(dir $(COMPILER_JAR))
	curl http://closure-compiler.googlecode.com/files/compiler-latest.tar.gz | tar -C $(dir $(COMPILER_JAR)) -xzf - compiler.jar

$(CLOSURE_LIBRARY):
	svn checkout http://closure-library.googlecode.com/svn/trunk/ $@
