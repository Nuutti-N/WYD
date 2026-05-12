from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select
from backend.models import CheckinIn, Checkin, Dream
from backend.routers.users import get_current_user
from backend.database import Session, get_session


router = APIRouter()


@router.post("/checkins", tags=["checkins"], summary="endpoint idea to users can add hours and text.")
async def add_logs(data: CheckinIn, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    dream = session.exec(select(Dream).where(
        Dream.user_id == current_user.id)).first()
    if not dream:
        raise HTTPException(status_code=404, detail="Not found")
    new_checkin = Checkin(user_id=current_user.id,
                          dream_id=dream.id, hours=data.hours, note=data.note)
    session.add(new_checkin)
    session.commit()
    session.refresh(new_checkin)
    return new_checkin
