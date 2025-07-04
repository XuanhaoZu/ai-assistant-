from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.db import init_db 
from api.upload_api import router as upload_router
from api.query_api import router as query_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.on_event("startup")
def startup_event():
    init_db()

app.include_router(upload_router)
app.include_router(query_router)

