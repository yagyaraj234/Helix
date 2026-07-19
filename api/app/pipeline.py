"""Persistence for completed trace assessments."""

import secrets
import uuid
from typing import Any

from app.assessment import TraceAssessment, assess_trace
from app.db import get_supabase
from app.models import (
    BatchIngestRequest,
    BatchIngestResponse,
    BatchIngestResult,
    IngestRequest,
    Source,
)
from app.normalize.redact import redact_value
from app.roast_line import fallback_detailed_report
from app.types import CostReport, NormalizedTrace


def make_slug() -> str:
    return secrets.token_urlsafe(8)[:8]


def _insert_row(row: dict[str, Any]) -> None:
    """Keep ingest live until optional-report and integration migrations land."""
    try:
        get_supabase().table("roasts").insert(row).execute()
    except Exception as exc:
        optional_columns = (
            "detailed_report",
            "langsmith_connection_id",
            "external_trace_id",
        )
        if not any(column in str(exc) for column in optional_columns):
            raise
        legacy_row = {
            key: value for key, value in row.items() if key not in optional_columns
        }
        get_supabase().table("roasts").insert(legacy_row).execute()


def persist_assessment(
    assessment: TraceAssessment,
    request: IngestRequest,
    *,
    user_id: str | None = None,
    batch_id: str | None = None,
    title_override: str | None = None,
    langsmith_connection_id: str | None = None,
    external_trace_id: str | None = None,
) -> str:
    """Store one assessment with its ownership and provenance."""

    slug = make_slug()
    row: dict[str, Any] = {
        "slug": slug,
        "title": title_override or request.title or assessment.normalized.workflow or "Untitled trace",
        "source": request.source,
        "raw_trace": assessment.raw_trace,
        "normalized": assessment.normalized.model_dump(),
        "findings": [finding.model_dump() for finding in assessment.findings],
        "cost": assessment.cost.model_dump(),
        "score": assessment.score,
        "tier": assessment.tier,
        "roast_line": assessment.roast_line,
        "detailed_report": assessment.detailed_report.model_dump(),
        "status": "done",
        "user_id": user_id,
        "batch_id": batch_id,
        "langsmith_connection_id": langsmith_connection_id,
        "external_trace_id": external_trace_id,
    }
    _insert_row(row)
    return slug


def run_pipeline(
    req: IngestRequest,
    user_id: str | None = None,
    batch_id: str | None = None,
    title_override: str | None = None,
    langsmith_connection_id: str | None = None,
    external_trace_id: str | None = None,
) -> str:
    return persist_assessment(
        assess_trace(req),
        req,
        user_id=user_id,
        batch_id=batch_id,
        title_override=title_override,
        langsmith_connection_id=langsmith_connection_id,
        external_trace_id=external_trace_id,
    )


def _failed_batch_row(
    trace: Any,
    title: str,
    source: Source,
    user_id: str,
    batch_id: str,
    error: ValueError,
) -> BatchIngestResult:
    slug = make_slug()
    message = str(error)[:240]
    empty_trace = NormalizedTrace(trace_id=slug, workflow=title, spans=[])
    empty_cost = CostReport(
        total_tokens_in=0,
        total_tokens_out=0,
        total_usd=0.0,
        waste_usd=0.0,
        token_source="estimated",
        monthly_projection_usd=0.0,
        projection_assumption="at 1,000 runs/day",
        unpriced_models=[],
    )
    _insert_row(
        {
            "slug": slug,
            "title": title,
            "source": source,
            "raw_trace": redact_value(trace),
            "normalized": empty_trace.model_dump(),
            "findings": [],
            "cost": empty_cost.model_dump(),
            "detailed_report": fallback_detailed_report([], empty_cost).model_dump(),
            "score": 0,
            "tier": "Unknown",
            "roast_line": None,
            "status": "failed",
            "error": message,
            "user_id": user_id,
            "batch_id": batch_id,
        }
    )
    return BatchIngestResult(slug=slug, status="failed", error=message)


def run_batch(req: BatchIngestRequest, user_id: str) -> BatchIngestResponse:
    """Run a user-owned batch, preserving an auditable row for parse failures."""

    batch_id = str(uuid.uuid4())
    multiple = len(req.traces) > 1
    results: list[BatchIngestResult] = []
    for index, trace in enumerate(req.traces):
        single = IngestRequest(source=req.source, title=req.title, format=req.format, trace=trace)
        try:
            assessment = assess_trace(single)
            base_title = req.title or assessment.normalized.workflow or "Untitled trace"
            title = f"{base_title} {index + 1}" if multiple else base_title
            slug = persist_assessment(
                assessment,
                single,
                user_id=user_id,
                batch_id=batch_id,
                title_override=title,
            )
            results.append(BatchIngestResult(slug=slug, status="done"))
        except ValueError as exc:
            base_title = req.title or "Untitled trace"
            title = f"{base_title} {index + 1}" if multiple else base_title
            results.append(
                _failed_batch_row(trace, title, req.source, user_id, batch_id, exc)
            )
    return BatchIngestResponse(batch_id=batch_id, results=results)
