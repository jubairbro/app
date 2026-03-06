from main import SessionLocal, Customer
import sys

def check_db():
    try:
        db = SessionLocal()
        count = db.query(Customer).count()
        print(f"Database is functional. Total customers: {count}")
        db.close()
    except Exception as e:
        print(f"Database Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check_db()
