import json
import logging
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI

from ..core.config import settings
from ..models import Tool, ToolType, ToolParameter, ParameterType

logger = logging.getLogger(__name__)


class ToolGeneratorService:
    """Service for generating tools using AI"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
    
    async def generate_smart_tools(
        self,
        business_type: str,
        business_name: str,
        business_description: str,
        requirements: str,
        file_analysis_results: Optional[List[Dict[str, Any]]] = None,
        additional_data: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Generate smart tools based on business context"""
        
        # Build context from all available data
        context = self._build_context(
            business_type,
            business_name,
            business_description,
            requirements,
            file_analysis_results,
            additional_data,
        )
        
        # Generate tools using GPT-4
        tools = await self._generate_tools_with_ai(context)
        
        return tools
    
    def _build_context(
        self,
        business_type: str,
        business_name: str,
        business_description: str,
        requirements: str,
        file_analysis_results: Optional[List[Dict[str, Any]]] = None,
        additional_data: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Build context string for AI tool generation"""
        
        context_parts = [
            f"Business Type: {business_type}",
            f"Business Name: {business_name}",
            f"Business Description: {business_description}",
            f"Requirements: {requirements}",
        ]
        
        # Add file analysis results
        if file_analysis_results:
            for result in file_analysis_results:
                if result.get("type") == "menu":
                    context_parts.append(f"\nMenu Items:")
                    for item in result.get("items", []):
                        context_parts.append(f"- {item.get('name')} - ${item.get('price')}")
                
                elif result.get("type") == "services":
                    context_parts.append(f"\nServices:")
                    for service in result.get("services", []):
                        context_parts.append(f"- {service.get('name')} - ${service.get('price')}")
                
                elif result.get("type") == "inventory":
                    context_parts.append(f"\nInventory:")
                    for item in result.get("items", []):
                        context_parts.append(f"- {item.get('name')}")
        
        # Add additional business data
        if additional_data:
            if additional_data.get("hours"):
                context_parts.append(f"\nBusiness Hours:")
                for day, hours in additional_data['hours'].items():
                    context_parts.append(f"  {day.title()}: {hours}")
            
            if additional_data.get("menu"):
                context_parts.append(f"\nMENU ITEMS:")
                menu_text = additional_data['menu']
                context_parts.append(f"{menu_text}")
            
            if additional_data.get("doctors"):
                context_parts.append(f"\nDoctors: {additional_data['doctors']}")
            
            if additional_data.get("stylists"):
                context_parts.append(f"\nStylists: {additional_data['stylists']}")
            
            if additional_data.get("services"):
                context_parts.append(f"\nServices: {additional_data['services']}")
            
            if additional_data.get("products"):
                context_parts.append(f"\nProducts: {additional_data['products']}")
            
            if additional_data.get("inventory"):
                context_parts.append(f"\nInventory: {additional_data['inventory']}")
        
        return "\n".join(context_parts)
    
    async def _generate_tools_with_ai(self, context: str) -> List[Dict[str, Any]]:
        """Use GPT-4 to generate tools based on context"""
        
        prompt = f"""You are creating highly sophisticated, business-specific function calling tools for an AI phone agent using LiveKit's OpenAI Realtime API integration. Analyze the business context deeply and create advanced, practical tools.

BUSINESS CONTEXT:
{context}

REQUIREMENTS:
1. Create 4-7 ADVANCED tools that are HIGHLY specific to this exact business
2. Use the actual business data provided (menu items, services, staff, hours, etc.)
3. Create tools that handle real customer scenarios, not generic templates
4. Include sophisticated parameter validation with enums based on actual business data
5. Focus on business-critical operations: ordering, booking, information retrieval, customer service
6. Follow OpenAI function calling schema format exactly

TOOL DESIGN PRINCIPLES:
- Use EXACT menu items, services, or inventory from the business data
- Create enums with real options, not generic placeholders
- Design for actual customer phone call scenarios
- Include comprehensive parameter validation
- Think about the customer journey and pain points
- Use descriptive parameter names that are self-documenting
- Include detailed descriptions for both the tool and each parameter

CRITICAL RULES FOR TOOL DESCRIPTIONS:
1. ALWAYS include "USE THIS TOOL ONLY WHEN:" followed by specific trigger phrases
2. ALWAYS include "DO NOT USE THIS TOOL WHEN:" followed by negative examples
3. Information retrieval tools (provide_menu, check_hours) should NEVER be used for actions
4. Action tools (take_order, book_appointment) should NEVER be used for information queries
5. Be EXTREMELY explicit about the difference between browsing/asking vs. acting/ordering

PARAMETER TYPE GUIDELINES:
- Use "string" for text values (names, dates, times, selections)
- Use "number" for numeric values (quantities, prices, counts)
- Use "boolean" for yes/no flags
- Use "array" for multiple selections (with items schema)
- Use "object" for nested structures (with properties schema)
- Always include "enum" arrays when there are specific valid options

IMPORTANT CONFIGURATION REQUIREMENT:
For tools that provide information (like menu, hours, prices), include a "configuration" field with the actual data that will be returned when the tool is called. The tool should NOT make external calls - it should return the data stored in its configuration.

NATURAL RESPONSE FORMATTING:
When creating the "response" field in tool configurations, format it conversationally:
- Start with a friendly introduction: "I'd be happy to help you with that!"
- Present information naturally, not as a list dump
- Use transitions like "We offer...", "Our options include..."
- Break up long lists with contextual phrases
- End with an engaging question: "What sounds good to you?" or "Would you like to hear more about any of these?"

OUTPUT FORMAT (JSON only, no explanation):
{{
  "tools": [
    {{
      "name": "snake_case_function_name",
      "displayName": "Human Readable Name",
      "description": "Detailed description explaining when and how the AI should use this tool",
      "type": "function",
      "configuration": {{
        // For information retrieval tools, include the actual data here
        // This data will be returned when the tool is called
        "response": "The formatted response to return",
        "data": {{ /* actual business data */ }}
      }},
      "json_schema": {{
        "type": "object",
        "properties": {{
          "parameter_name": {{
            "type": "string|number|boolean|array|object",
            "description": "Clear, detailed description of what this parameter is for",
            "enum": ["actual_option_1", "actual_option_2"],  // Only if there are specific valid values
            "items": {{ "type": "string" }},  // Only for array type
            "properties": {{ }},  // Only for object type
            "minimum": 1,  // Optional for numbers
            "maximum": 100  // Optional for numbers
          }}
        }},
        "required": ["list", "of", "required", "parameter", "names"],
        "additionalProperties": false
      }}
    }}
  ]
}}

CRITICAL INSTRUCTION: Make tool descriptions EXTREMELY SPECIFIC about when to use them vs when NOT to use them. Include explicit trigger phrases and negative examples to prevent confusion.

EXAMPLES OF WELL-FORMED TOOLS WITH ULTRA-CLEAR DESCRIPTIONS:

1. Information retrieval tool (NO parameters, just returns data):
{{
  "name": "provide_menu",
  "displayName": "Provide Menu Information",
  "description": "Returns the complete restaurant menu with all items and prices. USE THIS TOOL ONLY WHEN: customer asks 'What's on the menu?', 'What food do you have?', 'What can I order?', 'Do you have pizza?', 'How much does X cost?', 'What are your prices?'. DO NOT USE THIS TOOL WHEN: customer wants to place an order, customer says 'I want to order', customer is ready to purchase, or any other action besides viewing the menu.",
  "type": "function",
  "configuration": {{
    "response": "I'd be happy to tell you about our delicious menu! We have several fantastic pizzas to choose from. Our classic Margherita is $12.99 - it's made with fresh mozzarella, tomatoes, and basil. The Pepperoni pizza is always popular at $14.99, and if you're feeling adventurous, we have a Hawaiian with ham and pineapple for $15.99. For drinks, we offer Coke and Sprite at $2.99 each, or fresh orange juice for $3.99. What sounds good to you today?",
    "menu_items": [
      {{"name": "Margherita Pizza", "price": 12.99, "description": "Classic pizza with fresh mozzarella, tomatoes, and basil"}},
      {{"name": "Pepperoni Pizza", "price": 14.99, "description": "Traditional pepperoni with mozzarella cheese"}},
      {{"name": "Hawaiian Pizza", "price": 15.99, "description": "Ham and pineapple with mozzarella"}}
    ],
    "drinks": [
      {{"name": "Coke", "price": 2.99}},
      {{"name": "Sprite", "price": 2.99}},
      {{"name": "Orange Juice", "price": 3.99}}
    ]
  }},
  "json_schema": {{
    "type": "object",
    "properties": {{}},
    "required": [],
    "additionalProperties": false
  }}
}}

2. Action tool for placing orders (WITH parameters):
{{
  "name": "take_order",
  "displayName": "Take Customer Order",
  "description": "Processes a customer's order after they have decided what to purchase. USE THIS TOOL ONLY WHEN: customer says 'I want to order X', 'I'll have the X', 'Can I get X', 'I'd like to purchase X', or explicitly states they want to place an order. DO NOT USE THIS TOOL WHEN: customer is asking about menu items, prices, or just browsing options. Always use provide_menu tool first if customer needs to see options.",
  "type": "function",
  "json_schema": {{
    "type": "object",
    "properties": {{
      "date": {{
        "type": "string",
        "description": "The date for the reservation in YYYY-MM-DD format"
      }},
      "time": {{
        "type": "string",
        "description": "The time for the reservation in HH:MM format (24-hour)"
      }},
      "party_size": {{
        "type": "number",
        "description": "Number of people in the party",
        "minimum": 1,
        "maximum": 20
      }},
      "seating_preference": {{
        "type": "string",
        "description": "Customer's seating preference",
        "enum": ["indoor", "outdoor", "bar", "private_room", "no_preference"]
      }},
      "special_requests": {{
        "type": "string",
        "description": "Any special requests or dietary restrictions"
      }}
    }},
    "required": ["date", "time", "party_size"],
    "additionalProperties": false
  }}
}}

Generate tools that would impress customers with their intelligence and business knowledge."""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at creating function calling tools for AI phone agents. Generate practical, business-specific tools based on the context provided."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )
            
            content = response.choices[0].message.content
            tools_data = json.loads(content)
            
            # Ensure we have a list
            if isinstance(tools_data, dict) and "tools" in tools_data:
                tools_data = tools_data["tools"]
            elif not isinstance(tools_data, list):
                tools_data = [tools_data]
            
            # Format tools for our system
            formatted_tools = []
            for tool in tools_data:
                # Handle both old and new schema formats
                if "json_schema" in tool:
                    # New format with proper json_schema
                    schema = tool["json_schema"]
                elif "parameters" in tool:
                    # Old format - convert to proper schema
                    schema = {
                        "type": "object",
                        "properties": tool.get("parameters", {}),
                        "required": [
                            param for param, config in tool.get("parameters", {}).items()
                            if config.get("required", True)
                        ]
                    }
                else:
                    # No parameters defined
                    schema = {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                
                formatted_tool = {
                    "name": tool.get("name"),
                    "displayName": tool.get("displayName", tool.get("name")),
                    "description": tool.get("description"),
                    "type": ToolType.FUNCTION,
                    "enabled": True,
                    "json_schema": schema,  # Use json_schema field to match the model
                    "configuration": tool.get("configuration")  # Use configuration from AI
                }
                formatted_tools.append(formatted_tool)
            
            return formatted_tools
            
        except Exception as e:
            logger.error(f"Error generating tools with AI: {str(e)}")
            return self._get_default_tools(context.split("\n")[0].split(": ")[1])
    
    def _get_default_tools(self, business_type: str) -> List[Dict[str, Any]]:
        """Get default tools for a business type"""
        
        default_tools = {
            "restaurant": [
                {
                    "name": "check_menu_item",
                    "displayName": "Check Menu Item",
                    "description": "Check if a menu item is available and get its price. Use this when customers ask about menu items, prices, or availability.",
                    "type": ToolType.FUNCTION,
                    "enabled": True,
                    "json_schema": {
                        "type": "object",
                        "properties": {
                            "item_name": {
                                "type": "string",
                                "description": "Name of the menu item to check"
                            }
                        },
                        "required": ["item_name"],
                        "additionalProperties": False
                    }
                },
                {
                    "name": "make_reservation",
                    "displayName": "Make Reservation",
                    "description": "Create a table reservation for the restaurant. Use this after confirming availability and party details with the customer.",
                    "type": ToolType.FUNCTION,
                    "enabled": True,
                    "json_schema": {
                        "type": "object",
                        "properties": {
                            "date": {
                                "type": "string",
                                "description": "Reservation date in YYYY-MM-DD format"
                            },
                            "time": {
                                "type": "string",
                                "description": "Reservation time in HH:MM format (24-hour)"
                            },
                            "party_size": {
                                "type": "number",
                                "description": "Number of people in the party",
                                "minimum": 1,
                                "maximum": 50
                            }
                        },
                        "required": ["date", "time", "party_size"],
                        "additionalProperties": False
                    }
                }
            ],
            "salon": [
                {
                    "name": "book_appointment",
                    "displayName": "Book Appointment",
                    "description": "Book a salon appointment for a customer. Use this after confirming service, date, and time with the customer.",
                    "type": ToolType.FUNCTION,
                    "enabled": True,
                    "json_schema": {
                        "type": "object",
                        "properties": {
                            "service": {
                                "type": "string",
                                "description": "Type of salon service requested"
                            },
                            "stylist": {
                                "type": "string",
                                "description": "Name of the preferred stylist (optional)"
                            },
                            "date": {
                                "type": "string",
                                "description": "Appointment date in YYYY-MM-DD format"
                            },
                            "time": {
                                "type": "string",
                                "description": "Appointment time in HH:MM format (24-hour)"
                            }
                        },
                        "required": ["service", "date", "time"],
                        "additionalProperties": False
                    }
                },
                {
                    "name": "check_service_price",
                    "displayName": "Check Service Price",
                    "description": "Get pricing information for salon services. Use when customers ask about service costs.",
                    "type": ToolType.FUNCTION,
                    "enabled": True,
                    "json_schema": {
                        "type": "object",
                        "properties": {
                            "service": {
                                "type": "string",
                                "description": "Name of the salon service to check pricing for"
                            }
                        },
                        "required": ["service"],
                        "additionalProperties": False
                    }
                }
            ],
            "medical": [
                {
                    "name": "schedule_appointment",
                    "displayName": "Schedule Appointment",
                    "description": "Schedule a medical appointment with a doctor. Use after gathering patient information and confirming availability.",
                    "type": ToolType.FUNCTION,
                    "enabled": True,
                    "json_schema": {
                        "type": "object",
                        "properties": {
                            "doctor": {
                                "type": "string",
                                "description": "Name of the doctor (optional - can be assigned based on reason)"
                            },
                            "reason": {
                                "type": "string",
                                "description": "Reason for the visit or chief complaint"
                            },
                            "date": {
                                "type": "string",
                                "description": "Preferred appointment date in YYYY-MM-DD format"
                            },
                            "time": {
                                "type": "string",
                                "description": "Preferred appointment time in HH:MM format (24-hour)"
                            },
                            "appointment_type": {
                                "type": "string",
                                "description": "Type of appointment",
                                "enum": ["new_patient", "follow_up", "routine_checkup", "urgent_care"]
                            }
                        },
                        "required": ["reason", "date"],
                        "additionalProperties": False
                    }
                },
                {
                    "name": "check_insurance",
                    "displayName": "Check Insurance",
                    "description": "Verify if a specific insurance provider is accepted at the practice. Use when patients ask about insurance coverage.",
                    "type": ToolType.FUNCTION,
                    "enabled": True,
                    "json_schema": {
                        "type": "object",
                        "properties": {
                            "insurance_provider": {
                                "type": "string",
                                "description": "Name of the insurance provider to check"
                            },
                            "plan_type": {
                                "type": "string",
                                "description": "Specific insurance plan type (optional)",
                                "enum": ["PPO", "HMO", "EPO", "POS", "Medicare", "Medicaid"]
                            }
                        },
                        "required": ["insurance_provider"],
                        "additionalProperties": False
                    }
                }
            ]
        }
        
        return default_tools.get(business_type, [])


# Singleton instance
tool_generator_service = ToolGeneratorService()