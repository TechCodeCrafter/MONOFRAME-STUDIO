"""
MonoFrame Studio API
FastAPI backend for cinematic AI video editing
"""

from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

app = FastAPI(
    title="MonoFrame Studio API",
    description="Cinematic AI video studio API - auto-detects the best moments, generates edits, and exports creator-ready clips",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Models
class EmailSignup(BaseModel):
    email: EmailStr
    source: Optional[str] = "landing_page"


class EmailSignupResponse(BaseModel):
    success: bool
    message: str
    email: str


# In-memory storage (replace with database in production)
email_signups = []


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to MonoFrame Studio API",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}


@app.post("/api/waitlist", response_model=EmailSignupResponse)
async def join_waitlist(signup: EmailSignup):
    """
    Add email to waitlist for early access
    """
    # Check if email already exists
    if any(entry["email"] == signup.email for entry in email_signups):
        raise HTTPException(status_code=400, detail="Email already registered")

    # Store email (in production, save to database)
    email_signups.append(
        {
            "email": signup.email,
            "source": signup.source,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )

    return EmailSignupResponse(
        success=True,
        message="Successfully joined the waitlist!",
        email=signup.email,
    )


@app.get("/api/waitlist/count")
async def waitlist_count():
    """Get total number of waitlist signups"""
    return {"count": len(email_signups), "status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

