import re
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.AuthResponse)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    username = payload.username.strip()

    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(status_code=400, detail="Invalid email format.")
    if not username:
        raise HTTPException(status_code=400, detail="Username is required.")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in.",
        )

    # Check if this is the first registered user - if so, associate orphaned legacy data
    is_first_user = db.query(models.User).count() == 0

    user_id = uuid.uuid4().hex
    user = models.User(
        id=user_id,
        email=email,
        username=username,
        password_hash=hash_password(payload.password),
        gsheet_url="",
        created_at=datetime.now().isoformat(),
    )
    db.add(user)

    if is_first_user:
        # Link any legacy unassigned records to this first user
        db.query(models.Income).filter(models.Income.user_id.is_(None)).update({"user_id": user_id})
        db.query(models.Expense).filter(models.Expense.user_id.is_(None)).update({"user_id": user_id})
        db.query(models.Stock).filter(models.Stock.user_id.is_(None)).update({"user_id": user_id})

    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return {"token": token, "user": user}


@router.post("/login", response_model=schemas.AuthResponse)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(user.id)
    return {"token": token, "user": user}


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=schemas.UserOut)
def update_profile(
    payload: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.username is not None and payload.username.strip():
        current_user.username = payload.username.strip()
    if payload.gsheet_url is not None:
        current_user.gsheet_url = payload.gsheet_url.strip()

    db.commit()
    db.refresh(current_user)
    return current_user
