SHELL := /bin/bash
PATH := node_modules/.bin:$(PATH)

# python3 and pip3 are required
PYTHON = python3
PIP = pip3

.PHONY: all server build clean install data data-song-list data-spotify data-shs-versions clean-shs-cache clean-shs-search-cache clean-shs-scrape-cache

all: server

server: install
	webpack-dev-server --colors --progress --port 6060

build: clean install
	NODE_ENV=production webpack -p --colors --progress --hide-modules
	cp index.html build/index.html
	mkdir -p build/data/out
	cp data/out/songinfo-production.json build/data/out/songinfo-production.json

deploy: build
	rsync -avz build/ --exclude=.DS_Store interact@interactivethings.com:/home/interact/www/lab.interactivethings.com/galaxy-of-covers

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

# the data-processing pipeline
data-song-list:
	wget -O data/out/songs.csv https://docs.google.com/spreadsheets/d/1EqO6oF0o8oL0XLcNXNkdOA4wbcKJBiTb24rBphubgrA/export?format=csv

data-guardian-covers:
	wget -O data/out/guardian_songs.csv https://docs.google.com/spreadsheets/d/1vIkPwZaE58TbgoPpCQvMLvSvPfs068m1pIetNvElCr4/export?format=csv

data-shs-versions:
	$(PYTHON) data/py/pullData.py

data-spotify:
	node data/js/spotify.js

data-echonest:
	node data/js/echonest.js

data-musixmatch:
	node data/js/musixmatch.js

data-add-whosampled-genres:
	$(PYTHON) data/py/mergeWhoSampledGenres.py

data-trim-for-production:
	$(PYTHON) data/py/trimForProduction.py

data-add-manual-genres:
	$(PYTHON) data/py/addManualGenres.py

data-whosampled:
#	probably shouldn't use this - it's broken
#	node data/js/whosampled.js

clean-shs-cache: clean-shs-search-cache clean-shs-scrape-cache

clean-shs-search-cache:
	rm data/shs-search-cache/*

clean-shs-scrape-cache:
	rm data/shs-scrape-cache/*

test-shs-api:
	$(PYTHON) data/py/shsApiTests.py
