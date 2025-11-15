# MonoFrame Studio - API

FastAPI backend for MonoFrame Studio.

## Getting Started

### Setup Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Run Development Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000)

API documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

## Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check (returns `{"status": "ok"}`)

## Tech Stack

- FastAPI
- Python 3.10+
- Uvicorn
- Pydantic
