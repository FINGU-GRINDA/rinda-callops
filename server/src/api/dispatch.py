from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Dict, Any, Optional
import logging
from datetime import datetime
import uuid

from ..services.livekit_service import LiveKitService
from ..services.database import get_db, FirebaseService
from ..core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


async def get_current_user_id(
    authorization: str = Header(...),
    db: FirebaseService = Depends(get_db),
) -> str:
    """Extract user ID from Firebase auth token"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    decoded_token = await db.verify_id_token(token)
    
    if not decoded_token:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return decoded_token["uid"]


@router.post("/create")
async def create_dispatch(
    agent_name: str = "phone-agent",
    room_name: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    user_id: str = Depends(get_current_user_id),
    db: FirebaseService = Depends(get_db),
):
    """Create a new agent dispatch"""
    livekit_service = LiveKitService()
    
    try:
        # Verify agent ownership if agent_id is provided in metadata
        if metadata and metadata.get("agent_id"):
            agent = await db.get_agent(metadata["agent_id"])
            if not agent:
                raise HTTPException(status_code=404, detail="Agent not found")
            if agent.user_id != user_id:
                raise HTTPException(status_code=403, detail="Not authorized to use this agent")
        
        result = await livekit_service.create_dispatch(
            agent_name=agent_name,
            room_name=room_name,
            metadata=metadata or {},
        )
        
        # Store dispatch info in database for tracking
        dispatch_data = {
            "id": result.get("dispatch_id", str(uuid.uuid4())),
            "userId": user_id,
            "agentId": metadata.get("agent_id") if metadata else None,
            "agentName": agent_name,
            "roomName": result.get("room_name"),
            "metadata": metadata or {},
            "status": "created",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }
        
        # TODO: Add dispatch collection to database service
        # For now, just return the result
        
        return {
            **result,
            "user_id": user_id,
        }
    except Exception as e:
        logger.error(f"Error creating dispatch: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{dispatch_id}")
async def get_dispatch(
    dispatch_id: str,
    user_id: str = Depends(get_current_user_id),
    db: FirebaseService = Depends(get_db),
):
    """Get dispatch details"""
    try:
        # TODO: Implement dispatch tracking in database
        return {
            "dispatch_id": dispatch_id,
            "status": "unknown",
            "message": "Dispatch tracking not fully implemented yet"
        }
    except Exception as e:
        logger.error(f"Error getting dispatch: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{dispatch_id}/cancel")
async def cancel_dispatch(
    dispatch_id: str,
    user_id: str = Depends(get_current_user_id),
    db: FirebaseService = Depends(get_db),
):
    """Cancel a dispatch"""
    try:
        # TODO: Implement dispatch cancellation
        return {
            "success": True,
            "message": "Dispatch cancellation not fully implemented yet"
        }
    except Exception as e:
        logger.error(f"Error cancelling dispatch: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))