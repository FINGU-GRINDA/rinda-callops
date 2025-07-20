import asyncio
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import httpx
from pydantic import ValidationError

from ..models import Tool, ToolExecutionRequest, ToolExecutionResponse, ToolType

logger = logging.getLogger(__name__)


class ToolExecutor:
    """Service for executing agent tools"""
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
    
    async def get_tool(self, tool_id: str) -> Optional[Tool]:
        """Get tool from database"""
        from .database import db_service
        return await db_service.get_tool(tool_id)
    
    async def execute(
        self,
        tool_id: str,
        parameters: Dict[str, Any],
        call_id: Optional[str] = None,
        agent_id: Optional[str] = None,
    ) -> ToolExecutionResponse:
        """Execute a tool with given parameters"""
        
        start_time = datetime.utcnow()
        
        try:
            tool = await self.get_tool(tool_id)
            if not tool:
                return ToolExecutionResponse(
                    success=False,
                    error=f"Tool {tool_id} not found",
                )
            
            if not tool.enabled:
                return ToolExecutionResponse(
                    success=False,
                    error=f"Tool {tool.name} is disabled",
                )
            
            # Validate parameters against schema
            if tool.schema:
                # TODO: Implement JSON schema validation
                pass
            
            # Execute based on tool type
            result = await self._execute_tool(tool, parameters)
            
            # Update usage statistics
            await self._update_tool_usage(tool_id)
            
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            
            return ToolExecutionResponse(
                success=True,
                result=result,
                execution_time=execution_time,
            )
            
        except Exception as e:
            logger.error(f"Error executing tool {tool_id}: {str(e)}")
            return ToolExecutionResponse(
                success=False,
                error=str(e),
                execution_time=(datetime.utcnow() - start_time).total_seconds(),
            )
    
    async def _execute_tool(self, tool: Tool, parameters: Dict[str, Any]) -> Any:
        """Execute the tool based on its type"""
        
        if tool.type == ToolType.WEBHOOK:
            return await self._execute_webhook(tool, parameters)
        elif tool.type == ToolType.CUSTOM_API:
            return await self._execute_custom_api(tool, parameters)
        elif tool.type == ToolType.SHEET_APPEND:
            return await self._execute_sheet_append(tool, parameters)
        elif tool.type == ToolType.SHEET_UPDATE:
            return await self._execute_sheet_update(tool, parameters)
        elif tool.type == ToolType.SHEET_READ:
            return await self._execute_sheet_read(tool, parameters)
        elif tool.type == ToolType.SMS_SEND:
            return await self._execute_sms_send(tool, parameters)
        elif tool.type == ToolType.EMAIL_SEND:
            return await self._execute_email_send(tool, parameters)
        elif tool.type == ToolType.CALENDAR_CREATE:
            return await self._execute_calendar_create(tool, parameters)
        elif tool.type == ToolType.FUNCTION:
            return await self._execute_function(tool, parameters)
        else:
            raise ValueError(f"Unknown tool type: {tool.type}")
    
    async def _execute_webhook(self, tool: Tool, parameters: Dict[str, Any]) -> Any:
        """Execute a webhook tool"""
        
        config = tool.config
        if not config or not config.webhook_url:
            raise ValueError("Webhook URL not configured")
        
        headers = config.headers or {}
        headers["Content-Type"] = "application/json"
        
        response = await self.client.request(
            method=config.method or "POST",
            url=config.webhook_url,
            json=parameters,
            headers=headers,
            timeout=config.timeout or 30,
        )
        
        response.raise_for_status()
        
        if response.headers.get("content-type", "").startswith("application/json"):
            return response.json()
        else:
            return response.text
    
    async def _execute_custom_api(self, tool: Tool, parameters: Dict[str, Any]) -> Any:
        """Execute a custom API tool"""
        
        config = tool.config
        if not config or not config.api_endpoint:
            raise ValueError("API endpoint not configured")
        
        headers = config.headers or {}
        
        response = await self.client.request(
            method=config.method or "POST",
            url=config.api_endpoint,
            json=parameters,
            headers=headers,
            timeout=config.timeout or 30,
        )
        
        response.raise_for_status()
        
        if response.headers.get("content-type", "").startswith("application/json"):
            return response.json()
        else:
            return response.text
    
    async def _execute_sheet_append(self, tool: Tool, parameters: Dict[str, Any]) -> Any:
        """Execute Google Sheets append operation"""
        # This will call the Next.js API endpoint that handles Google Sheets
        frontend_url = "http://localhost:3000"  # This should come from config
        
        response = await self.client.post(
            f"{frontend_url}/api/actions/sheets/append",
            json={
                "toolId": tool.id,
                "parameters": parameters,
                "sheetId": tool.config.sheet_id if tool.config else None,
            },
        )
        
        response.raise_for_status()
        return response.json()
    
    async def _execute_sheet_update(self, tool: Tool, parameters: Dict[str, Any]) -> Any:
        """Execute Google Sheets update operation"""
        raise NotImplementedError("Sheet update not implemented yet")
    
    async def _execute_sheet_read(self, tool: Tool, parameters: Dict[str, Any]) -> Any:
        """Execute Google Sheets read operation"""
        raise NotImplementedError("Sheet read not implemented yet")
    
    async def _execute_sms_send(self, tool: Tool, parameters: Dict[str, Any]) -> Any:
        """Send SMS using Twilio"""
        from twilio.rest import Client
        from ..core.config import settings
        
        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        
        message = client.messages.create(
            body=parameters.get("message", ""),
            from_=parameters.get("from_number", settings.twilio_phone_number),
            to=parameters.get("to_number", ""),
        )
        
        return {
            "message_sid": message.sid,
            "status": message.status,
            "to": message.to,
            "from": message.from_,
        }
    
    async def _execute_email_send(self, tool: Tool, parameters: Dict[str, Any]) -> Any:
        """Send email"""
        raise NotImplementedError("Email sending not implemented yet")
    
    async def _execute_calendar_create(self, tool: Tool, parameters: Dict[str, Any]) -> Any:
        """Create calendar event"""
        raise NotImplementedError("Calendar creation not implemented yet")
    
    async def _execute_function(self, tool: Tool, parameters: Dict[str, Any]) -> Any:
        """Execute a custom function"""
        # This would execute predefined functions based on tool configuration
        raise NotImplementedError("Custom functions not implemented yet")
    
    async def _update_tool_usage(self, tool_id: str):
        """Update tool usage statistics"""
        from .database import db_service
        await db_service.update_tool_usage(tool_id)