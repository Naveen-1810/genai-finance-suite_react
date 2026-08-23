from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/income", tags=["income"])


def new_id() -> str:
    # Same id scheme as the original Streamlit app (HHMMSS string)
    return datetime.now().strftime("%H%M%S%f")


@router.get("", response_model=list[schemas.IncomeOut])
def list_income(db: Session = Depends(get_db)):
    return db.query(models.Income).order_by(models.Income.date.desc()).all()


@router.post("", response_model=schemas.IncomeOut)
def create_income(payload: schemas.IncomeIn, db: Session = Depends(get_db)):
    row = models.Income(id=new_id(), date=payload.date, source=payload.source, amount=payload.amount)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/{income_id}", response_model=schemas.IncomeOut)
def update_income(income_id: str, payload: schemas.IncomeIn, db: Session = Depends(get_db)):
    row = db.query(models.Income).filter(models.Income.id == income_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Income entry not found")
    row.date, row.source, row.amount = payload.date, payload.source, payload.amount
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{income_id}")
def delete_income(income_id: str, db: Session = Depends(get_db)):
    row = db.query(models.Income).filter(models.Income.id == income_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Income entry not found")
    db.delete(row)
    db.commit()
    return {"deleted": income_id}
