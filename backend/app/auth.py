from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db
from .models import User, RideRequest, Ride
from .schemas import UserCreate, UserLogin
import bcrypt
import jwt
import os
from dotenv import load_dotenv
from uuid import uuid4


load_dotenv()
router = APIRouter()
SECRET_KEY = os.getenv("NEXTAUTH_SECRET")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = hash_password(user.password)
    db_user = User(id=str(uuid4()), email=user.email, password=hashed_password, name=user.name, phoneNumber=user.phoneNumber)
    db.add(db_user)
    db.commit()
    return {"message": "User registered successfully"}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not (user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = jwt.encode({"user_id": db_user.id}, SECRET_KEY, algorithm="HS256")
    return {"token": token}

@router.get("/user/details", response_model=dict)
def get_user_details(email: str = None, user_id: str = None, db: Session = Depends(get_db)):
    if not email and not user_id:
        raise HTTPException(status_code=400, detail="Either email or user_id must be provided")
    
    query = db.query(User)
    if email:
        user = query.filter(User.email == email).first()
    else:
        user = query.filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone_number": user.phoneNumber,
    }

@router.get("/user/{user_id}")
def get_user_requests(user_id: str, db: Session = Depends(get_db)):
    pending = db.query(RideRequest).join(Ride).filter(Ride.driver_id == user_id, RideRequest.status == "pending").all()
    requested = db.query(RideRequest).filter(RideRequest.userId == user_id, RideRequest.status == "pending").all()
    approved = db.query(RideRequest).filter(
        (RideRequest.userId == user_id) | (RideRequest.ride.has(driver_id=user_id)),
        RideRequest.status == "approved"
    ).all()

    return {
        "pending": pending,
        "requested": requested,
        "approved": approved
    }
