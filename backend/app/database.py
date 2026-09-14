import os
import re
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "finance_pro.db")

# Read DATABASE_URL from environment (e.g. Supabase / PostgreSQL).
# If not provided, cleanly falls back to local SQLite finance_pro.db.
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Cloud providers (Supabase/Render) often supply "postgres://", which SQLAlchemy requires to be "postgresql://"
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

    # Strip Prisma-specific query params that psycopg2 rejects
    DATABASE_URL = re.sub(r"[?&]pgbouncer=true", "", DATABASE_URL)

    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    engine = create_engine(
        f"sqlite:///{DB_PATH}",
        connect_args={"check_same_thread": False},
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def migrate_db():
    """Ensure all required tables and columns exist across SQLite and PostgreSQL."""
    # Ensure models are imported so Base.metadata knows about all tables
    from . import models
    Base.metadata.create_all(bind=engine)

    # Safely ensure user_id column exists on income, expenses, and stocks tables
    try:
        inspector = inspect(engine)
        for table in ["income", "expenses", "stocks"]:
            if inspector.has_table(table):
                existing_cols = [c["name"] for c in inspector.get_columns(table)]
                if "user_id" not in existing_cols:
                    with engine.begin() as conn:
                        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN user_id VARCHAR"))
    except Exception as e:
        print(f"Database migration notice: {e}")
