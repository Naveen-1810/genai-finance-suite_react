from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(db: Session = Depends(get_db)):
    incomes = db.query(models.Income).all()
    expenses = db.query(models.Expense).all()
    stocks = db.query(models.Stock).all()

    total_income = sum(i.amount for i in incomes)
    total_expenses = sum(e.amount for e in expenses)
    total_stock_pl = sum(s.pl for s in stocks)

    # Expense distribution by category (for pie chart)
    by_category: dict[str, float] = defaultdict(float)
    for e in expenses:
        by_category[e.category or "Uncategorized"] += e.amount
    expense_distribution = [{"category": k, "amount": v} for k, v in by_category.items()]

    # Stock performance by symbol (for bar chart)
    stock_performance = [{"symbol": s.symbol, "pl": s.pl} for s in stocks]

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_cash_flow": total_income - total_expenses,
        "total_stock_pl": total_stock_pl,
        "expense_distribution": expense_distribution,
        "stock_performance": stock_performance,
        "recent_income": [
            {"date": i.date, "source": i.source, "amount": i.amount}
            for i in sorted(incomes, key=lambda x: x.date, reverse=True)[:5]
        ],
        "recent_expenses": [
            {"date": e.date, "category": e.category, "amount": e.amount}
            for e in sorted(expenses, key=lambda x: x.date, reverse=True)[:5]
        ],
    }
