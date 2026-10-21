import os
import sys

# Add root folder to sys.path for Vercel Serverless Function imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
