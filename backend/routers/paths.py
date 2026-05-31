from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from backend.routers.users import get_current_user
from backend.database import Session, get_session
from backend.models import Path, PathIn

router = APIRouter()


@router.post("/paths", tags=["paths"], summary="")
async def create_paths(body: PathIn, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    new_path = Path(title=body.title, description=body.description,
                    category=body.category, price=body.price, creator_id=current_user.id)
    session.add(new_path)
    session.commit()
    session.refresh(new_path)
    return new_path
