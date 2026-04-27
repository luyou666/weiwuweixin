import json
import urllib.request

# 5d) POST /api/lists
url = 'http://localhost:3001/api/lists'
payload = json.dumps({
    "title": "测试榜单",
    "dimensions": [{"name": "好感", "weight": 1, "scale": "1-10"}],
    "items": [{"name": "条目1", "order": 0}]
}).encode('utf-8')

req = urllib.request.Request(url, data=payload, method='POST')
req.add_header('X-Device-Id', 'test-device-A')
req.add_header('Content-Type', 'application/json')

resp = urllib.request.urlopen(req)
status = resp.status
body = resp.read().decode('utf-8')
print(f"HTTP_STATUS: {status}")
print(f"Response (first 500 bytes): {body[:500]}")

# Parse and save listId and itemId for later steps
data = json.loads(body)
print(f"\n=== Key IDs ===")
print(f"listId: {data.get('id', 'N/A')}")
print(f"authorHandle: {data.get('author', {}).get('handle', 'N/A')}")
if 'items' in data and len(data['items']) > 0:
    print(f"firstItemId: {data['items'][0]['id']}")

# Save for next steps
with open('/tmp/test_ids.json', 'w') as f:
    json.dump({
        'listId': data.get('id'),
        'itemId': data['items'][0]['id'] if 'items' in data and len(data['items']) > 0 else None,
    }, f)