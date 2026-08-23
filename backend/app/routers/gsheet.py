import os
import re
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/gsheet", tags=["gsheet"])


@router.get("/status")
def gsheet_status():
    path = os.getenv("GOOGLE_CREDENTIALS_PATH")
    connected = bool(path and os.path.exists(path))
    return {"read_write_active": connected}


@router.post("/sync")
def sync_gsheet(payload: schemas.GsheetSyncRequest, db: Session = Depends(get_db)):
    """Pulls Income / Expenses tabs from a Google Sheet into the local DB.
    Requires GOOGLE_CREDENTIALS_PATH to point at a service-account JSON
    that has been shared access to the target sheet."""
    try:
        import gspread
    except ImportError:
        raise HTTPException(status_code=500, detail="gspread is not installed")

    creds_path = os.getenv("GOOGLE_CREDENTIALS_PATH")
    if not creds_path or not os.path.exists(creds_path):
        raise HTTPException(
            status_code=400,
            detail="GOOGLE_CREDENTIALS_PATH not set or file missing. "
                   "Sync needs a Google service account JSON (see backend/.env.example).",
        )

    match = re.search(r"/d/([a-zA-Z0-9-_]+)", payload.url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid Google Sheet URL format")

    spreadsheet_id = match.group(1)
    client = gspread.service_account(filename=creds_path)

    try:
        sh = client.open_by_key(spreadsheet_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not open sheet: {e}")

    def read_tab(*names):
        for name in names:
            try:
                ws = sh.worksheet(name)
                return ws.get_all_records()
            except Exception:
                continue
        return []

    inc_records = read_tab("Income", "income")
    exp_records = read_tab("Expenses", "expenses")

    synced = {"income": 0, "expenses": 0}

    for rec in inc_records:
        keys = {k.lower().strip(): v for k, v in rec.items()}
        if "source" not in keys or "amount" not in keys:
            continue
        row = models.Income(
            id=datetime.now().strftime("%H%M%S%f"),
            date=str(keys.get("date", "")),
            source=str(keys.get("source", "")),
            amount=float(keys.get("amount", 0) or 0),
        )
        db.add(row)
        synced["income"] += 1

    for rec in exp_records:
        keys = {k.lower().strip(): v for k, v in rec.items()}
        if "category" not in keys or "amount" not in keys:
            continue
        row = models.Expense(
            id=datetime.now().strftime("%H%M%S%f"),
            date=str(keys.get("date", "")),
            category=str(keys.get("category", "")),
            amount=float(keys.get("amount", 0) or 0),
            note=str(keys.get("note", "")),
        )
        db.add(row)
        synced["expenses"] += 1

    db.commit()
    return {"synced": synced}
