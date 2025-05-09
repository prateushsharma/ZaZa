import os
import json
import sys

sys.path.append('..')
from codegen_engine.graph_codegen import gen_code
from utils.json_to_map import map_json

placeholder_code = """
import redis
import json

def candle_generator(redis_host='localhost', redis_port=6379, channel='binance_data'):
    r = redis.Redis(host=redis_host, port=redis_port)
    pubsub = r.pubsub()
    pubsub.subscribe(channel)
    
    # Wait for subscription confirmation
    while True:
        msg = pubsub.get_message()
        if msg and msg['type'] == 'subscribe':
            print(f"✅ Successfully subscribed to {channel}")
            break
    
    try:
        while True:
            message = pubsub.get_message(timeout=0.5)
            
            if message and message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                    print(f"📩 Received batch at {data['timestamp']}")
                    
                    # Yield the data exactly as it comes from your publisher
                    yield data
                    
                except json.JSONDecodeError:
                    print("⚠️ Invalid JSON received")
                except KeyError as e:
                    print(f"⚠️ Missing expected field in data: {e}")
                except Exception as e:
                    print(f"⚠️ Error processing message: {e}")
                    
    finally:
        pubsub.close()
        print("🔴 Redis connection closed")

def agent_code(data):
<<>>
    return decision_to_buy_or_sell

# Example usage
if __name__ == "__main__":
    try:
        for data in candle_generator():
            if not data.get('candlesticks'):
                continue
            
            decision = agent_code(data)
            print(f"Buy: {decision}")
            # latest = data['candlesticks'][-1]
            # print(f"🕯️ Latest Candle - Close: {latest['close']}, Volume: {latest['volume']}")
            # print("---")
            
    except KeyboardInterrupt:
        print("\\n🛑 Stopped by user")
    except Exception as e:
        print(f"💥 Fatal error: {e}")
"""

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

    # Check if the "deploy_status" field exists in the json and its value
    if code_sync_data.get("deploy_status", False):
        return {"status": "error", "message": "The no code graph is already deployed and no changes are noticed", "code": 400}

    # Copy the content of data_config.json and preprocess using map_json
    with open(user_folder + "/data_config.json", 'r') as file:
        data_config = json.load(file)

    mapped_json = map_json(data_config)

    ### Here we will convert json to code, and then try to deploy it ###
    req, imp, code = gen_code(mapped_json)
    imp2 = imp
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

    indented_code = "\n".join("    " + line for line in code.splitlines())

    # Replace placeholder and combine
    final_code = "\n".join(imp2) + "\n\n" + placeholder_code.replace("<<>>", indented_code)

    with open(code_path, 'w', encoding='utf-8') as file:
        file.write(final_code)

    return {"status": "success", "message": "Deployed successfully", "code": 200}