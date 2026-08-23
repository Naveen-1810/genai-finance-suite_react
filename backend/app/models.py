from sqlalchemy import Column, String, Float, Integer
from .database import Base


class Income(Base):
    __tablename__ = "income"
    id = Column(String, primary_key=True)
    date = Column(String)
    source = Column(String)
    amount = Column(Float)


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(String, primary_key=True)
    date = Column(String)
    category = Column(String)
    amount = Column(Float)
    note = Column(String)


class Stock(Base):
    __tablename__ = "stocks"
    id = Column(String, primary_key=True)
    date = Column(String)
    symbol = Column(String)
    qty = Column(Integer)
    buy_price = Column(Float)
    sell_price = Column(Float)
    pl = Column(Float)
