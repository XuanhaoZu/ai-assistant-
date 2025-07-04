from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import pandas as pd
from agent import query_agent
import os
import numpy as np

router = APIRouter()
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

class QueryRequest(BaseModel):
    question: str
    file_id: Optional[str] = None

@router.post("/query")
async def query_data(payload: QueryRequest):
    if payload.file_id:
        file_path = os.path.join(DATA_DIR, payload.file_id)
        if not os.path.isfile(file_path):
            return {"error": f"File {payload.file_id} not found in /data"}
        df = pd.read_csv(file_path)
    else:
        df = pd.read_csv(os.path.join(DATA_DIR, "customer_churn_dataset.csv"))

    full_prompt = (
        "You are a data analysis expert. Please analyze the CSV data provided below strictly based on the data, "
        "and return only conclusions derived from the data. Use tables, customer lists, or statistical summaries whenever possible. "
        "Avoid vague explanations. The question is:\n" + payload.question
    )

    answer = query_agent(df, full_prompt)
    return {"result": answer}

@router.get("/preview")
async def preview_data(file_id: str = Query(..., description="The filename to preview")):
    file_path = os.path.join(DATA_DIR, file_id)
    if not os.path.isfile(file_path):
        return JSONResponse({"error": f"File {file_id} not found in /data"}, status_code=404)

    try:
        print(f"[PREVIEW] Reading: {file_path}")
        df = pd.read_csv(file_path)
        print(f"[PREVIEW] Loaded shape: {df.shape}")

        df = df.replace({np.inf: None, -np.inf: None})
        preview_df = df.sample(n=min(5, len(df)), random_state=42)
        preview_df = preview_df.where(pd.notna(preview_df), None)

        print(f"[PREVIEW] Columns: {list(df.columns)}")
        print(f"[PREVIEW] Preview rows: {preview_df.shape[0]}")

        return {
            "columns": list(df.columns),
            "preview": preview_df.to_dict(orient="records"),
            "rows": len(df)
        }

    except Exception as e:
        print(f"[ERROR] Preview failed: {str(e)}")
        return JSONResponse({"error": f"Failed to preview file: {str(e)}"}, status_code=500)


