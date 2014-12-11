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

data: data-song-list data-spotify
	python data/pullData.py

data-song-list:
	wget -O data/out/songs.csv https://docs.google.com/spreadsheets/d/1EqO6oF0o8oL0XLcNXNkdOA4wbcKJBiTb24rBphubgrA/export?format=csv

data-spotify:
	node data/spotify-popularity.js

