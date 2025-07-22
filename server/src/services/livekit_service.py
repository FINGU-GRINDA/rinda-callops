import logging
import json
from typing import Dict, Any, Optional
import uuid
from datetime import datetime

from livekit import api
from livekit.api import LiveKitAPI

from ..core.config import settings

logger = logging.getLogger(__name__)


class LiveKitService:
    """Service for interacting with LiveKit API"""
    
    def __init__(self):
        self.api = LiveKitAPI(
            url=settings.livekit_url,
            api_key=settings.livekit_api_key,
            api_secret=settings.livekit_api_secret,
        )
        self.ws_url = settings.livekit_url.replace('http', 'ws')
    
    async def create_room(self, room_name: str) -> Dict[str, Any]:
        """Create a new LiveKit room"""
        try:
            room_info = await self.api.room.create_room(
                api.CreateRoomRequest(
                    name=room_name,
                    empty_timeout=300,  # 5 minutes
                    max_participants=10,
                )
            )
            
            logger.info(f"Created room {room_name}")
            
            return {
                "name": room_info.name,
                "sid": room_info.sid,
                "creation_time": room_info.creation_time,
            }
            
        except Exception as e:
            logger.error(f"Error creating room: {str(e)}")
            raise
    
    async def generate_access_token(
        self,
        room_name: str,
        participant_identity: str,
        participant_name: str = None,
        metadata: str = None,
    ) -> str:
        """Generate access token for a participant to join a room"""
        try:
            token_builder = api.AccessToken(
                api_key=settings.livekit_api_key,
                api_secret=settings.livekit_api_secret,
            ).with_identity(participant_identity).with_name(
                participant_name or participant_identity
            )
            
            if metadata:
                token_builder = token_builder.with_metadata(metadata)
            
            token = token_builder.with_grants(
                api.VideoGrants(
                    room_join=True,
                    room=room_name,
                    can_publish=True,
                    can_subscribe=True,
                )
            ).to_jwt()
            
            logger.info(f"Generated access token for {participant_identity} in room {room_name}")
            return token
            
        except Exception as e:
            logger.error(f"Error generating access token: {str(e)}")
            raise
    
    async def delete_room(self, room_name: str):
        """Delete a LiveKit room"""
        try:
            await self.api.room.delete_room(
                api.DeleteRoomRequest(room=room_name)
            )
            
            logger.info(f"Deleted room {room_name}")
            
        except Exception as e:
            logger.error(f"Error deleting room: {str(e)}")
            raise
    
    async def create_dispatch(
        self,
        agent_name: str,
        room_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Create a new agent dispatch"""
        
        if not room_name:
            room_name = f"room_{uuid.uuid4().hex[:8]}"
        
        dispatch_id = f"dispatch_{uuid.uuid4().hex[:8]}"
        
        try:
            # Create room first
            await self.create_room(room_name)
            
            # Agent worker will automatically join when participants connect to the room
            logger.info(f"Created dispatch {dispatch_id} for room {room_name} - agent will auto-join when participant connects")
            
            return {
                "dispatch_id": dispatch_id,
                "room_name": room_name,
                "agent_name": agent_name,
                "metadata": metadata,
                "created_at": datetime.utcnow().isoformat(),
            }
            
        except Exception as e:
            logger.error(f"Error creating dispatch: {str(e)}")
            raise
    
    async def create_sip_participant(
        self,
        room_name: str,
        trunk_id: str,
        phone_number: str,
        participant_identity: str = "phone_user",
    ) -> Dict[str, Any]:
        """Create a SIP participant for outbound calling"""
        
        try:
            response = await self.api.sip.create_sip_participant(
                api.CreateSIPParticipantRequest(
                    room_name=room_name,
                    sip_trunk_id=trunk_id,
                    sip_call_to=phone_number,
                    participant_identity=participant_identity,
                )
            )
            
            return {
                "participant_sid": response.participant_sid,
                "participant_identity": response.participant_identity,
            }
            
        except Exception as e:
            logger.error(f"Error creating SIP participant: {str(e)}")
            raise
    
    async def remove_participant(self, room_name: str, identity: str):
        """Remove a participant from a room"""
        
        try:
            await self.api.room.remove_participant(
                api.RoomParticipantIdentity(
                    room=room_name,
                    identity=identity,
                )
            )
        except Exception as e:
            logger.error(f"Error removing participant: {str(e)}")
            raise
    
    async def remove_all_participants(self, room_name: str):
        """Remove all participants from a room"""
        
        try:
            participants = await self.api.room.list_participants(
                api.ListParticipantsRequest(room=room_name)
            )
            
            for participant in participants:
                await self.remove_participant(room_name, participant.identity)
                
        except Exception as e:
            logger.error(f"Error removing all participants: {str(e)}")
            raise
    
    async def get_room(self, room_name: str) -> Optional[api.Room]:
        """Get room details"""
        
        try:
            rooms = await self.api.room.list_rooms(api.ListRoomsRequest())
            
            for room in rooms:
                if room.name == room_name:
                    return room
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting room: {str(e)}")
            raise
    
    async def update_participant_metadata(
        self,
        room_name: str,
        identity: str,
        metadata: str,
    ):
        """Update participant metadata"""
        
        try:
            await self.api.room.update_participant(
                api.UpdateParticipantRequest(
                    room=room_name,
                    identity=identity,
                    metadata=metadata,
                )
            )
        except Exception as e:
            logger.error(f"Error updating participant metadata: {str(e)}")
            raise