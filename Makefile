.DELETE_ON_ERROR:

SHELL:=bash

SRC:=src
DIST:=dist
QA:=qa
TEST_STAGING:=test-staging

ALL_JS_FILES_SRC:=$(shell find $(SRC) -name "*.mjs" -o -name "*.cjs" -o -name "*.js")

CONFIG_FILES_SRC:=$(SRC)/index.cjs $(SRC)/babel/babel-shared.config.cjs $(SRC)/babel/babel.config.cjs $(SRC)/rollup/rollup.config.mjs
CONFIG_FILES_DIST:=$(patsubst $(SRC)/%, $(DIST)/%, $(CONFIG_FILES_SRC))

default: all

$(CONFIG_FILES_DIST): $(DIST)/%: $(SRC)/%
	mkdir -p $(dir $@)
	cp $< $@

TEST_REPORT:=$(QA)/unit-test.txt
TEST_PASS_MARKER:=$(QA)/.unit-test.passed
PRECIOUS_TARGETS+=$(TEST_REPORT)

$(TEST_REPORT) $(TEST_PASS_MARKER) &: package.json $(ALL_JS_FILES_SRC)
	mkdir -p $(dir $@)
	echo -n 'Test git rev: ' > $(TEST_REPORT)
	git rev-parse HEAD >> $(TEST_REPORT)
	( set -e; set -o pipefail; \
		node src/test/rollup.test.js | tee -a $(TEST_REPORT); \
		touch $(TEST_PASS_MARKER) )

test: $(TEST_REPORT) $(TEST_PASS_MARKER)


ESLINT:=npx eslint
LINT_REPORT:=$(QA)/lint.txt
LINT_PASS_MARKER:=$(QA)/.lint.passed
PRECIOUS_TARGETS+=$(LINT_REPORT)

LINT_IGNORE_PATTERNS:=--ignore-pattern '$(DIST)/**/*' \
  --ignore-pattern '$(TEST_STAGING)/**/*' \
  --ignore-pattern src/test/throw-expression.mjs

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

qa: test lint

build: $(CONFIG_FILES_DIST)

all: build

default: all

.PRECIOUS: $(PRECIOUS_TARGETS)

.PHONY: all build default lint qa test