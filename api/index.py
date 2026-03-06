import sys
import os
from pathlib import Path

# Add the project root to the Python path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from main import app

# This allows Vercel to find the app object
