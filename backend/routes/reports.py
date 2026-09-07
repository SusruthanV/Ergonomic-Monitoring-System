from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

from database import get_session, UserSession, ScoreAggregate

router = APIRouter(prefix="/api/reports", tags=["reports"])

PERIOD_MAP = {
    "1h": timedelta(hours=1),
    "6h": timedelta(hours=6),
    "12h": timedelta(hours=12),
    "1d": timedelta(days=1),
    "3d": timedelta(days=3),
    "7d": timedelta(days=7),
    "14d": timedelta(days=14),
    "1m": timedelta(days=30),
    "3m": timedelta(days=90),
    "6m": timedelta(days=180),
    "1y": timedelta(days=365),
    "all": None,
}


def generate_pdf(sessions_data: list, period_label: str, stats: dict) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    elements = []

    title_style = ParagraphStyle('Title2', parent=styles['Title'], fontSize=22, spaceAfter=6, textColor=colors.HexColor('#6366f1'))
    heading_style = ParagraphStyle('Heading2', parent=styles['Heading2'], fontSize=14, spaceAfter=6, textColor=colors.HexColor('#1e1b4b'))
    normal_style = ParagraphStyle('Normal2', parent=styles['Normal'], fontSize=10, spaceAfter=4)

    elements.append(Paragraph("ErgoGuard Report", title_style))
    elements.append(Paragraph(f"Period: {period_label}", normal_style))
    elements.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", normal_style))
    elements.append(Spacer(1, 0.3*inch))

    elements.append(Paragraph("Summary", heading_style))
    summary_data = [
        ["Metric", "Value"],
        ["Total Sessions", str(stats['total_sessions'])],
        ["Total Duration", f"{stats['total_hours']} hours"],
        ["Avg Overall Score", f"{stats['avg_overall']:.1f}"],
        ["Avg Posture Score", f"{stats['avg_posture']:.1f}"],
        ["Avg Blink Score", f"{stats['avg_blink']:.1f}"],
        ["Best Score", f"{stats['best_score']:.1f}"],
        ["Worst Score", f"{stats['worst_score']:.1f}"],
    ]
    t = Table(summary_data, colWidths=[2.5*inch, 2.5*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#6366f1')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 0.3*inch))

    if sessions_data:
        elements.append(Paragraph("Session Details", heading_style))
        header = ["#", "Date", "Duration", "Overall", "Posture", "Blink", "Risk"]
        rows = [header]
        for i, s in enumerate(sessions_data, 1):
            rows.append([
                str(i),
                s['date'],
                f"{s['duration']:.1f}m",
                f"{s['overall']:.1f}",
                f"{s['posture']:.1f}",
                f"{s['blink']:.1f}",
                f"{s['risk']:.1f}",
            ])
        t2 = Table(rows, colWidths=[0.4*inch, 1.2*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.8*inch])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#6366f1')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        elements.append(t2)
    else:
        elements.append(Paragraph("No sessions found for this period.", normal_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer


@router.get("/generate")
async def generate_report(
    period: str = Query("7d", description="Time period"),
    db: AsyncSession = Depends(get_session)
):
    if period not in PERIOD_MAP:
        period = "7d"

    delta = PERIOD_MAP[period]
    now = datetime.utcnow()
    if delta is not None:
        since = now - delta
        result = await db.execute(
            select(UserSession)
            .where(UserSession.created_at >= since)
            .where(UserSession.ended_at.isnot(None))
            .order_by(UserSession.created_at.desc())
        )
    else:
        result = await db.execute(
            select(UserSession)
            .where(UserSession.ended_at.isnot(None))
            .order_by(UserSession.created_at.desc())
        )
    sessions = result.scalars().all()

    sessions_data = []
    total_minutes = 0.0
    overall_scores = []
    posture_scores = []
    blink_scores = []
    risk_scores = []

    for s in sessions:
        agg_result = await db.execute(
            select(ScoreAggregate).where(ScoreAggregate.session_id == s.id)
        )
        agg = agg_result.scalars().first()
        if agg:
            sessions_data.append({
                "date": s.created_at.strftime('%Y-%m-%d %H:%M'),
                "duration": agg.session_duration_minutes,
                "overall": agg.overall_score,
                "posture": agg.posture_score,
                "blink": agg.eye_blink_score,
                "risk": agg.disease_risk_score,
            })
            total_minutes += agg.session_duration_minutes
            overall_scores.append(agg.overall_score)
            posture_scores.append(agg.posture_score)
            blink_scores.append(agg.eye_blink_score)
            risk_scores.append(agg.disease_risk_score)

    stats = {
        "total_sessions": len(sessions),
        "total_hours": round(total_minutes / 60, 1),
        "avg_overall": sum(overall_scores) / len(overall_scores) if overall_scores else 0,
        "avg_posture": sum(posture_scores) / len(posture_scores) if posture_scores else 0,
        "avg_blink": sum(blink_scores) / len(blink_scores) if blink_scores else 0,
        "best_score": max(overall_scores) if overall_scores else 0,
        "worst_score": min(overall_scores) if overall_scores else 0,
    }

    PERIOD_LABELS = {
        "1h": "Last 1 Hour", "6h": "Last 6 Hours", "12h": "Last 12 Hours",
        "1d": "Last 1 Day", "3d": "Last 3 Days", "7d": "Last 7 Days",
        "14d": "Last 14 Days", "1m": "Last 1 Month", "3m": "Last 3 Months",
        "6m": "Last 6 Months", "1y": "Last 1 Year", "all": "All Time",
    }

    pdf_buffer = generate_pdf(sessions_data, PERIOD_LABELS.get(period, period), stats)

    filename = f"ergoguard-report-{period}-{now.strftime('%Y%m%d')}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
