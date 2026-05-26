import json, os

index_uid = os.environ['INDEX_UID']
start_url = os.environ['START_URL']
context = os.environ['CONTEXT']

with open('.meilisearch-docs-scraper.json') as f:
    config = json.load(f)

config['index_uid'] = index_uid
config['start_urls'] = [start_url]

# Use sitemap only for production (preview URLs have isolated sitemaps)
if context == 'production':
    config['sitemap_urls'] = ['https://docs.kvid.ai/sitemap.xml']
else:
    config.pop('sitemap_urls', None)

with open('/tmp/scraper-config.json', 'w') as f:
    json.dump(config, f, indent=2)

print(f"Config: index={config['index_uid']} start={config['start_urls']}")
