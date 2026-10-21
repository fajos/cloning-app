import json
import os
import re
import datetime
import requests
from typing import Dict, Any, Optional
from json_repair import repair_json

class AIService:
    @staticmethod
    def _get_current_year() -> int:
        return datetime.datetime.now().year

    @staticmethod
    def generate_cloned_content(
        transcript: str,
        video_metadata: Dict[str, Any],
        api_key: str,
        ai_provider: str = "deepseek",
        target_format: str = "Auto-Detect",
        target_tone: str = "Auto-Detect"
    ) -> Dict[str, Any]:
        """
        Executes the complete 12-State Channel Cloning Pipeline automatically.
        Enforces MINIMUM 1,500-1,800 words for Long-form scripts and 16-22 beat prompts.
        Dynamically uses the system's current year (datetime.datetime.now().year).
        """
        if not api_key:
            provider_name = "DeepSeek" if ai_provider == "deepseek" else "Gemini"
            return {
                "success": False,
                "error": f"{provider_name} API Key is missing. Please enter your API key in the settings modal."
            }

        current_year = AIService._get_current_year()
        format_str = target_format if target_format and target_format != "Auto-Detect" else "Auto-Detect from source channel"
        tone_str = target_tone if target_tone and target_tone != "Auto-Detect" else "Auto-Detect from source channel"

        length_instructions = f"""
STRICT SCRIPT DURATION & WORD COUNT RULES:
1. If Target Format is Long-form (or Auto-Detected as Long-form 5-10 mins):
   - You MUST generate a MASSIVE, fully written teleprompter script containing AT LEAST 1,500 to 1,800 WORDS of spoken narration.
   - Do NOT summarize. Write full, in-depth explanations, dialogues, examples, and stories for every section.
   - Break the script into timestamped chapters:
     * [0:00 - 0:45 Hook & Teaser] (120+ words)
     * [0:45 - 2:30 Chapter 1: The Core Context & Backstory] (300+ words)
     * [2:30 - 5:00 Chapter 2: Deep Dive Analysis & Case Studies] (450+ words)
     * [5:00 - 7:30 Chapter 3: The Secret Counter-Intuitive Twist] (450+ words)
     * [7:30 - 9:00 Chapter 4: Step-by-Step Actionable Playbook] (300+ words)
     * [9:00 - 9:30 Outro & Call to Action] (80+ words)
   - Generate 16 to 22 individual beat prompts in stage7_8_9_beat_prompts (one image/video prompt for every 25 seconds of speech).

2. CRITICAL YEAR RULE:
   - The current year is ALWAYS {current_year}. Any year mentioned in topic titles, script lines, SEO descriptions, or tags MUST be {current_year}.
   - NEVER use past years ({current_year - 1}, {current_year - 2}, {current_year - 3}, etc.) in titles or scripts.
"""

        prompt = f"""
You are the world's most advanced AI YouTube Content Engine, Video Director, and Channel Modeling Strategist.
Your task is to analyze the target channel's identity and write a complete, 12-State Channel Clone Package.

--- TARGET CHANNEL DETAILS ---
Channel/Video Title: {video_metadata.get('title', 'Unknown')}
Creator/Channel Name: {video_metadata.get('author', 'Unknown')}
Target Output Format: {format_str}
Target Tone: {tone_str}

{length_instructions}

--- ORIGINAL TRANSCRIPT / CONTENT DNA ---
{transcript if transcript else 'No transcript available. Model the channel based on creator name, video title, and niche style.'}

--- INSTRUCTIONS & RULES ---
Execute all 12 states of channel modeling in one structured JSON output:
1. STATE 2: Channel Branding Brief (5 suggested clone channel names, 2 channel descriptions, logo prompt, banner prompt).
2. STATE 4: 5 Viral Topic Ideas in the channel's niche (using current year {current_year}!).
3. STATE 5: Analysis & Style DNA (Niche, Audience, Hook style, Pacing, Sentence rhythm, Curiosity gaps, Emotional triggers, Words per second).
4. STATE 6: Complete word-for-word Script matching Style DNA and target word count (1,500+ words for long-form!).
5. STATE 8 & 9: Beat-by-Beat Visual & Video Prompts for 16-22 visual beats of the script (Image prompt, Video motion prompt, Camera angle, Lighting, Mood).
6. STATE 11: 5 High-CTR Thumbnail Concepts (Visual concept, Text overlay, Emotion trigger, Midjourney prompt).
7. SEO Package (YouTube description, tags, hashtags).

You MUST respond strictly with valid, well-formatted JSON with no markdown backticks or commentary outside the JSON object.

JSON Schema to follow strictly:
{{
  "stage2_branding_brief": {{
    "suggested_channel_names": ["Name 1", "Name 2", "Name 3", "Name 4", "Name 5"],
    "channel_description_variants": ["Description variant 1", "Description variant 2"],
    "logo_generation_prompt": "Detailed Midjourney prompt for channel logo",
    "banner_generation_prompt": "Detailed Midjourney prompt for channel banner"
  }},
  "stage4_topic_and_ideas": [
    "Topic Idea 1 in {current_year}", "Topic Idea 2 in {current_year}", "Topic Idea 3 in {current_year}", "Topic Idea 4 in {current_year}", "Topic Idea 5 in {current_year}"
  ],
  "stage5_style_dna": {{
    "niche": "Primary channel niche",
    "target_audience": "Primary audience persona",
    "hook_style": "How the opening hook retains viewers",
    "script_flow": "Overall narrative structure",
    "sentence_rhythm": "Fast / Short punchy sentences / Deep cadence",
    "tone": "Extracted channel tone",
    "curiosity_gaps": "How curiosity is sustained",
    "emotional_triggers": "Core emotions triggered",
    "retention_techniques": "Visual & auditory retention triggers",
    "words_per_second": "2.5",
    "target_word_count": "1,500 - 1,800 words"
  }},
  "stage6_script": {{
    "target_word_count": "1,500 - 1,800 words",
    "final_word_count": 1650,
    "hook": "Opening 3-second retention hook",
    "full_script": "Full word-for-word 1,500+ word script narration with [Visual & SFX cues] for all chapters",
    "outro": "Closing call to action"
  }},
  "stage7_8_9_beat_prompts": [
    {{
      "beat_num": 1,
      "script_segment": "[0:00 - 0:25] Script segment text...",
      "image_prompt": "Standalone Midjourney/DALL-E prompt for this beat",
      "video_motion_prompt": "Runway/Luma/Kling AI motion prompt for this beat",
      "camera_angle": "Close-up / Wide / Drone",
      "lighting": "Dramatic neon rim lighting",
      "mood": "Intense",
      "action": "Description of scene motion"
    }}
  ],
  "stage10_11_thumbnails": [
    {{
      "title": "Thumbnail Concept 1",
      "visual_concept": "Visual layout description",
      "text_overlay": "3-4 word bold text overlay",
      "emotion_trigger": "Shock / Curiosity",
      "midjourney_prompt": "Midjourney prompt for thumbnail"
    }}
  ],
  "seo_package": {{
    "description": "Comprehensive, monetization-friendly YouTube description for {current_year}",
    "tags": ["tag1", "tag2", "tag3"],
    "hashtags": ["#tag1", "#tag2", "#tag3"]
  }},
  "monetization_growth_tips": [
    "Growth tip 1 for maximizing watch time",
    "Growth tip 2 for algorithmic push in {current_year}",
    "Growth tip 3 for subscriber conversion"
  ]
}}
"""

        if ai_provider == "deepseek":
            res = AIService._call_deepseek_api(prompt, api_key)
        else:
            res = AIService._call_gemini_api(prompt, api_key)

        if res.get("success") and isinstance(res.get("data"), dict):
            res["data"] = AIService._enforce_current_year(res["data"])
        return res

    @staticmethod
    def generate_niche_channel_launcher(
        niche_info: Dict[str, Any],
        api_key: str,
        ai_provider: str = "deepseek"
    ) -> Dict[str, Any]:
        """
        Generates a COMPLETE 12-STATE Channel Setup Package dynamically using datetime.now().year!
        """
        if not api_key:
            provider_name = "DeepSeek" if ai_provider == "deepseek" else "Gemini"
            return {
                "success": False,
                "error": f"{provider_name} API Key is missing. Please enter your API key in settings."
            }

        current_year = AIService._get_current_year()

        prompt = f"""
You are a YouTube Channel Launch Strategist, Master Scriptwriter, and Niche Growth Director.
Your task is to generate a COMPLETE, 12-STATE YouTube Channel Launch Package for a creator launching a channel in this high-demand, low-competition niche.

--- SELECTED UNEXPLOITED NICHE ---
Niche Name: {niche_info.get('niche_name', 'Unknown Niche')}
Category: {niche_info.get('category', 'General')}
Estimated CPM: {niche_info.get('cpm_estimate', '$20 - $35')}
Niche Overview: {niche_info.get('description', '')}

--- MANDATORY YEAR RULE ---
The current year is ALWAYS {current_year}. Any year in video topic titles, script lines, SEO descriptions, or thumbnail text MUST be {current_year} (e.g. "Who Wins in {current_year}?", "Best Strategy for {current_year}"). NEVER use past years ({current_year - 1}, {current_year - 2}, {current_year - 3}, etc.).

--- INSTRUCTIONS ---
Generate ALL 12 STATES in one single JSON response:
1. STATE 2: Channel Branding Brief (5 suggested channel names, 2 channel descriptions, Midjourney logo prompt, Midjourney banner prompt).
2. STATE 4: 5 High-CTR Video Topic Ideas for {current_year}.
3. STATE 5: Target Audience Persona & Style Strategy DNA.
4. STATE 6: Complete, word-for-word spoken teleprompter script (MINIMUM 1,500 WORDS) for the #1 Topic Idea, broken into timestamped chapters.
5. STATE 8 & 9: 16 to 22 Beat-by-Beat Visual & Video Motion Prompts for the script.
6. STATE 10 & 11: High-CTR Thumbnail Concepts with Midjourney Prompts.
7. SEO Package for {current_year} (YouTube description, search tags, hashtags).
8. Monetization Growth Tips for {current_year}.

Respond strictly with valid JSON following this schema:
{{
  "stage2_branding_brief": {{
    "suggested_channel_names": ["Name 1", "Name 2", "Name 3", "Name 4", "Name 5"],
    "channel_description_variants": ["Variant 1", "Variant 2"],
    "logo_generation_prompt": "Midjourney prompt for channel logo",
    "banner_generation_prompt": "Midjourney prompt for channel banner"
  }},
  "stage4_topic_and_ideas": [
    "Topic Idea 1 in {current_year}", "Topic Idea 2 in {current_year}", "Topic Idea 3 in {current_year}", "Topic Idea 4 in {current_year}", "Topic Idea 5 in {current_year}"
  ],
  "stage5_style_dna": {{
    "niche": "{niche_info.get('niche_name', '')}",
    "target_audience": "Detailed audience persona",
    "hook_style": "Recommended opening hook style",
    "script_flow": "Recommended narrative flow",
    "sentence_rhythm": "Recommended sentence rhythm",
    "tone": "Recommended brand tone",
    "curiosity_gaps": "Recommended retention technique",
    "emotional_triggers": "Core emotional triggers",
    "retention_techniques": "Visual B-roll strategy",
    "words_per_second": "2.5",
    "target_word_count": "1,500 - 1,800 words"
  }},
  "stage6_script": {{
    "target_word_count": "1,500 - 1,800 words",
    "final_word_count": 1650,
    "hook": "Opening 3-second retention hook",
    "full_script": "Full word-for-word 1,500+ word script narration with [Visual & SFX cues]",
    "outro": "Closing call to action"
  }},
  "stage7_8_9_beat_prompts": [
    {{
      "beat_num": 1,
      "script_segment": "[0:00 - 0:25] Script segment line...",
      "image_prompt": "Midjourney image prompt for this beat",
      "video_motion_prompt": "Runway/Kling motion prompt for this beat",
      "camera_angle": "Close-up / Wide",
      "lighting": "Cinematic studio lighting",
      "mood": "Engaging",
      "action": "Description of scene action"
    }}
  ],
  "stage10_11_thumbnails": [
    {{
      "title": "Thumbnail Concept 1",
      "visual_concept": "Visual layout description",
      "text_overlay": "3-4 word bold text overlay",
      "emotion_trigger": "Curiosity / Shock",
      "midjourney_prompt": "Midjourney prompt for thumbnail image"
    }}
  ],
  "seo_package": {{
    "description": "Comprehensive YouTube description with monetization links for {current_year}",
    "tags": ["tag1", "tag2", "tag3"],
    "hashtags": ["#tag1", "#tag2", "#tag3"]
  }},
  "monetization_growth_tips": [
    "Growth tip 1 for monetizing fast in {current_year}",
    "Growth tip 2 for algorithm push",
    "Growth tip 3 for subscriber conversion"
  ]
}}
"""

        if ai_provider == "deepseek":
            res = AIService._call_deepseek_api(prompt, api_key)
        else:
            res = AIService._call_gemini_api(prompt, api_key)

        if res.get("success") and isinstance(res.get("data"), dict):
            res["data"] = AIService._enforce_current_year(res["data"])
        return res

    @staticmethod
    def _enforce_current_year(obj: Any) -> Any:
        """
        Recursively replaces outdated year references (< current_year) with current_year across all JSON strings.
        """
        current_year_int = datetime.datetime.now().year
        current_year_str = str(current_year_int)

        def replace_year(match):
            y = int(match.group(0))
            if 2020 <= y < current_year_int:
                return current_year_str
            return match.group(0)

        if isinstance(obj, str):
            return re.sub(r'\b(202[0-9])\b', replace_year, obj)
        elif isinstance(obj, dict):
            return {k: AIService._enforce_current_year(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [AIService._enforce_current_year(item) for item in obj]
        return obj

    @staticmethod
    def _call_deepseek_api(prompt: str, api_key: str) -> Dict[str, Any]:
        url = "https://api.deepseek.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": f"You are a professional AI JSON generator that models YouTube channels and generates full 12-state content clone briefs in pure JSON. The current year is ALWAYS {datetime.datetime.now().year}."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.7,
            "max_tokens": 8192
        }

        try:
            res = requests.post(url, headers=headers, json=payload, timeout=90)
            if res.status_code == 200:
                data = res.json()
                choices = data.get("choices", [])
                if choices:
                    raw_text = choices[0].get("message", {}).get("content", "").strip()
                    parsed = AIService._clean_and_parse_json(raw_text)
                    if isinstance(parsed, dict) and parsed:
                        return {"success": True, "data": parsed}
                    else:
                        return {"success": False, "error": "AI response was received, but could not be parsed as structured JSON. Please try again."}

            error_data = res.json().get("error", {})
            error_msg = error_data.get("message", "DeepSeek request failed")
            return {
                "success": False,
                "error": f"DeepSeek API Error ({res.status_code}): {error_msg}"
            }
        except Exception as e:
            return {"success": False, "error": f"Connection to DeepSeek API failed: {str(e)}"}

    @staticmethod
    def _call_gemini_api(prompt: str, api_key: str) -> Dict[str, Any]:
        candidate_models = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite"
        ]

        last_error = ""

        for model_name in candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "responseMimeType": "application/json",
                    "maxOutputTokens": 8192
                }
            }

            try:
                res = requests.post(url, headers=headers, json=payload, timeout=90)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get('candidates', [])
                    if candidates:
                        parts = candidates[0].get('content', {}).get('parts', [])
                        if parts:
                            raw_text = parts[0].get('text', '').strip()
                            parsed_json = AIService._clean_and_parse_json(raw_text)
                            if isinstance(parsed_json, dict) and parsed_json:
                                return {"success": True, "data": parsed_json}

                error_data = res.json().get('error', {})
                error_msg = error_data.get('message', 'Gemini request failed')
                status_reason = error_data.get('status', '')

                if "API key not valid" in error_msg or "API_KEY_INVALID" in status_reason or res.status_code in (401, 403):
                    return {
                        "success": False,
                        "error": "Invalid Gemini API Key. Please check your API key at https://aistudio.google.com/ and re-enter it."
                    }

                last_error = f"{model_name}: {error_msg}"
            except Exception as ex:
                last_error = f"Connection error ({model_name}): {str(ex)}"

        return {
            "success": False,
            "error": f"Gemini API Error: {last_error}"
        }

    @staticmethod
    def _clean_and_parse_json(raw_text: str) -> Optional[Dict[str, Any]]:
        """
        Cleans markdown wrappers and uses json_repair with return_objects=True to safely parse truncated LLM JSON.
        """
        if not raw_text:
            return None

        try:
            cleaned = raw_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            try:
                result = json.loads(cleaned)
                if isinstance(result, dict):
                    return result
            except Exception:
                pass

            repaired = repair_json(cleaned, return_objects=True)
            if isinstance(repaired, dict):
                return repaired
            if isinstance(repaired, str):
                return json.loads(repaired)
        except Exception:
            pass

        return None
