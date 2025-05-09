import redis
import json
from datetime import datetime, timezone

def candle_generator(redis_host='localhost', redis_port=6379, channel='binance_data'):
    """
    Generator that yields candles in your specified format:
    {
        "candlesticks": [
            {"open": val, "close": val, ...}, 
            {...}, 
            ...
        ]
    }
    """
    r = redis.Redis(host=redis_host, port=redis_port)
    pubsub = r.pubsub()
    pubsub.subscribe(channel)
    
    try:
        while True:
            message = pubsub.get_message(timeout=0.5)
            
            if message and message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                    print(f"Received data at: {data['timestamp']}")  # Just print timestamp
                    
                    # Convert to your desired format
                    processed = {
                        "candlesticks": [
                            {
                                "open": float(candle[1]),
                                "high": float(candle[2]),
                                "low": float(candle[3]),
                                "close": float(candle[4]),
                                "volume": float(candle[5]),
                                "close_time": datetime.fromtimestamp(candle[6]/1000, timezone.utc).isoformat(),
                                "quote_volume": float(candle[7]),
                                "trades": int(candle[8]),
                                "taker_buy_base": float(candle[9]),
                                "taker_buy_quote": float(candle[10])
                            }
                            for candle in data['candlesticks']
                        ]
                    }
                    
                    yield processed
                    
                except Exception as e:
                    print(f"[ERROR] Processing message: {e}")
    finally:
        pubsub.close()

# Example usage
if __name__ == "__main__":
    for data in candle_generator():
        latest = data["candlesticks"][-1]  # Get most recent candle
        print(f"Latest close price: {latest['close']}")
        print(f"Volume: {latest['volume']}")
        print("---")