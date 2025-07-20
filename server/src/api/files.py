from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
import logging

from ..services.file_analyzer import file_analyzer_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze")
async def analyze_files(
    files: List[UploadFile] = File(...),
    business_context: Optional[str] = Form(None),
):
    """Analyze uploaded business files"""
    
    try:
        # Process files
        file_data = []
        for file in files:
            content = await file.read()
            file_data.append({
                "name": file.filename,
                "content": content,
                "type": file.content_type,
            })
        
        # Analyze files
        results = await file_analyzer_service.analyze_multiple_files(
            files=file_data,
            business_context=business_context,
        )
        
        return {"results": results}
        
    except Exception as e:
        logger.error(f"Error analyzing files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))