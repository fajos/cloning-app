import re
import json
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Tuple
import requests

class VideoService:
    @staticmethod
    def get_video_info(url_or_topic: str) -> Dict[str, Any]:
        """
        Parses Channel handle URLs (@handle), YouTube video URLs, or custom topics.
        """
        raw = url_or_topic.strip()

        # Handle Channel handle e.g. @SightofFortitude or youtube.com/@SightofFortitude
        if "@" in raw or "/channel/" in raw or "/c/" in raw or "youtube.com/user/" in raw:
            handle_match = re.search(r'(@[a-zA-Z0-9_\-\.]+)', raw)
            handle_str = handle_match.group(1) if handle_match else raw
            channel_url = f"https://www.youtube.com/{handle_str}" if not raw.startswith("http") else raw

            return {
                "platform": "YouTube Channel",
                "metadata": {
                    "title": f"Channel Blueprint: {handle_str}",
                    "author": handle_str,
                    "thumbnail": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop",
                    "channel_url": channel_url
                },
                "transcript": f"Target YouTube Channel Blueprint for handle: {handle_str}. Focus on extracting channel identity, style DNA, branding, logo prompts, script hooks, and content topics.",
                "transcript_status": {"word_count": 0, "status": "Channel URL Loaded"}
            }

        # Handle YouTube Video ID
        video_id = VideoService._extract_youtube_id(raw)
        if video_id:
            metadata = VideoService._get_youtube_oembed(video_id)
            transcript, status = VideoService._fetch_youtube_transcript(video_id)
            return {
                "platform": "YouTube Video",
                "metadata": metadata,
                "transcript": transcript,
                "transcript_status": status
            }

        # Topic fallback
        return {
            "platform": "Topic / Keyword",
            "metadata": {
                "title": raw,
                "author": "Creator Topic Concept",
                "thumbnail": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop"
            },
            "transcript": f"Topic Concept: {raw}. Generate full 12-state channel modeling and teleprompter script based on this topic idea.",
            "transcript_status": {"word_count": len(raw.split()), "status": "Topic Prompt Loaded"}
        }

    @staticmethod
    def search_live_youtube_channels(query: str, min_views: int = 50000, max_results: int = 6) -> List[Dict[str, Any]]:
        """
        VIRAL-FILTERED CHANNEL SEARCH:
        Searches YouTube for videos ordered by view count (sp=CAM%253D) and extracts channels that produced VERIFIED VIRAL VIDEOS (>50,000 to millions of views)!
        Uses a strict 3.5s timeout for fast response on Vercel serverless.
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
            search_url = f"https://www.youtube.com/results?search_query={requests.utils.quote(query)}&sp=CAM%253D"
            res = requests.get(search_url, headers=headers, timeout=3.5)

            match = re.search(r'ytInitialData\s*=\s*({.+?});</script>', res.text)
            viral_channels = []
            seen_handles = set()

            if match:
                yt_data = json.loads(match.group(1))
                contents = yt_data.get('contents', {}).get('twoColumnSearchResultsRenderer', {}).get('primaryContents', {}).get('sectionListRenderer', {}).get('contents', [])
                for c in contents:
                    items = c.get('itemSectionRenderer', {}).get('contents', [])
                    for item in items:
                        v_renderer = item.get('videoRenderer', {})
                        if v_renderer:
                            title = v_renderer.get('title', {}).get('runs', [{}])[0].get('text', '')
                            view_str = v_renderer.get('viewCountText', {}).get('simpleText', '')

                            owner = v_renderer.get('ownerText', {}).get('runs', [{}])[0]
                            ch_name = owner.get('text', '')
                            handle_endpoint = owner.get('navigationEndpoint', {}).get('browseEndpoint', {}).get('canonicalBaseUrl', '')

                            if not handle_endpoint or handle_endpoint in seen_handles or not ch_name:
                                continue

                            # Parse approx view count
                            view_nums = re.findall(r'([0-9\.,]+)\s*([KkMmBb]?)\s*views', view_str)
                            is_viral = False
                            view_count_approx = 0

                            if view_nums:
                                num_val, unit = view_nums[0]
                                num_val = float(num_val.replace(',', ''))
                                unit = unit.upper()
                                if unit == 'K':
                                    view_count_approx = int(num_val * 1000)
                                elif unit == 'M':
                                    view_count_approx = int(num_val * 1000000)
                                elif unit == 'B':
                                    view_count_approx = int(num_val * 1000000000)
                                else:
                                    view_count_approx = int(num_val)

                                if view_count_approx >= min_views:
                                    is_viral = True

                            if is_viral:
                                seen_handles.add(handle_endpoint)
                                viral_channels.append({
                                    "name": ch_name,
                                    "handle": handle_endpoint,
                                    "url": f"https://www.youtube.com{handle_endpoint}",
                                    "viral_video_title": title,
                                    "subscriber_highlight": f"Verified Viral Video ({view_str})",
                                    "why_clone": f"Proved viral hit: '{title}' ({view_str})"
                                })

                                if len(viral_channels) >= max_results:
                                    break

            return viral_channels
        except Exception:
            return []

    @staticmethod
    def _extract_youtube_id(url: str) -> str:
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
            r'youtu\.be\/([0-9A-Za-z_-]{11})',
            r'shorts\/([0-9A-Za-z_-]{11})'
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return ""

    @staticmethod
    def _get_youtube_oembed(video_id: str) -> Dict[str, Any]:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                return {
                    "title": data.get("title", f"YouTube Video {video_id}"),
                    "author": data.get("author_name", "Unknown Creator"),
                    "thumbnail": data.get("thumbnail_url", f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"),
                    "video_id": video_id
                }
        except Exception:
            return {
                "title": f"YouTube Video {video_id}",
                "author": "YouTube Creator",
                "thumbnail": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                "video_id": video_id
            }

    @staticmethod
    def _fetch_youtube_transcript(video_id: str) -> Tuple[str, Dict[str, Any]]:
        url = f"https://www.youtube.com/watch?v={video_id}"
        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            res = requests.get(url, headers=headers, timeout=10)

            captions_match = re.search(r'"captionTracks":\s*(\[.*?\])', res.text)
            if captions_match:
                tracks = json.loads(captions_match.group(1))
                if tracks:
                    caption_url = tracks[0].get('baseUrl')
                    cap_res = requests.get(caption_url, headers=headers, timeout=10)
                    text = re.sub(r'<[^>]+>', ' ', cap_res.text)
                    cleaned_text = " ".join(text.split())
                    word_count = len(cleaned_text.split())
                    return cleaned_text, {"word_count": word_count, "status": "Subtitles Extracted"}

            title_match = re.search(r'<title>(.*?)</title>', res.text)
            title = title_match.group(1) if title_match else f"Video {video_id}"
            fallback_text = f"Title: {title}. Automatic caption track unavailable. Analyze video based on title and topic."
            return fallback_text, {"word_count": len(fallback_text.split()), "status": "Title Only (No Subtitles)"}

        except Exception as e:
            fallback = f"YouTube Video ID: {video_id}. Model content strategy based on video ID and niche."
            return fallback, {"word_count": 0, "status": f"Transcript Error: {str(e)}"}
