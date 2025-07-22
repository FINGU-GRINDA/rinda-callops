from fastapi import APIRouter, Request, HTTPException, Depends
import logging
from typing import Dict, Any
from ..services.database import FirebaseService, get_db
from ..dependencies import get_current_user_id
from datetime import datetime
import json

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/twilio/voice")
async def handle_twilio_voice_webhook(request: Request):
    """Handle Twilio voice webhooks for inbound calls"""
    data = await request.form()
    
    call_sid = data.get("CallSid")
    from_number = data.get("From")
    to_number = data.get("To")
    call_status = data.get("CallStatus")
    
    logger.info(f"Received Twilio voice webhook: {call_sid} - {call_status}")
    
    # TODO: Create LiveKit room and dispatch agent
    # TODO: Return TwiML response to connect call to LiveKit
    
    # For now, return a simple TwiML response
    return {
        "Response": {
            "Say": {
                "@voice": "alice",
                "#text": "Thank you for calling. Our AI assistant will be with you shortly."
            }
        }
    }


@router.post("/twilio/status")
async def handle_twilio_status_webhook(request: Request):
    """Handle Twilio call status webhooks"""
    data = await request.form()
    
    call_sid = data.get("CallSid")
    call_status = data.get("CallStatus")
    
    logger.info(f"Call status update: {call_sid} - {call_status}")
    
    # TODO: Update call status in database
    
    return {"status": "ok"}


@router.post("/livekit/room")
async def handle_livekit_room_webhook(
    request: Request,
    db: FirebaseService = Depends(get_db),
):
    """Handle LiveKit room events"""
    data = await request.json()
    
    event = data.get("event")
    room = data.get("room", {})
    participant = data.get("participant", {})
    
    room_name = room.get("name")
    logger.info(f"LiveKit room event: {event} - {room_name}")
    
    try:
        # Find call by room name
        calls = await db.get_calls_by_room(room_name)
        if not calls:
            logger.warning(f"No call found for room: {room_name}")
            return {"status": "ok"}
        
        call = calls[0]  # Get the first matching call
        
        # Update call status based on event
        if event == "room_started":
            await db.update_call_status(call.id, "in-progress")
        elif event == "room_finished":
            await db.update_call_status(call.id, "completed")
            # Update call duration
            duration = room.get("duration", 0)
            await db.update_call_duration(call.id, duration)
        elif event == "participant_joined":
            if participant.get("identity") != "phone-agent":
                await db.update_call_status(call.id, "in-progress")
        elif event == "participant_disconnected":
            if participant.get("identity") != "phone-agent":
                await db.update_call_status(call.id, "completed")
        
        logger.info(f"Updated call {call.id} for room event {event}")
        
    except Exception as e:
        logger.error(f"Error handling room event: {str(e)}")
    
    return {"status": "ok"}


@router.post("/tool-handler")
async def handle_tool_webhook(
    request: Request,
    db: FirebaseService = Depends(get_db),
):
    """Handle tool execution webhooks from LiveKit agents"""
    data = await request.json()
    
    logger.info(f"Tool webhook received: {data}")
    
    # Handle LiveKit agent tool calls
    if "tool_calls" in data:
        # Process tool calls from LiveKit agent
        results = []
        agent_id = data.get("agent_id")
        call_id = data.get("call_id")
        
        for tool_call in data["tool_calls"]:
            tool_id = tool_call.get("tool_id")
            parameters = tool_call.get("parameters", {})
            
            try:
                # Get tool from database
                tool = await db.get_tool(tool_id)
                if not tool:
                    logger.error(f"Tool {tool_id} not found")
                    results.append({
                        "success": False,
                        "error": "Tool not found"
                    })
                    continue
                
                # Execute the tool
                from ..services.tool_executor import ToolExecutor
                executor = ToolExecutor(db)
                
                result = await executor.execute(
                    tool_id=tool_id,
                    parameters=parameters,
                    call_id=call_id,
                    agent_id=agent_id,
                )
                
                # Track tool usage in database
                await db.track_tool_usage(
                    tool_id=tool_id,
                    call_id=call_id,
                    agent_id=agent_id,
                    parameters=parameters,
                    result=result.dict(),
                    success=result.success,
                )
                
                # Update tool usage count
                await db.increment_tool_usage(tool_id)
                
                results.append(result.dict())
                
            except Exception as e:
                logger.error(f"Error executing tool {tool_id}: {str(e)}")
                
                # Track failed tool usage
                if tool_id and call_id:
                    try:
                        await db.track_tool_usage(
                            tool_id=tool_id,
                            call_id=call_id,
                            agent_id=agent_id,
                            parameters=parameters,
                            result={"error": str(e)},
                            success=False,
                        )
                    except Exception as track_error:
                        logger.error(f"Error tracking failed tool usage: {str(track_error)}")
                
                results.append({
                    "success": False,
                    "error": str(e)
                })
        
        return {"results": results}
    
    # Handle direct tool execution
    elif "tool_name" in data:
        tool_name = data["tool_name"]
        parameters = data.get("parameters", {})
        agent_id = data.get("agent_id")
        call_id = data.get("call_id")
        
        try:
            # Find tool by name and agent
            tools = await db.get_tools_by_agent(agent_id)
            tool = next((t for t in tools if t.name == tool_name), None)
            
            if not tool:
                return {
                    "success": False,
                    "error": f"Tool {tool_name} not found for agent {agent_id}"
                }
            
            # Execute the tool
            from ..services.tool_executor import ToolExecutor
            executor = ToolExecutor(db)
            
            result = await executor.execute(
                tool_id=tool.id,
                parameters=parameters,
                call_id=call_id,
                agent_id=agent_id,
            )
            
            # Track tool usage
            await db.track_tool_usage(
                tool_id=tool.id,
                call_id=call_id,
                agent_id=agent_id,
                parameters=parameters,
                result=result.dict(),
                success=result.success,
            )
            
            # Update tool usage count
            await db.increment_tool_usage(tool.id)
            
            return {
                "success": True,
                "result": result.dict(),
            }
            
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    # Default response
    return {
        "success": True,
        "message": "Webhook received",
    }