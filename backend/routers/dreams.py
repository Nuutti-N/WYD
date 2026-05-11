from sqlmodel import select
from fastapi import APIRouter, HTTPException, Depends
from backend.models import Dream
from backend.routers.users import get_current_user
from backend.database import Session, get_session

router = APIRouter()


@router.post("/category", tags=["dream"], summary="Choose your dream or just make to in free text it.")
async def choose_category(category: str, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    new_dream = Dream(user_id=current_user.id, category=category)
    session.add(new_dream)
    session.commit()
    session.refresh(new_dream)
    return new_dream


@router.post("/specific-items", tags=["dream"], summary="You can make free text/choose after when you choosed category")
async def specific_items(specific_items: list[str], session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    dream = session.exec(select(Dream).where(
        Dream.user_id == current_user.id)).first()
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    dream.specific_items = specific_items
    session.add(dream)
    session.commit()
    session.refresh(dream)
    return dream
