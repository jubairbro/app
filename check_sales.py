from sqlalchemy import create_engine, text
engine = create_engine("sqlite:///data/database.sqlite")
with engine.connect() as conn:
    conn.execute(text("CREATE TABLE IF NOT EXISTS test_sales2 (id TEXT)"))
    conn.execute(text("INSERT INTO test_sales2 VALUES ('INV-123'), ('0001'), ('0002'), ('0010')"))
    res = conn.execute(text("SELECT MAX(CAST(id AS INTEGER)) FROM test_sales2 WHERE id NOT GLOB '*[^0-9]*'")).fetchone()
    print(res)
