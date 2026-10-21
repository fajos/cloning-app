import re
import requests
from typing import Dict, Any, Optional
from youtube_transcript_api import YouTubeTranscriptApi

class YouTubeService:
    @staticmethod
    def extract_video_id(url: str) -> Optional[str]:
        """
        Extracts video ID from various YouTube URL formats including regular, shorts, embed, and shortened URLs.
        """
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
            r'youtu\.be\/([0-9A-Za-z_-]{11})',
            r'youtube\.com\/shorts\/([0-9A-Za-z_-]{11})',
            r'youtube\.com\/embed\/([0-9A-Za-z_-]{11})',
            r'youtube\.com\/v\/([0-9A-Za-z_-]{11})'
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    @staticmethod
    def get_transcript(video_id: str) -> Dict[str, Any]:
        """
        Fetches the transcript for a YouTube video using YouTubeTranscriptApi safely.
        """
        try:
            api = YouTubeTranscriptApi()

            # 1. Try direct fetch (v1.2.4 API)
            try:
                fetched = api.fetch(video_id)
                if fetched:
                    # Check if fetched object is iterable list of dicts
                    items = list(fetched)
                    full_text = " ".join([item.get('text', '') for item in items if isinstance(item, dict)])
                    if full_text.strip():
                        return {
                            "success": True,
                            "text": full_text,
                            "word_count": len(full_text.split())
                        }
            except Exception:
                pass

            # 2. Try list and fetch fallback
            try:
                transcript_list = api.list(video_id)
                for t in transcript_list:
                    items = t.fetch()
                    full_text = " ".join([item.get('text', '') for item in items if isinstance(item, dict)])
                    if full_text.strip():
                        return {
                            "success": True,
                            "text": full_text,
                            "word_count": len(full_text.split())
                        }
            except Exception:
                pass

        except Exception as e:
            pass

        # Safe fallback: Return success=False without crashing
        return {
            "success": False,
            "error": "Transcript unavailable (captions disabled or YouTube IP limit). Generating script based on video title & topic.",
            "text": "",
            "word_count": 0
        }

    @staticmethod
    def get_video_metadata(video_id: str) -> Dict[str, Any]:
        """
        Fetches video metadata (title, author, thumbnail) reliably via official YouTube oEmbed API.
        Does not require yt-dlp or cookies, avoiding bot checks.
        """
        metadata = {
            "video_id": video_id,
            "title": f"YouTube Video ({video_id})",
            "author": "YouTube Creator",
            "thumbnail": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
        }

        try:
            oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
            res = requests.get(oembed_url, timeout=6)
            if res.status_code == 200:
                data = res.json()
                metadata["title"] = data.get("title", metadata["title"])
                metadata["author"] = data.get("author_name", metadata["author"])
                if data.get("thumbnail_url"):
                    metadata["thumbnail"] = data.get("thumbnail_url")
        except Exception:
            pass

        return metadata
