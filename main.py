import os
import uuid
import shutil
import zipfile
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from io import BytesIO
from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException, status, Request, Response, UploadFile, File, Form
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text, desc, func, and_, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship, joinedload
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

# --- Logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()]
)
logger = logging.getLogger("SaikatERP")

# --- Configuration ---
import os
BASE_DIR = Path(__file__).resolve().parent

# Support Supabase PostgreSQL or local SQLite
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/data/database.sqlite")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = BASE_DIR / "uploads"
SECRET_KEY = "saikat_machinery_super_secret_key_v3_secure" # In production, use os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Supabase/Postgres doesn't need check_same_thread
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Advanced ERP Models ---

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="User")
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String) # admin, staff
    status = Column(String, default="active") # active, suspended
    createdAt = Column(DateTime, default=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True, nullable=True)
    category = Column(String, index=True)
    purchasePrice = Column(Float)
    wholesalePrice = Column(Float)
    retailPrice = Column(Float)
    stock = Column(Integer, default=0)
    minStockLevel = Column(Integer, default=10)
    unit = Column(String)
    imageUrl = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    stock_logs = relationship("StockLog", back_populates="product", cascade="all, delete-orphan")

class StockLog(Base):
    __tablename__ = "stock_logs"
    id = Column(Integer, primary_key=True, index=True)
    productId = Column(Integer, ForeignKey("products.id"))
    changeAmount = Column(Integer) # + or -
    reason = Column(String) # purchase, sale, damage, adjustment
    createdAt = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product", back_populates="stock_logs")

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    address = Column(String, nullable=True)
    totalDue = Column(Float, default=0.0)
    loyaltyPoints = Column(Integer, default=0)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    createdAt = Column(DateTime, default=datetime.utcnow)

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contactPerson = Column(String, nullable=True)
    phone = Column(String, index=True)
    email = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    totalBalance = Column(Float, default=0.0) # What we owe them
    createdAt = Column(DateTime, default=datetime.utcnow)

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String) # rent, bill, salary, other
    amount = Column(Float)
    note = Column(Text, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

class Sale(Base):
    __tablename__ = "sales"
    id = Column(String, primary_key=True, index=True)
    customerId = Column(Integer, ForeignKey("customers.id"))
    customerName = Column(String)
    customerPhone = Column(String)
    customerAddress = Column(String, nullable=True)
    totalAmount = Column(Float)
    discount = Column(Float, default=0.0)
    finalAmount = Column(Float)
    paidAmount = Column(Float)
    dueAmount = Column(Float)
    paymentMethod = Column(String, default="cash") # cash, bkash, bank
    createdAt = Column(DateTime, default=datetime.utcnow)
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")

class SaleItem(Base):
    __tablename__ = "sale_items"
    id = Column(Integer, primary_key=True, index=True)
    saleId = Column(String, ForeignKey("sales.id"))
    productId = Column(Integer, ForeignKey("products.id"))
    name = Column(String)
    quantity = Column(Integer)
    salePrice = Column(Float)
    purchasePriceAtSale = Column(Float) # For calculating profit later
    priceType = Column(String)
    unit = Column(String)
    sale = relationship("Sale", back_populates="items")

# Table Initialization
Base.metadata.create_all(bind=engine)

# --- Security & Auth Logic ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password): return pwd_context.hash(password)
def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)
def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

async def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("token")
    if not token: raise HTTPException(status_code=401, detail="সেশন শেষ হয়েছে")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = db.query(User).filter(User.email == payload.get("email")).first()
        if not user or user.status != "active": raise HTTPException(status_code=401)
        return user
    except: raise HTTPException(status_code=401)

# --- Pydantic Schemas ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ExpenseCreate(BaseModel):
    title: str
    category: str
    amount: float
    note: Optional[str] = None

class CustomerCreate(BaseModel):
    name: str
    phone: str
    address: Optional[str] = None
    initialDue: Optional[float] = 0.0

class ManualDueCreate(BaseModel):
    amount: float
    reason: Optional[str] = "পুরাতন বাকি"

class SaleItemCreate(BaseModel):
    id: int
    name: str
    quantity: int
    salePrice: float
    priceType: str
    unit: str

class SaleCreate(BaseModel):
    customerId: Optional[int] = None # Existing customer ID
    customerName: Optional[str] = None
    customerPhone: Optional[str] = None
    customerAddress: Optional[str] = None
    items: List[SaleItemCreate]
    totalAmount: float
    discount: float
    finalAmount: float
    paidAmount: float
    dueAmount: float
    paymentMethod: str = "cash"

# --- App Setup ---
app = FastAPI(title="Saikat Machinery Enterprise ERP", version="3.0.0")
app.add_middleware(
    CORSMiddleware, 
    allow_origin_regex="https?://.*", # Allow credentials with any origin
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    response = await call_next(request)
    duration = datetime.now() - start_time
    logger.info(f"{request.method} {request.url.path} - Status: {response.status_code} - Duration: {duration}")
    return response

@app.on_event("startup")
def startup_seeding():
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        if not db.query(User).first():
            hashed_pw = pwd_context.hash("1234")
            db.add(User(name="Admin", email="admin@erp.com", hashed_password=hashed_pw, role="admin"))
            db.commit()
        db.close()
    except Exception as e:
        logger.error(f"Error creating tables: {e}")

@app.get("/api/migrate-data")
async def migrate_sqlite_to_postgres(secret: str):
    if secret != "saikat123":
        raise HTTPException(403)
        
    if "sqlite" in DATABASE_URL:
        return {"msg": "You are currently connected to SQLite, not Postgres"}
        
    # Open local sqlite directly
    import sqlite3
    import os
    sqlite_path = os.path.join(BASE_DIR, "data", "database.sqlite")
    if not os.path.exists(sqlite_path):
        return {"msg": "No SQLite database found to migrate"}
        
    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    db = SessionLocal()
    
    # Migrate Users
    cursor.execute("SELECT * FROM users")
    for row in cursor.fetchall():
        if not db.query(User).filter_by(id=row["id"]).first():
            db.add(User(id=row["id"], name=row["name"], email=row["email"], hashed_password=row["hashed_password"], role=row["role"]))
    
    # Migrate Products
    cursor.execute("SELECT * FROM products")
    for row in cursor.fetchall():
        if not db.query(Product).filter_by(id=row["id"]).first():
            db.add(Product(
                id=row["id"], name=row["name"], category=row["category"], 
                purchasePrice=row["purchasePrice"], wholesalePrice=row.get("wholesalePrice", 0), 
                retailPrice=row.get("retailPrice", 0), stock=row["stock"], 
                unit=row["unit"], sku=row.get("sku"), description=row.get("description"), 
                imageUrl=row.get("imageUrl")
            ))
            
    # Migrate Customers
    cursor.execute("SELECT * FROM customers")
    for row in cursor.fetchall():
        if not db.query(Customer).filter_by(id=row["id"]).first():
            db.add(Customer(
                id=row["id"], name=row["name"], phone=row["phone"], 
                address=row.get("address"), totalDue=row.get("totalDue", 0), 
                createdAt=row["createdAt"]
            ))

    # Migrate Sales
    cursor.execute("SELECT * FROM sales")
    for row in cursor.fetchall():
        if not db.query(Sale).filter_by(id=row["id"]).first():
            db.add(Sale(
                id=row["id"], customerId=row.get("customerId"), customerName=row["customerName"], 
                customerPhone=row["customerPhone"], customerAddress=row.get("customerAddress"), 
                totalAmount=row["totalAmount"], discount=row.get("discount", 0), 
                finalAmount=row.get("finalAmount", 0), paidAmount=row["paidAmount"], 
                dueAmount=row["dueAmount"], paymentMethod=row.get("paymentMethod", "cash"), 
                createdAt=row["createdAt"]
            ))

    # Migrate Sale Items
    cursor.execute("SELECT * FROM sale_items")
    for row in cursor.fetchall():
        if not db.query(SaleItem).filter_by(id=row["id"]).first():
            db.add(SaleItem(
                id=row["id"], saleId=row["saleId"], productId=row["productId"], 
                name=row["name"], quantity=row["quantity"], salePrice=row["salePrice"], 
                purchasePriceAtSale=row.get("purchasePriceAtSale"), 
                priceType=row.get("priceType", "retail"), unit=row["unit"]
            ))
            
    # Migrate Expenses
    cursor.execute("SELECT * FROM expenses")
    for row in cursor.fetchall():
        if not db.query(Expense).filter_by(id=row["id"]).first():
            db.add(Expense(
                id=row["id"], category=row["category"], amount=row["amount"], 
                description=row.get("description"), date=row["date"], 
                loggedBy=row["loggedBy"]
            ))

    db.commit()
    conn.close()
    return {"msg": "Migration successful"}
def startup_seeding():
    # Make sure tables exist in Postgres/SQLite
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.error(f"Error creating tables: {e}")

    # Start FastAPI session to seed
    db = SessionLocal()
    if not db.query(User).filter(User.email == "admin@saikat.com").first():
        db.add(User(name="Admin", email="admin@saikat.com", password=get_password_hash("@Admin123"), role="admin", status="active"))
        db.commit()
    db.close()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "সার্ভারে একটি সমস্যা হয়েছে। দয়া করে লগ ফাইল চেক করুন।"},
    )

# --- Auth Endpoints ---
@app.post("/api/auth/login")
async def login(user_data: UserLogin, request: Request, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(401, detail="ভুল ইমেইল বা পাসওয়ার্ড")
    token = create_access_token({"email": user.email})
    
    # Trust X-Forwarded-Proto if behind proxy
    proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    is_secure = proto == "https"
    
    response.set_cookie(
        "token", 
        token, 
        httponly=True, 
        secure=is_secure, 
        samesite="lax", 
        path="/", 
        max_age=30*86400
    )
    return {"user": {"email": user.email, "role": user.role, "name": user.name}}

@app.get("/api/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return {"user": {"email": user.email, "role": user.role, "name": user.name}}

@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie("token", path="/")
    return {"ok": True}

# --- Inventory Endpoints ---
@app.get("/api/products")
async def get_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.name).all()

@app.post("/api/products")
async def create_product(
    name: str = Form(...),
    category: str = Form(...),
    purchasePrice: float = Form(...),
    wholesalePrice: float = Form(...),
    retailPrice: float = Form(...),
    stock: int = Form(...),
    unit: str = Form(...),
    sku: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.role != "admin": raise HTTPException(403, detail="অনুমতি নেই")
    
    img_path = None
    if image:
        ext = image.filename.split('.')[-1]
        fname = f"{uuid.uuid4().hex[:12]}.{ext}"
        save_path = UPLOADS_DIR / fname
        with open(save_path, "wb") as f: shutil.copyfileobj(image.file, f)
        img_path = f"/uploads/{fname}"
    
    prod = Product(name=name, category=category, purchasePrice=purchasePrice, wholesalePrice=wholesalePrice, retailPrice=retailPrice, stock=stock, unit=unit, sku=sku, description=description, imageUrl=img_path)
    db.add(prod); db.commit(); db.refresh(prod)
    
    # Log Initial Stock
    db.add(StockLog(productId=prod.id, changeAmount=stock, reason="Initial Setup"))
    db.commit()
    return prod

@app.put("/api/products/{id}")
async def update_product(
    id: int,
    name: str = Form(...),
    category: str = Form(...),
    purchasePrice: float = Form(...),
    wholesalePrice: float = Form(...),
    retailPrice: float = Form(...),
    stock: int = Form(...),
    unit: str = Form(...),
    sku: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.role != "admin": raise HTTPException(403, detail="অনুমতি নেই")
    
    prod = db.query(Product).get(id)
    if not prod: raise HTTPException(404, detail="পণ্য পাওয়া যায়নি")
    
    prod.name = name
    prod.category = category
    prod.purchasePrice = purchasePrice
    prod.wholesalePrice = wholesalePrice
    prod.retailPrice = retailPrice
    prod.unit = unit
    prod.sku = sku
    prod.description = description
    
    # Handle Stock change log if updated
    if prod.stock != stock:
        diff = stock - prod.stock
        db.add(StockLog(productId=prod.id, changeAmount=diff, reason="Manual Update"))
        prod.stock = stock
        
    if image:
        ext = image.filename.split('.')[-1]
        fname = f"{uuid.uuid4().hex[:12]}.{ext}"
        save_path = UPLOADS_DIR / fname
        with open(save_path, "wb") as f: shutil.copyfileobj(image.file, f)
        prod.imageUrl = f"/uploads/{fname}"
    
    db.commit()
    return prod

@app.delete("/api/products/{id}")
async def delete_product(id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403, detail="অনুমতি নেই")
    p = db.query(Product).get(id)
    if p: db.delete(p); db.commit()
    return {"ok": True}
# --- Sales & Ledger ---
@app.get("/api/sales")
async def list_sales(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sales = db.query(Sale).options(joinedload(Sale.items)).order_by(desc(Sale.createdAt)).all()
    return sales

@app.get("/api/sales/{id}")
async def get_sale(id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sale = db.query(Sale).options(joinedload(Sale.items)).filter(Sale.id == id).first()
    if not sale: raise HTTPException(404, detail="মেমো পাওয়া যায়নি")
    return sale

@app.post("/api/sales")

async def perform_sale(data: SaleCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Customer Handling
        if data.customerId:
            c = db.query(Customer).get(data.customerId)
            if not c: raise HTTPException(404, detail="কাস্টমার পাওয়া যায়নি")
        else:
            c = db.query(Customer).filter(Customer.phone == data.customerPhone).first()
            if not c:
                c = Customer(name=data.customerName, phone=data.customerPhone, address=data.customerAddress, totalDue=0.0)
                db.add(c)
                db.flush()
        
        c.totalDue += data.dueAmount
        if data.customerAddress: c.address = data.customerAddress

        # Generate a purely numeric memo ID starting from 0001
        if DATABASE_URL.startswith("sqlite"):
            query = "SELECT MAX(CAST(id AS INTEGER)) FROM sales WHERE id NOT GLOB '*[^0-9]*'"
        else:
            query = "SELECT MAX(CAST(id AS INTEGER)) FROM sales WHERE id ~ '^[0-9]+$'"
        
        last_id = db.execute(text(query)).scalar()
        sid = str((last_id or 0) + 1).zfill(4)
        
        sale = Sale(id=sid, customerId=c.id, customerName=c.name, customerPhone=c.phone, customerAddress=c.address, totalAmount=data.totalAmount, discount=data.discount, finalAmount=data.finalAmount, paidAmount=data.paidAmount, dueAmount=data.dueAmount, paymentMethod=data.paymentMethod)
        db.add(sale)

        for item in data.items:
            p = db.query(Product).get(item.id)
            if not p or p.stock < item.quantity:
                db.rollback(); raise HTTPException(400, detail=f"{item.name} স্টকে নেই")
            
            p.stock -= item.quantity
            db.add(SaleItem(saleId=sid, productId=p.id, name=item.name, quantity=item.quantity, salePrice=item.salePrice, purchasePriceAtSale=p.purchasePrice, priceType=item.priceType, unit=item.unit))
            db.add(StockLog(productId=p.id, changeAmount=-item.quantity, reason=f"Sale {sid}"))
        
        db.commit()
        return {"id": sid}
    except Exception as e:
        db.rollback()
        logger.error(f"Sale Error: {str(e)}")
        if isinstance(e, HTTPException): raise e
        raise HTTPException(500, detail=str(e))

@app.get("/api/customers")
async def list_customers(user: User = Depends(get_current_user), db: Session = Depends(get_db)): 
    return db.query(Customer).order_by(Customer.name).all()

@app.post("/api/customers")
async def create_customer(data: CustomerCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Customer).filter(Customer.phone == data.phone).first()
    if existing:
        raise HTTPException(400, detail="এই মোবাইল নম্বর দিয়ে অলরেডি কাস্টমার আছে")
    c = Customer(name=data.name, phone=data.phone, address=data.address, totalDue=data.initialDue)
    db.add(c); db.commit(); db.refresh(c)
    return c

@app.post("/api/customers/{id}/manual-due")
async def add_manual_due(id: int, data: ManualDueCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403)
    c = db.query(Customer).get(id)
    if not c: raise HTTPException(404, detail="কাস্টমার পাওয়া যায়নি")
    c.totalDue += data.amount
    db.commit()
    return {"ok": True, "newBalance": c.totalDue}

@app.post("/api/customers/{id}/payment")
async def customer_payment(id: int, data: Dict[str, float], user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403)
    c = db.query(Customer).get(id)
    if not c: raise HTTPException(404, detail="কাস্টমার পাওয়া যায়নি")
    
    amount = data.get("amount", 0)
    # Never allow due to go below 0 (no advance balance, return change to customer)
    c.totalDue = float(max(0.0, float(c.totalDue) - amount))
    db.commit()
    return {"ok": True, "newBalance": c.totalDue}

# --- Staff Management ---
@app.get("/api/users")
async def list_users(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403)
    return db.query(User).order_by(User.name).all()

@app.delete("/api/users/{id}")
async def suspend_user(id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403)
    u = db.query(User).get(id)
    if u:
        if u.email == "admin@saikat.com": raise HTTPException(400, detail="মেইন অ্যাডমিনকে ডিলিট করা সম্ভব নয়")
        db.delete(u)
        db.commit()
    return {"ok": True}

# --- Reports ---
@app.get("/api/reports")
async def basic_reports(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403)
    
    # Sales by date (last 30 days)
    sales_by_date = db.query(
        func.date(Sale.createdAt).label("date"),
        func.sum(Sale.finalAmount).label("totalSales")
    ).group_by(func.date(Sale.createdAt)).order_by(desc("date")).limit(30).all()
    
    # Top products
    top_products = db.query(
        SaleItem.name,
        func.sum(SaleItem.quantity).label("totalQuantity"),
        func.sum(SaleItem.quantity * SaleItem.salePrice).label("totalRevenue")
    ).group_by(SaleItem.productId).order_by(desc("totalQuantity")).limit(5).all()
    
    return {
        "salesByDate": [dict(r._mapping) for r in sales_by_date],
        "topProducts": [dict(r._mapping) for r in top_products]
    }

# --- Auth Profile & Register ---
@app.get("/api/auth/profile")
async def get_profile(user: User = Depends(get_current_user)):
    return {"email": user.email, "name": user.name, "role": user.role, "status": user.status}

@app.post("/api/auth/register")
async def register_user(data: Dict[str, Any], user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403, detail="অনুমতি নেই")
    if db.query(User).filter(User.email == data.get("email")).first():
        raise HTTPException(400, detail="এই ইমেইল দিয়ে অলরেডি ইউজার আছে")
    
    new_user = User(
        name=data.get("name"),
        email=data.get("email"),
        password=get_password_hash(data.get("password")),
        role=data.get("role", "staff"),
        status="active"
    )
    db.add(new_user); db.commit(); db.refresh(new_user)
    return {"ok": True}

# --- Expenses ---
@app.get("/api/expenses")
async def get_expenses(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Expense).order_by(desc(Expense.createdAt)).all()

@app.post("/api/expenses")
async def add_expense(data: ExpenseCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = Expense(**data.dict())
    db.add(exp); db.commit(); return exp

# --- Advanced Reports ---
@app.get("/api/reports/detailed")
async def enterprise_reports(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403)
    now = datetime.utcnow()
    m_start = now.replace(day=1, hour=0, minute=0, second=0)
    
    # Sales Stats
    m_sales = db.query(func.sum(Sale.finalAmount)).filter(Sale.createdAt >= m_start).scalar() or 0
    m_paid = db.query(func.sum(Sale.paidAmount)).filter(Sale.createdAt >= m_start).scalar() or 0
    m_due = db.query(func.sum(Sale.dueAmount)).filter(Sale.createdAt >= m_start).scalar() or 0
    
    # Expense Stats
    m_expense = db.query(func.sum(Expense.amount)).filter(Expense.createdAt >= m_start).scalar() or 0
    
    # Profit Calculation (Revenue - Purchase Cost - Expenses)
    total_cost = db.query(func.sum(SaleItem.quantity * SaleItem.purchasePriceAtSale)).join(Sale).filter(Sale.createdAt >= m_start).scalar() or 0
    estimated_profit = m_sales - total_cost - m_expense

    # Chart Data
    daily_revenue = db.query(func.date(Sale.createdAt).label("date"), func.sum(Sale.finalAmount).label("amount")).filter(Sale.createdAt >= now - timedelta(days=15)).group_by(func.date(Sale.createdAt)).all()
    
    return {
        "monthly": {"revenue": m_sales, "paid": m_paid, "due": m_due, "expense": m_expense, "profit": estimated_profit},
        "charts": {"revenue": [dict(r._mapping) for r in daily_revenue]}
    }

@app.get("/api/dashboard")
async def dashboard_summary(db: Session = Depends(get_db)):
    return {
        "totalSales": db.query(func.sum(Sale.finalAmount)).scalar() or 0,
        "totalDue": db.query(func.sum(Customer.totalDue)).scalar() or 0,
        "totalProducts": db.query(func.count(Product.id)).scalar() or 0,
        "activeStaff": db.query(func.count(User.id)).scalar() or 0,
        "lowStockItems": db.query(Product).filter(Product.stock <= Product.minStockLevel).all()
    }

@app.get("/api/notifications")
async def alerts(db: Session = Depends(get_db)):
    low = db.query(Product).filter(Product.stock <= Product.minStockLevel).all()
    n = [{"id": f"ls-{p.id}", "title": "স্টক শেষ", "message": f"{p.name} মাত্র {p.stock} {p.unit} আছে।"} for p in low]
    return n

# --- System Admin ---
@app.get("/api/admin/backup")
async def enterprise_backup(user: User = Depends(get_current_user)):
    if user.role != "admin": raise HTTPException(403)
    buf = BytesIO()
    with zipfile.ZipFile(buf, 'w') as z:
        if os.path.exists("./data/database.sqlite"): z.write("./data/database.sqlite", "database.sqlite")
        for f in Path("./uploads").glob("*"): z.write(f, f"uploads/{f.name}")
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/zip", headers={"Content-Disposition": f"attachment; filename=SaikatERP_Backup_{datetime.now().strftime('%Y%m%d')}.zip"})

@app.post("/api/admin/reset-database")
async def system_reset(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403)
    for tbl in [SaleItem, Sale, StockLog, Product, Customer, Expense, Supplier]:
        db.query(tbl).delete()
    db.commit()
    for f in Path("./uploads").glob("*"): f.unlink()
    return {"ok": True}

# --- Suppliers Endpoints ---
@app.get("/api/suppliers")
async def list_suppliers(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Supplier).order_by(Supplier.name).all()

@app.post("/api/suppliers")
async def create_supplier(data: Dict[str, Any], user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403)
    s = Supplier(
        name=data.get("name"),
        contactPerson=data.get("contactPerson"),
        phone=data.get("phone"),
        email=data.get("email"),
        address=data.get("address"),
        totalBalance=data.get("initialBalance", 0.0)
    )
    db.add(s); db.commit(); db.refresh(s)
    return s

@app.post("/api/suppliers/{id}/pay")
async def supplier_payment(id: int, data: Dict[str, float], user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin": raise HTTPException(403)
    s = db.query(Supplier).get(id)
    if not s: raise HTTPException(404, detail="সাপ্লায়ার পাওয়া যায়নি")
    amount = data.get("amount", 0)
    s.totalBalance -= amount
    db.commit()
    return {"ok": True, "newBalance": s.totalBalance}

# --- Stock Logs ---
@app.get("/api/stock-logs")
async def get_stock_logs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(StockLog, Product.name.label("productName"))\
             .join(Product, StockLog.productId == Product.id)\
             .order_by(desc(StockLog.createdAt)).limit(100).all()
    return [{"id": l[0].id, "productId": l[0].productId, "productName": l[1], "changeAmount": l[0].changeAmount, "reason": l[0].reason, "createdAt": l[0].createdAt} for l in logs]

# --- Static ---
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

dist_path = BASE_DIR / "dist"
if dist_path.exists():
    app.mount("/assets", StaticFiles(directory=str(dist_path / "assets")), name="assets")
    @app.get("/{p:path}")
    async def spa_handler(p: str):
        if p.startswith("api/"): raise HTTPException(404)
        # If it reached here and it's an upload, it means the mount failed to find it.
        # We should still allow it to fall through or return 404.
        if p.startswith("uploads/"): 
             # Check if file exists, if not, it's a genuine 404
             file_path = BASE_DIR / p
             if file_path.exists():
                 return FileResponse(str(file_path))
             raise HTTPException(404)
        return FileResponse(str(dist_path / "index.html"))

if __name__ == "__main__":
    import uvicorn
    # Use 0.0.0.0 to allow access from shared hosting/external
    uvicorn.run(app, host="0.0.0.0", port=3000, proxy_headers=True, forwarded_allow_ips="*")
