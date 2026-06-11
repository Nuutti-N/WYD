from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from backend.routers.users import get_current_user
from backend.database import Session, get_session
from backend.models import Path, PathIn, PathPurchase
from backend.embedding import embed

router = APIRouter()


@router.post("/paths", tags=["paths"], summary="")
async def create_paths(body: PathIn, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    new_path = Path(title=body.title, description=body.description,
                    category=body.category, price=body.price, creator_id=current_user.id)
    text = body.title + " " + body.description + " " + body.category
    new_path.embedding = embed(text)
    session.add(new_path)
    session.commit()
    session.refresh(new_path)
    return new_path


@router.get("/paths", tags=["paths"])
async def list_paths(session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    path = session.exec(select(Path)).all()
    if not path:
        raise HTTPException(status_code=404, detail="[]")
    return path


@router.get("/paths/mine", tags=["paths"])
async def mine_paths(session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    mine_paths = session.exec(select(Path).where(
        Path.creator_id == current_user.id)).all()
    return mine_paths


@router.get("/paths/{id}", tags=["paths"])
async def paths_id(id: int, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    path = session.exec(select(Path).where(Path.id == id)).first()
    if not path:
        raise HTTPException(status_code=404, detail="Nothing found")
    return path


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
    purchase = PathPurchase(user_id=current_user.id, path_id=id)
    session.add(purchase)
    session.commit()
    return {"message": "Path unlocked"}
