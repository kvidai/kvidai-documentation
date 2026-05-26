import json, os, urllib.request

host = os.environ['MEILISEARCH_HOST_URL'].rstrip('/')
key = os.environ['MEILISEARCH_API_KEY']
index_uid = os.environ['INDEX_UID']

def api(method, path, data=None):
    req = urllib.request.Request(f"{host}{path}", method=method,
        headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'})
    if data is not None:
        req.data = json.dumps(data).encode()
    with urllib.request.urlopen(req) as r:
        return json.load(r)

offset, limit, patches = 0, 500, []
resp = api('GET', f'/indexes/{index_uid}/documents?limit=1&fields=objectID')
total = resp['total']
print(f'Total documents: {total}')

while offset < total:
    resp = api('GET', f'/indexes/{index_uid}/documents?limit={limit}&offset={offset}&fields=objectID,url')
    for doc in resp['results']:
        lang = 'ko' if '/ko/' in doc.get('url', '') else 'en'
        patches.append({'objectID': doc['objectID'], 'lang': lang})
    offset += limit

for i in range(0, len(patches), 500):
    batch = patches[i:i+500]
    resp = api('PUT', f'/indexes/{index_uid}/documents', batch)
    print(f'Patch batch {i//500+1}/{-(-len(patches)//500)}: taskUid={resp.get("taskUid")}')

ko = sum(1 for p in patches if p['lang'] == 'ko')
print(f'lang applied — en: {len(patches)-ko}, ko: {ko}')
