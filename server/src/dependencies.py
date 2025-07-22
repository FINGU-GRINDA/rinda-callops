"""
Dependency injection for FastAPI routes
"""

from fastapi import HTTPException, Header, Depends
from typing import Optional
import logging

logger = logging.getLogger(__name__)


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Extract user ID from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.replace("Bearer ", "")
    
    # Verify Firebase ID token
    from .services.database import db_service
    
    try:
        decoded_token = await db_service.verify_id_token(token)
        if not decoded_token:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = decoded_token.get("uid")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token - no user ID")
        
        return user_id
        
    except Exception as e:
        logger.error(f"Error verifying token: {str(e)}")
        raise HTTPException(status_code=401, detail="Token verification failed")


async def get_optional_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extract user ID from Authorization header (optional)"""
    if not authorization:
        return None
    
    try:
        return await get_current_user_id(authorization)
    except HTTPException:
        return None