import json
import re

from bs4 import BeautifulSoup, UnicodeDammit

from constants import *
import shsapi
import shshtmlapi

# test for getting info about a specific cover
dest = open(DEST_DIR + "test.json", "w+")

resp = shsapi.searchWork("Summertime", ["Gershwin"])
print(json.dumps(resp, indent = 1))

songList = []
for workInfo in resp["resultPage"]:
  songPage = shshtmlapi.makeRequest(workInfo["uri"])
  soup = BeautifulSoup(songPage)
  songData = workInfo.copy()

  for metaTag in soup.find_all("meta"):
    if metaTag.has_attr("name"):
      if metaTag["name"] == "description":
        songData["description"] = metaTag["content"]
      if metaTag["name"] == "keywords":
        songData["keywords"] = metaTag["content"]

  infoEl = soup.find(id="main").find(id="content").find(id="entity-info").div.dl
  for termDef in infoEl.find_all("dt"):
    defName = str(termDef.string)
    defValue = str("".join([s for s in termDef.find_next_sibling("dd").stripped_strings]))
    songData[defName] = defValue

  songData["versions"] = []

  songVersions = shshtmlapi.makeRequest(workInfo["uri"] + "/versions")
  soup = BeautifulSoup(songVersions)
  versionsList = soup.find(id="main").find(id="entity-section").table.tbody.find_all("tr")
  for versionEl in versionsList:
    versionData = {}
    for fieldEl in versionEl.find_all("td", class_=re.compile(".*-title|.*-performer|.*-date")):
      fieldName = re.compile("field-").sub("", fieldEl["class"][0])
      fieldValue = str("".join([s for s in fieldEl.stripped_strings]))
      versionData[fieldName] = fieldValue
    songData["versions"].append(versionData)

  songList.append(songData)

json.dump(songList, dest, indent=1)


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
#   resp = shsapi.getObject(objUri)
#   results.append(resp)

# json.dump(results, dest, indent=1)
