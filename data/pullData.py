import json

from constants import *
import shsapi


# test for getting info about a specific cover
dest = open(DEST_DIR + "test.json", "w+")

resp = shsapi.searchWork("Summertime", ["Gershwin"])
json.dump(resp, dest, indent = 1)
print(json.dumps(resp, indent = 1))

for songPerf in resp["resultPage"]:
  songObj = shsapi.getObject(songPerf["uri"])
  print(json.dumps(songObj, indent = 1))



# tests for querying object uris
objUriTests = [
  "http://www.secondhandsongs.com/artist/123",
  "http://www.secondhandsongs.com/performance/123",
  "http://www.secondhandsongs.com/work/123",
  "http://www.secondhandsongs.com/release/123",
  "http://www.secondhandsongs.com/label/123"
  "http://www.secondhandsongs.com/badformat/123"
]

dest = open(DEST_DIR + "testResult.json", "w+")

results = []
for objUri in objUriTests:
  resp = shsapi.getObject(objUri)
  results.append(resp)

json.dump(results, dest, indent=1)
