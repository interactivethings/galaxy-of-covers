import requests
import json
import textwrap

API_SEARCH = "http://www.secondhandsongs.com/search/"
STD_HEADERS = {
  "Accept": "application/json"
}
POLL_INTERVAL = (60 * 60 * 1000) / 1000 # milliseconds per request, at 1000 requests per hour
MAX_PAGE_SIZE = 100

def requestOrNull(url, headers=STD_HEADERS, payload={}):
  gotten = requests.get(url, headers=headers, params=payload)
  if gotten.status_code == requests.codes.ok:
    try:
      return gotten.json()
    except:
      return gotten.text
  else:
    try:
      respString = json.dumps(gotten.json())
    except:
      respString = str(gotten)

    indent = " " * 10
    wrapped = textwrap.wrap(respString, width=100, initial_indent=indent, subsequent_indent=indent)

    print("Error:", url, "returned:")
    print("\n".join(wrapped))

    return None

def getObject(url):
  return requestOrNull(url)

def searchArtist(artist, pageNum=0):
  url = API_SEARCH + "artist"
  payload = {
    "commonName": artist,
    "pageSize": MAX_PAGE_SIZE,
    "page": pageNum
  }
  return requestOrNull(url, payload=payload)

def searchPerformance(title, performer="", date="", pageNum=0):
  url = API_SEARCH + "performance"
  payload = {
    "title": title,
    "performer": performer,
    "date": date,
    "pageSize": MAX_PAGE_SIZE,
    "page": pageNum
  }
  return requestOrNull(url, payload=payload)

def searchWork(title, credits=[], pageNum=0):
  url = API_SEARCH + "work"
  payload = {
    "title": title,
    "credits": credits,
    "pageSize": MAX_PAGE_SIZE,
    "page": pageNum
  }
  return requestOrNull(url, payload=payload)

def searchObject(searchField):
  url = API_SEARCH + "object"
  payload = {
    "caption": searchField,
    "pageSize": MAX_PAGE_SIZE,
    "page": pageNum
  }
  return requestOrNull(url, payload=payload)
