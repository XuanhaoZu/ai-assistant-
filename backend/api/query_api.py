from fastapi import APIRouter, Query, Body
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


# @router.post("/multi-query")
# async def query_multi_data1(
#     question: str = Body(...),
#     file_ids: list[str] = Body(...)
# ):
#     dfs = []
#     previews = []
#     for fid in file_ids:
#         file_path = os.path.join(DATA_DIR, fid)
#         if not os.path.isfile(file_path):
#             return {"error": f"File {fid} not found"}
#         df = pd.read_csv(file_path)
#         dfs.append(df)
#         previews.append(df.head(3).to_string(index=False))

#     preview_section = "\n\n".join(
#         f"Sample from {fid}:\n{preview}"
#         for fid, preview in zip(file_ids, previews)
#     )

#     full_prompt = f"""
#     You are a senior revenue analyst. You have access to the following datasets:

#     {preview_section}

#     Answer the question based on all the data. You may merge, compare, or analyze trends across files as needed.

#     Question:
#     {question}
#     """

#     from agent import create_custom_agent, refine_answer
#     combined_agent = create_custom_agent(dfs, "+".join(file_ids))
#     result = combined_agent.invoke({"input": full_prompt})
#     answer = result["output"] if isinstance(result, dict) else result
#     refined = refine_answer(answer)
#     return {"result": refined}


@router.post("/multi-query")
async def query_multi_data(
    question: str = Body(...),
    file_ids: list[str] = Body(...)
):
    dfs = []
    previews = []

    for fid in file_ids:
        file_path = os.path.join(DATA_DIR, fid)
        if not os.path.isfile(file_path):
            return {"error": f"File {fid} not found"}
        df = pd.read_csv(file_path)
        dfs.append(df)
        previews.append(df.head(3).to_string(index=False))

    preview_section = "\n\n".join(
        f"df{i} (from {fid}):\n{preview}"
        for i, (fid, preview) in enumerate(zip(file_ids, previews))
    )

    df_info = "\n".join(
        f"- df{i}: loaded from `{fid}`"
        for i, fid in enumerate(file_ids)
    )

    full_prompt = f"""
You are a senior revenue analyst.

The following pandas DataFrames are already loaded into memory and available for use:

{df_info}

Do not use read_csv or attempt to load any files. Use df0, df1, etc. directly.

Here are a few preview rows to help you understand the structure:

{preview_section}

Question:
{question}
    """

    from agent import create_custom_agent, refine_answer

    df_map = {f"df{i}": df for i, df in enumerate(dfs)}
    combined_agent = create_custom_agent(df_map, "+".join(file_ids))
    result = combined_agent.invoke({"input": full_prompt})
    answer = result["output"] if isinstance(result, dict) else result
    refined = refine_answer(answer)

    return {"result": refined}
