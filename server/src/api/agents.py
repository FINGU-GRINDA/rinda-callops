from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Header
import logging

from ..models import Agent, CreateAgentRequest, UpdateAgentRequest
from ..services.database import get_db, FirebaseService
from ..services.livekit_service import LiveKitService

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


@router.post("/", response_model=Agent)
async def create_agent(
    request: CreateAgentRequest,
    user_id: str = Depends(get_current_user_id),
    db: FirebaseService = Depends(get_db),
):
    """Create a new agent"""
    try:
        agent = await db.create_agent(user_id, request)
        return agent
    except Exception as e:
        logger.error(f"Error creating agent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[Agent])
async def list_agents(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    db: FirebaseService = Depends(get_db),
):
    """List all agents"""
    try:
        agents = await db.list_agents(user_id=user_id, skip=skip, limit=limit)
        return agents
    except Exception as e:
        logger.error(f"Error listing agents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{agent_id}", response_model=Agent)
async def get_agent(
    agent_id: str,
    db: FirebaseService = Depends(get_db),
):
    """Get a specific agent"""
    agent = await db.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.patch("/{agent_id}", response_model=Agent)
async def update_agent(
    agent_id: str,
    request: UpdateAgentRequest,
    db: FirebaseService = Depends(get_db),
):
    """Update an agent"""
    agent = await db.update_agent(agent_id, request)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.delete("/{agent_id}")
async def delete_agent(
    agent_id: str,
    db: FirebaseService = Depends(get_db),
):
    """Delete an agent"""
    success = await db.delete_agent(agent_id)
    if not success:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"success": True}


@router.post("/{agent_id}/test-call")
async def test_agent_call(
    agent_id: str,
    phone_number: str,
    customer_name: Optional[str] = None,
):
    """Make a test call with the agent"""
    livekit_service = LiveKitService()
    
    try:
        # Create dispatch for outbound call
        dispatch_result = await livekit_service.create_dispatch(
            agent_name="outbound-caller",
            metadata={
                "agent_id": agent_id,
                "phone_number": phone_number,
                "customer_name": customer_name,
            },
        )
        
        return {
            "success": True,
            "dispatch_id": dispatch_result.get("dispatch_id"),
            "room_name": dispatch_result.get("room_name"),
        }
    except Exception as e:
        logger.error(f"Error creating test call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))