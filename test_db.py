from main import SessionLocal, User, Product, Customer
db = SessionLocal()
print("Users:", db.query(User).count())
print("Products:", db.query(Product).count())
print("Customers:", db.query(Customer).count())
