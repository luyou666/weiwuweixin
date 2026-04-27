import json, urllib.request, urllib.error

url = 'http://localhost:3001/api/lists'
payload = json.dumps({
    "title": "测试榜单",
    "dimensions": [{"name": "好感", "weight": 1, "scale": "1-10"}],
    "items": [{"name": "条目1", "order": 0}]
}).encode('utf-8')

req = urllib.request.Request(url, data=payload, method='POST')
req.add_header('X-Device-Id', 'test-device-A')
req.add_header('Content-Type', 'application/json')

try:
    resp = urllib.request.urlopen(req)
    body = resp.read().decode('utf-8')
    print(f"HTTP_STATUS: {resp.status}")
    print(f"Response: {body[:500]}")
except urllib.error.HTTPError as e:
    print(f"HTTP_STATUS: {e.code}")
    body = e.read().decode('utf-8')
    print(f"Error Response: {body[:1000]}")