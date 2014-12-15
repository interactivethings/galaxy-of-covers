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
    response = json.loads(contents) if contents is not None else None
  else:
    response = shsJsonApi.searchWork(songName, authorCredits)
    writeValue = json.dumps(response) if response is not None else stringNone
    writeFileContents(fileName, writeValue)

  if response is None:
    return (None, SearchStatus.FAIL)
  elif len(response["resultPage"]) < 1:
    return (response, SearchStatus.EMPTY)
  elif len(response["resultPage"]) > 1:
    return (response, SearchStatus.MANY)
  else:
    return (response, SearchStatus.SUCCESS)

def requestPerformanceSearch(songName, performer=""):
  fileName = SHS_SEARCH_CACHE_DIR + hashString("performance+++" + songName + "+++" + performer)

  if os.path.isfile(fileName):
    contents = fetchFileContents(fileName)
    response = json.loads(contents) if contents is not None else None
  else:
    response = shsJsonApi.searchPerformance(songName, performer)
    writeValue = json.dumps(response) if response is not None else stringNone
    writeFileContents(fileName, writeValue)

  if response is None:
    return (None, SearchStatus.FAIL)
  elif len(response["resultPage"]) < 1:
    return (response, SearchStatus.EMPTY)
  elif len(response["resultPage"]) > 1:
    originalPerformances = [p for p in response["resultPage"] if p["isOriginal"]]
    if len(originalPerformances) > 0:
      response["resultPage"] = originalPerformances[:1]
      return (response, SearchStatus.SUCCESS)
    else:
      return (response, SearchStatus.MANY)
  else:
    return (response, SearchStatus.SUCCESS)

def requestVersions(url):
  fileName = SHS_SCRAPE_CACHE_DIR + hashString(url)

  if os.path.isfile(fileName):
    contents = fetchFileContents(fileName)
    response = contents if contents is not None else None
  else:
    response = shsHtmlApi.makeRequest(url)
    writeValue = response if response is not None else stringNone
    writeFileContents(fileName, writeValue)

  if response is None:
    return (response, SearchStatus.FAIL)
  else:
    return (response, SearchStatus.SUCCESS)

# run a search for a work on secondhandsongs, and pull the versions down too
def searchSongVersions(songName, artistCredits=""):
  # default uses the work search
  isPerfSearch = False
  searchResponse, status = requestWorkSearch(songName, artistCredits)

  if status is SearchStatus.FAIL or status is SearchStatus.EMPTY:
    # if work search doesn't pan out, use the performance search
    isPerfSearch = True
    searchResponse, status = requestPerformanceSearch(songName, artistCredits)

  if status is SearchStatus.FAIL:
    print ("Search failed")
    writeLine(FILE_DEBUG_SEARCH, "Failed search:", songName, artistCredits, "")
    return None
  elif status is SearchStatus.EMPTY:
    print("Search returned no results")
    writeLine(FILE_DEBUG_SEARCH, "No Results:", songName, artistCredits, "")
    return None

  if status is SearchStatus.MANY:
    print("Search returned more than one result")
    writeLine(FILE_DEBUG_SEARCH, "Too many results:", songName, artistCredits)
    writeLine(FILE_DEBUG_SEARCH, json.dumps(searchResponse, indent=1), "")

  workInfo = searchResponse["resultPage"][0]
  songPage, status = requestVersions(workInfo["uri"] + "/versions")
  if status is SearchStatus.FAIL:
    print("Song versions page request failed")
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
