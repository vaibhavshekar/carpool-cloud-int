from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, DECIMAL, Text
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = "user"
    id = Column(String(191), primary_key=True)
    email = Column(String(191), unique=True, nullable=False)
    password = Column(String(191), nullable=False)
    name = Column(String(191), nullable=False)
    phoneNumber = Column(String(191), nullable=True)


class Ride(Base):
    __tablename__ = "ride"

    id = Column(String(191), primary_key=True)
    driver_id = Column(String(191), ForeignKey("user.id"), nullable=False,name="driverId")
    from_location = Column(String(191), nullable=False, name="from")  # Map to "from"
    to_location = Column(String(191), nullable=False, name="to")  # Map to "to"
    time = Column(DateTime, nullable=False)
    seats_available = Column(Integer, nullable=False, name="seatsAvailable")  # Ensures consistency

    driver = relationship("User")
    route = relationship("RideRoute", back_populates="ride", uselist=False, foreign_keys="[RideRoute.rideId]")

class RideRequest(Base):
    __tablename__ = "request"
    id = Column(String(191), primary_key=True)
    rideId = Column(String(191), ForeignKey("ride.id"), nullable=False)
    userId = Column(String(191), ForeignKey("user.id"), nullable=False)
    status = Column(String(191), default="pending")
    acceptedAt = Column(DateTime, nullable=True)

    ride = relationship("Ride")
    user = relationship("User")


class RideRoute(Base):
    __tablename__ = "ride_routes"

    id = Column(String(191), primary_key=True, index=True)
    rideId = Column(String(191), ForeignKey("ride.id", ondelete="CASCADE", onupdate="CASCADE"), unique=True, nullable=False)
    from_lat = Column(DECIMAL(10, 7), nullable=False)
    from_lng = Column(DECIMAL(10, 7), nullable=False)
    to_lat = Column(DECIMAL(10, 7), nullable=False)
    to_lng = Column(DECIMAL(10, 7), nullable=False)
    polyline = Column(Text, nullable=False)

    # Relationship with Ride
    ride = relationship("Ride", back_populates="route", primaryjoin="Ride.id == RideRoute.rideId")
