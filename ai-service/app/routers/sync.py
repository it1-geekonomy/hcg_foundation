from fastapi import APIRouter, Depends
from app.core.security import verify_internal_api_key
from app.schemas.schemas import SyncEvent, FullSyncRequest, PruneRequest
from app.services import sync_service

router = APIRouter(tags=["sync"], dependencies=[Depends(verify_internal_api_key)])


@router.post("/internal/sync")
def sync_event(event: SyncEvent):
    """Incremental CMS row upsert/delete from NestJS."""
    return sync_service.upsert_cms_event(event.model_dump())


@router.post("/internal/prune")
def prune_table(payload: PruneRequest):
    """Remove a CMS table's indexed rows that are not in keep_ids (no longer published)."""
    return sync_service.prune_cms_table(payload.table, payload.keep_ids)


@router.post("/sync")
def full_sync(payload: FullSyncRequest | None = None):
    """
    Fingerprint sync for static pages + knowledge files.
    Skips re-embed when unchanged unless force=true.
    Does NOT run on every /chat.
    """
    force = bool(payload.force) if payload else False
    return sync_service.full_sync(force=force)
