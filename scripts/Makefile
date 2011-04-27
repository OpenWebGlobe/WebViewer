COMPILER_JAR=../external/closure/compiler.jar
SOURCES=$(shell find ../source/core ../source/core/layer ../source/core/nodes -maxdepth 1 -name \*.js)
TARGETS=../compiled/owg.js

.PHONY: all
all: $(TARGETS)

../compiled/owg.js: $(SOURCES) Makefile $(COMPILER_JAR)
	java -jar $(COMPILER_JAR) --js_output_file=$@ $(foreach s,$(SOURCES),--js=$(s))

.PHONY: clean
clean:
	rm $(TARGETS)

.PHONY: lint
lint:
	gjslint --strict $(SOURCES)

$(COMPILER_JAR):
	mkdir -p $(dir $(COMPILER_JAR))
	curl http://closure-compiler.googlecode.com/files/compiler-latest.tar.gz | tar -C $(dir $(COMPILER_JAR)) -xzf - compiler.jar
