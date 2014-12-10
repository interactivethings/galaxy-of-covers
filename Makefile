SHELL := /bin/bash
PATH := node_modules/.bin:$(PATH)

.PHONY: all server build clean install data

all: server

server: install
	webpack-dev-server --colors --progress

build: clean install
	NODE_ENV=production webpack -p --colors --progress --hide-modules

clean:
	rm -rf build

# Dependencies

install: node_modules

node_modules: package.json
	npm install
	touch $@

data:
	python3 data/pullData.py
