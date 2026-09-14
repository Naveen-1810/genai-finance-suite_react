from typing import Optional
from pydantic import BaseModel, ConfigDict


# ==================== User & Auth Schemas ====================

class UserRegister(BaseModel):
    email: str
    username: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    username: str
    gsheet_url: Optional[str] = ""
    created_at: Optional[str] = ""


class UserUpdate(BaseModel):
    username: Optional[str] = None
    gsheet_url: Optional[str] = None


class AuthResponse(BaseModel):
    token: str
    user: UserOut


# ==================== Financial Records Schemas ====================

class IncomeIn(BaseModel):
    date: str
    source: str
    amount: float


class IncomeOut(IncomeIn):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: Optional[str] = None


class ExpenseIn(BaseModel):
    date: str
    category: str
    amount: float
    note: str = ""


class ExpenseOut(ExpenseIn):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: Optional[str] = None


class StockIn(BaseModel):
    date: str
    symbol: str
    qty: int
    buy_price: float
    sell_price: float = 0.0


class StockOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: Optional[str] = None
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
    url: Optional[str] = ""


class GsheetConfigUpdate(BaseModel):
    url: str
