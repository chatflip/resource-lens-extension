.PHONY: install build watch package clean

install:
	pnpm install

build: install
	pnpm run build

watch: install
	pnpm run watch

package: build
	pnpm exec vsce package

clean:
	rm -rf dist node_modules
