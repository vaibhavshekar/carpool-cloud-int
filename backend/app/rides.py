from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db
from .models import Ride, RideRoute
from .schemas import RideCreate
from uuid import uuid4
from sqlalchemy.exc import SQLAlchemyError
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

ORS_API_KEY = os.getenv("ORS_API_KEY")
ORS_GEOCODE_URL = os.getenv("ORS_GEOCODE_URL")

router = APIRouter()

import requests

def get_geocode(location: str):
    ORS_API_KEY = ORS_API_KEY
    ORS_GEOCODE_URL = ORS_GEOCODE_URL

    params = {
        "api_key": ORS_API_KEY,
        "text": location,
        "size": 1,
        "boundary.city": "Coimbatore"  # Restrict to Coimbatore
    }

    response = requests.get(ORS_GEOCODE_URL, params=params)

    if response.status_code == 200:
        data = response.json()
        if data["features"]:
            coordinates = data["features"][0]["geometry"]["coordinates"]
            return (coordinates[0], coordinates[1])  # (longitude, latitude)
    
    return "None"  # Return None instead of error dictionary

    
def get_polyline(start: tuple, end: tuple):
    ORS_API_KEY = "5b3ce3597851110001cf624870ef7b6bd38d4031befb802c575bf729"
    ORS_DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
    
    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }
    
    body = {
        "coordinates": [
            [start[0], start[1]],  # Ensure (longitude, latitude) format
            [end[0], end[1]]
        ]
    }
    
    response = requests.post(ORS_DIRECTIONS_URL, json=body, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if "features" in data and data["features"]:
            route = data["features"][0]
            polyline = [(coord[0], coord[1]) for coord in route["geometry"]["coordinates"]]  # Remove elevation
            return {
                "polyline": polyline,
                "distance_m": route["properties"]["segments"][0]["distance"],
                "duration_s": route["properties"]["segments"][0]["duration"]
            }
        else:
            return {"error": "No route found"}
    else:
        return {"error": f"Request failed with status code {response.status_code}, message: {response.text}"}
    

@router.post("/post")
def post_ride(ride: RideCreate, db: Session = Depends(get_db)):
    db_ride = Ride(id=str(uuid4()), driver_id=ride.driver_id, from_location=ride.from_location, 
                   to_location=ride.to_location, time=ride.time, seats_available=ride.seatsAvailable)
    db.add(db_ride)
    db.commit()
    return {"message": "Ride posted successfully"}

@router.get("/find")
def find_rides(from_location: str, to_location: str, db: Session = Depends(get_db)):
    rides = db.query(Ride).filter(Ride.from_location == from_location, Ride.to_location == to_location).all()
    return rides


@router.get("/ride/{ride_id}")
def get_ride(ride_id: str, db: Session = Depends(get_db)):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    return ride

@router.post("/update_routes")
def update_routes(db: Session = Depends(get_db)):
    update_ride_routes(db)
    return {"message": "Ride routes updated"}



def update_ride_routes(db: Session):
    try:
        # Fetch all rides
        rides = db.query(Ride).all()
        
        for ride in rides:
            # Get geocode for from_location and to_location
            from_coords = get_geocode(ride.from_location)
            to_coords = get_geocode(ride.to_location)
            
            if not from_coords or not to_coords:  # Handle invalid geocode results
                print(f"Skipping ride {ride.id} due to geocode error")
                continue
            
            # Get polyline route data
            route_data = get_polyline(from_coords, to_coords)
            
            if "error" in route_data:
                print(f"Ride {ride.id} has a route error: {route_data['error']}")
                polyline = "no route"  # Mark as "no route" in the database
                distance_m = None
                duration_s = None
            else:
                polyline = json.dumps(route_data["polyline"])  # Store route polyline
                distance_m = route_data["distance_m"]
                duration_s = route_data["duration_s"]
            
            # Check if a route already exists for the ride
            existing_route = db.query(RideRoute).filter_by(rideId=ride.id).first()
            
            if existing_route:
                # Update existing route
                existing_route.from_lat = from_coords[1]
                existing_route.from_lng = from_coords[0]
                existing_route.to_lat = to_coords[1]
                existing_route.to_lng = to_coords[0]
                existing_route.polyline = polyline
            else:
                # Insert new route entry
                ride_route = RideRoute(
                    id=ride.id,
                    rideId=ride.id,
                    from_lat=from_coords[1],
                    from_lng=from_coords[0],
                    to_lat=to_coords[1],
                    to_lng=to_coords[0],
                    polyline=polyline
                )
                db.add(ride_route)
        
        db.commit()
        print("Ride routes updated successfully")
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error: {str(e)}")