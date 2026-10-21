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
        Dynamically discovers 6 HIGH-DEMAND YouTube sub-niches AND pulls live YouTube channels in real-time.
        """
        try:
            live_channels = VideoService.search_live_youtube_channels(category, max_results=12)
        except Exception:
            live_channels = []

        if not api_key:
            niches = NicheService._get_default_niches(category)
            if live_channels and len(niches) > 0:
                for idx, n in enumerate(niches):
                    start_idx = (idx * 2) % len(live_channels)
                    n["suggested_channels"] = live_channels[start_idx:start_idx+2]
            return {"success": True, "niches": niches}

        prompt = f"""
You are a Real-Time YouTube Niche Analyst and Creator Market Intelligence Engine.
Your task is to analyze the YouTube creator ecosystem and identify 6 HIGH-DEMAND, LOW-COMPETITION, HIGH-CPM trending sub-niches within the category/topic: "{category}".

Live YouTube channels active in this topic:
{json.dumps(live_channels if live_channels else [], indent=2)}

For EACH of the 6 sub-niches, generate:
1. Unique Sub-Niche Name & Description
2. Estimated Advertiser CPM ($) & Competition Level
3. 2 REAL YouTube Channels matching this niche (use live channels provided or real active handles)
4. 3 High-CTR Viral Video Topic Ideas

Respond strictly with valid JSON following this schema:
{{
  "niches": [
    {{
      "id": "niche-1",
      "niche_name": "Name of Sub-Niche 1",
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

        # Guaranteed instant fallback with 6 niches
        niches = NicheService._get_default_niches(category)
        if live_channels and len(niches) > 0:
            for idx, n in enumerate(niches):
                start_idx = (idx * 2) % len(live_channels)
                n["suggested_channels"] = live_channels[start_idx:start_idx+2]
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
                },
                {
                    "id": "ai-cinematic-sci-fi",
                    "niche_name": "AI Sci-Fi Dystopia & Future Civilizations",
                    "category": category,
                    "cpm_estimate": "$22 - $38",
                    "competition_level": "Low",
                    "demand_score": "95/100",
                    "description": "Photorealistic AI animated spec-fiction exploring megastructures, alien encounters, and future human timelines.",
                    "suggested_channels": [
                        {
                            "name": "Species | Documenting AGI",
                            "url": "https://www.youtube.com/@AISpecies",
                            "subscriber_highlight": "11.3M+ views hit",
                            "why_clone": "High-impact sci-fi AI docudrama."
                        }
                    ],
                    "example_topics": [
                        "What Earth Looks Like 500 Years After Human Extinction",
                        "The Secret AI Experiment That Simulated a Parallel Universe",
                        "Why Humanity May Never Reach Type 3 Civilization Status"
                    ]
                },
                {
                    "id": "ai-historical-reconstructions",
                    "niche_name": "AI Real-Time Ancient Battle Reconstructions",
                    "category": category,
                    "cpm_estimate": "$18 - $30",
                    "competition_level": "Low",
                    "demand_score": "96/100",
                    "description": "Immersive 3D/AI cinematic walkthroughs of ancient battles, lost cities, and historical decisions.",
                    "suggested_channels": [
                        {
                            "name": "Kings and Generals",
                            "url": "https://www.youtube.com/@KingsandGenerals",
                            "subscriber_highlight": "3.2M+ subs",
                            "why_clone": "Tactical historical battle maps with high retention narration."
                        }
                    ],
                    "example_topics": [
                        "3D Reconstruction: How 300 Spartans Held Thermopylae Against 100,000",
                        "The Tactical Mistake That Destroyed Napoleon's Empire in 48 Hours",
                        "How Ancient Rome Engineered Impregnable Citadel Fortresses"
                    ]
                },
                {
                    "id": "ai-creepypasta-mysteries",
                    "niche_name": "AI Creepypasta & Analog Horror Chronicles",
                    "category": category,
                    "cpm_estimate": "$18 - $32",
                    "competition_level": "Low",
                    "demand_score": "98/100",
                    "description": "Analog VHF tapes, found footage horror, and psychological creepypasta narrations using custom AI sound design.",
                    "suggested_channels": [
                        {
                            "name": "Skull Towns",
                            "url": "https://www.youtube.com/@SkullTowns",
                            "subscriber_highlight": "15.1M+ views hit",
                            "why_clone": "Mature animated horror storytelling."
                        }
                    ],
                    "example_topics": [
                        "The Analog Tape Found in an Abandoned Underground Bunker",
                        "Why No One Visits the Forgotten Sub-Level 4 Laboratory",
                        "The Broadcast That Hijacked Every TV Screen for 9 Minutes"
                    ]
                },
                {
                    "id": "ai-unsolved-conspiracies",
                    "niche_name": "AI Unsolved Expeditions & Lost Voyages",
                    "category": "History & Storytelling",
                    "cpm_estimate": "$20 - $34",
                    "competition_level": "Medium-Low",
                    "demand_score": "94/100",
                    "description": "Investigating lost ocean voyages, vanished expeditions, and unexplained Arctic anomalies with cinematic AI visuals.",
                    "suggested_channels": [
                        {
                            "name": "LEMMINO",
                            "url": "https://www.youtube.com/@LEMMINO",
                            "subscriber_highlight": "5.4M+ subs",
                            "why_clone": "Minimalist high-production mystery documentaries."
                        }
                    ],
                    "example_topics": [
                        "The Lost Arctic Expedition That Vanished Without Leaving a Footprint",
                        "What Divers Found Inside the Uncharted Deep Sea Trench",
                        "The Mysterious Ghost Ship Found Floating With No Crew in 1872"
                    ]
                },
                {
                    "id": "ai-philosophical-fables",
                    "niche_name": "AI Stoic Fables & Philosophical Parables",
                    "category": "Mindset & Storytelling",
                    "cpm_estimate": "$22 - $38",
                    "competition_level": "Low",
                    "demand_score": "96/100",
                    "description": "Stoic wisdom stories, samurai parables, and psychological fables narrated with calm, captivating voiceover.",
                    "suggested_channels": [
                        {
                            "name": "Sight of Fortitude",
                            "url": "https://www.youtube.com/@SightofFortitude",
                            "subscriber_highlight": "250K+ subs",
                            "why_clone": "Philosophical storytelling with ultra-high retention."
                        }
                    ],
                    "example_topics": [
                        "The Samurai's Rule for Overcoming Mental Fatigue Instantly",
                        "Why Silent People Quietly Control Every Room They Enter",
                        "The Stoic Lesson That Reclaims Full Focus in 30 Seconds"
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
                },
                {
                    "id": "real-estate-cashflow",
                    "niche_name": "Passive Real Estate & Commercial Cashflow",
                    "category": "Finance & Wealth",
                    "cpm_estimate": "$32 - $50",
                    "competition_level": "Medium-Low",
                    "demand_score": "95/100",
                    "description": "Unpacking creative real estate strategies, commercial property leasing, and passive cashflow portfolios.",
                    "suggested_channels": [
                        {
                            "name": "Graham Stephan",
                            "url": "https://www.youtube.com/@GrahamStephan",
                            "subscriber_highlight": "4.6M+ subs",
                            "why_clone": "High-CTR title hooks, reaction breakdowns, and transparent numbers."
                        }
                    ],
                    "example_topics": [
                        "How to Buy Your First Rental Property With Creative Financing",
                        "5 Financial Traps Keeping 90% of Middle Class Broke",
                        "The Unspoken Rules of Real Estate Cashflow"
                    ]
                },
                {
                    "id": "financial-psychology-behavior",
                    "niche_name": "Financial Psychology & Impulse Control",
                    "category": "Finance & Wealth",
                    "cpm_estimate": "$25 - $40",
                    "competition_level": "Low",
                    "demand_score": "96/100",
                    "description": "Deconstructing consumer psychology, lifestyle creep traps, and behavioral hacks that protect capital.",
                    "suggested_channels": [
                        {
                            "name": "Andrei Jikh",
                            "url": "https://www.youtube.com/@AndreiJikh",
                            "subscriber_highlight": "2.3M+ subs",
                            "why_clone": "Visually engaging financial graphics and high CPMs."
                        }
                    ],
                    "example_topics": [
                        "How Retail Corporations Quietly Manipulation Your Spending Choices",
                        "The Psychology of Money: Why Smart People Make Dumb Spending Mistakes",
                        "3 Psychological Rules to Eliminate Impulse Buying Instantly"
                    ]
                },
                {
                    "id": "micro-saas-revenue",
                    "niche_name": "Solopreneur Micro-SaaS & Cash Machine Workflows",
                    "category": "Finance & Business",
                    "cpm_estimate": "$30 - $48",
                    "competition_level": "Low",
                    "demand_score": "97/100",
                    "description": "Case studies of single-founder micro-SaaS, digital product empires, and high-margin automated recurring revenue.",
                    "suggested_channels": [
                        {
                            "name": "Brett Malinowski",
                            "url": "https://www.youtube.com/@BrettMalinowski",
                            "subscriber_highlight": "350K+ subs",
                            "why_clone": "High energy breakdowns of AI SaaS products and digital businesses."
                        }
                    ],
                    "example_topics": [
                        "How One Founder Built a $20k/mo Micro-SaaS In 14 Days Alone",
                        "5 Automated Digital Business Models With 90% Profit Margins",
                        "Why High-Margin Micro-Businesses Are Replacing Traditional Startups"
                    ]
                },
                {
                    "id": "economic-market-cycles",
                    "niche_name": "Macro Economics & Global Market Cycles",
                    "category": "Finance & Macro",
                    "cpm_estimate": "$35 - $55",
                    "competition_level": "Medium-Low",
                    "demand_score": "96/100",
                    "description": "Analyzing central bank interest rates, currency debasement, debt cycles, and inflation hedging strategies.",
                    "suggested_channels": [
                        {
                            "name": "George Gammon",
                            "url": "https://www.youtube.com/@GeorgeGammon",
                            "subscriber_highlight": "500K+ subs",
                            "why_clone": "Whiteboard macroeconomic breakdowns of debt cycles and Fed policy."
                        }
                    ],
                    "example_topics": [
                        "What Happens When Central Banks Print $10 Trillion In Debt",
                        "The 80-Year Debt Supercycle: Why Hard Assets Outperform Currency",
                        "How Inflation Quietly Transfers Wealth From Savers To Investors"
                    ]
                },
                {
                    "id": "credit-points-optimizations",
                    "niche_name": "Credit Optimization & Luxury Travel Hacks",
                    "category": "Finance & Credit",
                    "cpm_estimate": "$26 - $42",
                    "competition_level": "Low",
                    "demand_score": "94/100",
                    "description": "Unlocking business credit lines, credit card reward arbitrage, and zero-interest capital strategies.",
                    "suggested_channels": [
                        {
                            "name": "Credit Shifu",
                            "url": "https://www.youtube.com/@CreditShifu",
                            "subscriber_highlight": "400K+ subs",
                            "why_clone": "Clear breakdown of credit optimization and cashback hacks."
                        }
                    ],
                    "example_topics": [
                        "How to Access $50,000 in 0% Business Credit in 30 Days",
                        "The Secret Rule Credit Card Companies Don't Want You to Know",
                        "How Wealthy Travelers Fly First Class for $0 Using Points"
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
            },
            {
                "id": "ai-faceless-video-editing",
                "niche_name": "Faceless AI Video Production Pipelines",
                "category": category,
                "cpm_estimate": "$25 - $40",
                "competition_level": "Low",
                "demand_score": "97/100",
                "description": "Tutorials on Runway, Midjourney v6, ElevenLabs, and CapCut workflows to produce 4K faceless documentary videos.",
                "suggested_channels": [
                    {
                        "name": "AI Jason",
                        "url": "https://www.youtube.com/@AIJason",
                        "subscriber_highlight": "300K+ subs",
                        "why_clone": "Step-by-step AI video workflows."
                    }
                ],
                "example_topics": [
                    "How to Create a 10-Minute Faceless AI Documentary in 1 Hour",
                    "The Complete AI Video Pipeline: Midjourney + ElevenLabs + Runway",
                    "5 Midjourney Prompt Styles That Look Like $10,000 Studio Animation"
                ]
            },
            {
                "id": "ai-code-copilots",
                "niche_name": "Autonomous AI Coding & App Generators",
                "category": category,
                "cpm_estimate": "$30 - $48",
                "competition_level": "Low",
                "demand_score": "96/100",
                "description": "Leveraging Cursor, Claude 3.5 Sonnet, and GitHub Copilot to build full-stack web applications without writing code manually.",
                "suggested_channels": [
                    {
                        "name": "Fireship",
                        "url": "https://www.youtube.com/@Fireship",
                        "subscriber_highlight": "3.1M+ subs",
                        "why_clone": "Fast 100-second developer breakdowns with ultra high retention."
                    }
                ],
                "example_topics": [
                    "How to Build & Deploy a Full Web App Using Cursor AI in 20 Minutes",
                    "Why Claude 3.5 Sonnet Is Revolutionizing Software Engineering",
                    "The End of Manual Boilerplate: Autonomous AI Coding Agents Explained"
                ]
            },
            {
                "id": "ai-hardware-wearables",
                "niche_name": "On-Device AI Hardware & Smart Wearables",
                "category": category,
                "cpm_estimate": "$26 - $42",
                "competition_level": "Low",
                "demand_score": "95/100",
                "description": "Exploring AI smart glasses, neural wristbands, offline LLM chips, and local privacy hardware.",
                "suggested_channels": [
                    {
                        "name": "Marques Brownlee",
                        "url": "https://www.youtube.com/@mkbhd",
                        "subscriber_highlight": "18.5M+ subs",
                        "why_clone": "Clean studio tech reviews and high production value."
                    }
                ],
                "example_topics": [
                    "Why Local On-Device AI Hardware Is Replacing Cloud Subscriptions",
                    "AI Smart Glasses Review: The Future of Augmented Reality",
                    "The Neural Wristband That Translates Muscle Signals Into Actions"
                ]
            },
            {
                "id": "ai-music-audio",
                "niche_name": "AI Music Generation & Voice Cloning",
                "category": category,
                "cpm_estimate": "$22 - $36",
                "competition_level": "Low",
                "demand_score": "94/100",
                "description": "Mastering Suno AI, Udio, and ElevenLabs voice models for royalty-free soundtrack production.",
                "suggested_channels": [
                    {
                        "name": "Two Minute Papers",
                        "url": "https://www.youtube.com/@TwoMinutePapers",
                        "subscriber_highlight": "1.5M+ subs",
                        "why_clone": "Enthusiastic research paper breakdowns with visual demos."
                    }
                ],
                "example_topics": [
                    "How to Generate Studio-Quality Songs in 30 Seconds Using Suno v4",
                    "The Science of AI Voice Cloning: How ElevenLabs Recreates Natural Cadence",
                    "How Filmmakers Use AI Audio Tools for Instant Cinematic Sound Effects"
                ]
            },
            {
                "id": "ai-robotics-automation",
                "niche_name": "Humanoid Robotics & Factory Automation",
                "category": category,
                "cpm_estimate": "$28 - $46",
                "competition_level": "Low",
                "demand_score": "96/100",
                "description": "Tracking Boston Dynamics, Tesla Optimus, Figure 02, and autonomous warehouse robotics.",
                "suggested_channels": [
                    {
                        "name": "ColdFusion",
                        "url": "https://www.youtube.com/@ColdFusion",
                        "subscriber_highlight": "4.5M+ subs",
                        "why_clone": "Calm storytelling about futuristic tech monopolies and robotics."
                    }
                ],
                "example_topics": [
                    "Inside the Factory Where 1,000 Humanoid Robots Work 24/7",
                    "How Tesla Optimus Gen 2 Learns Tasks from Video Observations",
                    "The Quantum Shift in Autonomous Warehouse Robotics"
                ]
            }
        ]
