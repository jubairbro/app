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
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text, desc, func, and_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
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
BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{BASE_DIR}/data/database.sqlite"
UPLOADS_DIR = BASE_DIR / "uploads"
DATA_DIR = BASE_DIR / "data"
SECRET_KEY = "saikat-super-secret-key-enterprise-edition"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
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
    allow_origins=["*"], 
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
    db = SessionLocal()
    if not db.query(User).filter(User.email == "admin@saikat.com").first():
        db.add(User(name="Admin", email="admin@saikat.com", password=get_password_hash("@Admin123"), role="admin"))
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
    is_secure = request.url.scheme == "https"
    response.set_cookie("token", token, httponly=True, secure=is_secure, samesite="lax", path="/", max_age=30*86400)
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
    db: Session = Depends(get_db)
):
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

@app.delete("/api/products/{id}")
async def delete_product(id: int, db: Session = Depends(get_db)):
    p = db.query(Product).get(id)
    if p: db.delete(p); db.commit()
    return {"ok": True}

# --- Sales & Ledger ---
@app.post("/api/sales")
async def perform_sale(data: SaleCreate, db: Session = Depends(get_db)):
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

        sid = f"INV-{datetime.now().strftime('%y%m')}-{uuid.uuid4().hex[:4].upper()}"
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
async def list_customers(db: Session = Depends(get_db)): 
    return db.query(Customer).order_by(Customer.name).all()

@app.post("/api/customers")
async def create_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    existing = db.query(Customer).filter(Customer.phone == data.phone).first()
    if existing:
        raise HTTPException(400, detail="এই মোবাইল নম্বর দিয়ে অলরেডি কাস্টমার আছে")
    c = Customer(name=data.name, phone=data.phone, address=data.address, totalDue=data.initialDue)
    db.add(c); db.commit(); db.refresh(c)
    return c

@app.post("/api/customers/{id}/manual-due")
async def add_manual_due(id: int, data: ManualDueCreate, db: Session = Depends(get_db)):
    c = db.query(Customer).get(id)
    if not c: raise HTTPException(404, detail="কাস্টমার পাওয়া যায়নি")
    c.totalDue += data.amount
    db.commit()
    return {"ok": True, "newBalance": c.totalDue}

@app.post("/api/customers/{id}/pay")
async def customer_payment(id: int, data: Dict[str, float], db: Session = Depends(get_db)):
    c = db.query(Customer).get(id)
    if c: c.totalDue -= data.get("amount", 0); db.commit()
    return {"ok": True}

# --- Expenses ---
@app.get("/api/expenses")
async def get_expenses(db: Session = Depends(get_db)):
    return db.query(Expense).order_by(desc(Expense.createdAt)).all()

@app.post("/api/expenses")
async def add_expense(data: ExpenseCreate, db: Session = Depends(get_db)):
    exp = Expense(**data.dict())
    db.add(exp); db.commit(); return exp

# --- Advanced Reports ---
@app.get("/api/reports/detailed")
async def enterprise_reports(db: Session = Depends(get_db)):
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

@app.get("/api/notifications")
async def alerts(db: Session = Depends(get_db)):
    low = db.query(Product).filter(Product.stock <= Product.minStockLevel).all()
    n = [{"id": f"ls-{p.id}", "title": "স্টক শেষ", "message": f"{p.name} মাত্র {p.stock} {p.unit} আছে।"} for p in low]
    return n

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

# --- Static ---
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
dist_path = BASE_DIR / "dist"
if dist_path.exists():
    app.mount("/assets", StaticFiles(directory=str(dist_path / "assets")), name="assets")
    @app.get("/{p:path}")
    async def spa_handler(p: str):
        if p.startswith("api/"): raise HTTPException(404)
        return FileResponse(str(dist_path / "index.html"))

if __name__ == "__main__":
    import uvicorn
    # Use 0.0.0.0 to allow access from shared hosting/external
    uvicorn.run(app, host="0.0.0.0", port=3000)
