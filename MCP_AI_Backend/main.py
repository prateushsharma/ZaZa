from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from fastapi.responses import StreamingResponse
import json
import uvicorn
import asyncio
from server_integrity.assign_loc import create_user
from server_integrity.update_loc import update_user
from server_integrity.deploy_loc import graph_to_code
from server_integrity.fetch_loc import fetch_user_data
from server_integrity.clone_loc import clone_code
from server_integrity.delete_loc import delete_asset
from data_integrity.sui_fetch import initiate_publisher
from redis_docker_engine.setup_redis import setup_docker_redis_engine
from user_runtime.reqm_install import handle_req_install
from user_runtime.reqm_import import handle_req_import
# from user_runtime.code_exec import exec_code
from user_runtime.fin_deploy import deploy_code
from user_runtime.stop_exec import kill_code
import threading
import time

app = FastAPI()

# Allow all CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CompileRequest(BaseModel):
    password: str

# /compile endpoint — fully async
@app.post("/get_uid")
async def compile_code(request: CompileRequest):
    output = await create_user(request.password)
    return output

class UpdateRequest(BaseModel):
    uid: str
    password: str
    code: dict
    @field_validator('code')
    def validate_code_is_json(cls, v):
        # If `v` is a string, try to parse it into a Python dictionary
        if isinstance(v, str):
            try:
                # Attempt to load the string as JSON (convert to dict)
                v = json.loads(v)
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON format: {e}")
        elif not isinstance(v, dict):
            # If it's not a string or a dict, raise an error
            raise ValueError("Code must be a valid JSON object (dictionary).")
        return v

@app.post("/update")
async def update_code(request: UpdateRequest):
    output = await update_user(request.uid, request.password, request.code)
    return output

class DeployRequest(BaseModel):
    uid: str
    password: str

@app.post("/deploy")
async def deploy_code_from_graph(request: Request):
    data = await request.json()
    req = DeployRequest(uid=data["uid"], password=data["password"])

    async def stream():
        yield "Initiating graph to code conversion...\n"
        output = await graph_to_code(req.uid, req.password)
        if output.get("status") != "success":
            yield f"Error in graph to code conversion: {output.get('message')}\n"
            return
        yield "Graph to code conversion complete.\n"

        yield "Installing dependencies...\n"
        output = await handle_req_install(req.uid, req.password)
        if output.get("status") != "success":
            yield f"Error in installing dependencies: {output.get('message')}\n"
            return
        yield "Dependencies successfully installed.\n"

        yield "Checking import compatibility...\n"
        output = await handle_req_import(req.uid, req.password)
        if output.get("status") != "success":
            yield f"Error in checking imports: {output.get('message')}\n"
            return
        yield "Imports successfully compiled.\n"

        yield "Initiating code execution...\n"
        output = await deploy_code(req.uid, req.password)
        if output.get("status") != "success":
            yield f"Error in finalizing deployment: {output.get('message')}\n"
            return
        yield "Code has been successfully executed and deployed.\n"

    return StreamingResponse(stream(), media_type="text/plain")

@app.post("/stop_execution")
async def stop_execution(request: DeployRequest):
    output = await kill_code(request.uid, request.password)
    return output

class FetchRequest(BaseModel):
    password: str

@app.post("/fetch_data")
async def fetch_data(request: FetchRequest):
    output = await fetch_user_data(request.password)
    return output

class CloneRequest(BaseModel):
    uid_from: str
    password_from: str
    password_to: str

@app.post("/clone")
async def clone_asset(request: CloneRequest):
    gen_uid = await create_user(request.password_to)
    uid_to = gen_uid["uid"]
    output = await clone_code(uid_to, request.password_to, request.uid_from, request.password_from)
    return output

@app.post("/delete")
async def delete_data(request: DeployRequest):
    output = await delete_asset(request.uid, request.password)
    return output

# Function to start the WebSocket in a separate daemon thread
def initiate_data_fetch(symbol="SUIUSDT"):
    def thread_target():
        loop = asyncio.new_event_loop()  # Create a new event loop for the thread
        asyncio.set_event_loop(loop)  # Set this loop for the thread
        loop.run_until_complete(initiate_publisher(symbol))

    # Create and start the thread as a daemon (it will stop automatically when the main program ends)
    websocket_thread = threading.Thread(target=thread_target, daemon=True)
    websocket_thread.start()
    print(f"Started WebSocket data fetch in a background thread for {symbol}")

# Run the app
if __name__ == "__main__":
    print("Starting the FastAPI server...")
    setup_docker_redis_engine()
    initiate_data_fetch(symbol="SUIUSDT") # Uncomment this line to start the WebSocket data fetch
    print("Initialized Server")
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
