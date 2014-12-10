import requests

url = 'http://www.secondhandsongs.com/search/performance'
headers = {
  "Accept": "application/json"
}
payload = {
  "title": "I'm Waiting for My Man",
  "performer": "The Velvet Underground"
}

resp = requests.get(url, headers=headers)

print(resp.text)
