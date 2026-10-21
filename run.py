import uvicorn
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    print(f"\n=======================================================")
    print(f" 🚀 ViralScript AI Web App is starting...")
    print(f" 🌐 Open your browser at: http://localhost:{port} or http://127.0.0.1:{port}")
    print(f"=======================================================\n")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
