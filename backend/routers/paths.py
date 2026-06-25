from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy import func, or_
from backend.routers.users import get_current_user
from backend.database import Session, get_session
from backend.models import Path, PathIn, PathPurchase, ProofIn, User, Checkin

router = APIRouter()


def enrolled_counts(session: Session) -> dict[int, int]:
    """How many people enrolled in each path (one grouped query, no N+1)."""
    rows = session.exec(
        select(PathPurchase.path_id, func.count())
        .group_by(PathPurchase.path_id)
    ).all()
    return {path_id: count for path_id, count in rows}


def finished_counts(paths: list[Path], session: Session) -> dict[int, int]:
    """How many enrollees PROVED every step of each path (true completion).

    "Finished" = an enrollment whose completed_steps covers all of the path's
    steps. This is what 'Popular' should rank by — real finishers, not sign-ups.
    """
    totals = {p.id: len(p.steps or []) for p in paths}
    if not totals:
        return {}
    rows = session.exec(
        select(PathPurchase.path_id, PathPurchase.completed_steps)
        .where(PathPurchase.path_id.in_(totals.keys()))
    ).all()
    finished = {pid: 0 for pid in totals}
    for path_id, completed in rows:
        total = totals.get(path_id, 0)
        if total > 0 and len(completed or []) >= total:
            finished[path_id] += 1
    return finished


def serialize_paths(paths: list[Path], session: Session) -> list[dict]:
    """Turn paths into response dicts with enrolled count + mentor proof.

    Mentor proof is the CREATOR's real stats: their streak + total logged hours.
    That's the whole point of a path marketplace — the proof someone actually
    walked the path. Each dict gets mentor_name / mentor_streak / mentor_hours.
    """
    counts = enrolled_counts(session)
    finished = finished_counts(paths, session)

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
        enrolled = counts.get(p.id, 0)
        data["enrolled"] = enrolled
        data["finished"] = finished.get(p.id, 0)
        data["completion_rate"] = round(
            data["finished"] / enrolled * 100) if enrolled else 0
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
    data["completed_steps"] = purchase.completed_steps or []
    data["step_proofs"] = purchase.step_proofs or {}
    data["completed"] = len(purchase.completed_steps or [])
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
    data["completed_steps"] = (purchase.completed_steps or []) if purchase else []
    data["step_proofs"] = (purchase.step_proofs or {}) if purchase else {}
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


@router.post("/paths/{id}/steps/{index}/proof", tags=["paths"], summary="Submit Proof of Work for a step (unlocks the next one)")
async def submit_proof(id: int, index: int, body: ProofIn, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    path = session.exec(select(Path).where(Path.id == id)).first()
    if not path:
        raise HTTPException(status_code=404, detail="Path not found")
    purchase = session.exec(select(PathPurchase).where(
        PathPurchase.user_id == current_user.id, PathPurchase.path_id == id)).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Enroll in this path first")

    total_steps = len(path.steps or [])
    if index < 0 or index >= total_steps:
        raise HTTPException(status_code=404, detail="No such step")

    url = body.proof_url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="Proof can't be empty")

    # Gating: every earlier step must already have a proof.
    proofs = dict(purchase.step_proofs or {})
    for j in range(index):
        if str(j) not in proofs:
            raise HTTPException(
                status_code=400, detail="Prove the earlier steps first")

    # Save the proof; completed = the set of proven step indices.
    proofs[str(index)] = url
    purchase.step_proofs = proofs
    purchase.completed_steps = sorted(int(k) for k in proofs)
    session.add(purchase)
    session.commit()
    return {"completed_steps": purchase.completed_steps, "step_proofs": proofs}


@router.get("/me/proofs", tags=["paths"], summary="The current user's public proof-of-work portfolio")
async def my_proofs(session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    purchases = session.exec(select(PathPurchase).where(
        PathPurchase.user_id == current_user.id)).all()
    purchases = [p for p in purchases if p.step_proofs]
    if not purchases:
        return []

    path_ids = {p.path_id for p in purchases}
    path_rows = session.exec(select(Path).where(Path.id.in_(path_ids))).all()
    paths = {p.id: p for p in path_rows}

    out = []
    for purchase in purchases:
        path = paths.get(purchase.path_id)
        if not path:
            continue
        steps = path.steps or []
        # newest-proven first: higher step index = further along
        for key in sorted(purchase.step_proofs, key=lambda k: int(k), reverse=True):
            i = int(key)
            step_title = steps[i]["title"] if i < len(steps) else f"Step {i + 1}"
            out.append({
                "path_id": path.id,
                "path_title": path.title,
                "step_index": i,
                "step_title": step_title,
                "proof_url": purchase.step_proofs[key],
            })
    return out
