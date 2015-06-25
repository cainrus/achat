TESTS = $(shell find lib public/javascripts -name "*.test.js")
MOCHA_BIN = $(shell npm bin)/mocha

.PHONY: tests
tests:
	@echo $(MOCHA_BIN)
	$(MOCHA_BIN) $(TESTS)
