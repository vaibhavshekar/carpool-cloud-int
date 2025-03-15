from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    phoneNumber: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class RideCreate(BaseModel):
    driver_id: str
    from_location: str
    to_location: str
    time: datetime
    seatsAvailable: int

class RideRequestCreate(BaseModel):
    rideId: str

class RideRouteBase(BaseModel):
    rideId: str
    from_lat: float
    from_lng: float
    to_lat: float
    to_lng: float
    polyline: str

class RideRouteCreate(RideRouteBase):
    pass

class RideRouteResponse(RideRouteBase):
    id: str

    class Config:
        from_attributes = True