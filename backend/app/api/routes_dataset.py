"""
Dataset exploration, statistics, and template download endpoints.
"""
from typing import Optional
import io
import pandas as pd
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import Response, StreamingResponse
from app.ml.dataset import get_dataset_overview, get_dataset_preview, get_dataset_summary_statistics, load_raw_dataset
from app.core.config import EARLY_FEATURES, GRADE_ASSISTED_FEATURES

router = APIRouter(prefix="/api/dataset", tags=["Dataset"])


@router.get("/summary")
def get_summary():
    """Detailed summary statistics, distributions, and correlation matrix."""
    return get_dataset_summary_statistics()


@router.get("/preview")
def get_preview(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(15, ge=1, le=100, description="Records per page"),
    search: Optional[str] = Query(None, description="Search keyword across text columns")
):
    """Paginated preview of student records."""
    return get_dataset_preview(page=page, page_size=page_size, search=search)


@router.get("/download")
def download_full_dataset():
    """Export the loaded dataset as a CSV file."""
    df = load_raw_dataset()
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    return Response(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=student_mathematics_dataset.csv"}
    )


@router.get("/template")
def download_template(mode: str = Query("early", description="'early' or 'grade_assisted'")):
    """
    Download a sample CSV template pre-populated with correct column headers and 3 valid sample student rows.
    """
    df_raw = load_raw_dataset()
    cols = EARLY_FEATURES if mode == "early" else GRADE_ASSISTED_FEATURES
    
    # Grab 3 real rows as sample data
    sample_df = df_raw[cols].head(3).copy()
    
    stream = io.StringIO()
    sample_df.to_csv(stream, index=False)
    
    filename = f"sais_template_{mode}.csv"
    return Response(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

