import json
import urllib.request

# 5c) Get first list id
resp = urllib.request.urlopen('http://localhost:3001/api/lists')
data = json.loads(resp.read())
first_id = data['data'][0]['id']
print(f"firstId: {first_id}")

# Now fetch that specific list
resp2 = urllib.request.urlopen(f'http://localhost:3001/api/lists/{first_id}')
detail = resp2.read()
print(f"HTTP_STATUS: {resp2.status}")
print(f"Detail (first 500 bytes): {detail[:500].decode()}")