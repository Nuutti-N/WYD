from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select
from backend.models import CheckinIn, Checkin, Dream, StatsOut
from backend.routers.users import get_current_user
from backend.database import Session, get_session
from datetime import date

router = APIRouter()


@router.post("/checkins", tags=["checkins"], summary="endpoint idea to users can add hours and text.")
async def add_logs(data: CheckinIn, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    dream = session.exec(select(Dream).where(
        Dream.user_id == current_user.id)).first()
    if not dream:
        raise HTTPException(status_code=404, detail="Not found")
    log_information = session.exec(select(Checkin).where(
        Checkin.user_id == current_user.id, Checkin.created_day == date.today())).first()
    if not log_information and data.hours >= 0.33:
        current_user.streak += 1
    new_checkin = Checkin(user_id=current_user.id,
                          dream_id=dream.id, hours=data.hours, note=data.note)
    session.add(new_checkin)
    session.commit()
    session.refresh(new_checkin)
    return new_checkin


@router.get("/checkins/stats", tags=["checkins"], summary="Get stats, what streak, what level, and how much you have xp")
async def checkins_stats(session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    thresholds = [0]
    cost = 50
    total = 0
    for _ in range(50):
        total += cost
        thresholds.append(total)
        cost += 50
    level = 0
    for threshold in thresholds:
        if current_user.xp >= threshold:
            level += 1
    return {
        "streak": current_user.streak,
        "xp": current_user.xp,
        "level": level
    }
