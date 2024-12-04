import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    # Connect to PostgreSQL server
    conn = psycopg2.connect(
        dbname='postgres',
        user='postgres',
        password='postgres',
        host='localhost'
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    # Create a cursor object
    cursor = conn.cursor()
    
    # Create database if it doesn't exist
    cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'doc_control'")
    exists = cursor.fetchone()
    if not exists:
        cursor.execute('CREATE DATABASE doc_control')
        print("Database 'doc_control' created successfully")
    else:
        print("Database 'doc_control' already exists")
    
    # Close the cursor and connection
    cursor.close()
    conn.close()

if __name__ == "__main__":
    create_database()
