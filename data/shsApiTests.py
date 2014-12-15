import json
import shsJsonApi

from constants import *

# tests for querying object uris
objUriTests = [
  "http://www.secondhandsongs.com/artist/123",
  "http://www.secondhandsongs.com/performance/123",
  "http://www.secondhandsongs.com/work/122",
  "http://www.secondhandsongs.com/release/123",
  "http://www.secondhandsongs.com/label/123"
  "http://www.secondhandsongs.com/badformat/123"
]

results = []
for objUri in objUriTests:
  resp = shsJsonApi.getObject(objUri)
  results.append(resp)

json.dump(results, FILE_API_TESTS, indent=1)
