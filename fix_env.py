import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv('.env.local')
db_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL_NON_POOLING") or os.getenv("POSTGRES_URL")
DATABASE_URL = db_url if db_url else f"sqlite:///data/database.sqlite"

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

def fix_db_url(url: str) -> str:
    if "://" not in url or "sqlite" in url: return url
    prefix, rest = url.split("://", 1)
    
    # Strip unsupported Vercel query params that break SQLAlchemy
    if "&supa=" in rest:
        rest = rest.split("&supa=")[0]
    if "?supa=" in rest:
        rest = rest.split("?supa=")[0]
        
    if "@" in rest:
        auth, host_path = rest.rsplit("@", 1)
        if ":" in auth:
            user, pwd = auth.split(":", 1)
            user = urllib.parse.quote(urllib.parse.unquote(user))
            pwd = urllib.parse.quote(urllib.parse.unquote(pwd))
            auth = f"{user}:{pwd}"
        rest = f"{auth}@{host_path}"
    return f"{prefix}://{rest}"

DATABASE_URL = fix_db_url(DATABASE_URL)
print(DATABASE_URL)

from sqlalchemy import create_engine
try:
    engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 5})
    with engine.connect() as conn:
        print("SQLAlchemy Connected Successfully!")
except Exception as e:
    print("SQLAlchemy Connection Error:", e)
