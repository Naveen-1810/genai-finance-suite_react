from sqlalchemy import Column, String, Float, Integer, ForeignKey
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    gsheet_url = Column(String, default="", nullable=True)
    created_at = Column(String, nullable=True)


class Income(Base):
    __tablename__ = "income"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=True)
    date = Column(String)
    source = Column(String)
    amount = Column(Float)


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=True)
    date = Column(String)
    category = Column(String)
    amount = Column(Float)
    note = Column(String)


class Stock(Base):
    __tablename__ = "stocks"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=True)
    date = Column(String)
    symbol = Column(String)
    qty = Column(Integer)
    buy_price = Column(Float)
    sell_price = Column(Float)
    pl = Column(Float)
