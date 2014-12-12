SHELL := /bin/bash
PATH := node_modules/.bin:$(PATH)

# python3 and pip3 are required
PYTHON := python3
PIP := pip3

.PHONY: all server build clean install data data-song-list data-spotify data-shs-versions

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

# Data

pythonsetup:
	$(PIP) install requests
	$(PIP) install beautifulsoup4

data: data-song-list data-spotify data-shs-versions

data-song-list:
	wget -O data/out/songs.csv https://docs.google.com/spreadsheets/d/1EqO6oF0o8oL0XLcNXNkdOA4wbcKJBiTb24rBphubgrA/export?format=csv

data-spotify:
	node data/spotify-popularity.js

data-shs-versions:
	$(PYTHON) data/pullData.py

clean-shs-cache: clean-shs-search-cache clean-shs-scrape-cache

clean-shs-search-cache:
	rm data/shs-search-cache/*

clean-shs-scrape-cache:
	rm data/shs-scrape-cache/*
