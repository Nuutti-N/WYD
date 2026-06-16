from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy import func, or_
from backend.routers.users import get_current_user
from backend.database import Session, get_session
from backend.models import Path, PathIn, PathPurchase, User, Checkin

router = APIRouter()


def enrolled_counts(session: Session) -> dict[int, int]:
    """How many people enrolled in each path (one grouped query, no N+1)."""
    rows = session.exec(
        select(PathPurchase.path_id, func.count())
        .group_by(PathPurchase.path_id)
    ).all()
    return {path_id: count for path_id, count in rows}


def serialize_paths(paths: list[Path], session: Session) -> list[dict]:
    """Turn paths into response dicts with enrolled count + mentor proof.

    Mentor proof is the CREATOR's real stats: their streak + total logged hours.
    That's the whole point of a path marketplace — the proof someone actually
    walked the path. Each dict gets mentor_name / mentor_streak / mentor_hours.
    """
    counts = enrolled_counts(session)

    creator_ids = {p.creator_id for p in paths}
    users: dict[int, User] = {}
    hours_map: dict[int, float] = {}
    if creator_ids:
        user_rows = session.exec(
            select(User).where(User.id.in_(creator_ids))).all()
        users = {u.id: u for u in user_rows}
        hour_rows = session.exec(
            select(Checkin.user_id, func.sum(Checkin.hours))
            .where(Checkin.user_id.in_(creator_ids))
            .group_by(Checkin.user_id)
        ).all()
        hours_map = {uid: total for uid, total in hour_rows}

    out = []
    for p in paths:
        data = p.model_dump()
        data["enrolled"] = counts.get(p.id, 0)
        u = users.get(p.creator_id)
        if u:
            data["mentor_name"] = u.username or u.full_name or u.email.split(
                "@")[0]
        else:
            data["mentor_name"] = "Mentor"
        data["mentor_streak"] = u.streak if u else 0
        data["mentor_hours"] = round(hours_map.get(p.creator_id, 0) or 0)
        out.append(data)
    return out


@router.post("/paths", tags=["paths"], summary="Create a path / roadmap")
async def create_paths(body: PathIn, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    steps = [s.model_dump() for s in body.steps]
    total_hours = round(sum(s["hours"] for s in steps)) if steps else None
    new_path = Path(
        title=body.title,
        description=body.description,
        category=body.category,
        price=body.price,
        creator_id=current_user.id,
        difficulty=body.difficulty,
        total_hours=total_hours,
        achievements=body.achievements,
        prerequisites=body.prerequisites,
        steps=steps,
    )
    session.add(new_path)
    session.commit()
    session.refresh(new_path)
    return serialize_paths([new_path], session)[0]


@router.get("/paths/search", tags=["paths"])
async def search_paths(q: str, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    like = f"%{q}%"
    results = session.exec(
        select(Path).where(
            or_(
                Path.title.ilike(like),
                Path.description.ilike(like),
                Path.category.ilike(like),
            )
        )
    ).all()
    return serialize_paths(results, session)


@router.get("/paths", tags=["paths"])
async def list_paths(session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    paths = session.exec(select(Path)).all()
    return serialize_paths(paths, session)


@router.get("/paths/mine", tags=["paths"])
async def mine_paths(session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    paths = session.exec(select(Path).where(
        Path.creator_id == current_user.id)).all()
    return serialize_paths(paths, session)


@router.get("/paths/owned", tags=["paths"], summary="Path ids the current user has unlocked")
async def owned_paths(session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    rows = session.exec(select(PathPurchase.path_id).where(
        PathPurchase.user_id == current_user.id)).all()
    return rows


@router.get("/paths/active", tags=["paths"], summary="The user's current roadmap + progress for the dashboard")
async def active_path(session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    # "active" = the most recently enrolled path. Simple, no extra column needed.
    purchase = session.exec(
        select(PathPurchase)
        .where(PathPurchase.user_id == current_user.id)
        .order_by(PathPurchase.purchased_at.desc())
    ).first()
    if not purchase:
        return None
    path = session.exec(select(Path).where(Path.id == purchase.path_id)).first()
    if not path:
        return None
    data = serialize_paths([path], session)[0]
    data["completed_steps"] = purchase.completed_steps
    data["completed"] = len(purchase.completed_steps)
    data["total"] = len(path.steps or [])
    return data


@router.get("/paths/{id}", tags=["paths"])
async def paths_id(id: int, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    path = session.exec(select(Path).where(Path.id == id)).first()
    if not path:
        raise HTTPException(status_code=404, detail="Nothing found")
    data = serialize_paths([path], session)[0]
    # if this user enrolled, tell the frontend which steps they've checked off
    purchase = session.exec(select(PathPurchase).where(
        PathPurchase.user_id == current_user.id, PathPurchase.path_id == id)).first()
    data["completed_steps"] = purchase.completed_steps if purchase else []
    return data


@router.delete("/paths/{id}", tags=["paths"])
async def delete_path(id: int, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    path = session.exec(select(Path).where(Path.id == id)).first()
    if not path:
        raise HTTPException(status_code=404, detail="Path not found")
    if path.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your path")
    session.delete(path)
    session.commit()
    return {"message": "Path deleted"}


@router.post("/paths/{id}/buy", tags=["paths"])
async def buy_path(id: int, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    path = session.exec(select(Path).where(Path.id == id)).first()
    if not path:
        raise HTTPException(status_code=404, detail="Path not found")
    # don't charge / duplicate if they already unlocked it
    existing = session.exec(select(PathPurchase).where(
        PathPurchase.user_id == current_user.id, PathPurchase.path_id == id)).first()
    if existing:
        return {"message": "Already enrolled"}
    purchase = PathPurchase(user_id=current_user.id, path_id=id)
    session.add(purchase)
    session.commit()
    return {"message": "Path unlocked"}


@router.post("/paths/{id}/steps/{index}/toggle", tags=["paths"], summary="Check / uncheck a roadmap step")
async def toggle_step(id: int, index: int, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    purchase = session.exec(select(PathPurchase).where(
        PathPurchase.user_id == current_user.id, PathPurchase.path_id == id)).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Enroll in this path first")
    # rebuild a fresh list so SQLAlchemy notices the JSON column changed
    done = list(purchase.completed_steps)
    if index in done:
        done.remove(index)
    else:
        done.append(index)
    purchase.completed_steps = done
    session.add(purchase)
    session.commit()
    return {"completed_steps": done}
