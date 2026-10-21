import os
from fastapi import FastAPI, Request, HTTPException, Body, Query
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import uvicorn

from app.services.video_service import VideoService
from app.services.ai_service import AIService
from app.services.docx_service import DocxService
from app.services.niche_service import NicheService

app = FastAPI(
    title="TubeClone AI",
    description="Automated 12-State YouTube Channel Clone, Dynamic Niche Discovery & Script Engine",
    version="3.3.0"
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

class AnalyzeRequest(BaseModel):
    youtube_url: str = Field(..., description="Video URL or Channel URL")
    ai_provider: Optional[str] = Field("deepseek", description="AI Provider e.g. deepseek or gemini")
    target_format: str = Field("Auto-Detect", description="Target format e.g. Auto-Detect, Shorts, Long-form")
    target_tone: str = Field("Auto-Detect", description="Target tone e.g. Auto-Detect, Punchy, Storytelling")

class NicheDiscoveryRequest(BaseModel):
    category: Optional[str] = "Finance & Wealth"
    ai_provider: Optional[str] = "deepseek"

class NicheLaunchRequest(BaseModel):
    niche_id: str = Field(..., description="Selected niche ID")
    ai_provider: Optional[str] = Field("deepseek", description="AI Provider")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    default_key_set = bool(os.getenv("DEEPSEEK_API_KEY") or os.getenv("GEMINI_API_KEY"))
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={"default_key_set": default_key_set}
    )

@app.get("/health")
async def health():
    return {"status": "ok", "service": "TubeClone AI"}

@app.get("/api/trending-niches")
async def get_trending_niches_get(
    category: str = Query("Finance & Wealth"),
    ai_provider: str = Query("deepseek")
):
    provider = ai_provider.strip().lower() if ai_provider else "deepseek"
    env_var = "DEEPSEEK_API_KEY" if provider == "deepseek" else "GEMINI_API_KEY"
    api_key = os.getenv(env_var, "")

    res = NicheService.discover_dynamic_niches(
        category=category,
        api_key=api_key,
        ai_provider=provider
    )
    return JSONResponse(content=res)

@app.post("/api/trending-niches")
async def get_trending_niches_post(payload: NicheDiscoveryRequest):
    cat = payload.category or "Finance & Wealth"
    provider = (payload.ai_provider or "deepseek").lower()
    env_var = "DEEPSEEK_API_KEY" if provider == "deepseek" else "GEMINI_API_KEY"
    api_key = os.getenv(env_var, "")

    res = NicheService.discover_dynamic_niches(
        category=cat,
        api_key=api_key,
        ai_provider=provider
    )
    return JSONResponse(content=res)

@app.get("/api/launch-niche-channel")
async def launch_niche_channel_get(
    niche_id: str = Query("stealth-wealth"),
    ai_provider: str = Query("deepseek")
):
    provider = ai_provider.lower().strip() if ai_provider else "deepseek"
    env_var = "DEEPSEEK_API_KEY" if provider == "deepseek" else "GEMINI_API_KEY"
    key = os.getenv(env_var, "")

    if not key:
        provider_name = "DeepSeek" if provider == "deepseek" else "Google Gemini"
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": f"{provider_name} API Key is missing in backend environment variables ({env_var}). Please add it to your server configuration."
            }
        )

    niches_res = NicheService.discover_dynamic_niches(category="Finance & Wealth", api_key=key, ai_provider=provider)
    niches = niches_res.get("niches", [])
    target_niche = next((n for n in niches if n.get("id") == niche_id), None)

    if not target_niche:
        target_niche = {
            "niche_name": niche_id.replace("-", " ").title(),
            "category": "Trending Niche",
            "cpm_estimate": "$25 - $40",
            "description": "High-demand, unexploited YouTube creator niche."
        }

    ai_result = AIService.generate_niche_channel_launcher(
        niche_info=target_niche,
        api_key=key,
        ai_provider=provider
    )

    if not ai_result.get("success"):
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": ai_result.get("error", "Failed to launch niche channel")}
        )

    return JSONResponse(content={
        "success": True,
        "niche": target_niche,
        "video_metadata": {
            "title": f"New Channel Setup: {target_niche.get('niche_name', 'Trending Niche')}",
            "author": "New Creator",
            "thumbnail": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop"
        },
        "data": ai_result["data"]
    })

@app.post("/api/launch-niche-channel")
async def launch_niche_channel_post(payload: NicheLaunchRequest):
    target_id = payload.niche_id or "stealth-wealth"
    provider = (payload.ai_provider or "deepseek").lower()
    env_var = "DEEPSEEK_API_KEY" if provider == "deepseek" else "GEMINI_API_KEY"
    key = os.getenv(env_var, "")

    if not key:
        provider_name = "DeepSeek" if provider == "deepseek" else "Google Gemini"
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": f"{provider_name} API Key is missing in backend environment variables ({env_var}). Please add it to your server configuration."
            }
        )

    niches_res = NicheService.discover_dynamic_niches(category="Finance & Wealth", api_key=key, ai_provider=provider)
    niches = niches_res.get("niches", [])
    target_niche = next((n for n in niches if n.get("id") == target_id), None)

    if not target_niche:
        target_niche = {
            "niche_name": target_id.replace("-", " ").title(),
            "category": "Trending Niche",
            "cpm_estimate": "$25 - $40",
            "description": "High-demand, unexploited YouTube creator niche."
        }

    ai_result = AIService.generate_niche_channel_launcher(
        niche_info=target_niche,
        api_key=key,
        ai_provider=provider
    )

    if not ai_result.get("success"):
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": ai_result.get("error", "Failed to launch niche channel")}
        )

    return JSONResponse(content={
        "success": True,
        "niche": target_niche,
        "video_metadata": {
            "title": f"New Channel Setup: {target_niche.get('niche_name', 'Trending Niche')}",
            "author": "New Creator",
            "thumbnail": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop"
        },
        "data": ai_result["data"]
    })

@app.post("/api/analyze")
async def analyze_video(payload: AnalyzeRequest):
    url_or_topic = payload.youtube_url.strip()
    if not url_or_topic:
        raise HTTPException(status_code=400, detail="Video URL or Channel URL is required")

    # 1. Extract Video / Channel Info
    video_info = VideoService.get_video_info(url_or_topic)
    metadata = video_info.get("metadata", {})
    transcript_text = video_info.get("transcript", "")
    transcript_status = video_info.get("transcript_status", {})

    # 2. Determine Backend API Key
    provider = payload.ai_provider.lower() if payload.ai_provider else "deepseek"
    env_var = "DEEPSEEK_API_KEY" if provider == "deepseek" else "GEMINI_API_KEY"
    api_key = os.getenv(env_var, "")

    if not api_key:
        provider_name = "DeepSeek" if provider == "deepseek" else "Google Gemini"
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": f"{provider_name} API Key is missing in backend environment variables ({env_var}). Please add it to your Vercel / server Environment Variables."
            }
        )

    # 3. Generate Complete 12-State Channel Clone Package
    ai_result = AIService.generate_cloned_content(
        transcript=transcript_text,
        video_metadata=metadata,
        api_key=api_key,
        ai_provider=provider,
        target_format=payload.target_format,
        target_tone=payload.target_tone
    )

    if not ai_result.get("success"):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": ai_result.get("error", "Failed to generate AI content"),
                "metadata": metadata
            }
        )

    return JSONResponse(content={
        "success": True,
        "platform": video_info.get("platform", "Video"),
        "video_metadata": metadata,
        "transcript_status": transcript_status,
        "data": ai_result["data"]
    })

@app.post("/api/export-docx")
async def export_docx(data: Dict[str, Any] = Body(...)):
    """
    State 12: Exports all 12 states into a beautifully formatted Microsoft Word (.docx) Document!
    """
    try:
        docx_stream = DocxService.generate_docx(data)
        return StreamingResponse(
            docx_stream,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=Channel_Clone_Package.docx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export Word Document: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
