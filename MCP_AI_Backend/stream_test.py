from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import time
import io

app = FastAPI()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
import json
import json
import uvicorn
import asyncio
from server_integrity.assign_loc import create_user
from server_integrity.update_loc import update_user
# from server_integrity.deploy_loc import deploy_user

app = FastAPI()

# Allow all CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_responses():
    # Step 1: Send first chunk
    yield "Step 1: Starting the process\n"
    time.sleep(1)  # Simulate processing time
    # Step 2: Send second chunk
    yield "Step 2: Halfway through the process\n"
    time.sleep(1)  # Simulate more processing time
    # Step 3: Send third chunk
    yield "Step 3: Process completed\n"

@app.post("/process")
async def process_request():
    # Create a StreamingResponse that streams the data from generate_responses
    return StreamingResponse(generate_responses(), media_type="text/plain")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)
