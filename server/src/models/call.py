from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class CallStatus(str, Enum):
    PENDING = "pending"
    RINGING = "ringing"
    ACTIVE = "active"
    AUTOMATION = "automation"  # During DTMF dialing
    COMPLETED = "completed"
    FAILED = "failed"
    NO_ANSWER = "no_answer"
    BUSY = "busy"
    VOICEMAIL = "voicemail"
    HANGUP = "hangup"


class CallDirection(str, Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"


class CallParticipant(BaseModel):
    identity: str
    name: Optional[str] = None
    phone_number: Optional[str] = None
    attributes: Dict[str, Any] = Field(default_factory=dict)


class Call(BaseModel):
    id: str
    agent_id: str
    room_name: str
    direction: CallDirection
    status: CallStatus
    from_number: str
    to_number: str
    participants: List[CallParticipant] = Field(default_factory=list)
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[int] = None  # seconds
    recording_url: Optional[str] = None
    transcript: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    analytics: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CreateOutboundCallRequest(BaseModel):
    agent_id: str
    to_number: str
    from_number: Optional[str] = None  # If not provided, use agent's default
    customer_name: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    max_duration: Optional[int] = None  # Override agent's max duration


class CreateInboundCallRequest(BaseModel):
    agent_id: str
    from_number: str
    to_number: str
    call_sid: str  # From Twilio/SIP provider
    metadata: Optional[Dict[str, Any]] = None


class CallEvent(BaseModel):
    call_id: str
    event_type: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Dict[str, Any] = Field(default_factory=dict)


class CallTranscriptEntry(BaseModel):
    speaker: str  # "agent" or "customer"
    text: str
    timestamp: datetime
    confidence: Optional[float] = None