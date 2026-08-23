from pydantic import BaseModel, ConfigDict


class IncomeIn(BaseModel):
    date: str
    source: str
    amount: float


class IncomeOut(IncomeIn):
    model_config = ConfigDict(from_attributes=True)
    id: str


class ExpenseIn(BaseModel):
    date: str
    category: str
    amount: float
    note: str = ""


class ExpenseOut(ExpenseIn):
    model_config = ConfigDict(from_attributes=True)
    id: str


class StockIn(BaseModel):
    date: str
    symbol: str
    qty: int
    buy_price: float
    sell_price: float = 0.0


class StockOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    date: str
    symbol: str
    qty: int
    buy_price: float
    sell_price: float
    pl: float


class AdvisorQuery(BaseModel):
    question: str


class AdvisorResponse(BaseModel):
    answer: str


class GsheetSyncRequest(BaseModel):
    url: str
