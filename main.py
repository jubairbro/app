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

# --- Configuration ---
DATABASE_URL = "sqlite:///./data/database.sqlite"
SECRET_KEY = "saikat-super-secret-key-change-in-prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

os.makedirs("./data", exist_ok=True)
os.makedirs("./uploads", exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Models ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    purchasePrice = Column(Float)
    wholesalePrice = Column(Float)
    retailPrice = Column(Float)
    stock = Column(Integer, default=0)
    unit = Column(String)
    imageUrl = Column(String, nullable=True)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    address = Column(String, nullable=True)
    totalDue = Column(Float, default=0.0)

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
    createdAt = Column(DateTime, default=datetime.utcnow)
    items = relationship("SaleItem", back_populates="sale")

class SaleItem(Base):
    __tablename__ = "sale_items"
    id = Column(Integer, primary_key=True, index=True)
    saleId = Column(String, ForeignKey("sales.id"))
    productId = Column(Integer, ForeignKey("products.id"))
    name = Column(String)
    quantity = Column(Integer)
    salePrice = Column(Float)
    priceType = Column(String)
    unit = Column(String)
    sale = relationship("Sale", back_populates="items")

Base.metadata.create_all(bind=engine)

# --- Security ---
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
    if not token: raise HTTPException(401)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = db.query(User).filter(User.email == payload.get("email")).first()
        if not user: raise HTTPException(401)
        return user
    except: raise HTTPException(401)

# --- Schemas ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SaleItemCreate(BaseModel):
    id: int
    name: str
    quantity: int
    salePrice: float
    priceType: str
    unit: str

class SaleCreate(BaseModel):
    customerName: str
    customerPhone: str
    customerAddress: Optional[str] = None
    items: List[SaleItemCreate]
    totalAmount: float
    discount: float
    finalAmount: float
    paidAmount: float
    dueAmount: float

# --- App ---
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def seed_admin():
    db = SessionLocal()
    if not db.query(User).filter(User.email == "admin@saikat.com").first():
        db.add(User(email="admin@saikat.com", password=get_password_hash("@Admin123"), role="admin"))
        db.commit()
    db.close()

# --- Routes ---
@app.post("/api/auth/login")
async def login(user_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password): raise HTTPException(401)
    token = create_access_token({"email": user.email})
    response.set_cookie("token", token, httponly=True, secure=True, samesite="lax", path="/")
    return {"user": {"email": user.email, "role": user.role}}

@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie("token", path="/")
    return {"ok": True}

@app.get("/api/auth/me")
async def me(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email, "role": current_user.role}

@app.get("/api/notifications")
async def get_notifs(db: Session = Depends(get_db)):
    low_stock = db.query(Product).filter(Product.stock <= 10).all()
    return [{"id": p.id, "title": "স্টক শেষ পর্যায়ে", "message": f"{p.name} মাত্র {p.stock} টি আছে।"} for p in low_stock]

@app.get("/api/products")
async def get_prods(db: Session = Depends(get_db)): return db.query(Product).all()

@app.post("/api/products")
async def add_prod(name:str=Form(...), category:str=Form(...), purchasePrice:float=Form(...), wholesalePrice:float=Form(...), retailPrice:float=Form(...), stock:int=Form(...), unit:str=Form(...), image:Optional[UploadFile]=File(None), db:Session=Depends(get_db)):
    fname = None
    if image:
        fname = f"{int(datetime.now().timestamp())}.png"
        with open(f"./uploads/{fname}", "wb") as b: shutil.copyfileobj(image.file, b)
    p = Product(name=name, category=category, purchasePrice=purchasePrice, wholesalePrice=wholesalePrice, retailPrice=retailPrice, stock=stock, unit=unit, imageUrl=f"/uploads/{fname}" if fname else None)
    db.add(p); db.commit(); return p

@app.delete("/api/products/{id}")
async def del_prod(id:int, db:Session=Depends(get_db)):
    p = db.query(Product).get(id)
    if p: db.delete(p); db.commit()
    return {"ok": True}

@app.post("/api/sales")
async def sell(data: SaleCreate, db: Session = Depends(get_db)):
    c = db.query(Customer).filter(Customer.phone == data.customerPhone).first()
    if not c:
        c = Customer(name=data.customerName, phone=data.customerPhone, address=data.customerAddress, totalDue=data.dueAmount)
        db.add(c)
    else:
        c.totalDue += data.dueAmount
        if data.customerAddress: c.address = data.customerAddress
    db.flush()
    sid = f"MEMO-{uuid.uuid4().hex[:6].upper()}"
    s = Sale(id=sid, customerId=c.id, customerName=c.name, customerPhone=c.phone, customerAddress=c.address, totalAmount=data.totalAmount, discount=data.discount, finalAmount=data.finalAmount, paidAmount=data.paidAmount, dueAmount=data.dueAmount)
    db.add(s)
    for itm in data.items:
        p = db.query(Product).get(itm.id)
        if p: p.stock -= itm.quantity
        db.add(SaleItem(saleId=sid, productId=itm.id, name=itm.name, quantity=itm.quantity, salePrice=itm.salePrice, priceType=itm.priceType, unit=itm.unit))
    db.commit()
    return {"id": sid}

@app.get("/api/customers")
async def get_custs(db: Session = Depends(get_db)): return db.query(Customer).all()

@app.post("/api/customers/{id}/pay")
async def pay_due(id:int, d:Dict[str, float], db:Session=Depends(get_db)):
    c = db.query(Customer).get(id)
    if c: c.totalDue -= d.get("amount", 0); db.commit()
    return {"ok": True}

@app.get("/api/dashboard")
async def dash(db: Session = Depends(get_db)):
    return {
        "totalSales": db.query(func.sum(Sale.finalAmount)).scalar() or 0,
        "totalDue": db.query(func.sum(Customer.totalDue)).scalar() or 0,
        "totalProducts": db.query(func.count(Product.id)).scalar() or 0,
        "lowStockItems": db.query(Product).filter(Product.stock <= 10).all()
    }

@app.get("/api/reports/detailed")
async def reports(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    m = db.query(func.sum(Sale.finalAmount).label("sales"), func.sum(Sale.paidAmount).label("paid"), func.sum(Sale.dueAmount).label("due")).filter(Sale.createdAt >= now.replace(day=1)).first()
    y = db.query(func.sum(Sale.finalAmount).label("sales"), func.sum(Sale.paidAmount).label("paid"), func.sum(Sale.dueAmount).label("due")).filter(Sale.createdAt >= now.replace(month=1, day=1)).first()
    d = db.query(func.date(Sale.createdAt).label("date"), func.sum(Sale.finalAmount).label("amount")).filter(Sale.createdAt >= now - timedelta(days=7)).group_by(func.date(Sale.createdAt)).all()
    return {"monthly": m._mapping, "yearly": y._mapping, "daily": [dict(r._mapping) for r in d]}

@app.get("/api/sales")
async def sales_list(db: Session = Depends(get_db)): return db.query(Sale).order_by(desc(Sale.createdAt)).all()

@app.get("/api/admin/backup")
async def backup(current_user: User = Depends(get_current_user)):
    m = BytesIO()
    with zipfile.ZipFile(m, 'w') as z:
        if os.path.exists("./data/database.sqlite"): z.write("./data/database.sqlite", "database.sqlite")
        for f in Path("./uploads").glob("*"): z.write(f, f"uploads/{f.name}")
    m.seek(0)
    return StreamingResponse(m, media_type="application/zip", headers={"Content-Disposition": "attachment; filename=backup.zip"})

@app.post("/api/admin/reset-database")
async def reset(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(SaleItem).delete(); db.query(Sale).delete(); db.query(Product).delete(); db.query(Customer).delete(); db.commit()
    for f in Path("./uploads").glob("*"): f.unlink()
    return {"ok": True}

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")
    @app.get("/{p:path}")
    async def spa(p: str):
        if p.startswith("api/"): raise HTTPException(404)
        return FileResponse("dist/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=3000)
