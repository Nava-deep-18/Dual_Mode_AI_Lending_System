import sqlite3

try:
    conn = sqlite3.connect('loans.db')
    cursor = conn.cursor()
    # Drop in reverse dependency order (children first)
    cursor.execute('DROP TABLE IF EXISTS monthly_payments')
    cursor.execute('DROP TABLE IF EXISTS repayment_schedules')
    cursor.execute('DROP TABLE IF EXISTS loan_history')
    cursor.execute('DROP TABLE IF EXISTS users')
    conn.commit()
    conn.close()
    print("Database wiped successfully! FastAPI reload will naturally recreate all tables.")
except Exception as e:
    print(f"Error dropping tables: {e}")
