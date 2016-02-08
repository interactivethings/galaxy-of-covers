SHELL := /bin/bash
PATH := node_modules/.bin:$(PATH)

# python3 and pip3 are required
PYTHON = python3
PIP = pip3

TOUCH := /usr/bin/touch

env ?= development

ifeq ($(env),production)
NODE_ENV ?= production
else ifeq ($(env),staging)
NODE_ENV ?= production
else
NODE_ENV ?= development
endif

CLI_IXT_BLUE = \033[38;5;67m
CLI_SUCCESS  = \033[1;32m✔
CLI_ERROR    = \033[1;31m✘
CLI_NOTICE   = \033[1;36m→
CLI_RESET    = \033[0m

.PHONY: all server build deploy clean clobber install pythonsetup data clean-js-search-cache clean-shs-search-cache clean-shs-scrape-cache test-shs-api

all: server

# Dependencies

install: Makefile node_modules pythonsetup

node_modules: package.json
	npm install
	$(TOUCH) $@

pythonsetup:
	@$(PIP) install requests beautifulsoup4

setup: install
	@echo "No environment setup needed"

update: install
	@echo "No environment update needed"

server: install
	NODE_ENV=$(NODE_ENV) $$(npm bin)/nodemon -q -i src -i data -i prototypes -i build script/server.js

build: clean install
	NODE_ENV=$(NODE_ENV) $$(npm bin)/webpack --colors --progress

deploy: build
	rsync -avz --delete --exclude-from=.rsyncexclude ./build/ interact@interactivethings.com:/home/interact/www/lab.interactivethings.com/galaxy-of-covers

clean:
	rm -rf build

clobber: clean
	rm -rf node_modules

# Data

# the data-processing pipeline
data/out/songs.csv:
	wget -O data/out/songs.csv https://docs.google.com/spreadsheets/d/1EqO6oF0o8oL0XLcNXNkdOA4wbcKJBiTb24rBphubgrA/export?format=csv

data/out/guardian_songs.csv:
	wget -O data/out/guardian_songs.csv https://docs.google.com/spreadsheets/d/1vIkPwZaE58TbgoPpCQvMLvSvPfs068m1pIetNvElCr4/export?format=csv

data/out/songinfo.json: data/out/guardian_songs.csv
	$(PYTHON) data/py/pullData.py

data/out/songinfo-spotify.json: data/out/songinfo.json
	node data/js/spotify.js

data/out/songinfo-spotify-echonest.json: data/out/songinfo-spotify.json
	node data/js/echonest.js

data/out/songinfo-spotify-echonest-genres.json: data/out/songinfo-spotify-echonest.json
	node data/js/musixmatch.js

data/out/songinfo-spotify-echonest-genres-whosampled.json: data/out/songinfo-spotify-echonest-genres.json
	$(PYTHON) data/py/mergeWhoSampledGenres.py

data/out/songinfo-production.json: data/out/songinfo-spotify-echonest-genres-whosampled.json
	$(PYTHON) data/py/trimForProduction.py

data: install data/out/songinfo-production.json
	$(PYTHON) data/py/addManualGenres.py

data-whosampled:
#	probably shouldn't use this - it's broken
#	node data/js/whosampled.js

clean-js-search-cache:
	rm data/cached/*

clean-shs-search-cache:
	rm data/shs-search-cache/*

clean-shs-scrape-cache:
	rm data/shs-scrape-cache/*

test-shs-api:
	$(PYTHON) data/py/shsApiTests.py
