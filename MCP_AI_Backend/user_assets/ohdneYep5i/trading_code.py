import pandas as pd


import os
import redis
import json
import requests
import time
from pydantic import BaseModel

def ensure_json(wallet):
    # Check if wallet is a dictionary
    if isinstance(wallet, dict):
        # If it's a dictionary, convert it to JSON string
        wallet_json = json.dumps(wallet, indent=2)
        print("Converted to JSON")
        # print(wallet_json)
        return wallet_json  # Return the JSON string
    elif isinstance(wallet, str):
        # If it's already a string (possibly JSON), skip
        try:
            # Try parsing the JSON string to verify if it's valid JSON
            json.loads(wallet)
            print("Already in JSON format, no conversion needed.")
            return wallet  # It's already a valid JSON string, return as-is
        except json.JSONDecodeError:
            # If it's a string but not valid JSON
            print("String is not valid JSON.")
            return None  # or handle error as needed
    else:
        print("Wallet is neither a dictionary nor a JSON string.")
        return None  # Handle the case where it's neither a dict nor a JSON string

# Define the Wallet and SwapRequest models using Pydantic
class Wallet(BaseModel):
    address: str
    privateKey: dict
    secretKey: str

class SwapRequest(BaseModel):
    wallet: Wallet
    fromCoin: str
    toCoin: str

# Function to call the /swap endpoint using requests
def swap(wallet, from_coin, to_coin):
    url = "http://localhost:5000/swap"
    
    # Prepare the payload for the swap request
    swap_request = SwapRequest(
        wallet=wallet,  # Pass the wallet object
        fromCoin=from_coin,
        toCoin=to_coin
    )
    
    # Convert the Pydantic model to a dictionary to send in the request
    swap_payload = swap_request.dict()  # This will serialize the model to a dictionary

    # Send the POST request to the /swap endpoint
    try:
        response = requests.post(url, json=swap_payload)
        response_json = response.json()

        if response.status_code == 200 and response_json.get("success", False):
            print(f"Swap successful: {response_json}")
            return response_json  # Return the response if success
        else:
            print(f"Swap failed, no change in status. Error: {response_json}")
            return None
    except Exception as e:
        print(f"Error during swap request: {e}")
        return None

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
    close_price = data['candlesticks'][-1]['close']
    if close_price == 3.25:
        decision_to_buy_or_sell = 'buy'
    elif close_price == 3.3:
        decision_to_buy_or_sell = 'sell'
    else:
        decision_to_buy_or_sell = 'hold'
    return decision_to_buy_or_sell

# Example usage
if __name__ == "__main__":
    wallet = {
  "address": "0x352425ab2c9cec336f16d6856d29cc0ce003b9f157285da951a86a8c6ce490dc",
  "privateKey": {
    "keypair": {
      "publicKey": {
        "0": 101,
        "1": 196,
        "2": 78,
        "3": 23,
        "4": 122,
        "5": 138,
        "6": 187,
        "7": 25,
        "8": 117,
        "9": 211,
        "10": 67,
        "11": 11,
        "12": 255,
        "13": 239,
        "14": 15,
        "15": 167,
        "16": 101,
        "17": 231,
        "18": 135,
        "19": 8,
        "20": 52,
        "21": 145,
        "22": 107,
        "23": 169,
        "24": 149,
        "25": 106,
        "26": 110,
        "27": 197,
        "28": 11,
        "29": 216,
        "30": 199,
        "31": 43
      },
      "secretKey": {
        "0": 208,
        "1": 0,
        "2": 66,
        "3": 168,
        "4": 84,
        "5": 164,
        "6": 10,
        "7": 231,
        "8": 77,
        "9": 249,
        "10": 140,
        "11": 113,
        "12": 99,
        "13": 195,
        "14": 12,
        "15": 85,
        "16": 78,
        "17": 31,
        "18": 51,
        "19": 116,
        "20": 156,
        "21": 248,
        "22": 64,
        "23": 101,
        "24": 158,
        "25": 111,
        "26": 127,
        "27": 101,
        "28": 70,
        "29": 101,
        "30": 127,
        "31": 49,
        "32": 101,
        "33": 196,
        "34": 78,
        "35": 23,
        "36": 122,
        "37": 138,
        "38": 187,
        "39": 25,
        "40": 117,
        "41": 211,
        "42": 67,
        "43": 11,
        "44": 255,
        "45": 239,
        "46": 15,
        "47": 167,
        "48": 101,
        "49": 231,
        "50": 135,
        "51": 8,
        "52": 52,
        "53": 145,
        "54": 107,
        "55": 169,
        "56": 149,
        "57": 106,
        "58": 110,
        "59": 197,
        "60": 11,
        "61": 216,
        "62": 199,
        "63": 43
      }
    }
  },
  "secretKey": "suiprivkey1qrgqqs4g2jjq4e6dlxx8zc7rp325u8enwjw0ssr9nehh7e2xv4lnzzansjy"
}
    wallet = ensure_json(wallet)
    try:
        curr_status = "liq"
        for data in candle_generator():
            if not data.get('candlesticks'):
                continue
            
            decision = agent_code(data)
            print(f"Decision: {decision}")

            if decision == "buy" and curr_status == "liq":
                # Call swap from USDC to SUI (buy scenario)
                print("Initiating swap from USDC to SUI...")
                response = swap(wallet, "USDC", "SUI")
                if response: 
                    curr_status = "tkn"  # Change status to token
                    decision = "buy"
            
            elif decision == "buy" and curr_status == "tkn":
                # No action needed as already in tokens (tkn)
                decision = "hold"
            
            elif decision == "sell" and curr_status == "liq":
                # No action needed as already in liquidity (liq)
                decision = "hold"
            
            elif decision == "sell" and curr_status == "tkn":
                # Call swap from SUI to USDC (sell scenario)
                print("Initiating swap from SUI to USDC...")
                response = swap(wallet, "SUI", "USDC")
                if response: 
                    curr_status = "liq"  # Change status to liquidity
                    decision = "sell"
            
            log_file_path = "./user_assets/ohdneYep5i/data_log.txt"
            with open(log_file_path, 'a') as f:
                f.write(f"Decision: {decision} at {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
                print(f"Logged decision: {decision}")
            
            ### Main Tasks
            ## Call endpoint here to send swap request
            ## Also log the decision to data_log.txt
            ## Add get_logs endpoint to main.py
            # latest = data['candlesticks'][-1]
            # print(f"🕯️ Latest Candle - Close: {latest['close']}, Volume: {latest['volume']}")
            # print("---")
            
    except KeyboardInterrupt:
        print("\n🛑 Stopped by user")
    except Exception as e:
        print(f"💥 Fatal error: {e}")
