.DELETE_ON_ERROR:

SRC:=src
DIST:=dist
QA:=qa

ALL_JS_FILES_SRC:=$(shell find $(SRC) -name "*.mjs" -o -name "*.cjs")

CONFIG_FILES_SRC:=$(SRC)/babel/babel-shared.config.cjs $(SRC)/babel/babel.config.cjs $(SRC)/rollup/rollup.config.mjs
CONFIG_FILES_DIST:=$(patsubst $(SRC)/%, $(DIST)/%, $(CONFIG_FILES_SRC))

default: all

$(CONFIG_FILES_DIST): $(DIST)/%: $(SRC)/%
	mkdir -p $(dir $@)
	cp $< $@


ESLINT:=npx eslint
LINT_REPORT:=$(QA)/lint.txt
LINT_PASS_MARKER:=$(QA)/.lint.passed
PRECIOUS_TARGETS+=$(LINT_REPORT)

LINT_IGNORE_PATTERNS:=--ignore-pattern '$(DIST)/**/*'

$(LINT_REPORT) $(LINT_PASS_MARKER) &: $(ALL_JS_FILES_SRC)
	mkdir -p $(dir $@)
	echo -n 'Test git rev: ' > $(LINT_REPORT)
	git rev-parse HEAD >> $(LINT_REPORT)
	( set -e; set -o pipefail; \
	  $(ESLINT) \
	    --ext .cjs,.js,.mjs,.cjs,.xjs \
	    $(LINT_IGNORE_PATTERNS) \
	    . \
	    | tee -a $(LINT_REPORT); \
	  touch $(LINT_PASS_MARKER) )

lint-fix:
	@( set -e; set -o pipefail; \
	  $(ESLINT) \
	    --ext .js,.mjs,.cjs,.xjs \
	    $(LINT_IGNORE_PATTERNS) \
	    --fix . )

lint: $(LINT_REPORT) $(LINT_PASS_MARKER)

qa: lint

build: $(CONFIG_FILES_DIST)

all: build

default: all

.PHONY: all build default lint qa