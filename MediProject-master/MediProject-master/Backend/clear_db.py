"""
Clears ALL data from every table in medilocker.db while keeping the schema intact.
Run once: python clear_db.py
"""
import sqlite3

DB = "medilocker.db"

conn = sqlite3.connect(DB)
cur = conn.cursor()

# Get all user-created tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
tables = [r[0] for r in cur.fetchall()]

print(f"Found {len(tables)} tables: {tables}\n")

# Disable FK constraints temporarily so order doesn't matter
cur.execute("PRAGMA foreign_keys = OFF")

for table in tables:
    cur.execute(f"DELETE FROM {table}")
    print(f"  ✓ Cleared  {table}")

# Reset auto-increment counters if the sequence table exists
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'")
if cur.fetchone():
    cur.execute("DELETE FROM sqlite_sequence")
    print("  ✓ Reset    auto-increment counters")

cur.execute("PRAGMA foreign_keys = ON")
conn.commit()
conn.close()

print("\nAll data deleted. Schema preserved. Auto-increment counters reset.")
