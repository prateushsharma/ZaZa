import subprocess
from pathlib import Path
import json

async def kill_code(uid: str, password: str) -> dict:
    """Forcefully terminate the trading code terminal"""
    window_title = f"{uid}_{password}"
    
    try:
        # Force kill the terminal window
        subprocess.call(
            f'taskkill /fi "WindowTitle eq {window_title}*" /f >nul 2>&1', 
            shell=True
        )

        with open(Path(f"./user_assets/{uid}/code_sync.json"), "r") as json_file:
            data = json.load(json_file)
        
        data["code_updated"] = False

        with open(Path(f"./user_assets/{uid}/code_sync.json"), "w") as json_file:
            json.dump(data, json_file, indent=4)

        return {"status": "success", "message": "Process terminated"}
    except Exception as e:
        return {"status": "error", "message": str(e)}