import urllib.request
try:
    req = urllib.request.Request('http://localhost:8000/api/v1/game-categories/4', method='DELETE')
    urllib.request.urlopen(req)
except Exception as e:
    print(e.read().decode())
