import json

from constants import *

def pick(sourceDict, propList):
  targetDict = {}
  for prop in propList:
    if prop in sourceDict:
      targetDict[prop] = sourceDict[prop]
  return targetDict

fullData = json.load(open(OUT_DIR+"songinfo-spotify-echonest-genres-whosampled.json", "r"))
trimmedData = []

clearOpenFile(FILE_TRIMMED_FOR_PRODUCTION)

for songData in fullData:
  trimmedSong = pick(songData, ["title"])
  trimmedVersions = []
  for versionData in songData["versions"]:
    if "echonest" not in versionData or "spotify" not in versionData:
      continue
    trimmedV = pick(versionData, ["title", "performer", "date"])
    trimmedV["spotify"] = pick(versionData["spotify"], ["popularity", "preview"])
    trimmedV["echonest"] = pick(versionData["echonest"], ["speechiness", "valence", "tempo", "energy"])
    if "whosampled" in versionData and versionData["whosampled"]["genre"]:
      trimmedV["genre"] = versionData["whosampled"]["genre"]
    elif "musiXmatch" in versionData and versionData["musiXmatch"] and len(versionData["musiXmatch"]["genres"]):
      trimmedV["genre"] = " / ".join(versionData["musiXmatch"]["genres"])
    else:
      trimmedV["genre"] = "Unknown"
    trimmedVersions.append(trimmedV)
  trimmedSong["versions"] = trimmedVersions
  trimmedData.append(trimmedSong)

json.dump(trimmedData, FILE_TRIMMED_FOR_PRODUCTION, indent=1)
