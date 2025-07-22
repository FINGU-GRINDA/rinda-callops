from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum


class ToolType(str, Enum):
    SHEET_APPEND = "sheet_append"
    SHEET_UPDATE = "sheet_update"
    SHEET_READ = "sheet_read"
    CALENDAR_CREATE = "calendar_create"
    SMS_SEND = "sms_send"
    EMAIL_SEND = "email_send"
    CUSTOM_API = "custom_api"
    FUNCTION = "function"
    WEBHOOK = "webhook"
    # Additional tool types for phone agent
    MENU = "menu"
    ORDER = "order"
    TAKE_ORDER = "take-order"
    FAQ = "faq"
    ANSWER_QUESTIONS = "answer-questions"
    REFERENCE = "reference"
    # AI-generated tools
    AI_GENERATED = "ai_generated"


class ParameterType(str, Enum):
    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    ARRAY = "array"
    OBJECT = "object"


class ToolParameter(BaseModel):
    name: str
    type: ParameterType
    description: str
    required: bool = True
    default: Optional[Any] = None
    enum: Optional[List[str]] = None


class ToolConfig(BaseModel):
    sheet_id: Optional[str] = None
    sheet_url: Optional[str] = None
    webhook_url: Optional[str] = None
    api_endpoint: Optional[str] = None
    headers: Optional[Dict[str, str]] = None
    parameters: Optional[List[ToolParameter]] = None
    method: Optional[str] = "POST"
    timeout: Optional[int] = 30


class Tool(BaseModel):
    id: str
    user_id: str
    agent_id: Optional[str] = None
    name: str
    display_name: Optional[str] = None
    description: Optional[str] = None
    type: ToolType
    enabled: bool = True
    configuration: Optional[Dict[str, Any]] = None
    config: Optional[ToolConfig] = None
    json_schema: Optional[Dict[str, Any]] = None  # JSON Schema for parameters
    usage_count: int = 0
    last_used: Optional[datetime] = None
    template_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CreateToolRequest(BaseModel):
    agent_id: Optional[str] = None
    name: str
    display_name: Optional[str] = None
    description: str
    type: ToolType
    enabled: bool = True
    configuration: Optional[Dict[str, Any]] = None
    config: Optional[ToolConfig] = None
    json_schema: Optional[Dict[str, Any]] = None


class UpdateToolRequest(BaseModel):
    name: Optional[str] = None
    display_name: Optional[str] = None
    description: Optional[str] = None
    enabled: Optional[bool] = None
    configuration: Optional[Dict[str, Any]] = None
    config: Optional[ToolConfig] = None
    json_schema: Optional[Dict[str, Any]] = None


class ToolExecutionRequest(BaseModel):
    tool_id: str
    parameters: Dict[str, Any]
    call_id: Optional[str] = None
    agent_id: Optional[str] = None


class ToolExecutionResponse(BaseModel):
    success: bool
    result: Optional[Any] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None