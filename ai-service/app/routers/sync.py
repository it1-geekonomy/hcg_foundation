from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import verify_internal_api_key
from app.schemas.schemas import SyncEvent
from app.services import vector_store

router = APIRouter(prefix="/internal", tags=["sync"], dependencies=[Depends(verify_internal_api_key)])


@router.post("/sync")
def sync_event(event: SyncEvent, db: Session = Depends(get_db)):
    """
    Called by NestJS's ChatbotSyncSubscriber whenever a tracked CMS row is
    inserted, updated, or deleted. This is the only way data enters or
    leaves the vector store — there's no separate manual reindex here because
    NestJS already exposes that (it just replays sync calls for every row).
    """
    if event.action == "delete":
        vector_store.delete_row(db, event.table, event.source_id)
        return {"status": "deleted", "table": event.table, "source_id": event.source_id}

    chunks_stored = vector_store.upsert_row(db, event.table, event.source_id, event.content or "")
    return {
        "status": "upserted",
        "table": event.table,
        "source_id": event.source_id,
        "chunks_stored": chunks_stored,
    }
