import requests
import re
import json

def search_live_youtube_channels(query: str):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    }
    # sp=EgIQAg%253D%253D forces Channel filter on YouTube Search
    url = f"https://www.youtube.com/results?search_query={requests.utils.quote(query)}&sp=EgIQAg%253D%253D"
    res = requests.get(url, headers=headers, timeout=10)

    # Extract channel handles
    handles = list(set(re.findall(r'"(@[a-zA-Z0-9_\-\.]+)"', res.text)))

    # Extract channel names & subscriber strings from ytInitialData JSON in HTML
    match = re.search(r'ytInitialData\s*=\s*({.+?});</script>', res.text)
    channel_details = []
    if match:
        try:
            yt_data = json.loads(match.group(1))
            contents = yt_data.get('contents', {}).get('twoColumnSearchResultsRenderer', {}).get('primaryContents', {}).get('sectionListRenderer', {}).get('contents', [])
            for c in contents:
                items = c.get('itemSectionRenderer', {}).get('contents', [])
                for item in items:
                    ch_renderer = item.get('channelRenderer', {})
                    if ch_renderer:
                        c_id = ch_renderer.get('channelId')
                        title = ch_renderer.get('title', {}).get('simpleText', '')
                        subs = ch_renderer.get('subscriberCountText', {}).get('simpleText', 'Active')
                        desc_snippet = ch_renderer.get('descriptionSnippet', {}).get('runs', [{}])[0].get('text', '')
                        handle = ch_renderer.get('navigationEndpoint', {}).get('browseEndpoint', {}).get('canonicalBaseUrl', '')
                        if handle:
                            channel_details.append({
                                "name": title,
                                "handle": handle,
                                "url": f"https://www.youtube.com{handle}",
                                "subscribers": subs,
                                "snippet": desc_snippet
                            })
        except Exception as e:
            print("Parser error:", e)

    return channel_details, handles

details, raw_handles = search_live_youtube_channels("AI storytelling")
print("Live YouTube Channels Found:", len(details))
for d in details[:5]:
    print(" - Name:", d['name'])
    print("   URL:", d['url'])
    print("   Subs:", d['subscribers'])
    print("   Snippet:", d['snippet'])
