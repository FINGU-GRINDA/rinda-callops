from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Header
import logging
from datetime import datetime
import uuid

from ..models import (
    Call,
    CreateOutboundCallRequest,
    CreateInboundCallRequest,
    CallStatus,
    CallDirection,
)
from ..services.livekit_service import LiveKitService
from ..services.database import get_db, FirebaseService

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


@router.post("/outbound")
async def create_outbound_call(
    request: CreateOutboundCallRequest,
    user_id: str = Depends(get_current_user_id),
    db: FirebaseService = Depends(get_db),
):
    """Create an outbound call"""
    livekit_service = LiveKitService()
    
    try:
        # Get agent to verify ownership
        agent = await db.get_agent(request.agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        if agent.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to use this agent")
        
        # Create dispatch for outbound call
        dispatch_result = await livekit_service.create_dispatch(
            agent_name="phone-agent",
            metadata={
                "agent_id": request.agent_id,
                "phone_number": request.to_number,
                "from_number": request.from_number,
                "customer_name": request.customer_name,
                **(request.metadata or {}),
            },
        )
        
        # Create call record in database
        call_data = {
            "id": dispatch_result.get("dispatch_id", str(uuid.uuid4())),
            "agentId": request.agent_id,
            "userId": user_id,
            "roomName": dispatch_result.get("room_name"),
            "direction": CallDirection.OUTBOUND,
            "status": CallStatus.PENDING,
            "fromNumber": request.from_number or agent.phone_number or "",
            "toNumber": request.to_number,
            "participants": [],
            "startTime": datetime.utcnow(),
            "metadata": request.metadata or {},
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }
        
        call = await db.create_call(call_data)
        
        return {
            "success": True,
            "call": call.dict(),
            "dispatch_id": dispatch_result.get("dispatch_id"),
            "room_name": dispatch_result.get("room_name"),
        }
    except Exception as e:
        logger.error(f"Error creating outbound call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/inbound")
async def handle_inbound_call(
    request: CreateInboundCallRequest,
    db: FirebaseService = Depends(get_db),
):
    """Handle an inbound call from Twilio"""
    livekit_service = LiveKitService()
    
    try:
        # Get agent
        agent = await db.get_agent(request.agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Create dispatch for inbound call
        dispatch_result = await livekit_service.create_dispatch(
            agent_name="phone-agent",
            metadata={
                "agent_id": request.agent_id,
                "call_sid": request.call_sid,
                "from_number": request.from_number,
                "to_number": request.to_number,
                **(request.metadata or {}),
            },
        )
        
        # Create call record
        call_data = {
            "id": str(uuid.uuid4()),
            "agentId": request.agent_id,
            "userId": agent.user_id,
            "roomName": dispatch_result.get("room_name"),
            "direction": CallDirection.INBOUND,
            "status": CallStatus.RINGING,
            "fromNumber": request.from_number,
            "toNumber": request.to_number,
            "participants": [],
            "startTime": datetime.utcnow(),
            "metadata": {"call_sid": request.call_sid, **(request.metadata or {})},
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }
        
        call = await db.create_call(call_data)
        
        return {
            "success": True,
            "call": call.dict(),
            "room_name": dispatch_result.get("room_name"),
        }
    except Exception as e:
        logger.error(f"Error handling inbound call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def list_calls(
    agent_id: Optional[str] = None,
    status: Optional[CallStatus] = None,
    skip: int = 0,
    limit: int = 100,
    user_id: str = Depends(get_current_user_id),
    db: FirebaseService = Depends(get_db),
):
    """List calls for the authenticated user"""
    try:
        # TODO: Implement list_calls in database service
        # For now, return empty list
        return {"calls": []}
    except Exception as e:
        logger.error(f"Error listing calls: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{call_id}")
async def get_call(
    call_id: str,
    user_id: str = Depends(get_current_user_id),
    db: FirebaseService = Depends(get_db),
):
    """Get call details"""
    try:
        # TODO: Implement get_call in database service
        raise HTTPException(status_code=404, detail="Call not found")
    except Exception as e:
        logger.error(f"Error getting call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{call_id}/end")
async def end_call(
    call_id: str,
    user_id: str = Depends(get_current_user_id),
    db: FirebaseService = Depends(get_db),
):
    """End an active call"""
    livekit_service = LiveKitService()
    
    try:
        # TODO: Get call from database and verify ownership
        # For now, attempt to end call
        
        # Update call status
        await db.update_call(call_id, {
            "status": CallStatus.COMPLETED,
            "endTime": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        })
        
        return {"success": True}
    except Exception as e:
        logger.error(f"Error ending call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{call_id}/transcript")
async def get_call_transcript(
    call_id: str,
    user_id: str = Depends(get_current_user_id),
    db: FirebaseService = Depends(get_db),
):
    """Get call transcript"""
    try:
        # TODO: Implement transcript retrieval
        return {"transcript": "Transcript retrieval not implemented yet"}
    except Exception as e:
        logger.error(f"Error getting transcript: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{call_id}/recording")
async def get_call_recording(
    call_id: str,
    user_id: str = Depends(get_current_user_id),
    db: FirebaseService = Depends(get_db),
):
    """Get call recording URL"""
    try:
        # TODO: Implement recording retrieval
        return {"recording_url": None, "message": "Recording retrieval not implemented yet"}
    except Exception as e:
        logger.error(f"Error getting recording: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))