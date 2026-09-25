import sqlite3

# Connect to the database file (creates it if it doesn't exist)
conn = sqlite3.connect("mydatabase.db")
cursor = conn.cursor()

# Create the table if it doesn't already exist
cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY,
        name TEXT,
        age INTEGER,
        major TEXT
    )
""")

# Insert a row (example)
cursor.execute(
    "INSERT INTO students (name, age, major) VALUES (?, ?, ?)",
    ("Alex", 20, "Computer Science")
)

# Save the changes to the database file
conn.commit()

# Read back all rows to confirm it worked
cursor.execute("SELECT * FROM students")
rows = cursor.fetchall()
for row in rows:
    print(row)

# Close the connection when done
conn.close()