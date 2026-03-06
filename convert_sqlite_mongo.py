import sqlite3
import json

def export():
    conn = sqlite3.connect("data/database.sqlite")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    data = {}
    tables = ["users", "products", "customers", "sales", "sale_items", "expenses", "suppliers", "stock_logs"]
    
    for table in tables:
        try:
            cursor.execute(f"SELECT * FROM {table}")
            data[table] = [dict(row) for row in cursor.fetchall()]
        except sqlite3.OperationalError:
            pass # Table doesn't exist
            
    with open("data/backup.json", "w") as f:
        json.dump(data, f, indent=2)

export()
