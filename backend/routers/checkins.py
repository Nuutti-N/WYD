from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlmodel import select
from backend.models import Checkin, Dream, StatsOut
from backend.routers.users import get_current_user
from backend.database import Session, get_session
from backend.supabase_client import supabase
from datetime import date, timedelta
from uuid import uuid4
import os

router = APIRouter()


@router.post("/checkins", tags=["checkins"], summary="endpoint idea to users can add hours, text and a proof photo.")
async def add_logs(
    hours: float = Form(...),
    note: str | None = Form(None),
    proof: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    dream = session.exec(select(Dream).where(
        Dream.user_id == current_user.id)).first()
    if not dream:
        raise HTTPException(status_code=404, detail="Not found")

    # Upload the proof photo to Supabase Storage (bucket: "proofs").
    file_bytes = await proof.read()
    ext = os.path.splitext(proof.filename or "")[1] or ".jpg"
    key = f"{current_user.id}/{uuid4().hex}{ext}"
    supabase.storage.from_("proofs").upload(
        key, file_bytes, {"content-type": proof.content_type or "image/jpeg"})
    proof_url = supabase.storage.from_("proofs").get_public_url(key)

    log_information = session.exec(select(Checkin).where(
        Checkin.user_id == current_user.id, Checkin.created_day == date.today())).first()
    if not log_information and hours >= 0.33:
        if current_user.last_checkin_date == date.today() - timedelta(days=1):
            current_user.streak += 1
        else:
            current_user.streak = 1
        current_user.last_checkin_date = date.today()
    xp_earned = hours * (1 + current_user.streak * 0.1)
    new_checkin = Checkin(user_id=current_user.id, dream_id=dream.id, hours=hours,
                          note=note, xp_earned=xp_earned, proof_url=proof_url)
    current_user.xp += xp_earned
    session.add(current_user)
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
    xp_current_level = thresholds[level - 1]
    xp_next_level = thresholds[level]
    all_checkins = session.exec(select(Checkin).where(
        Checkin.user_id == current_user.id)).all()
    total_hours = sum(checkin.hours for checkin in all_checkins)
    if current_user.last_checkin_date == date.today() - timedelta(days=1) or current_user.last_checkin_date == date.today():
        streak = current_user.streak
    else:
        streak = 0
    return {
        "streak": streak,
        "xp": current_user.xp,
        "level": level,
        "hours": total_hours,
        "xp_current_level": xp_current_level,
        "xp_next_level": xp_next_level,
    }
