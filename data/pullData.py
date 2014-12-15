import os
import hashlib
import csv
import json

from bs4 import BeautifulSoup

from constants import *
import shsJsonApi
import shsHtmlApi

def writeLine(file, *messages):
  n = "\n"
  file.write(n.join(messages) + n)

def hashString(toBeHashed):
  return hashlib.md5(bytes(toBeHashed, "utf-8")).hexdigest()

stringNone = str(None)

def fetchFileContents(fileName):
  with open(fileName, 'r') as file:
    contents = file.read()
  if contents == '' or contents == stringNone:
    return None
  else:
    return contents

def writeFileContents(fileName, contents):
  with open(fileName, 'w') as file:
    file.write(str(contents))

def requestWorkSearch(songName, authorCredits=""):
  fileName = SHS_SEARCH_CACHE_DIR + hashString("work+++" + songName + "+++" + authorCredits)

  if os.path.isfile(fileName):
    contents = fetchFileContents(fileName)
    return json.loads(contents) if contents is not None else None
  else:
    response = shsJsonApi.searchWork(songName, authorCredits)
    writeValue = json.dumps(response) if response is not None else stringNone
    writeFileContents(fileName, writeValue)
    return response

def requestPerformanceSearch(songName, performer=""):
  fileName = SHS_SEARCH_CACHE_DIR + hashString("performance+++" + songName + "+++" + performer)

  if os.path.isfile(fileName):
    contents = fetchFileContents(fileName)
    return json.loads(contents) if contents is not None else None
  else:
    response = shsJsonApi.searchPerformance(songName, performer)
    writeValue = json.dumps(response) if response is not None else stringNone
    writeFileContents(fileName, writeValue)
    return response

def requestVersions(url):
  fileName = SHS_SCRAPE_CACHE_DIR + hashString(url)

  if os.path.isfile(fileName):
    contents = fetchFileContents(fileName)
    return contents if contents is not None else None
  else:
    response = shsHtmlApi.makeRequest(url)
    writeValue = response if response is not None else stringNone
    writeFileContents(fileName, writeValue)
    return response

# run a search for a work on secondhandsongs, and pull the versions down too
def searchSongVersions(songName, artistCredits=""):
  # default uses the work search
  worksResponse = requestWorkSearch(songName, artistCredits)
  isPerfSearch = False

  if worksResponse is None or len(worksResponse["resultPage"]) < 1:
    # if work search doesn't pan out, use the performance search
    worksResponse = requestPerformanceSearch(songName, artistCredits)
    isPerfSearch = True

  if worksResponse is None:
    print ("Search failed")
    writeLine(FILE_DEBUG_SEARCH, "Failed search:", songName, artistCredits, "")
    return None
  elif len(worksResponse["resultPage"]) < 1:
    print("Search returned no results")
    writeLine(FILE_DEBUG_SEARCH, "No Results:", songName, artistCredits, "")
    return None
  elif len(worksResponse["resultPage"]) > 1:
    print("Search returned more than one result")
    writeLine(FILE_DEBUG_SEARCH, "Too many results:", songName, artistCredits)
    writeLine(FILE_DEBUG_SEARCH, json.dumps(worksResponse, indent=1), "")

  workInfo = worksResponse["resultPage"][0]
  songPage = requestVersions(workInfo["uri"] + "/versions")
  if songPage is None:
    print("Song versions page request returned None")
    writeLine(FILE_DEBUG_SEARCH, "No versions page:", workInfo["uri"])
    return None

  soupObj = BeautifulSoup(songPage)

  songData = workInfo.copy()
  songData.update(shsHtmlApi.parseMetaData(soupObj))
  itemData = shsHtmlApi.parseWorkData(soupObj) if not isPerfSearch else shsHtmlApi.parsePerformanceData(soupObj)
  songData.update(itemData)
  songData["versions"] = shsHtmlApi.parseWorkVersions(soupObj)

  return songData

sourceList = csv.DictReader(FILE_SONG_SOURCE)
songInfoList = []

for sourceItem in sourceList:
  title = sourceItem["TITLE (original)"]
  credits = sourceItem["ORIGINAL"]
  print(title, credits)

  searchResults = searchSongVersions(title, credits)
  if searchResults is not None:
    songInfoList.append(searchResults)

json.dump(songInfoList, FILE_SONG_OUTPUT, indent=1)
