import json
import csv
import re

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
classificationCsvFile = open(OUT_DIR+"classificationhelper.csv", "a")
clearOpenFile(classificationCsvFile)
classificationWriter = csv.writer(classificationCsvFile)
classificationWriter.writerow(["spotifyid", "link", "genre"])

genreReMap = {
  'mm Pop': "Rock / Pop",
  'mm Rock': "Rock / Pop",
  'mm Pop/Rock': "Rock / Pop",
  'mm Pop / Rock': "Rock / Pop",
  'mm Blues': "Jazz / Blues",
  'mm Jazz': "Jazz / Blues",
  'mm Country': "Country / Folk",
  'mm Reggae': "Reggae",
}

coreGrenres = [
  "Rock / Pop",
  "Country / Folk",
  "Hip-Hop / R&B",
  "Soul / Funk / Disco",
  "Jazz / Blues",
  "Reggae",
  "Electronic / Dance",
  "Classical",
  "Vocal",
]

for songData in fullData:
  trimmedSong = pick(songData, ["title"])
  trimmedVersions = []
  for versionData in songData["versions"]:
    # make sure necessary data exists
    if "echonest" not in versionData or "spotify" not in versionData:
      continue
    trimmedV = pick(versionData, ["title", "performer", "date"])
    trimmedV["date"] = re.sub(" \(performance date\)", '', trimmedV["date"])
    trimmedV["id"] = versionData["spotify"]["id"]
    trimmedV["spotify"] = pick(versionData["spotify"], ["popularity", "preview"])
    trimmedV["echonest"] = pick(versionData["echonest"], ["speechiness", "valence", "tempo", "energy"])
    # genre selection
    if "whosampled" in versionData and versionData["whosampled"]["genre"]:
      chosenGenre = versionData["whosampled"]["genre"]
    elif "musiXmatch" in versionData and versionData["musiXmatch"] and len(versionData["musiXmatch"]["genres"]):
      chosenGenre = "mm " + " / ".join(versionData["musiXmatch"]["genres"])
    else:
      chosenGenre = None
    # genre remap
    if chosenGenre in genreReMap:
      chosenGenre = genreReMap[chosenGenre]
    # genre validity check
    if chosenGenre not in coreGrenres:
      chosenGenre = None
      classificationWriter.writerow([trimmedV["id"], trimmedV["spotify"]["preview"], chosenGenre or ''])

    trimmedV["genre"] = chosenGenre
    trimmedVersions.append(trimmedV)
  trimmedSong["versions"] = trimmedVersions
  trimmedData.append(trimmedSong)

json.dump(trimmedData, FILE_TRIMMED_FOR_PRODUCTION, indent=1)
