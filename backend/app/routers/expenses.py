from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


def new_id() -> str:
    return datetime.now().strftime("%H%M%S%f")


@router.get("", response_model=list[schemas.ExpenseOut])
def list_expenses(db: Session = Depends(get_db)):
    return db.query(models.Expense).order_by(models.Expense.date.desc()).all()


@router.post("", response_model=schemas.ExpenseOut)
def create_expense(payload: schemas.ExpenseIn, db: Session = Depends(get_db)):
    row = models.Expense(
        id=new_id(), date=payload.date, category=payload.category,
        amount=payload.amount, note=payload.note,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/{expense_id}", response_model=schemas.ExpenseOut)
def update_expense(expense_id: str, payload: schemas.ExpenseIn, db: Session = Depends(get_db)):
    row = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Expense entry not found")
    row.date, row.category, row.amount, row.note = (
        payload.date, payload.category, payload.amount, payload.note,
    )
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{expense_id}")
def delete_expense(expense_id: str, db: Session = Depends(get_db)):
    row = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Expense entry not found")
    db.delete(row)
    db.commit()
    return {"deleted": expense_id}
