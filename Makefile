.PHONY: install build watch package clean test test-docker test-all

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

test: install
	pnpm run test

test-docker:
	docker compose -f docker/docker-compose.test.yml build
	docker compose -f docker/docker-compose.test.yml run --rm ubuntu-test
	docker compose -f docker/docker-compose.test.yml run --rm alpine-test
	docker compose -f docker/docker-compose.test.yml run --rm gpu-mock-test

test-all: test test-docker
