import sys
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:%40Jubair121%23@db.bkxtgknnxupkennwcfbf.supabase.co:5432/postgres"
try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        res = conn.execute(text("SELECT version();")).fetchone()
        print("Connected to:", res[0])
except Exception as e:
    print("Connection failed:", e)
