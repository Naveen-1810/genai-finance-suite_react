from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


def new_id() -> str:
    return datetime.now().strftime("%H%M%S%f")


def calc_pl(qty: int, buy_price: float, sell_price: float) -> float:
    return (sell_price - buy_price) * qty


@router.get("", response_model=list[schemas.StockOut])
def list_stocks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Stock)
        .filter(models.Stock.user_id == current_user.id)
        .order_by(models.Stock.date.desc())
        .all()
    )


@router.post("", response_model=schemas.StockOut)
def create_stock(
    payload: schemas.StockIn,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pl = calc_pl(payload.qty, payload.buy_price, payload.sell_price)
    row = models.Stock(
        id=new_id(),
        user_id=current_user.id,
        date=payload.date,
        symbol=payload.symbol.upper(),
        qty=payload.qty,
        buy_price=payload.buy_price,
        sell_price=payload.sell_price,
        pl=pl,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/{stock_id}", response_model=schemas.StockOut)
def update_stock(
    stock_id: str,
    payload: schemas.StockIn,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = (
        db.query(models.Stock)
        .filter(models.Stock.id == stock_id, models.Stock.user_id == current_user.id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Stock entry not found")
    row.date = payload.date
    row.symbol = payload.symbol.upper()
    row.qty = payload.qty
    row.buy_price = payload.buy_price
    row.sell_price = payload.sell_price
    row.pl = calc_pl(payload.qty, payload.buy_price, payload.sell_price)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{stock_id}")
def delete_stock(
    stock_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = (
        db.query(models.Stock)
        .filter(models.Stock.id == stock_id, models.Stock.user_id == current_user.id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Stock entry not found")
    db.delete(row)
    db.commit()
    return {"deleted": stock_id}
