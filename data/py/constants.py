import os
from enum import Enum

ROOT_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"

DEBUG_DIR = ROOT_DIR  + "debug/"
OUT_DIR = ROOT_DIR + "out/"
SHS_SEARCH_CACHE_DIR = ROOT_DIR + "shs-search-cache/"
SHS_SCRAPE_CACHE_DIR = ROOT_DIR + "shs-scrape-cache/"

FILE_API_TESTS = open(DEBUG_DIR + "apiTests.json", "a")
FILE_DEBUG_SEARCH = open(DEBUG_DIR + "searchdebug.txt", "a")
FILE_SONG_SOURCE = open(OUT_DIR + "guardian_songs.csv", "r")
FILE_SONG_OUTPUT = open(OUT_DIR + "songinfo.json", "a")
FILE_WITH_WHOSAMPLED_GENRES_OUTPUT = open(OUT_DIR + "songinfo-spotify-echonest-genres-whosampled.json", "a")
FILE_TRIMMED_FOR_PRODUCTION = open(OUT_DIR + "songinfo-production.json", "a+")
FILE_MANUAL_GENRES = open(ROOT_DIR + "genre_manual_categorization.csv", "r")

def clearOpenFile(fileObj):
  fileObj.seek(0)
  fileObj.truncate()

class SearchStatus(Enum):
  SUCCESS = 1
  FAIL = 2
  EMPTY = 3
  MANY = 4

