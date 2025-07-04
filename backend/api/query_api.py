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

    sample_rows = df.head(3).replace({np.nan: None}).to_dict(orient="records")
    print("✅✅✅✅✅✅✅Sample!!")
    full_prompt = f"""
    You are a business analyst helping a revenue team make decisions based on CSV data.

    Instructions:
    - First, review the column names and sample rows provided below.
    - Answer the user's business question based on the full dataset `df`.
    - Perform data exploration as needed (e.g., groupby, value_counts, aggregations).
    - When providing insights, include quantitative evidence (e.g., percentages, totals).
    - If helpful, use Python pandas and matplotlib to perform calculations and plot charts.
    - DO NOT use plt.show().
    - Always explain your findings in clear, concise business language.
    - Always write in a way that supports business decisions: mention trends, patterns, comparisons.
    - Do NOT explain technical code unless asked. Focus on insights.
    - If the question cannot be answered with the data, explain why.
    - The **full dataset is already loaded as a DataFrame called `df`**, and should be used for all analysis and charting.
    - Below are just **sample rows to help you understand the structure**. **Do NOT use these for computation.**

    Here is the user's question:
    {payload.question}

    Here are a few rows from the uploaded CSV file:
    {sample_rows}
    """

    result = query_agent(df, full_prompt, file_id=payload.file_id)

    return {
        "result": result["answer"],
        "chart": result["chart"]
    }

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


