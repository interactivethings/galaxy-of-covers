import requests
import re

API_ROOT = "http://www.secondhandsongs.com/"
STD_HEADERS = {}

def makeRequest(url, headers=STD_HEADERS):
  gotten = requests.get(url, headers=headers)
  if gotten.status_code == requests.codes.ok:
    return gotten.text
  else:
    respString = gotten.text
    wrapped = textwrap.wrap(respString, width=100)

    print("Error:", url, "returned:")
    print("\n".join(wrapped))

    return None

def parseMetaData(soupObj):
  metaData = {}
  for metaTag in soupObj.find_all("meta"):
    if metaTag.has_attr("name"):
      if metaTag["name"] == "description":
        metaData["description"] = metaTag["content"]
      if metaTag["name"] == "keywords":
        metaData["keywords"] = metaTag["content"]
  return metaData

def bsNavStringToUnicode(navStr):
  return str(navStr)

def grabParsedSubstrings(soupObj):
  return "".join([bsNavStringToUnicode(s) for s in soupObj.stripped_strings])

def parseWorkData(soupObj):
  workData = {}
  infoEl = soupObj.find(id="main").find(id="content").find(id="entity-info").div.dl
  for termDef in infoEl.find_all("dt"):
    defName = bsNavStringToUnicode(termDef.string)
    defValue = grabParsedSubstrings(termDef.find_next_sibling("dd"))
    workData[defName] = defValue
  return workData

# regular expressions for scraping version item info
versionInfoClassRE = re.compile(".*-title|.*-performer|.*-date")
fieldPrefixRE = re.compile("field-")

def parseWorkVersions(soupObj):
  versionsList = []
  versionElements = soupObj.find(id="main").find(id="entity-section").table.tbody.find_all("tr")
  for versionEl in versionElements:
    versionData = {}
    for fieldEl in versionEl.find_all("td", class_=versionInfoClassRE):
      fieldName = fieldPrefixRE.sub("", fieldEl["class"][0])
      fieldValue = grabParsedSubstrings(fieldEl)
      versionData[fieldName] = fieldValue
    versionsList.append(versionData)
  return versionsList
