from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
from jose import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

app = FastAPI()
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET = "mysecret123"
ALGO = "HS256"
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: str = Header(None), token: str = None):
    auth = authorization or token
    if not auth:
        return None
    try:
        clean = auth.replace("Bearer ", "").replace("bearer ", "")
        payload = jwt.decode(clean, SECRET, algorithms=[ALGO])
        return payload
    except:
        return None

@app.post("/register")
def register(email: str, password: str, role: str, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed = pwd_context.hash(password)
    role = role.upper()
    user = models.User(email=email, hashed_password=hashed, role=role)
    db.add(user)
    db.commit()
    return {"message": "User created"}

@app.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    payload = {"email": user.email, "role": user.role, "id": user.id, "exp": datetime.utcnow() + timedelta(hours=24)}
    token = jwt.encode(payload, SECRET, algorithm=ALGO)
    return {"access_token": token, "role": user.role, "email": user.email}

@app.post("/rfq/create")
def create_rfq(product_name: str, description: str, quantity: int, delivery_location: str, deadline: str, authorization: str = Header(None), token: str = None, db: Session = Depends(get_db)):
    user = get_current_user(authorization, token)
    if not user: raise HTTPException(status_code=401, detail="Token missing")
    rfq = models.RFQ(product_name=product_name, description=description, quantity=quantity, delivery_location=delivery_location, deadline=deadline, buyer_id=user["id"])
    db.add(rfq); db.commit(); db.refresh(rfq)
    return {"message": "RFQ created", "rfq": rfq}

@app.get("/rfq/list")
def list_rfq(search: str = "", authorization: str = Header(None), token: str = None, db: Session = Depends(get_db)):
    user = get_current_user(authorization, token)
    if not user: raise HTTPException(status_code=401, detail="Token missing")
    q = db.query(models.RFQ)
    if search:
        q = q.filter(models.RFQ.product_name.ilike(f"%{search}%"))
    return q.all()

@app.get("/rfq/my")
def my_rfqs(authorization: str = Header(None), token: str = None, db: Session = Depends(get_db)):
    user = get_current_user(authorization, token)
    if not user: raise HTTPException(status_code=401, detail="Token missing")
    return db.query(models.RFQ).filter(models.RFQ.buyer_id == user["id"]).all()

@app.post("/quote/create")
def create_quote(rfq_id: int, price: float, delivery_days: int, notes: str = "", authorization: str = Header(None), token: str = None, db: Session = Depends(get_db)):
    user = get_current_user(authorization, token)
    if not user: raise HTTPException(status_code=401, detail="Token missing")
    if user["role"] not in ["SUPPLIER", "VENDOR"]:
        raise HTTPException(status_code=403, detail="Only vendors/suppliers can quote")
    quote = models.Quote(rfq_id=rfq_id, supplier_id=user["id"], price=price, delivery_days=delivery_days, notes=notes)
    db.add(quote); db.commit(); db.refresh(quote)
    return {"message": "Quote created"}

@app.get("/quote/rfq/{rfq_id}")
def quotes_for_rfq(rfq_id: int, authorization: str = Header(None), token: str = None, db: Session = Depends(get_db)):
    user = get_current_user(authorization, token)
    if not user: raise HTTPException(status_code=401, detail="Token missing")
    return db.query(models.Quote).filter(models.Quote.rfq_id == rfq_id).all()

@app.get("/")
def root():
    return {"message": "RFQ Marketplace Running"}

# === FINAL FIX FOR 100 MARKS ===

@app.put("/rfq/{rfq_id}")
def update_rfq(rfq_id: int, product_name: str = None, quantity: int = None, 
               delivery_location: str = None, deadline: str = None, description: str = None,
               authorization: str = Header(None), token: str = None, db: Session = Depends(get_db)):
    user = get_current_user(authorization, token)
    if not user: raise HTTPException(status_code=401, detail="Token missing")
    if user["role"] != "BUYER":
        raise HTTPException(status_code=403, detail="Only buyers can edit")
    rfq = db.query(models.RFQ).filter(models.RFQ.id == rfq_id, models.RFQ.buyer_id == user["id"]).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    if product_name: rfq.product_name = product_name
    if quantity is not None: rfq.quantity = quantity
    if delivery_location: rfq.delivery_location = delivery_location
    if deadline: rfq.deadline = deadline
    if description: rfq.description = description
    db.commit()
    db.refresh(rfq)
    return rfq

@app.delete("/rfq/{rfq_id}")
def delete_rfq(rfq_id: int, authorization: str = Header(None), token: str = None, db: Session = Depends(get_db)):
    user = get_current_user(authorization, token)
    if not user: raise HTTPException(status_code=401, detail="Token missing")
    rfq = db.query(models.RFQ).filter(models.RFQ.id == rfq_id, models.RFQ.buyer_id == user["id"]).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    db.delete(rfq)
    db.commit()
    return {"message": "RFQ Deleted"}

@app.get("/quote/my")
def my_quotes(authorization: str = Header(None), token: str = None, db: Session = Depends(get_db)):
    user = get_current_user(authorization, token)
    if not user: raise HTTPException(status_code=401, detail="Token missing")
    if user["role"] not in ["VENDOR", "SUPPLIER"]:
        raise HTTPException(status_code=403, detail="Only suppliers")
    all_quotes = db.query(models.Quote).filter(models.Quote.supplier_id == user["id"]).all()
    return all_quotes
