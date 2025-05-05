import sqlite3
import os
import json

async def check_and_sync_code(uid: str, code) -> bool:
    try:
        user_dir = os.path.join("./user_assets", uid)
        data_config_path = os.path.join(user_dir, "data_config.json")
        code_sync_path = os.path.join(user_dir, "code_sync.json")

        # Read data_config.json and compare the code
        with open(data_config_path, 'r') as f:
            current_code = json.load(f)

        if current_code == code:
            return False, 200

        # Set "code_updated" to False in code_sync.json
        with open(code_sync_path, 'r') as f:
            code_sync = json.load(f)

        code_sync["code_updated"] = False

        with open(code_sync_path, 'w') as f:
            json.dump(code_sync, f, indent=4)

        # Update data_config.json with the new code
        with open(data_config_path, 'w') as f:
            json.dump(code, f, indent=4)

        return True, 200

    except (FileNotFoundError, json.JSONDecodeError, KeyError, TypeError) as e:
        print(f"Error: {e}")
        return False, 500


async def update_user(uid: str, password: str, code):
    try:
        # Connect to the database
        conn = sqlite3.connect("./core_db/users.db")
        cursor = conn.cursor()

        # Use parameterized query to avoid SQL injection
        cursor.execute("SELECT user_password FROM users WHERE uid = ?", (uid,))
        rows = cursor.fetchall()

        if len(rows) == 0:
            return {
                "status": "error",
                "message": "UID doesn't exist, bad request",
                "code": 400  # HTTP 400 Bad Request
            }
        elif len(rows) > 1:
            return {
                "status": "error",
                "message": "Internal Server Error",
                "code": 500  # HTTP 500 Internal Server Error
            }
        else:
            stored_password = rows[0][0]
            if stored_password != password:
                return {
                    "status": "error",
                    "message": "Permission to access denied",
                    "code": 403  # HTTP 403 Forbidden
                }
            else:
                # Check and sync code
                code_updated, code_status = await check_and_sync_code(uid, code)
                if code_status != 200:
                    return {
                        "status": "error",
                        "message": "Internal Server Error",
                        "code": code_status
                    }
                return {
                    "status": "success",
                    "update": code_updated
                }

    except sqlite3.Error as e:
        return {
            "status": "error",
            "message": f"Database error: {e}",
            "code": 500
        }

    finally:
        if conn:
            conn.close()
