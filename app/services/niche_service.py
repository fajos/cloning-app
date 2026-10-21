import json
from typing import List, Dict, Any
from app.services.ai_service import AIService
from app.services.video_service import VideoService

class NicheService:
    @staticmethod
    def discover_dynamic_niches(
        category: str = "Finance & Wealth",
        api_key: str = "",
        ai_provider: str = "deepseek"
    ) -> Dict[str, Any]:
        """
        Dynamically discovers real-time exploding YouTube sub-niches AND pulls live YouTube channels.
        Includes fast fallback for Vercel serverless functions.
        """
        try:
            live_channels = VideoService.search_live_youtube_channels(category, max_results=6)
        except Exception:
            live_channels = []

        if not api_key:
            niches = NicheService._get_default_niches(category)
            if live_channels and len(niches) > 0:
                niches[0]["suggested_channels"] = live_channels[:3]
                if len(niches) > 1 and len(live_channels) > 3:
                    niches[1]["suggested_channels"] = live_channels[3:6]
            return {"success": True, "niches": niches}

        prompt = f"""
You are a Real-Time YouTube Niche Analyst and Creator Market Intelligence Engine.
Your task is to analyze the YouTube creator ecosystem and identify 3 HIGH-DEMAND, LOW-COMPETITION, HIGH-CPM trending sub-niches within the category/topic: "{category}".

Live YouTube channels active in this topic:
{json.dumps(live_channels if live_channels else [], indent=2)}

For EACH sub-niche, generate:
1. Sub-Niche Name & Description
2. Estimated Advertiser CPM ($) & Competition Level
3. 2-3 REAL YouTube Channels matching this niche (use live channels provided or real active handles)
4. 3 High-CTR Viral Video Topic Ideas

Respond strictly with valid JSON following this schema:
{{
  "niches": [
    {{
      "id": "niche-1",
      "niche_name": "Name of Sub-Niche",
      "category": "{category}",
      "cpm_estimate": "$25 - $40",
      "competition_level": "Low / Medium-Low",
      "demand_score": "96/100",
      "description": "Why this sub-niche is exploding right now",
      "suggested_channels": [
        {{
          "name": "Real Channel Name 1",
          "url": "https://www.youtube.com/@ChannelHandle1",
          "subscriber_highlight": "250K+ subs",
          "why_clone": "Why this channel's formula converts"
        }},
        {{
          "name": "Real Channel Name 2",
          "url": "https://www.youtube.com/@ChannelHandle2",
          "subscriber_highlight": "180K+ subs",
          "why_clone": "Why this channel's hook converts"
        }}
      ],
      "example_topics": [
        "Viral Topic Idea 1",
        "Viral Topic Idea 2",
        "Viral Topic Idea 3"
      ]
    }}
  ]
}}
"""

        try:
            if ai_provider == "deepseek":
                res = AIService._call_deepseek_api(prompt, api_key)
            else:
                res = AIService._call_gemini_api(prompt, api_key)

            if res.get("success") and isinstance(res.get("data"), dict) and res["data"].get("niches"):
                niches = res["data"]["niches"]
                if live_channels and len(niches) > 0:
                    for idx, n in enumerate(niches):
                        if not n.get("suggested_channels") or len(n["suggested_channels"]) == 0:
                            start_idx = (idx * 2) % len(live_channels)
                            n["suggested_channels"] = live_channels[start_idx:start_idx+2]
                return {"success": True, "niches": niches}
        except Exception as ex:
            print("AI niche discovery error:", ex)

        # Guaranteed instant fallback
        niches = NicheService._get_default_niches(category)
        if live_channels and len(niches) > 0:
            niches[0]["suggested_channels"] = live_channels[:3]
        return {"success": True, "niches": niches}

    @staticmethod
    def _get_default_niches(category: str) -> List[Dict[str, Any]]:
        cat_lower = category.lower()

        if "storytelling" in cat_lower or "folklore" in cat_lower or "ai video" in cat_lower:
            return [
                {
                    "id": "ai-storytelling-dark-folklore",
                    "niche_name": "AI Animated Dark Folklore & Mythical Mysteries",
                    "category": category,
                    "cpm_estimate": "$20 - $35",
                    "competition_level": "Low",
                    "demand_score": "97/100",
                    "description": "High-retention cinematic storytelling exploring ancient mythology, dark folklore, and unrevealed historical legends using Midjourney visuals.",
                    "suggested_channels": [
                        {
                            "name": "Mythology & Fiction Explained",
                            "url": "https://www.youtube.com/@MythologyExplained",
                            "subscriber_highlight": "1.8M+ subs",
                            "why_clone": "Masterclass in lore breakdowns with high retention visual storytelling."
                        },
                        {
                            "name": "LIGHTS ARE OFF",
                            "url": "https://www.youtube.com/@LIGHTSAREOFF",
                            "subscriber_highlight": "18.9M+ views hit",
                            "why_clone": "Ultra viral dark animated horror shorts."
                        }
                    ],
                    "example_topics": [
                        "The Forgotten Mythological Creature That Terrified Ancient Civilizations",
                        "5 Erased Dark Legends From Ancient Historical Manuscripts",
                        "The Unspoken Truth About Ancient World Mythology"
                    ]
                }
            ]

        if "finance" in cat_lower or "wealth" in cat_lower or "money" in cat_lower:
            return [
                {
                    "id": "stealth-wealth",
                    "niche_name": "Stealth Wealth & Silent Financial Habits",
                    "category": "Finance & Wealth",
                    "cpm_estimate": "$28 - $42",
                    "competition_level": "Low",
                    "demand_score": "98/100",
                    "description": "Exploring quiet financial discipline, stealth wealth stories, and psychological money habits that build long-term independence.",
                    "suggested_channels": [
                        {
                            "name": "Sight of Fortitude",
                            "url": "https://www.youtube.com/@SightofFortitude",
                            "subscriber_highlight": "250K+ subs",
                            "why_clone": "Cinematic philosophical financial storytelling with ultra-high retention."
                        },
                        {
                            "name": "Breakthrough Zone",
                            "url": "https://www.youtube.com/@ZoneBreakthrough",
                            "subscriber_highlight": "180K+ subs",
                            "why_clone": "Short punchy financial discipline stories focusing on stealth wealth."
                        }
                    ],
                    "example_topics": [
                        "Why 4 Silent Habits Quietly Build Wealth Faster Than High Income",
                        "The Power of Stealth Wealth: How Rich People Live Below Their Means",
                        "Why Money Mindset Quietly Determines Your Financial Stability"
                    ]
                }
            ]

        return [
            {
                "id": "ai-automation-agents",
                "niche_name": "AI Micro-SaaS & Agent Workflows",
                "category": category,
                "cpm_estimate": "$28 - $45",
                "competition_level": "Medium-Low",
                "demand_score": "98/100",
                "description": "Practical breakdowns of on-device AI, autonomous agents, and practical micro-automation tools without fluff.",
                "suggested_channels": [
                    {
                        "name": "Matthew Berman",
                        "url": "https://www.youtube.com/@MatthewBerman",
                        "subscriber_highlight": "500K+ subs",
                        "why_clone": "Fast-paced, high-value breakdowns of local AI tools and autonomous agent frameworks."
                    }
                ],
                "example_topics": [
                    "How Autonomous AI Agents Will Replace 90% of Repetitive Web Tasks",
                    "The Hidden AI Tools Solopreneurs Use to Run 6-Figure Business Alone",
                    "Why Local On-Device AI Is the Biggest Tech Shift Since the Smartphone"
                ]
            }
        ]
