from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
import logging
import json
from ..services.database import FirebaseService, get_db
from ..services.livekit_service import LiveKitService
from ..dependencies import get_current_user_id

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/web-call/{agent_id}")
async def create_web_test_call(
    agent_id: str,
    user_id: str = Depends(get_current_user_id),
    db: FirebaseService = Depends(get_db),
):
    """Create a web test call for an agent (browser mic testing)"""
    
    try:
        # Get agent to verify ownership
        agent = await db.get_agent(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        if agent.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to use this agent")
        
        # Create LiveKit room for web testing
        livekit_service = LiveKitService()
        
        # Generate unique room name for test
        import uuid
        room_name = f"test-{agent_id}-{uuid.uuid4().hex[:8]}"
        
        # Create metadata for the room that includes agent_id
        room_metadata = {
            "agent_id": agent_id,
            "test_mode": True,
        }
        
        # Create LiveKit room
        room = await livekit_service.create_room(room_name)
        
        # Create call record in database
        from datetime import datetime
        call_data = {
            'agent_id': agent_id,
            'room_name': room_name,
            'direction': 'inbound',
            'status': 'pending',
            'from_number': 'web-test',
            'to_number': 'agent-test',
            'start_time': datetime.utcnow(),
            'metadata': {
                'test_mode': True,
                'agent_name': agent.name,
                'user_id': user_id,
                'type': 'web-test',
            }
        }
        
        call = await db.create_call(call_data)
        
        # Generate access token for user to join room
        # Include agent_id in the participant metadata
        participant_metadata = json.dumps({
            "agent_id": agent_id,
            "test_mode": True,
        })
        
        token = await livekit_service.generate_access_token(
            room_name=room_name,
            participant_identity=f"user-{user_id}",
            participant_name="Test User",
            metadata=participant_metadata
        )
        
        # Create dispatch to start agent in room
        dispatch_result = await livekit_service.create_dispatch(
            agent_name="phone-agent",
            metadata={
                "agent_id": agent_id,
                "call_id": call.id,
                "test_mode": True,
            },
            room_name=room_name,
        )
        
        return {
            "success": True,
            "call_id": call.id,
            "room_name": room_name,
            "access_token": token,
            "websocket_url": livekit_service.ws_url,
            "dispatch_id": dispatch_result.get("id"),
            "agent": {
                "id": agent.id,
                "name": agent.name,
                "voice": agent.voice,
            },
            "instructions": {
                "1": "Copy the access token and room details",
                "2": "Use LiveKit SDK in your frontend to connect",
                "3": "Enable microphone and start speaking",
                "4": "The AI agent will respond based on configured tools"
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating web test call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/web-call/{call_id}/status")
async def get_web_test_call_status(
    call_id: str,
    user_id: str = Depends(get_current_user_id),
    db: FirebaseService = Depends(get_db),
):
    """Get status of a web test call"""
    
    try:
        # Get call record
        call = await db.get_call(call_id)
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")
        
        if call.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this call")
        
        # Get agent details
        agent = await db.get_agent(call.agent_id)
        
        return {
            "call_id": call.id,
            "status": call.status,
            "duration": call.duration,
            "room_name": call.room_name,
            "agent": {
                "id": agent.id if agent else None,
                "name": agent.name if agent else None,
            },
            "created_at": call.created_at,
            "updated_at": call.updated_at,
        }
        
    except Exception as e:
        logger.error(f"Error getting call status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/web-call/{call_id}/end")
async def end_web_test_call(
    call_id: str,
    user_id: str = Depends(get_current_user_id),
    db: FirebaseService = Depends(get_db),
):
    """End a web test call"""
    
    try:
        # Get call record
        call = await db.get_call(call_id)
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")
        
        if call.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this call")
        
        # Update call status
        await db.update_call_status(call_id, "completed")
        
        # Clean up LiveKit room if needed
        if call.room_name:
            livekit_service = LiveKitService()
            try:
                await livekit_service.delete_room(call.room_name)
            except Exception as e:
                logger.warning(f"Error deleting room {call.room_name}: {str(e)}")
        
        return {
            "success": True,
            "message": "Call ended successfully"
        }
        
    except Exception as e:
        logger.error(f"Error ending call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))