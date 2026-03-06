from main import engine, Base
import sys

try:
    Base.metadata.create_all(bind=engine)
    print("Tables created!")
except Exception as e:
    print("FAILED TO CREATE TABLES:", e)
