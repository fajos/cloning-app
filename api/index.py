import os
import sys

# Ensure root folder is at head of sys.path for Vercel Serverless Function
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

try:
    from app.main import app
except Exception as e:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI(title="TubeClone AI - Error Handler")

    @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def vercel_startup_error(full_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Vercel Startup Error: {str(e)}"
            }
        )
