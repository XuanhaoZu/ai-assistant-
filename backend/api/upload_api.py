# api/upload_api.py
from fastapi import APIRouter, UploadFile, File, Depends, Body
from sqlalchemy.orm import Session
from utils.db import SessionLocal
from services.file_service import handle_file_upload, get_uploaded_files
from pydantic import BaseModel
import os 


router = APIRouter()

# TBC: DB dev
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# @router.post("/upload")
# def upload_csv(
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db),
#     user_id: str = "test_user" 
# ):
#     result = handle_file_upload(file, user_id, db)
#     return result

# class FileQueryRequest(BaseModel):
#     user_id: str

# @router.post("/files")
# def list_uploaded_files(
#     user_id: str = Body(..., embed=True),
#     db: Session = Depends(get_db)
# ):
#     return get_uploaded_files(user_id, db) 


DEMO_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))

# Get demo files
@router.get("/demo-files")
def list_demo_files():
    try:
        files = os.listdir(DEMO_DATA_DIR)
        csv_files = [f for f in files if f.endswith(".csv")]
        return {"files": csv_files}
    except Exception as e:
        return {"error": str(e)}

# TBC
# @router.get("/demo-files/{filename}")
# def get_demo_file(filename: str):
#     file_path = os.path.join(DEMO_DATA_DIR, filename)
#     if not os.path.isfile(file_path):
#         return {"error": "File not found"}
#     return FileResponse(file_path, media_type="text/csv", filename=filename)