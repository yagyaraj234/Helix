from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from app import auth
from app.auth import optional_user_id, required_user_id
from app.billing.entitlements import ScanLimitExceeded, queue_completed_scans, scan_entitlement
from app.models import BatchIngestRequest, BatchIngestResponse, IngestRequest, IngestResponse
from app.pipeline import run_batch, run_pipeline

router = APIRouter(tags=["ingest"])


def _scan_limit_response(error: ScanLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=402,
        content={
            "detail": "free_tier_scan_limit",
            "scans_used": error.scans_used,
            "scans_included": error.scans_included,
        },
    )


@router.post("/ingest", response_model=IngestResponse)
def ingest(
    req: IngestRequest,
    user_id: str | None = Depends(optional_user_id),
) -> IngestResponse | JSONResponse:
    if (
        req.source == "langsmith"
        or req.langsmith_connection_id is not None
        or req.external_trace_id is not None
    ):
        raise HTTPException(
            status_code=403,
            detail="LangSmith provenance is reserved for the internal sync service",
        )
    try:
        entitlement = scan_entitlement(auth.get_supabase(), user_id, 1) if user_id else None
    except ScanLimitExceeded as exc:
        return _scan_limit_response(exc)
    try:
        slug = run_pipeline(req, user_id=user_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=f"unparseable trace: {exc}") from exc
    if user_id and entitlement:
        queue_completed_scans(auth.get_supabase(), entitlement, user_id, [slug])
    return IngestResponse(slug=slug)


@router.post("/ingest/batch", response_model=BatchIngestResponse)
def ingest_batch(
    req: BatchIngestRequest,
    user_id: str = Depends(required_user_id),
) -> BatchIngestResponse | JSONResponse:
    try:
        entitlement = scan_entitlement(auth.get_supabase(), user_id, len(req.traces))
    except ScanLimitExceeded as exc:
        return _scan_limit_response(exc)
    response = run_batch(req, user_id)
    queue_completed_scans(
        auth.get_supabase(),
        entitlement,
        user_id,
        [result.slug for result in response.results if result.status == "done"],
    )
    return response
