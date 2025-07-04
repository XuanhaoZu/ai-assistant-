# AI Revenue Assistant Demo

This is a technical demo project that showcases how an AI agent can analyze structured CRM data and answer natural language business questions.

The goal is to simulate an "AI-powered revenue co-worker" for CROs and sales teams, capable of deriving insights from CSV-based data exports.

## Features

- Ask natural language questions
- LLM agent generates insights using pandas (LangChain + OpenAI)
- Returns concise answers and optional chart output
- Few-shot examples guide structured reasoning over CRM-like data
- Post-response refinement improves clarity and business relevance
- Supports lightweight agent memory for contextual follow-ups
- Backend built with FastAPI, front-end powered by Next.js

## How to Run

### Prerequisites

- Python 3.10+
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
```
API will be available at http://localhost:8000

### 2. Frontend (Next.js, optional)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:3000

### Example Questions
- *"What are the top 5 accounts by total opportunity value?"*
- *"Which titles show up most frequently as primary contacts on deals?"*
- *"Which accounts have the most potential for expansion?"*
- *"Show me the top 10 opportunities by value and their closing probability"*
- *"Who are our key decision makers in the technology sector?"*


### Future Directions
- Multi-user login and session-based storage

- File upload and persistent file history

- Agent memory and multi-turn chat context

- Visual dashboards with chart interactions

- Deeper Salesforce-style data modeling (Accounts, Opportunities, Activities)

- Self-updating next-step suggestions (workflow hint)

### License
MIT License

