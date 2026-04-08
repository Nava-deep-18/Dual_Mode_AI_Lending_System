import sqlite3

try:
    conn = sqlite3.connect('loans.db')
    cursor = conn.cursor()
    cursor.execute('DROP TABLE IF EXISTS loan_history')
    conn.commit()
    conn.close()
    print("Table dropped successfully! FastAPI reload will naturally recreate it.")
except Exception as e:
    print(f"Error dropping table: {e}")
