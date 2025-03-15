from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db
from .models import RideRequest, Ride, User
from .schemas import RideRequestCreate
from uuid import uuid4
from datetime import datetime

router = APIRouter()

@router.post("/request")
def request_ride(request: RideRequestCreate, db: Session = Depends(get_db)):
    ride_request = RideRequest(id=str(uuid4()), rideId=request.rideId, userId="some-user-id", status="pending")
    db.add(ride_request)
    db.commit()
    return {"message": "Ride request sent"}

@router.get("/requests/{user_id}")
def get_user_requests(user_id: str, db: Session = Depends(get_db)):
    pending = (
    db.query(RideRequest)
    .join(Ride)  # Explicitly join RideRequest with Ride
    .filter(Ride.driver_id == user_id, RideRequest.status == "pending")
    .all()
)


    approved = db.query(RideRequest).filter(RideRequest.userId == user_id, RideRequest.status == "approved").all()
    return {"pending": pending, "approved": approved}

@router.get("/requests/received/{driver_id}")
def get_received_requests(driver_id: str, db: Session = Depends(get_db)):
    received = (
        db.query(RideRequest)
        .join(Ride, RideRequest.rideId == Ride.id)
        .filter(Ride.driver_id == driver_id, RideRequest.status == "pending")
        .all()
    )
    return received

@router.post("/requests/approve/{request_id}")
def approve_request(request_id: str, db: Session = Depends(get_db)):
    ride_request = db.query(RideRequest).filter(RideRequest.id == request_id).first()
    if not ride_request:
        return {"error": "Request not found"}
    ride_request.status = "approved"
    ride_request.acceptedAt = datetime.utcnow()
    db.commit()
    return {"message": "Ride request approved"}

@router.post("/requests/decline/{request_id}")
def decline_request(request_id: str, db: Session = Depends(get_db)):
    ride_request = db.query(RideRequest).filter(RideRequest.id == request_id).first()
    if not ride_request:
        return {"error": "Request not found"}
    db.delete(ride_request)
    db.commit()
    return {"message": "Ride request declined"}

@router.post("/requests/retract/{request_id}")
def retract_request(request_id: str, db: Session = Depends(get_db)):
    ride_request = db.query(RideRequest).filter(RideRequest.id == request_id).first()
    if not ride_request:
        return {"error": "Request not found"}
    db.delete(ride_request)
    db.commit()
    return {"message": "Ride request retracted"}
