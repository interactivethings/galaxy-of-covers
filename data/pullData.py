import csv
import json

from bs4 import BeautifulSoup

from constants import *
import shsJsonApi
import shsHtmlApi

def writeLine(file, *messages):
  n = "\n"
  file.write(n.join(messages) + n)

# run a search for a work on secondhandsongs, and pull the versions down too
def searchSongVersions(songName, authorCredits=[]):
  worksResponse = shsJsonApi.searchWork(songName, authorCredits)

  if worksResponse is None:
    print ("Search failed")
    writeLine(FILE_DEBUG_SEARCH, "Failed search:", songName, authorCredits, "")
    return None
  elif len(worksResponse["resultPage"]) < 1:
    print("Search returned no results")
    writeLine(FILE_DEBUG_SEARCH, "No Results:", songName, authorCredits, "")
    return None
  elif len(worksResponse["resultPage"]) > 1:
    print("Search returned more than one result")
    writeLine(FILE_DEBUG_SEARCH, "Too many results:", songName, authorCredits)
    writeLine(FILE_DEBUG_SEARCH, json.dumps(worksResponse, indent=1), "")

  workInfo = worksResponse["resultPage"][0]
  songPage = shsHtmlApi.makeRequest(workInfo["uri"] + "/versions")
  if not songPage:
    print("Song versions page request returned None")
    writeLine(FILE_DEBUG_SEARCH, "No versions page:", workInfo["uri"])
    return None

  soupObj = BeautifulSoup(songPage)

  songData = workInfo.copy()
  songData.update(shsHtmlApi.parseMetaData(soupObj))
  songData.update(shsHtmlApi.parseWorkData(soupObj))
  songData["versions"] = shsHtmlApi.parseWorkVersions(soupObj)

  return songData

sourceList = csv.DictReader(FILE_SONG_SOURCE)
songInfoList = []

for sourceItem in sourceList:
  title = sourceItem["TITLE (original)"]
  credits = sourceItem["ORIGINAL"]
  print(title, credits)

  if title == "" or credits == "":
    continue

  searchResults = searchSongVersions(title, credits)
  if searchResults is not None:
    songInfoList.append(searchResults)

json.dump(songInfoList, FILE_SONG_OUTPUT, indent=1)


# tests for querying object uris
# objUriTests = [
#   "http://www.secondhandsongs.com/artist/123",
#   "http://www.secondhandsongs.com/performance/123",
#   "http://www.secondhandsongs.com/work/123",
#   "http://www.secondhandsongs.com/release/123",
#   "http://www.secondhandsongs.com/label/123"
#   "http://www.secondhandsongs.com/badformat/123"
# ]

# dest = open(DEST_DIR + "testResult.json", "w+")

# results = []
# for objUri in objUriTests:
#   resp = shsJsonApi.getObject(objUri)
#   results.append(resp)

# json.dump(results, dest, indent=1)
