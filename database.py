import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

DATABASE_URL = (
    f"postgresql+psycopg2://{USER}:{PASSWORD}"
    f"@{HOST}:{PORT}/{DBNAME}?sslmode=require"
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Prueba de conexión
if __name__ == "__main__":
    try:
        with engine.connect() as connection:
            print("Conexion exitosa con Supabase")
    except Exception as e:
        print("Error de conexion con Supabase:")
        print(e)