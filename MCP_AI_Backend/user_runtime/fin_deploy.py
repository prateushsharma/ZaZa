import subprocess
from pathlib import Path
import json

async def deploy_code(uid: str, password: str) -> dict:
    """Deploy trading code in a new terminal window (runs indefinitely)"""
    ftype = "trading_code.py"
    file_path = Path(f"./user_assets/{uid}/{ftype}")
    
    if not file_path.exists():
        return {"status": "error", "message": f"File {file_path} does not exist"}
    
    # Create the command sequence
    window_title = f"{uid}_{password}"
    commands = [
        f"title {window_title}",
        "call venv\\Scripts\\activate",
        f"python {file_path}",
    ]
    
    # Start the process in a new console (no waiting)
    subprocess.Popen(
        ["cmd", "/k", " && ".join(commands)],
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )
    
    with open(Path(f"./user_assets/{uid}/code_sync.json"), "r") as json_file:
        data = json.load(json_file)
    
    data["code_updated"] = True

    with open(Path(f"./user_assets/{uid}/code_sync.json"), "w") as json_file:
        json.dump(data, json_file, indent=4)
        
    return {"status": "success", "message": "deployed"}

