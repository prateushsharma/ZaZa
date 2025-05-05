import os
import json

async def deploy_user(uid, password):
    user_folder = f"./user_assets/{uid}"
    code_sync_path = os.path.join(user_folder, "code_sync.json")

    # Check if the user folder exists
    if not os.path.exists(user_folder):
        return {"status": "error", "message": "User folder does not exist", "code": 404}
    
    # Check if the code_sync.json file exists in the folder
    if not os.path.isfile(code_sync_path):
        return {"status": "error", "message": "code_sync.json file not found", "code": 404}
    
    # Read the code_sync.json file
    with open(code_sync_path, 'r') as file:
        code_sync_data = json.load(file)

    # Check if the "code_updated" field exists in the json and its value
    if code_sync_data.get("code_updated", False):
        return {"status": "error", "message": "The no code graph is already deployed and no changes are noticed", "code": 400}
    
    # Set "code_updated" to True and save the updated json back
    code_sync_data["code_updated"] = True

    with open(code_sync_path, 'w') as file:
        json.dump(code_sync_data, file, indent=4)

    return {"status": "success", "message": "Deployed successfully", "code": 200}
