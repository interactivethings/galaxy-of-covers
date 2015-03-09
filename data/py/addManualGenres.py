import csv
import json

from constants import *

FILE_TRIMMED_FOR_PRODUCTION.seek(0)
dataset = json.load(FILE_TRIMMED_FOR_PRODUCTION)

manualGenres = { row["spotifyid"]: row for row in csv.DictReader(FILE_MANUAL_GENRES) }

for row in dataset:
  for version in row["versions"]:
    if version["id"] in manualGenres:
      version["genre"] = manualGenres[version["id"]]["genre"]

clearOpenFile(FILE_TRIMMED_FOR_PRODUCTION)
json.dump(dataset, FILE_TRIMMED_FOR_PRODUCTION, indent=1)
