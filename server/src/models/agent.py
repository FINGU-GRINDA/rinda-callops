from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class VoiceProvider(str, Enum):
    OPENAI = "openai"
    DEEPGRAM = "deepgram"
    CARTESIA = "cartesia"


class AgentStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"


class Voice(BaseModel):
    provider: VoiceProvider
    voice_id: str
    voice_name: Optional[str] = None
    temperature: float = Field(default=0.7, ge=0, le=1)
    speed: float = Field(default=1.0, ge=0.5, le=2.0)


class AgentSettings(BaseModel):
    voice_id: str
    language: str = "en-US"
    first_message: str
    system_prompt: str
    max_call_duration: int = 600  # seconds
    interruption_threshold: float = Field(default=0.5, ge=0, le=1)
    voice_temperature: float = Field(default=0.7, ge=0, le=1)
    voice_speed: float = Field(default=1.0, ge=0.5, le=2.0)


class Agent(BaseModel):
    id: str
    user_id: str
    name: str
    business_name: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    business_type: Optional[str] = None
    phone_number_id: Optional[str] = None
    phone_number: Optional[str] = None
    instructions: Optional[str] = None
    greeting: Optional[str] = None
    first_message: Optional[str] = None
    voice: Optional[str] = None
    language: str = "en-US"
    tools: List[str] = Field(default_factory=list)  # Tool IDs
    workflows: List[str] = Field(default_factory=list)  # Workflow IDs
    settings: Optional[AgentSettings] = None
    analytics: Optional[Dict[str, Any]] = None
    status: AgentStatus = AgentStatus.ACTIVE
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BusinessData(BaseModel):
    """Business-specific data for agent creation"""
    # Restaurant
    menu: Optional[str] = None
    menu_files: Optional[List[Dict[str, Any]]] = None
    
    # Salon
    services: Optional[str] = None
    service_files: Optional[List[Dict[str, Any]]] = None
    stylists: Optional[str] = None
    
    # Medical
    doctors: Optional[str] = None
    insurance_accepted: Optional[str] = None
    
    # Common
    hours: Optional[Dict[str, str]] = None
    additional_info: Optional[str] = None


class CreateAgentRequest(BaseModel):
    name: str
    business_name: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    business_type: Optional[str] = None
    business_description: Optional[str] = None
    custom_requirements: Optional[str] = None
    phone_number: Optional[str] = None
    instructions: Optional[str] = None
    first_message: Optional[str] = None
    voice: Optional[str] = None  # Changed to string to match frontend
    language: str = "en-US"
    tools: List[Dict[str, Any]] = Field(default_factory=list)  # Changed to Dict for tool objects
    business_data: Optional[BusinessData] = None
    settings: Optional[AgentSettings] = None


class UpdateAgentRequest(BaseModel):
    name: Optional[str] = None
    business_name: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    business_type: Optional[str] = None
    phone_number: Optional[str] = None
    instructions: Optional[str] = None
    greeting: Optional[str] = None
    first_message: Optional[str] = None
    voice: Optional[str] = None
    language: Optional[str] = None
    tools: Optional[List[str]] = None
    settings: Optional[AgentSettings] = None
    status: Optional[AgentStatus] = None