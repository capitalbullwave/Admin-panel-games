import urllib.request
import json
try:
    req = urllib.request.Request('http://localhost:8000/api/v1/games/')
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    print("Games fetched:", len(data))
    if data:
        print("First game:", data[0]['name'])
except Exception as e:
    print("Error:", e)
