from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging

from ..models import (
    Tool,
    CreateToolRequest,
    UpdateToolRequest,
    ToolExecutionRequest,
    ToolExecutionResponse,
)
from ..services.tool_executor import ToolExecutor

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=Tool)
async def create_tool(request: CreateToolRequest):
    """Create a new tool"""
    raise NotImplementedError("Database integration pending")


@router.get("/", response_model=List[Tool])
async def list_tools(
    agent_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
):
    """List all tools"""
    raise NotImplementedError("Database integration pending")


@router.get("/{tool_id}", response_model=Tool)
async def get_tool(tool_id: str):
    """Get a specific tool"""
    raise NotImplementedError("Database integration pending")


@router.patch("/{tool_id}", response_model=Tool)
async def update_tool(tool_id: str, request: UpdateToolRequest):
    """Update a tool"""
    raise NotImplementedError("Database integration pending")


@router.delete("/{tool_id}")
async def delete_tool(tool_id: str):
    """Delete a tool"""
    raise NotImplementedError("Database integration pending")


@router.post("/execute", response_model=ToolExecutionResponse)
async def execute_tool(request: ToolExecutionRequest):
    """Execute a tool"""
    executor = ToolExecutor()
    
    try:
        result = await executor.execute(
            tool_id=request.tool_id,
            parameters=request.parameters,
            call_id=request.call_id,
            agent_id=request.agent_id,
        )
        return result
    except Exception as e:
        logger.error(f"Error executing tool: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await executor.close()


class GenerateToolsRequest(BaseModel):
    business_type: str
    business_name: str
    business_description: str
    requirements: str
    file_analysis_results: Optional[List[Dict[str, Any]]] = None
    additional_data: Optional[Dict[str, Any]] = None

@router.post("/generate-smart")
async def generate_smart_tools(request: GenerateToolsRequest):
    """Generate smart tools using AI based on business context"""
    from ..services.tool_generator import tool_generator_service
    
    try:
        tools = await tool_generator_service.generate_smart_tools(
            business_type=request.business_type,
            business_name=request.business_name,
            business_description=request.business_description,
            requirements=request.requirements,
            file_analysis_results=request.file_analysis_results,
            additional_data=request.additional_data,
        )
        
        return {"tools": tools}
    except Exception as e:
        logger.error(f"Error generating smart tools: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


class BusinessData(BaseModel):
    name: str
    type: str
    description: str
    requirements: Optional[str] = None


class GenerateToolsSimpleRequest(BaseModel):
    businessData: BusinessData
    toolConfiguration: Optional[Dict[str, Any]] = None


@router.post("/generate")
async def generate_tools(request: GenerateToolsSimpleRequest):
    """Generate AI tools with a simplified interface for frontend consumption"""
    from ..services.tool_generator import tool_generator_service
    
    try:
        # Transform the simplified request to the full format expected by the service
        full_request = GenerateToolsRequest(
            business_type=request.businessData.type,
            business_name=request.businessData.name,
            business_description=request.businessData.description,
            requirements=request.businessData.requirements or "Generate tools suitable for this business",
            file_analysis_results=None,
            additional_data=request.toolConfiguration or {}
        )
        
        tools = await tool_generator_service.generate_smart_tools(
            business_type=full_request.business_type,
            business_name=full_request.business_name,
            business_description=full_request.business_description,
            requirements=full_request.requirements,
            file_analysis_results=full_request.file_analysis_results,
            additional_data=full_request.additional_data,
        )
        
        return {"tools": tools}
    except Exception as e:
        logger.error(f"Error generating tools: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))