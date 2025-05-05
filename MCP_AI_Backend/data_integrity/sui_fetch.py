import requests
import redis
import json
import time
from datetime import datetime, timezone

# Initialize Redis Pub/Sub
redis_host = 'localhost'  # Redis server address
redis_port = 6379         # Redis server port
redis_channel = 'binance_data'  # Redis pub/sub channel name
r = redis.Redis(host=redis_host, port=redis_port)

# Function to fetch candlestick data for SUIUSDT
def fetch_candlesticks(symbol="SUIUSDT", interval="1m", limit=500):
    url = "https://api.binance.com/api/v3/klines"
    params = {
        "symbol": symbol,
        "interval": interval,
        "limit": limit
    }
    response = requests.get(url, params=params)
    data = response.json()

    # Parse the data into a useful format
    parsed = []
    for candle in data:
        parsed.append({
            'timestamp': datetime.fromtimestamp(candle[0] / 1000, timezone.utc).strftime('%Y-%m-%d %H:%M:%S'),
            'open': float(candle[1]),
            'high': float(candle[2]),
            'low': float(candle[3]),
            'close': float(candle[4]),
            'volume': float(candle[5]),
            'close_time': datetime.fromtimestamp(candle[6] / 1000, timezone.utc).strftime('%Y-%m-%d %H:%M:%S'),
            'quote_asset_volume': float(candle[7]),
            'number_of_trades': int(candle[8]),
            'taker_buy_base_asset_volume': float(candle[9]),
            'taker_buy_quote_asset_volume': float(candle[10]),
        })
    
    return parsed

# Function to fetch and publish data every minute
def initiate_publisher(symbol="SUIUSDT"):
    iteration = 0
    while True:
        iteration += 1
        # Fetch the last 500 candlesticks for SUIUSDT
        data = fetch_candlesticks(symbol=symbol, interval="1m", limit=500)
        print(f"Iteration {iteration}: Fetched {len(data)} candlesticks for {symbol}")
        # Create a data object with a timestamp indicating when this batch was fetched
        data_object = {
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "candlesticks": data  # This will contain all 500 candlesticks as a list
        }
        
        # Publish the entire batch of candlestick data as a single entity
        # print(f"Publishing data: {data_object}")
        r.publish(redis_channel, json.dumps(data_object))
        
        # Sleep for 1 minute before fetching data again
        time.sleep(5)