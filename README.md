# AI Revenue Assistant Demo

This is a technical demo project that showcases how an AI agent can analyze structured CRM data and answer natural language business questions.

The goal is to simulate an "AI-powered revenue co-worker" for CROs and sales teams, capable of deriving insights from CSV-based data exports.

## Features

- Upload structured CSV files (e.g. CRM, pipeline, churn data)
- Ask natural language questions (e.g. “Which customers may churn?”)
- LLM agent generates insights using pandas (LangChain + OpenAI)
- Returns concise answers and optional chart output (matplotlib)
- Backend built with FastAPI, front-end powered by Next.js

## How to Run

### Prerequisites

- Python 3.9+
- Node.js 18+ (for optional frontend)
- OpenAI API Key

### 1. Backend (FastAPI)

```bash
# Install dependencies
pip install -r requirements.txt

# Set OpenAI key
echo "OPENAI_API_KEY=your-key-here" > .env

# Run API
uvicorn app.main:app --reload
API will be available at http://localhost:8000



### 1. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev

Frontend runs at http://localhost:3000

