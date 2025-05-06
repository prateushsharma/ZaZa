import os
import json
import sys

sys.path.append('..')
from codegen_engine.graph_codegen import gen_code

async def graph_to_code(uid, password=None):
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

    # Copy the content of data_config.json and preprocess using map_json

    ### Here we will convert json to code, and then try to deploy it ###
    req, imp, code = gen_code()

    imp.append("\n\nprint(\"Hello World\")")

    print(code)

    req_path = os.path.join(user_folder, "requirements.txt")
    imp_path = os.path.join(user_folder, "initialise.py")
    code_path = os.path.join(user_folder, "trading_code.py")

    with open(req_path, 'w') as file:
        file.write("\n".join(req))

    # Write each import on a new line
    with open(imp_path, 'w') as file:
        file.write("\n".join(imp))

    # Write full code block directly
    with open(code_path, 'w') as file:
        file.write(code)

    return {"status": "success", "message": "Deployed successfully", "code": 200}