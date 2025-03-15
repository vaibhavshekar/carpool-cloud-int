from fastapi import FastAPI
from .database import Base, engine
from .auth import router as auth_router
from .rides import router as rides_router
from .requests import router as requests_router
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/")
def root():
    return {"message": "Welcome to Carpool API"}
