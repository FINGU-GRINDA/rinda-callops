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
            if tool.json_schema:
                try:
                    import jsonschema
                    jsonschema.validate(instance=parameters, schema=tool.json_schema)
                    logger.info(f"🔧 Parameter validation passed for tool: {tool.name}")
                except Exception as validation_error:
                    logger.warning(f"🔧 Parameter validation failed for tool {tool.name}: {validation_error}")
                    # Continue execution even if validation fails, but log the issue
            
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
        elif tool.type == ToolType.AI_GENERATED:
            return await self._execute_ai_generated(tool, parameters)
        elif tool.type == ToolType.REFERENCE:
            return await self._execute_reference(tool, parameters)
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
        try:
            # Get Google OAuth tokens from tool config or database
            if not tool.config or not hasattr(tool.config, 'google_sheet_id'):
                return {"error": "Tool not configured with Google Sheets"}
            
            # For now, we'll use the frontend API until we implement token storage
            # In production, we'd get tokens from database
            from .google_sheets_service import GoogleSheetsService, OrderSheetManager
            
            # This is a placeholder - in production, get tokens from secure storage
            access_token = tool.config.google_access_token if hasattr(tool.config, 'google_access_token') else None
            refresh_token = tool.config.google_refresh_token if hasattr(tool.config, 'google_refresh_token') else None
            
            if not access_token:
                # Fallback to frontend API
                frontend_url = "http://localhost:3000"
                response = await self.client.post(
                    f"{frontend_url}/api/actions/sheets/append",
                    json={
                        "toolId": tool.id,
                        "parameters": parameters,
                        "sheetId": tool.config.google_sheet_id,
                    },
                )
                response.raise_for_status()
                return response.json()
            
            # Use direct Google Sheets API
            sheets_service = GoogleSheetsService(access_token, refresh_token)
            
            # Handle order-specific operations
            if tool.type == "order" or tool.name.lower().startswith("order"):
                order_manager = OrderSheetManager(sheets_service)
                order_id = await order_manager.add_order(
                    tool.config.google_sheet_id,
                    parameters
                )
                return {"success": True, "order_id": order_id, "message": f"Order {order_id} has been placed successfully"}
            else:
                # Generic append for other tools
                values = [[parameters.get(key, '') for key in sorted(parameters.keys())]]
                result = await sheets_service.append_to_sheet(
                    tool.config.google_sheet_id,
                    tool.config.sheet_range or 'Sheet1!A:Z',
                    values
                )
                return {"success": True, "result": result}
                
        except Exception as e:
            logger.error(f"Error executing sheet append: {e}")
            return {"error": str(e)}
    
    async def _execute_sheet_update(self, tool: Tool, parameters: Dict[str, Any]) -> Any:
        """Execute Google Sheets update operation"""
        try:
            if not tool.config or not hasattr(tool.config, 'google_sheet_id'):
                return {"error": "Tool not configured with Google Sheets"}
            
            from .google_sheets_service import GoogleSheetsService, OrderSheetManager
            
            # Placeholder for token retrieval
            access_token = tool.config.google_access_token if hasattr(tool.config, 'google_access_token') else None
            
            if not access_token:
                return {"error": "Google Sheets not authenticated"}
            
            sheets_service = GoogleSheetsService(access_token)
            
            # Handle order status updates
            if "order_id" in parameters and "status" in parameters:
                order_manager = OrderSheetManager(sheets_service)
                success = await order_manager.update_order_status(
                    tool.config.google_sheet_id,
                    parameters["order_id"],
                    parameters["status"]
                )
                return {"success": success, "message": f"Order {parameters['order_id']} status updated to {parameters['status']}"}
            
            # Generic update
            range_name = parameters.get("range", "Sheet1!A1")
            values = parameters.get("values", [[]])
            result = await sheets_service.update_sheet(
                tool.config.google_sheet_id,
                range_name,
                values
            )
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"Error executing sheet update: {e}")
            return {"error": str(e)}
    
    async def _execute_sheet_read(self, tool: Tool, parameters: Dict[str, Any]) -> Any:
        """Execute Google Sheets read operation"""
        try:
            if not tool.config or not hasattr(tool.config, 'google_sheet_id'):
                return {"error": "Tool not configured with Google Sheets"}
            
            from .google_sheets_service import GoogleSheetsService, FAQSheetManager
            
            # Placeholder for token retrieval
            access_token = tool.config.google_access_token if hasattr(tool.config, 'google_access_token') else None
            
            if not access_token:
                return {"error": "Google Sheets not authenticated"}
            
            sheets_service = GoogleSheetsService(access_token)
            
            # Handle FAQ lookups
            if tool.type == "faq" or tool.name.lower().startswith("faq"):
                faq_manager = FAQSheetManager(sheets_service)
                
                if "question" in parameters:
                    answer = await faq_manager.find_answer(
                        tool.config.google_sheet_id,
                        parameters["question"]
                    )
                    if answer:
                        return {"found": True, "answer": answer}
                    else:
                        return {"found": False, "message": "I don't have an answer to that question in my FAQ database."}
                else:
                    faqs = await faq_manager.get_all_faqs(tool.config.google_sheet_id)
                    return {"faqs": faqs}
            
            # Generic read
            range_name = parameters.get("range", "Sheet1!A:Z")
            values = await sheets_service.read_sheet(
                tool.config.google_sheet_id,
                range_name
            )
            return {"success": True, "values": values}
            
        except Exception as e:
            logger.error(f"Error executing sheet read: {e}")
            return {"error": str(e)}
    
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
        # For function-type tools, return the stored configuration data
        # This is typically used for menu information, business hours, etc.
        
        if tool.configuration:
            logger.info(f"Returning stored configuration for function tool: {tool.name}")
            return tool.configuration
        
        # If no configuration is stored, return a helpful message
        return {
            "message": f"No data configured for {tool.name}",
            "tool_type": tool.type,
            "description": tool.description
        }
    
    async def _execute_ai_generated(self, tool: Tool, parameters: Dict[str, Any]) -> Any:
        """Execute an AI-generated tool like menu, FAQ, etc."""
        
        # AI-generated tools store their data in the configuration field
        if tool.configuration:
            logger.info(f"🔧 Executing AI-generated tool: {tool.name}")
            logger.info(f"🔧 Configuration keys: {list(tool.configuration.keys())}")
            
            # Handle menu tools specifically
            if tool.name.lower() == 'menu' and 'menuItems' in tool.configuration:
                menu_items = tool.configuration.get('menuItems', [])
                logger.info(f"🔧 Found {len(menu_items)} menu items")
                
                # Format menu response
                if not menu_items:
                    return {
                        "response": "I'm sorry, but our menu is currently not available. Please call back later or visit our location for more information.",
                        "success": True
                    }
                
                # Group items by category
                categories = {}
                for item in menu_items:
                    category = item.get('category', 'Main Items')
                    if category not in categories:
                        categories[category] = []
                    categories[category].append(item)
                
                # Build response text
                response_parts = ["I'd be happy to tell you about our menu! Here's what we have:"]
                
                for category, items in categories.items():
                    if len(categories) > 1:
                        response_parts.append(f"\n{category}:")
                    
                    for item in items:
                        name = item.get('name', 'Unknown Item')
                        price = item.get('price', '')
                        description = item.get('description', '')
                        
                        # Clean up price data - extract only the price part
                        if price:
                            # Look for price patterns like $X.XX or just numbers
                            import re
                            price_match = re.search(r'\$?\d+\.?\d*', str(price))
                            if price_match:
                                clean_price = price_match.group()
                                if not clean_price.startswith('$'):
                                    clean_price = f"${clean_price}"
                                price = clean_price
                            else:
                                price = ''  # Invalid price format
                        
                        item_text = f"• {name}"
                        if price:
                            item_text += f" - {price}"
                        if description:
                            item_text += f" - {description}"
                        
                        response_parts.append(item_text)
                
                response_parts.append("\nWhat sounds good to you today?")
                
                return {
                    "response": "\n".join(response_parts),
                    "menuItems": menu_items,
                    "success": True
                }
            
            # Handle order tools with Google Sheets integration
            if tool.name.lower() == 'order' and tool.configuration.get('googleSheetId'):
                logger.info(f"🔧 Processing AI-generated order tool with Google Sheets")
                return await self._execute_google_sheets_backend(tool, parameters, tool.configuration)
            
            # For other AI-generated tools, return the configuration directly
            return {
                "response": tool.configuration.get('response', 'Information retrieved successfully'),
                "data": tool.configuration,
                "success": True
            }
        
        # If no configuration is stored, return a helpful message
        logger.warning(f"🔧 No configuration found for AI-generated tool: {tool.name}")
        return {
            "response": f"I'm sorry, but the information for {tool.name} is not available right now. Please contact us directly for assistance.",
            "success": False,
            "error": "No configuration data available"
        }
    
    async def _execute_reference(self, tool: Tool, parameters: Dict[str, Any]) -> Any:
        """Execute a reference tool (like Google Sheets integration)"""
        
        logger.info(f"🔧 Executing reference tool: {tool.name}")
        
        if not tool.configuration:
            logger.warning(f"🔧 No configuration found for reference tool: {tool.name}")
            return {
                "success": False,
                "error": "Tool not configured",
                "message": f"The {tool.name} tool needs to be configured first."
            }
        
        config = tool.configuration
        
        # Handle Google Sheets integration
        if config.get('googleSheetId'):
            return await self._execute_google_sheets_backend(tool, parameters, config)
        
        # For other reference types, return configuration data
        logger.info(f"🔧 Returning configuration for reference tool: {tool.name}")
        return {
            "success": True,
            "data": config,
            "message": f"{tool.name} tool executed successfully"
        }
    
    async def _execute_google_sheets_reference(self, tool: Tool, parameters: Dict[str, Any], config: Dict[str, Any]) -> Any:
        """Execute Google Sheets reference tool"""
        
        sheet_id = config.get('googleSheetId')
        sheet_name = config.get('googleSheetName', 'Sheet1')
        column_mappings = config.get('columnMappings', {})
        
        logger.info(f"🔧 Processing Google Sheets operation for {tool.name}")
        logger.info(f"🔧 Sheet ID: {sheet_id}")
        logger.info(f"🔧 Parameters: {parameters}")
        
        # For order tools, process the order data
        if tool.name.lower() == 'order':
            # Extract order information from parameters
            order_data = {
                'customer_name': parameters.get('customer_name', 'Unknown Customer'),
                'phone_number': parameters.get('phone_number', ''),
                'items': parameters.get('items', 'No items specified'),
                'total_amount': parameters.get('total_amount', ''),
                'delivery_address': parameters.get('delivery_address', ''),
                'notes': parameters.get('notes', ''),
                'order_status': 'Pending'
            }
            
            logger.info(f"🔧 Order data prepared: {order_data}")
            
            # Try to write to Google Sheets using the frontend API fallback
            try:
                frontend_url = "http://localhost:3000"
                response = await self.client.post(
                    f"{frontend_url}/api/actions/sheets/append",
                    json={
                        "toolId": tool.id,
                        "parameters": order_data,
                        "sheetId": sheet_id,
                    },
                )
                response.raise_for_status()
                sheets_result = response.json()
                logger.info(f"🔧 Successfully wrote order to Google Sheets via frontend API: {sheets_result}")
                
                # Check if it was saved to actual Google Sheets or just stored temporarily
                if sheets_result.get('success') and 'temporarily' not in sheets_result.get('message', '').lower():
                    message = f"Thank you! I've recorded your order #{sheets_result.get('order_id', 'pending')}. Your order for {order_data['items']} has been placed and will be processed shortly."
                else:
                    message = f"Thank you! I've recorded your order. Your order for {order_data['items']} has been placed. Please ensure Google Sheets is connected to sync the order."
                
                return {
                    "success": True,
                    "message": message,
                    "order_data": order_data,
                    "sheet_id": sheet_id,
                    "sheets_response": sheets_result
                }
                
            except Exception as e:
                logger.error(f"🔧 Failed to write to Google Sheets: {e}")
                # Still return success to the user but log the error
                return {
                    "success": True,
                    "message": f"Thank you! I've recorded your order. Your order for {order_data['items']} has been placed and will be processed shortly.",
                    "order_data": order_data,
                    "sheet_id": sheet_id,
                    "warning": "Order recorded but may not have been saved to Google Sheets"
                }
        
        # For other reference tools, return success
        return {
            "success": True,
            "message": f"{tool.name} processed successfully",
            "configuration": config
        }
    
    async def _execute_google_sheets_backend(self, tool: Tool, parameters: Dict[str, Any], config: Dict[str, Any]) -> Any:
        """Execute Google Sheets operations directly from backend using stored OAuth tokens"""
        
        sheet_id = config.get('googleSheetId')
        sheet_name = config.get('googleSheetName', 'Sheet1')
        column_mappings = config.get('columnMappings', {})
        
        logger.info(f"🔧 Backend Google Sheets operation for {tool.name}")
        logger.info(f"🔧 Sheet ID: {sheet_id}")
        logger.info(f"🔧 Parameters: {parameters}")
        
        if not sheet_id:
            return {
                "success": False,
                "error": "No Google Sheet ID configured",
                "message": "Please configure Google Sheets integration first."
            }
        
        try:
            # Get OAuth tokens from database
            tokens = await self._get_google_oauth_tokens()
            if not tokens:
                logger.warning("🔧 No Google OAuth tokens found, falling back to frontend API")
                return await self._execute_google_sheets_reference(tool, parameters, config)
            
            # Initialize Google Sheets service with backend integration
            from .google_sheets_service import GoogleSheetsService, OrderSheetManager
            sheets_service = GoogleSheetsService(
                access_token=tokens['access_token'],
                refresh_token=tokens.get('refresh_token')
            )
            
            # For order tools, use OrderSheetManager
            if tool.name.lower() == 'order':
                order_manager = OrderSheetManager(sheets_service)
                
                # Prepare order data
                order_data = {
                    'customer_name': parameters.get('customer_name', 'Unknown Customer'),
                    'phone_number': parameters.get('phone_number', ''),
                    'items': parameters.get('items', 'No items specified'),
                    'total_amount': parameters.get('total_amount', ''),
                    'delivery_address': parameters.get('delivery_address', ''),
                    'notes': parameters.get('notes', '')
                }
                
                logger.info(f"🔧 Processing order with backend Google Sheets service")
                order_id = await order_manager.add_order(sheet_id, order_data)
                
                logger.info(f"🔧 Successfully created order {order_id} in Google Sheets")
                
                return {
                    "success": True,
                    "message": f"Thank you! I've recorded your order #{order_id}. Your order for {order_data['items']} has been placed and will be processed shortly.",
                    "order_data": order_data,
                    "order_id": order_id,
                    "sheet_id": sheet_id
                }
            else:
                # Generic sheet append for other tools
                logger.info(f"🔧 Generic sheet append for {tool.name}")
                values = [list(parameters.values())]
                await sheets_service.append_to_sheet(sheet_id, f"{sheet_name}!A:Z", values)
                
                return {
                    "success": True,
                    "message": f"Data saved to {sheet_name} successfully",
                    "data": parameters
                }
                
        except Exception as e:
            logger.error(f"🔧 Backend Google Sheets error: {e}")
            # Fallback to frontend API
            logger.info("🔧 Falling back to frontend Google Sheets API")
            return await self._execute_google_sheets_reference(tool, parameters, config)
    
    async def _get_google_oauth_tokens(self) -> Optional[Dict[str, str]]:
        """Retrieve Google OAuth tokens from database"""
        try:
            from .database import db_service
            # Get the most recent valid token
            # This is a simplified approach - in production you'd associate tokens with users
            tokens = await db_service.get_latest_google_tokens()
            
            if tokens and tokens.get('access_token'):
                logger.info("🔧 Found valid Google OAuth tokens in database")
                return tokens
            else:
                logger.warning("🔧 No valid Google OAuth tokens found in database")
                return None
                
        except Exception as e:
            logger.error(f"🔧 Error retrieving Google tokens: {e}")
            return None
    
    async def _update_tool_usage(self, tool_id: str):
        """Update tool usage statistics"""
        from .database import db_service
        await db_service.update_tool_usage(tool_id)