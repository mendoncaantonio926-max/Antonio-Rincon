from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import CurrentContextDep
from app.api.permissions import require_min_role
from app.domain.models import to_dict
from app.schemas.reports import ReportCreateRequest, ReportExportResponse, ReportResponse
from app.services.report_service import create_report, export_report, list_reports

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=list[ReportResponse])
def get_reports(
    context: CurrentContextDep,
    report_type: Annotated[str | None, Query()] = None,
) -> list[dict]:
    return [to_dict(report) for report in list_reports(context.membership.tenant_id, report_type=report_type)]


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def post_report(payload: ReportCreateRequest, context: CurrentContextDep) -> dict:
    require_min_role(context, {"owner", "admin", "coordinator", "analyst"})
    report = create_report(
        context.membership.tenant_id,
        context.user.id,
        payload.title,
        payload.report_type,
    )
    return to_dict(report)


@router.post("/{report_id}/export/{export_format}", response_model=ReportExportResponse)
def post_export(report_id: str, export_format: str, context: CurrentContextDep) -> ReportExportResponse:
    require_min_role(context, {"owner", "admin", "coordinator"})
    if export_format not in {"pdf", "csv"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato invalido.")
    try:
        payload = export_report(
            context.membership.tenant_id,
            context.user.id,
            report_id,
            export_format,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return ReportExportResponse(**payload)
