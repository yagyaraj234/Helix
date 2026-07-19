"""Trace assessment: parse, redact, analyze, score, and report without storage."""

from typing import Any

from pydantic import BaseModel

from app.analyze.cost import analyze_cost
from app.analyze.roast import analyze_roast
from app.analyze.score import score, tier
from app.models import DetailedReport, IngestRequest
from app.normalize import generic, openai_agents
from app.normalize.redact import redact_trace, redact_value
from app.roast_line import fallback_detailed_report, fallback_line, generate_luna_assessment
from app.types import CostReport, Finding, NormalizedTrace


class TraceAssessment(BaseModel):
    """One complete, redacted assessment ready for persistence."""

    raw_trace: Any
    normalized: NormalizedTrace
    findings: list[Finding]
    cost: CostReport
    score: int
    tier: str
    roast_line: str
    detailed_report: DetailedReport


def parse_trace(request: IngestRequest) -> NormalizedTrace:
    if request.format == "openai-agents":
        return openai_agents.parse(request.trace)
    if request.format == "generic":
        return generic.parse(request.trace)
    try:
        return openai_agents.parse(request.trace)
    except ValueError:
        return generic.parse(request.trace)


def assess_trace(request: IngestRequest) -> TraceAssessment:
    """Return the complete outcome for one trace; never writes to Supabase."""

    normalized, hits = redact_trace(parse_trace(request))
    cost_findings, cost = analyze_cost(normalized)
    findings = [*analyze_roast(normalized, hits), *cost_findings]
    score_value = score(findings)
    tier_value = tier(score_value)
    luna = generate_luna_assessment(findings, cost, normalized, score_value, tier_value)
    roast_line, detailed_report = (
        luna
        if luna is not None
        else (fallback_line(tier_value), fallback_detailed_report(findings, cost))
    )
    return TraceAssessment(
        raw_trace=redact_value(request.trace),
        normalized=normalized,
        findings=findings,
        cost=cost,
        score=score_value,
        tier=tier_value,
        roast_line=roast_line,
        detailed_report=detailed_report,
    )
