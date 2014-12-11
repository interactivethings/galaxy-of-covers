import requests

API_ROOT = "http://www.secondhandsongs.com/"
STD_HEADERS = {

}
MAX_PAGE_SIZE = 100

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
