from fastapi import FastAPI
from .database import Base, engine
from .auth import router as auth_router
from .rides import router as rides_router
from .requests import router as requests_router
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


app.include_router(auth_router, prefix="/auth")
app.include_router(rides_router, prefix="/rides")
app.include_router(requests_router, prefix="/requests")

@app.get("/",methods=["GET", "HEAD"])
def root():
    return {"message": "Welcome to Carpool API"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Use Render's assigned port
    uvicorn.run(app, host="0.0.0.0", port=port)
