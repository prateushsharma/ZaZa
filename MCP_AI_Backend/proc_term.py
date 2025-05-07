import sqlite3
import os

# Path to the database
db_path = "./core_db/users.db"

# Check if the database exists
if not os.path.exists(db_path):
    print("Database file not found at the specified path.")
else:
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Execute the SQL command to drop the table
        cursor.execute("DROP TABLE IF EXISTS pid_data")

        # Commit the changes and close the connection
        conn.commit()
        print("Table 'pid_data' has been deleted (if it existed).")

    except sqlite3.Error as e:
        print(f"An error occurred: {e}")

    finally:
        # Always close the connection
        conn.close()
