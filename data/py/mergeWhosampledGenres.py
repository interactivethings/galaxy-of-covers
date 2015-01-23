import csv
import json

from constants import *

withoutGenres = json.load(open(OUT_DIR+"songinfo-spotify-echonest-genres.json", "r"))
whosampledData = csv.DictReader(open(ROOT_DIR+"4whosampled-withgenres.csv", "r"))

clearOpenFile(FILE_WITH_WHOSAMPLED_GENRES_OUTPUT)

# this dict is based on an email from whosampled
genreDict = {
  "H": "Hip-Hop / R&B",
  "E": "Electronic / Dance",
  "R": "Rock / Pop",
  "S": "Soul / Funk / Disco",
  "J": "Jazz / Blues",
  "G": "Reggae",
  "C": "Country / Folk",
  "W": "World",
  "T": "Soundtrack",
  "L": "Classical",
  "P": "Spoken Word",
  "A": "Easy Listening",
  "1": "Gospel",
  "O": "Other",
}

echonestIdDict = dict([(item["echonestid"], item) for item in whosampledData])

for songData in withoutGenres:
  for versionData in songData["versions"]:
    if "echonest" in versionData:
      echoid = versionData["echonest"]["songId"]
      if echoid in echonestIdDict:
        genreAbbr = echonestIdDict[echoid]["genre"]
        fullGenreName = genreDict[genreAbbr] if genreAbbr else None
        versionData["whosampled"] = {
          "genre": fullGenreName
        }

json.dump(withoutGenres, FILE_WITH_WHOSAMPLED_GENRES_OUTPUT, indent=1)
